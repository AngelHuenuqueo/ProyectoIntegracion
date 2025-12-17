from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from usuarios.models import Instructor


class Clase(models.Model):
    """
    Modelo para representar una clase del gimnasio.
    """
    
    # Tipos de clases
    SPINNING = 'spinning'
    YOGA = 'yoga'
    PILATES = 'pilates'
    MUSCULACION = 'musculacion'
    CARDIO = 'cardio'
    
    TIPOS_CLASE = [
        (SPINNING, 'Spinning'),
        (YOGA, 'Yoga'),
        (PILATES, 'Pilates'),
        (MUSCULACION, 'Musculación'),
        (CARDIO, 'Cardio'),
    ]
    
    # Estados de la clase
    ACTIVA = 'activa'
    CANCELADA = 'cancelada'
    COMPLETADA = 'completada'
    
    ESTADOS = [
        (ACTIVA, 'Activa'),
        (CANCELADA, 'Cancelada'),
        (COMPLETADA, 'Completada'),
    ]
    
    # Campos principales
    nombre = models.CharField(
        max_length=100,
        verbose_name='Nombre de la Clase'
    )
    
    tipo = models.CharField(
        max_length=20,
        choices=TIPOS_CLASE,
        verbose_name='Tipo de Clase'
    )
    
    descripcion = models.TextField(
        blank=True,
        verbose_name='Descripción'
    )
    
    imagen = models.ImageField(
        upload_to='clases/',
        null=True,
        blank=True,
        verbose_name='Imagen de la Clase'
    )
    
    instructor = models.ForeignKey(
        Instructor,
        on_delete=models.SET_NULL,
        null=True,
        related_name='clases',
        verbose_name='Instructor'
    )
    
    # Fecha y hora
    fecha = models.DateField(
        verbose_name='Fecha'
    )
    
    hora_inicio = models.TimeField(
        verbose_name='Hora de Inicio'
    )
    
    hora_fin = models.TimeField(
        verbose_name='Hora de Fin'
    )
    
    # Cupos
    cupos_totales = models.IntegerField(
        validators=[MinValueValidator(1)],
        default=20,
        verbose_name='Cupos Totales'
    )
    
    cupos_ocupados = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Cupos Ocupados'
    )
    
    # Estado
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default=ACTIVA,
        verbose_name='Estado'
    )
    
    # Configuración
    permite_lista_espera = models.BooleanField(
        default=True,
        verbose_name='Permite Lista de Espera'
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
        verbose_name = 'Clase'
        verbose_name_plural = 'Clases'
        ordering = ['fecha', 'hora_inicio']
        indexes = [
            models.Index(fields=['fecha', 'tipo']),
            models.Index(fields=['estado']),
        ]
    
    def __str__(self):
        return f"{self.nombre} - {self.get_tipo_display()} ({self.fecha} {self.hora_inicio})"
    
    def clean(self):
        """Valida que la hora de fin sea posterior a la hora de inicio."""
        super().clean()
        if self.hora_inicio and self.hora_fin:
            if self.hora_fin <= self.hora_inicio:
                raise ValidationError({
                    'hora_fin': 'La hora de fin debe ser posterior a la hora de inicio.'
                })
    
    @property
    def cupos_disponibles(self):
        """Retorna la cantidad de cupos disponibles."""
        return self.cupos_totales - self.cupos_ocupados
    
    @property
    def esta_llena(self):
        """Verifica si la clase está llena."""
        return self.cupos_ocupados >= self.cupos_totales
    
    @property
    def porcentaje_ocupacion(self):
        """Calcula el porcentaje de ocupación."""
        if self.cupos_totales == 0:
            return 0
        return (self.cupos_ocupados / self.cupos_totales) * 100
    
    def incrementar_cupo(self):
        """Incrementa el contador de cupos ocupados."""
        if not self.esta_llena:
            self.cupos_ocupados += 1
            self.save()
            return True
        return False
    
    def liberar_cupo(self):
        """Libera un cupo ocupado."""
        if self.cupos_ocupados > 0:
            self.cupos_ocupados -= 1
            self.save()
            return True
        return False
    
    def puede_reservar(self):
        """Verifica si se puede reservar en esta clase."""
        return (
            self.estado == self.ACTIVA and
            not self.esta_llena and
            self.fecha >= timezone.now().date()
        )
