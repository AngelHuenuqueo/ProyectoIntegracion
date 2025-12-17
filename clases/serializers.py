"""
Serializers para la app de clases.
"""
from rest_framework import serializers
from .models import Clase
from usuarios.serializers import InstructorSerializer


class ClaseSerializer(serializers.ModelSerializer):
    """
    Serializer básico para Clase.
    """
    instructor_nombre = serializers.SerializerMethodField()
    cupos_disponibles = serializers.ReadOnlyField()
    esta_llena = serializers.ReadOnlyField()
    porcentaje_ocupacion = serializers.ReadOnlyField()
    puede_reservar = serializers.SerializerMethodField()
    
    class Meta:
        model = Clase
        fields = [
            'id', 'nombre', 'tipo', 'descripcion', 'imagen', 'instructor',
            'instructor_nombre', 'fecha', 'hora_inicio', 'hora_fin',
            'cupos_totales', 'cupos_ocupados', 'cupos_disponibles',
            'esta_llena', 'porcentaje_ocupacion', 'estado',
            'permite_lista_espera', 'puede_reservar',
            'fecha_creacion'
        ]
        read_only_fields = ['id', 'cupos_ocupados', 'fecha_creacion']
    
    def get_instructor_nombre(self, obj):
        """Retorna el nombre del instructor."""
        if obj.instructor:
            return obj.instructor.usuario.get_full_name()
        return None
    
    def get_puede_reservar(self, obj):
        """Indica si se puede reservar en esta clase."""
        return obj.puede_reservar()


class ClaseDetalleSerializer(serializers.ModelSerializer):
    """
    Serializer detallado para Clase, incluye información del instructor.
    """
    instructor = InstructorSerializer(read_only=True)
    cupos_disponibles = serializers.ReadOnlyField()
    esta_llena = serializers.ReadOnlyField()
    porcentaje_ocupacion = serializers.ReadOnlyField()
    puede_reservar = serializers.SerializerMethodField()
    total_reservas = serializers.SerializerMethodField()
    total_lista_espera = serializers.SerializerMethodField()
    
    class Meta:
        model = Clase
        fields = [
            'id', 'nombre', 'tipo', 'descripcion', 'imagen', 'instructor',
            'fecha', 'hora_inicio', 'hora_fin',
            'cupos_totales', 'cupos_ocupados', 'cupos_disponibles',
            'esta_llena', 'porcentaje_ocupacion', 'estado',
            'permite_lista_espera', 'puede_reservar',
            'total_reservas', 'total_lista_espera',
            'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'cupos_ocupados', 'fecha_creacion', 'fecha_actualizacion']
    
    def get_puede_reservar(self, obj):
        """Indica si se puede reservar en esta clase."""
        return obj.puede_reservar()
    
    def get_total_reservas(self, obj):
        """Retorna el total de reservas confirmadas."""
        return obj.reservas.filter(estado='confirmada').count()
    
    def get_total_lista_espera(self, obj):
        """Retorna el total de personas en lista de espera."""
        return obj.lista_espera.filter(estado='esperando').count()


class ClaseCrearSerializer(serializers.ModelSerializer):
    """
    Serializer para crear/actualizar clases.
    """
    class Meta:
        model = Clase
        fields = [
            'nombre', 'tipo', 'descripcion', 'imagen', 'instructor',
            'fecha', 'hora_inicio', 'hora_fin',
            'cupos_totales', 'estado', 'permite_lista_espera'
        ]
    
    def validate(self, attrs):
        """Valida que la hora de fin sea mayor que la hora de inicio."""
        if attrs.get('hora_fin') and attrs.get('hora_inicio'):
            if attrs['hora_fin'] <= attrs['hora_inicio']:
                raise serializers.ValidationError({
                    "hora_fin": "La hora de fin debe ser posterior a la hora de inicio."
                })
        return attrs
