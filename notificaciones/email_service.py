"""
Servicio de envío de emails para notificaciones.
"""
import logging
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def enviar_email_notificacion(notificacion):
    """
    Envía un email basado en una notificación.
    
    Args:
        notificacion: Instancia del modelo Notificacion
        
    Returns:
        bool: True si se envió correctamente, False si falló
    """
    try:
        # Verificar que el usuario tenga email
        if not notificacion.usuario.email:
            logger.warning(
                f"Usuario {notificacion.usuario.id} no tiene email configurado"
            )
            notificacion.marcar_como_fallida("Usuario sin email configurado")
            return False
        
        # Verificar configuración de email
        if not settings.EMAIL_HOST_USER:
            logger.warning("EMAIL_HOST_USER no configurado en settings")
            notificacion.marcar_como_fallida("Servidor de email no configurado")
            return False
        
        # Preparar contexto para la plantilla
        contexto = {
            'notificacion': notificacion,
            'usuario': notificacion.usuario,
            'titulo': notificacion.titulo,
            'mensaje': notificacion.mensaje,
            'datos': notificacion.datos_adicionales or {},
            'gimnasio_nombre': 'Gimnasio Energía Total',
            'gimnasio_email': settings.EMAIL_HOST_USER,
        }
        
        # Renderizar plantilla HTML
        try:
            html_content = render_to_string(
                'notificaciones/email_base.html', 
                contexto
            )
            text_content = strip_tags(html_content)
        except Exception as e:
            # Si falla la plantilla, usar texto plano
            logger.warning(f"Error al renderizar plantilla: {e}")
            html_content = None
            text_content = f"{notificacion.titulo}\n\n{notificacion.mensaje}"
        
        # Preparar email
        subject = notificacion.titulo
        from_email = settings.EMAIL_HOST_USER
        to_email = [notificacion.usuario.email]
        
        # Enviar email
        if html_content:
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=from_email,
                to=to_email
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)
        else:
            send_mail(
                subject=subject,
                message=text_content,
                from_email=from_email,
                recipient_list=to_email,
                fail_silently=False
            )
        
        # Marcar como enviada
        notificacion.marcar_como_enviada()
        logger.info(
            f"Email enviado a {notificacion.usuario.email} - "
            f"Notificación #{notificacion.id}"
        )
        return True
        
    except Exception as e:
        error_msg = str(e)
        logger.error(
            f"Error enviando email a {notificacion.usuario.email}: {error_msg}"
        )
        notificacion.marcar_como_fallida(error_msg)
        return False


def enviar_emails_pendientes():
    """
    Envía todos los emails de notificaciones pendientes.
    
    Returns:
        tuple: (enviados, fallidos)
    """
    from .models import Notificacion
    
    pendientes = Notificacion.objects.filter(
        estado=Notificacion.PENDIENTE,
        canal=Notificacion.EMAIL
    ).select_related('usuario')
    
    enviados = 0
    fallidos = 0
    
    for notificacion in pendientes:
        if enviar_email_notificacion(notificacion):
            enviados += 1
        else:
            fallidos += 1
    
    logger.info(f"Emails pendientes procesados: {enviados} enviados, {fallidos} fallidos")
    return enviados, fallidos


def reintentar_emails_fallidos(max_intentos=3):
    """
    Reintenta enviar emails que fallaron previamente.
    
    Args:
        max_intentos: Número máximo de intentos antes de abandonar
        
    Returns:
        tuple: (enviados, abandonados)
    """
    from .models import Notificacion
    
    fallidos = Notificacion.objects.filter(
        estado=Notificacion.FALLIDA,
        canal=Notificacion.EMAIL,
        intentos_envio__lt=max_intentos
    ).select_related('usuario')
    
    enviados = 0
    abandonados = 0
    
    for notificacion in fallidos:
        # Resetear estado a pendiente para reintentar
        notificacion.estado = Notificacion.PENDIENTE
        notificacion.save()
        
        if enviar_email_notificacion(notificacion):
            enviados += 1
        else:
            if notificacion.intentos_envio >= max_intentos:
                abandonados += 1
    
    logger.info(
        f"Reintento de emails: {enviados} enviados, {abandonados} abandonados"
    )
    return enviados, abandonados
