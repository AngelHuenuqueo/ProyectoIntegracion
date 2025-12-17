from rest_framework import serializers
from .models import Equipo


class EquipoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Equipo."""
    
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    necesita_mantenimiento = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Equipo
        fields = [
            'id',
            'nombre',
            'categoria',
            'categoria_display',
            'marca',
            'modelo',
            'numero_serie',
            'descripcion',
            'imagen',
            'ubicacion',
            'estado',
            'estado_display',
            'fecha_compra',
            'ultimo_mantenimiento',
            'proximo_mantenimiento',
            'notas_mantenimiento',
            'activo',
            'necesita_mantenimiento',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']


class EquipoCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer para crear/actualizar Equipo."""
    
    class Meta:
        model = Equipo
        fields = [
            'nombre',
            'categoria',
            'marca',
            'modelo',
            'numero_serie',
            'descripcion',
            'imagen',
            'ubicacion',
            'estado',
            'fecha_compra',
            'ultimo_mantenimiento',
            'proximo_mantenimiento',
            'notas_mantenimiento',
            'activo',
        ]
