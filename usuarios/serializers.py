"""
Serializers para la app de usuarios.
Convierten los modelos a JSON y viceversa.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Usuario, Instructor


class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer básico para Usuario.
    """
    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'rol', 'telefono', 'estado_membresia',
            'fecha_inicio_membresia', 'fecha_fin_membresia',
            'total_noshow', 'noshow_mes_actual', 'bloqueado_hasta',
            'fecha_creacion', 'is_active'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'total_noshow', 'noshow_mes_actual', 'bloqueado_hasta']


class UsuarioRegistroSerializer(serializers.ModelSerializer):
    """
    Serializer para registro de nuevos usuarios (socios).
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Usuario
        fields = [
            'username', 'password', 'password2', 'email',
            'first_name', 'last_name', 'telefono'
        ]

    def validate(self, attrs):
        """Valida que las contraseñas coincidan."""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        return attrs

    def create(self, validated_data):
        """Crea un nuevo usuario (socio por defecto)."""
        validated_data.pop('password2')
        
        usuario = Usuario.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            telefono=validated_data.get('telefono', ''),
            rol=Usuario.SOCIO,
            estado_membresia=Usuario.ACTIVA,
            password=validated_data['password']
        )
        
        return usuario


class UsuarioDetalleSerializer(serializers.ModelSerializer):
    """
    Serializer detallado para Usuario, incluye información del perfil.
    """
    puede_reservar = serializers.SerializerMethodField()
    esta_bloqueado = serializers.SerializerMethodField()
    
    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'rol', 'telefono', 'estado_membresia',
            'fecha_inicio_membresia', 'fecha_fin_membresia',
            'total_noshow', 'noshow_mes_actual', 'bloqueado_hasta',
            'puede_reservar', 'esta_bloqueado',
            'fecha_creacion', 'is_active'
        ]
        read_only_fields = ['id', 'fecha_creacion']
    
    def get_puede_reservar(self, obj):
        """Indica si el usuario puede hacer reservas."""
        return obj.puede_reservar()
    
    def get_esta_bloqueado(self, obj):
        """Indica si el usuario está bloqueado."""
        return obj.esta_bloqueado()


class InstructorSerializer(serializers.ModelSerializer):
    """
    Serializer para Instructor.
    """
    usuario = UsuarioSerializer(read_only=True)
    nombre_completo = serializers.SerializerMethodField()
    
    class Meta:
        model = Instructor
        fields = [
            'id', 'usuario', 'nombre_completo', 'especialidades',
            'biografia', 'foto', 'activo', 'fecha_creacion'
        ]
        read_only_fields = ['id', 'fecha_creacion']
    
    def get_nombre_completo(self, obj):
        """Retorna el nombre completo del instructor."""
        return obj.usuario.get_full_name()


class CambiarPasswordSerializer(serializers.Serializer):
    """
    Serializer para cambio de contraseña.
    """
    password_actual = serializers.CharField(required=True)
    password_nueva = serializers.CharField(required=True, validators=[validate_password])
    password_nueva2 = serializers.CharField(required=True)

    def validate(self, attrs):
        """Valida que las nuevas contraseñas coincidan."""
        if attrs['password_nueva'] != attrs['password_nueva2']:
            raise serializers.ValidationError({"password_nueva": "Las contraseñas no coinciden."})
        return attrs
