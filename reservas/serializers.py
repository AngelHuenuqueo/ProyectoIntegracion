"""
Serializers para la app de reservas.
"""
from rest_framework import serializers
from .models import Reserva
from clases.serializers import ClaseSerializer
from usuarios.serializers import UsuarioSerializer


class ReservaSerializer(serializers.ModelSerializer):
    """
    Serializer básico para Reserva.
    """
    socio_nombre = serializers.SerializerMethodField()
    clase_nombre = serializers.SerializerMethodField()
    puede_cancelar = serializers.SerializerMethodField()
    
    class Meta:
        model = Reserva
        fields = [
            'id', 'socio', 'socio_nombre', 'clase', 'clase_nombre',
            'estado', 'fecha_reserva', 'fecha_cancelacion',
            'puede_cancelar', 'notas', 'notificacion_enviada'
        ]
        read_only_fields = ['id', 'fecha_reserva', 'fecha_cancelacion']
    
    def get_socio_nombre(self, obj):
        """Retorna el nombre del socio."""
        return obj.socio.get_full_name()
    
    def get_clase_nombre(self, obj):
        """Retorna el nombre de la clase."""
        return obj.clase.nombre
    
    def get_puede_cancelar(self, obj):
        """Indica si la reserva puede ser cancelada."""
        return obj.puede_cancelar()


class ReservaDetalleSerializer(serializers.ModelSerializer):
    """
    Serializer detallado para Reserva.
    """
    socio = UsuarioSerializer(read_only=True)
    clase = ClaseSerializer(read_only=True)
    puede_cancelar = serializers.SerializerMethodField()
    
    class Meta:
        model = Reserva
        fields = [
            'id', 'socio', 'clase', 'estado',
            'fecha_reserva', 'fecha_cancelacion', 'fecha_actualizacion',
            'puede_cancelar', 'notas', 'notificacion_enviada'
        ]
        read_only_fields = ['id', 'fecha_reserva', 'fecha_cancelacion', 'fecha_actualizacion']
    
    def get_puede_cancelar(self, obj):
        """Indica si la reserva puede ser cancelada."""
        return obj.puede_cancelar()


class ReservaCrearSerializer(serializers.ModelSerializer):
    """
    Serializer para crear reservas.
    """
    class Meta:
        model = Reserva
        fields = ['clase', 'notas']
    
    def validate(self, attrs):
        """Valida que se pueda crear la reserva."""
        request = self.context.get('request')
        socio = request.user
        clase = attrs.get('clase')
        
        # Verificar que el usuario sea socio
        if socio.rol != socio.SOCIO:
            raise serializers.ValidationError("Solo los socios pueden hacer reservas.")
        
        # Verificar que el socio pueda reservar
        if not socio.puede_reservar():
            if socio.esta_bloqueado():
                raise serializers.ValidationError(
                    f"Tu cuenta está bloqueada hasta {socio.bloqueado_hasta} por exceso de no-shows."
                )
            else:
                raise serializers.ValidationError("Tu membresía no está activa.")
        
        # Verificar que la clase pueda recibir reservas
        if not clase.puede_reservar():
            if clase.esta_llena:
                raise serializers.ValidationError(
                    "La clase está llena. Puedes agregarte a la lista de espera."
                )
            else:
                raise serializers.ValidationError("Esta clase no está disponible para reservas.")
        
        # Verificar que no exista una reserva activa previa (solo CONFIRMADA)
        if Reserva.objects.filter(socio=socio, clase=clase, estado=Reserva.CONFIRMADA).exists():
            raise serializers.ValidationError("Ya tienes una reserva para esta clase.")
        
        return attrs
    
    def create(self, validated_data):
        """Crea la reserva e incrementa el cupo."""
        request = self.context.get('request')
        validated_data['socio'] = request.user
        
        reserva = Reserva.objects.create(**validated_data)
        
        # Incrementar cupo en la clase
        reserva.clase.incrementar_cupo()
        
        return reserva


class ReservaCancelarSerializer(serializers.Serializer):
    """
    Serializer para cancelar reservas.
    """
    motivo = serializers.CharField(required=False, allow_blank=True)
