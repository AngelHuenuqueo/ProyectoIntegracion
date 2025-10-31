from django.db import models
from django.utils import timezone
from usuarios.models import Usuario
from clases.models import Clase


class Reserva(models.Model):
    """
    Modelo para representar una reserva de clase.
    """
    
    # Estados de la reserva
    CONFIRMADA = 'confirmada'
    CANCELADA = 'cancelada'
    NOSHOW = 'noshow'
    COMPLETADA = 'completada'
    
    ESTADOS = [
        (CONFIRMADA, 'Confirmada'),
        (CANCELADA, 'Cancelada'),
        (NOSHOW, 'No Show'),
        (COMPLETADA, 'Completada'),
    ]
    
    # Campos principales
    socio = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='reservas',
        verbose_name='Socio',
        limit_choices_to={'rol': Usuario.SOCIO}
    )
    
    clase = models.ForeignKey(
        Clase,
        on_delete=models.CASCADE,
        related_name='reservas',
        verbose_name='Clase'
    )
    
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default=CONFIRMADA,
        verbose_name='Estado'
    )
    
    # Timestamps
    fecha_reserva = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Reserva'
    )
    
    fecha_cancelacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Cancelación'
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name='Fecha de Actualización'
    )
    
    # Campos adicionales
    notas = models.TextField(
        blank=True,
        verbose_name='Notas'
    )
    
    notificacion_enviada = models.BooleanField(
        default=False,
        verbose_name='Notificación Enviada'
    )
    
    class Meta:
        verbose_name = 'Reserva'
        verbose_name_plural = 'Reservas'
        ordering = ['-fecha_reserva']
        # Eliminada restricción unique_together para permitir re-reservar clases canceladas
        # La validación se hace en el serializer solo para reservas CONFIRMADAS
        indexes = [
            models.Index(fields=['socio', 'estado']),
            models.Index(fields=['clase', 'estado']),
            models.Index(fields=['fecha_reserva']),
        ]
    
    def __str__(self):
        return f"{self.socio.get_full_name()} - {self.clase.nombre} ({self.get_estado_display()})"
    
    def cancelar(self):
        """Cancela la reserva y libera el cupo."""
        if self.estado == self.CONFIRMADA:
            self.estado = self.CANCELADA
            self.fecha_cancelacion = timezone.now()
            self.save()
            
            # Liberar cupo en la clase
            self.clase.liberar_cupo()
            
            return True
        return False
    
    def marcar_noshow(self):
        """Marca la reserva como no-show e incrementa el contador del socio."""
        if self.estado == self.CONFIRMADA:
            self.estado = self.NOSHOW
            self.save()
            
            # Incrementar contador de no-shows del socio
            self.socio.incrementar_noshow()
            
            # Liberar cupo
            self.clase.liberar_cupo()
            
            return True
        return False
    
    def marcar_completada(self):
        """Marca la reserva como completada."""
        if self.estado == self.CONFIRMADA:
            self.estado = self.COMPLETADA
            self.save()
            return True
        return False
    
    def puede_cancelar(self, horas_minimas=2):
        """
        Verifica si la reserva puede ser cancelada.
        Por defecto requiere cancelar con al menos 2 horas de anticipación.
        """
        if self.estado != self.CONFIRMADA:
            return False
        
        # Calcular datetime de la clase
        clase_datetime = timezone.make_aware(
            timezone.datetime.combine(self.clase.fecha, self.clase.hora_inicio)
        )
        
        # Calcular tiempo mínimo requerido
        from datetime import timedelta
        tiempo_minimo = clase_datetime - timedelta(hours=horas_minimas)
        
        # Verificar que aún hay tiempo
        return timezone.now() < tiempo_minimo
