from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.utils import timezone
from datetime import timedelta


class Usuario(AbstractUser):
    """
    Modelo de Usuario personalizado para el gimnasio.
    Extiende AbstractUser para incluir campos adicionales.
    """
    
    # Tipos de roles
    SOCIO = 'socio'
    INSTRUCTOR = 'instructor'
    ADMINISTRADOR = 'administrador'
    
    ROLES = [
        (SOCIO, 'Socio'),
        (INSTRUCTOR, 'Instructor'),
        (ADMINISTRADOR, 'Administrador'),
    ]
    
    # Estados de membresía
    ACTIVA = 'activa'
    INACTIVA = 'inactiva'
    SUSPENDIDA = 'suspendida'
    
    ESTADOS_MEMBRESIA = [
        (ACTIVA, 'Activa'),
        (INACTIVA, 'Inactiva'),
        (SUSPENDIDA, 'Suspendida'),
    ]
    
    # Campos adicionales
    rol = models.CharField(
        max_length=20,
        choices=ROLES,
        default=SOCIO,
        verbose_name='Rol'
    )
    
    telefono_validator = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="El teléfono debe estar en formato: '+999999999'. Hasta 15 dígitos."
    )
    telefono = models.CharField(
        validators=[telefono_validator],
        max_length=17,
        blank=True,
        verbose_name='Teléfono'
    )
    
    estado_membresia = models.CharField(
        max_length=20,
        choices=ESTADOS_MEMBRESIA,
        default=ACTIVA,
        verbose_name='Estado de Membresía'
    )
    
    fecha_inicio_membresia = models.DateField(
        null=True,
        blank=True,
        verbose_name='Fecha Inicio Membresía'
    )
    
    fecha_fin_membresia = models.DateField(
        null=True,
        blank=True,
        verbose_name='Fecha Fin Membresía'
    )
    
    # Tracking de no-shows
    total_noshow = models.IntegerField(
        default=0,
        verbose_name='Total No-Shows'
    )
    
    noshow_mes_actual = models.IntegerField(
        default=0,
        verbose_name='No-Shows del Mes Actual'
    )
    
    bloqueado_hasta = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Bloqueado Hasta'
    )
    
    # Metadatos
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Creación'
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name='Fecha de Actualización'
    )
    
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-fecha_creacion']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_rol_display()})"
    
    def esta_bloqueado(self):
        """Verifica si el usuario está bloqueado por no-shows."""
        if self.bloqueado_hasta:
            return timezone.now() < self.bloqueado_hasta
        return False
    
    def puede_reservar(self):
        """Verifica si el usuario puede hacer reservas."""
        return (
            self.estado_membresia == self.ACTIVA and
            not self.esta_bloqueado()
        )
    
    def incrementar_noshow(self):
        """Incrementa el contador de no-shows."""
        self.total_noshow += 1
        self.noshow_mes_actual += 1
        
        # Bloquear si alcanza 3 no-shows en el mes
        if self.noshow_mes_actual >= 3:
            self.bloqueado_hasta = timezone.now() + timedelta(days=30)
            self.estado_membresia = self.SUSPENDIDA
        
        self.save()
    
    def resetear_noshow_mensual(self):
        """Resetea el contador mensual de no-shows."""
        self.noshow_mes_actual = 0
        if self.estado_membresia == self.SUSPENDIDA and not self.esta_bloqueado():
            self.estado_membresia = self.ACTIVA
        self.save()


class Instructor(models.Model):
    """
    Modelo para información adicional de instructores.
    Tiene relación uno a uno con Usuario.
    """
    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        related_name='perfil_instructor',
        verbose_name='Usuario'
    )
    
    especialidades = models.CharField(
        max_length=200,
        blank=True,
        help_text='Ej: Spinning, Yoga, Pilates',
        verbose_name='Especialidades'
    )
    
    certificaciones = models.TextField(
        blank=True,
        help_text='Certificaciones y títulos del instructor',
        verbose_name='Certificaciones'
    )
    
    biografia = models.TextField(
        blank=True,
        verbose_name='Biografía'
    )
    
    foto = models.ImageField(
        upload_to='instructores/',
        null=True,
        blank=True,
        verbose_name='Foto'
    )
    
    activo = models.BooleanField(
        default=True,
        verbose_name='Activo'
    )
    
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Creación'
    )
    
    class Meta:
        verbose_name = 'Instructor'
        verbose_name_plural = 'Instructores'
        ordering = ['usuario__first_name']
    
    def __str__(self):
        return f"Instructor: {self.usuario.get_full_name()}"
