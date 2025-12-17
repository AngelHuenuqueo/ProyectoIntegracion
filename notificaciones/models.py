from django.db import models
from django.utils import timezone
from usuarios.models import Usuario


class Notificacion(models.Model):
    """
    Modelo para gestionar las notificaciones del sistema.
    """
    
    # Tipos de notificación
    RESERVA_CONFIRMADA = 'reserva_confirmada'
    RESERVA_CANCELADA = 'reserva_cancelada'
    CLASE_CANCELADA = 'clase_cancelada'
    CUPO_DISPONIBLE = 'cupo_disponible'
    RECORDATORIO = 'recordatorio'
    BLOQUEO = 'bloqueo'
    OTROS = 'otros'
    
    TIPOS = [
        (RESERVA_CONFIRMADA, 'Reserva Confirmada'),
        (RESERVA_CANCELADA, 'Reserva Cancelada'),
        (CLASE_CANCELADA, 'Clase Cancelada'),
        (CUPO_DISPONIBLE, 'Cupo Disponible'),
        (RECORDATORIO, 'Recordatorio'),
        (BLOQUEO, 'Bloqueo de Cuenta'),
        (OTROS, 'Otros'),
    ]
    
    # Estados
    PENDIENTE = 'pendiente'
    ENVIADA = 'enviada'
    FALLIDA = 'fallida'
    LEIDA = 'leida'
    
    ESTADOS = [
        (PENDIENTE, 'Pendiente'),
        (ENVIADA, 'Enviada'),
        (FALLIDA, 'Fallida'),
        (LEIDA, 'Leída'),
    ]
    
    # Canales
    EMAIL = 'email'
    PUSH = 'push'
    SMS = 'sms'
    SISTEMA = 'sistema'
    
    CANALES = [
        (EMAIL, 'Email'),
        (PUSH, 'Push Notification'),
        (SMS, 'SMS'),
        (SISTEMA, 'Sistema'),
    ]
    
    # Campos principales
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='notificaciones',
        verbose_name='Usuario'
    )
    
    tipo = models.CharField(
        max_length=30,
        choices=TIPOS,
        verbose_name='Tipo de Notificación'
    )
    
    canal = models.CharField(
        max_length=20,
        choices=CANALES,
        default=SISTEMA,
        verbose_name='Canal'
    )
    
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default=PENDIENTE,
        verbose_name='Estado'
    )
    
    titulo = models.CharField(
        max_length=200,
        verbose_name='Título'
    )
    
    mensaje = models.TextField(
        verbose_name='Mensaje'
    )
    
    # Metadatos
    datos_adicionales = models.JSONField(
        null=True,
        blank=True,
        verbose_name='Datos Adicionales',
        help_text='Información adicional en formato JSON'
    )
    
    # Timestamps
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Creación'
    )
    
    fecha_envio = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Envío'
    )
    
    fecha_lectura = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Lectura'
    )
    
    # Control de errores
    intentos_envio = models.IntegerField(
        default=0,
        verbose_name='Intentos de Envío'
    )
    
    error_mensaje = models.TextField(
        blank=True,
        verbose_name='Mensaje de Error'
    )
    
    class Meta:
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['usuario', 'estado']),
            models.Index(fields=['tipo', 'estado']),
            models.Index(fields=['fecha_creacion']),
        ]
    
    def __str__(self):
        return f"{self.usuario.get_full_name()} - {self.get_tipo_display()} ({self.get_estado_display()})"
    
    def marcar_como_enviada(self):
        """Marca la notificación como enviada."""
        self.estado = self.ENVIADA
        self.fecha_envio = timezone.now()
        self.save()
    
    def marcar_como_leida(self):
        """Marca la notificación como leída."""
        if self.estado == self.ENVIADA:
            self.estado = self.LEIDA
            self.fecha_lectura = timezone.now()
            self.save()
            return True
        return False
    
    def marcar_como_fallida(self, error=''):
        """Marca la notificación como fallida."""
        self.estado = self.FALLIDA
        self.intentos_envio += 1
        self.error_mensaje = error
        self.save()
    
    @staticmethod
    def crear_notificacion_reserva(socio, clase, tipo=None):
        """Crea una notificación de reserva."""
        if tipo is None:
            tipo = Notificacion.RESERVA_CONFIRMADA
        
        return Notificacion.objects.create(
            usuario=socio,
            tipo=tipo,
            canal=Notificacion.EMAIL,
            titulo=f'Reserva {clase.nombre}',
            mensaje=f'Tu reserva para {clase.nombre} el {clase.fecha} a las {clase.hora_inicio} ha sido confirmada.',
            datos_adicionales={
                'clase_id': clase.id,
                'clase_nombre': clase.nombre,
                'fecha': str(clase.fecha),
                'hora': str(clase.hora_inicio)
            }
        )
    
    @staticmethod
    def crear_notificacion_cupo_disponible(socio, clase):
        """Crea una notificación de cupo disponible."""
        return Notificacion.objects.create(
            usuario=socio,
            tipo=Notificacion.CUPO_DISPONIBLE,
            canal=Notificacion.PUSH,
            titulo=f'Cupo disponible - {clase.nombre}',
            mensaje=f'¡Hay un cupo disponible para {clase.nombre} el {clase.fecha}! Reserva ahora.',
            datos_adicionales={
                'clase_id': clase.id,
                'clase_nombre': clase.nombre,
                'fecha': str(clase.fecha),
                'hora': str(clase.hora_inicio)
            }
        )
    
    @staticmethod
    def notificar_instructor_nueva_reserva(clase, socio):
        """Notifica al instructor cuando hay una nueva reserva en su clase."""
        if clase.instructor and clase.instructor.usuario:
            return Notificacion.objects.create(
                usuario=clase.instructor.usuario,
                tipo=Notificacion.RESERVA_CONFIRMADA,
                canal=Notificacion.SISTEMA,
                titulo=f'Nueva reserva - {clase.nombre}',
                mensaje=f'{socio.get_full_name() or socio.username} se ha inscrito en tu clase {clase.nombre} del {clase.fecha} a las {clase.hora_inicio}.',
                datos_adicionales={
                    'clase_id': clase.id,
                    'clase_nombre': clase.nombre,
                    'fecha': str(clase.fecha),
                    'hora': str(clase.hora_inicio),
                    'socio_id': socio.id,
                    'socio_nombre': socio.get_full_name() or socio.username
                }
            )
        return None
    
    @staticmethod
    def notificar_instructor_cancelacion(clase, socio):
        """Notifica al instructor cuando se cancela una reserva de su clase."""
        if clase.instructor and clase.instructor.usuario:
            return Notificacion.objects.create(
                usuario=clase.instructor.usuario,
                tipo=Notificacion.RESERVA_CANCELADA,
                canal=Notificacion.SISTEMA,
                titulo=f'Reserva cancelada - {clase.nombre}',
                mensaje=f'{socio.get_full_name() or socio.username} ha cancelado su reserva para la clase {clase.nombre} del {clase.fecha} a las {clase.hora_inicio}.',
                datos_adicionales={
                    'clase_id': clase.id,
                    'clase_nombre': clase.nombre,
                    'fecha': str(clase.fecha),
                    'hora': str(clase.hora_inicio),
                    'socio_id': socio.id,
                    'socio_nombre': socio.get_full_name() or socio.username
                }
            )
        return None
