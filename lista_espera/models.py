from django.db import models
from django.utils import timezone
from usuarios.models import Usuario
from clases.models import Clase


class ListaEspera(models.Model):
    """
    Modelo para gestionar la lista de espera de clases llenas.
    """
    
    # Estados
    ESPERANDO = 'esperando'
    ASIGNADO = 'asignado'
    EXPIRADO = 'expirado'
    CANCELADO = 'cancelado'
    
    ESTADOS = [
        (ESPERANDO, 'Esperando'),
        (ASIGNADO, 'Asignado'),
        (EXPIRADO, 'Expirado'),
        (CANCELADO, 'Cancelado'),
    ]
    
    # Campos principales
    socio = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='lista_espera',
        verbose_name='Socio',
        limit_choices_to={'rol': Usuario.SOCIO}
    )
    
    clase = models.ForeignKey(
        Clase,
        on_delete=models.CASCADE,
        related_name='lista_espera',
        verbose_name='Clase'
    )
    
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default=ESPERANDO,
        verbose_name='Estado'
    )
    
    posicion = models.IntegerField(
        default=0,
        verbose_name='Posición en la Lista'
    )
    
    # Timestamps
    fecha_ingreso = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Ingreso'
    )
    
    fecha_asignacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Asignación'
    )
    
    fecha_expiracion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Expiración'
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name='Fecha de Actualización'
    )
    
    # Notificaciones
    notificacion_enviada = models.BooleanField(
        default=False,
        verbose_name='Notificación Enviada'
    )
    
    class Meta:
        verbose_name = 'Lista de Espera'
        verbose_name_plural = 'Listas de Espera'
        ordering = ['clase', 'posicion', 'fecha_ingreso']
        unique_together = ['socio', 'clase']  # Un socio solo puede estar una vez en lista de espera por clase
        indexes = [
            models.Index(fields=['clase', 'estado', 'posicion']),
            models.Index(fields=['socio', 'estado']),
        ]
    
    def __str__(self):
        return f"{self.socio.get_full_name()} - {self.clase.nombre} (Pos: {self.posicion})"
    
    def asignar_cupo(self):
        """
        Asigna un cupo disponible al socio en la lista de espera.
        Crea automáticamente una reserva y notifica al usuario.
        """
        from reservas.models import Reserva
        from notificaciones.models import Notificacion
        
        if self.estado == self.ESPERANDO and not self.clase.esta_llena:
            # Crear la reserva
            reserva = Reserva.objects.create(
                socio=self.socio,
                clase=self.clase,
                estado=Reserva.CONFIRMADA
            )
            
            # Incrementar cupo en la clase
            self.clase.incrementar_cupo()
            
            # Actualizar estado de lista de espera
            self.estado = self.ASIGNADO
            self.fecha_asignacion = timezone.now()
            self.save()
            
            # Notificar al socio que fue asignado desde lista de espera
            Notificacion.crear_notificacion_cupo_disponible(self.socio, self.clase)
            
            return reserva
        return None
    
    def cancelar(self):
        """Cancela la entrada en la lista de espera."""
        if self.estado == self.ESPERANDO:
            self.estado = self.CANCELADO
            self.save()
            
            # Actualizar posiciones de los que están después
            ListaEspera.objects.filter(
                clase=self.clase,
                estado=self.ESPERANDO,
                posicion__gt=self.posicion
            ).update(posicion=models.F('posicion') - 1)
            
            return True
        return False
    
    def save(self, *args, **kwargs):
        """
        Sobrescribe el método save para asignar la posición automáticamente.
        """
        if not self.pk and self.estado == self.ESPERANDO:
            # Obtener la última posición para esta clase
            ultima_posicion = ListaEspera.objects.filter(
                clase=self.clase,
                estado=self.ESPERANDO
            ).aggregate(models.Max('posicion'))['posicion__max'] or 0
            
            self.posicion = ultima_posicion + 1
        
        super().save(*args, **kwargs)
    
    @staticmethod
    def procesar_siguiente_en_lista(clase):
        """
        Procesa el siguiente socio en la lista de espera cuando hay un cupo disponible.
        """
        siguiente = ListaEspera.objects.filter(
            clase=clase,
            estado=ListaEspera.ESPERANDO
        ).order_by('posicion', 'fecha_ingreso').first()
        
        if siguiente:
            return siguiente.asignar_cupo()
        return None
