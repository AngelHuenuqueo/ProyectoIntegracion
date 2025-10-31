"""
Serializers para la app de lista de espera.
"""
from rest_framework import serializers
from .models import ListaEspera
from clases.serializers import ClaseSerializer
from usuarios.serializers import UsuarioSerializer


class ListaEsperaSerializer(serializers.ModelSerializer):
    """
    Serializer básico para Lista de Espera.
    """
    socio_nombre = serializers.SerializerMethodField()
    clase_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = ListaEspera
        fields = [
            'id', 'socio', 'socio_nombre', 'clase', 'clase_nombre',
            'posicion', 'estado', 'fecha_ingreso', 'fecha_asignacion',
            'notificacion_enviada'
        ]
        read_only_fields = ['id', 'posicion', 'fecha_ingreso', 'fecha_asignacion']
    
    def get_socio_nombre(self, obj):
        """Retorna el nombre del socio."""
        return obj.socio.get_full_name()
    
    def get_clase_nombre(self, obj):
        """Retorna el nombre de la clase."""
        return obj.clase.nombre


class ListaEsperaDetalleSerializer(serializers.ModelSerializer):
    """
    Serializer detallado para Lista de Espera.
    """
    socio = UsuarioSerializer(read_only=True)
    clase = ClaseSerializer(read_only=True)
    
    class Meta:
        model = ListaEspera
        fields = [
            'id', 'socio', 'clase', 'posicion', 'estado',
            'fecha_ingreso', 'fecha_asignacion', 'fecha_expiracion',
            'fecha_actualizacion', 'notificacion_enviada'
        ]
        read_only_fields = [
            'id', 'posicion', 'fecha_ingreso', 'fecha_asignacion',
            'fecha_expiracion', 'fecha_actualizacion'
        ]


class ListaEsperaCrearSerializer(serializers.ModelSerializer):
    """
    Serializer para agregar a lista de espera.
    """
    class Meta:
        model = ListaEspera
        fields = ['clase']
    
    def validate(self, attrs):
        """Valida que se pueda agregar a la lista de espera."""
        request = self.context.get('request')
        socio = request.user
        clase = attrs.get('clase')
        
        # Verificar que el usuario sea socio
        if socio.rol != socio.SOCIO:
            raise serializers.ValidationError("Solo los socios pueden agregarse a la lista de espera.")
        
        # Verificar que el socio pueda reservar
        if not socio.puede_reservar():
            raise serializers.ValidationError("No puedes agregarte a la lista de espera en este momento.")
        
        # Verificar que la clase esté llena
        if not clase.esta_llena:
            raise serializers.ValidationError(
                "La clase aún tiene cupos disponibles. Puedes reservar directamente."
            )
        
        # Verificar que la clase permita lista de espera
        if not clase.permite_lista_espera:
            raise serializers.ValidationError("Esta clase no permite lista de espera.")
        
        # Verificar que no esté ya en la lista de espera activa (estado esperando)
        entrada_existente = ListaEspera.objects.filter(
            socio=socio, 
            clase=clase
        ).first()
        
        if entrada_existente:
            if entrada_existente.estado == ListaEspera.ESPERANDO:
                raise serializers.ValidationError("Ya estás en la lista de espera de esta clase.")
            else:
                # Si existe pero con otro estado (cancelado, asignado, etc.), eliminarla
                entrada_existente.delete()
        
        # Verificar que no tenga una reserva confirmada
        from reservas.models import Reserva
        if Reserva.objects.filter(socio=socio, clase=clase, estado=Reserva.CONFIRMADA).exists():
            raise serializers.ValidationError("Ya tienes una reserva confirmada para esta clase.")
        
        return attrs
    
    def create(self, validated_data):
        """Crea la entrada en lista de espera."""
        request = self.context.get('request')
        validated_data['socio'] = request.user
        validated_data['estado'] = ListaEspera.ESPERANDO
        
        return ListaEspera.objects.create(**validated_data)
