"""
Señales para el envío automático de emails de notificaciones.
"""
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notificacion

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Notificacion)
def enviar_email_al_crear(sender, instance, created, **kwargs):
    """
    Envía email automáticamente cuando se crea una notificación con canal EMAIL.
    """
    if not created:
        return
    
    # Solo enviar si el canal es EMAIL y está pendiente
    if instance.canal != Notificacion.EMAIL:
        return
    
    if instance.estado != Notificacion.PENDIENTE:
        return
    
    # Importar aquí para evitar importación circular
    from .email_service import enviar_email_notificacion
    
    try:
        logger.info(
            f"Enviando email automático para notificación #{instance.id} "
            f"a {instance.usuario.email}"
        )
        enviar_email_notificacion(instance)
    except Exception as e:
        logger.error(f"Error en señal de envío de email: {e}")
