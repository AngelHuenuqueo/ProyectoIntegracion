"""
Manejador global de excepciones para API REST
Proporciona respuestas JSON consistentes para todas las excepciones
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.http import Http404
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Manejador global de excepciones que devuelve respuestas JSON consistentes
    
    Formato de respuesta:
    {
        "error": true,
        "message": "Mensaje amigable para el usuario",
        "code": "CODIGO_ERROR",
        "details": {}  // opcional, detalles adicionales
    }
    """
    
    # Llamar al manejador por defecto de DRF primero
    response = exception_handler(exc, context)
    
    # Si DRF no manejó la excepción, la manejamos nosotros
    if response is None:
        # Manejar excepciones de Django no manejadas por DRF
        if isinstance(exc, ValidationError):
            return Response({
                'error': True,
                'message': 'Error de validación',
                'code': 'VALIDATION_ERROR',
                'details': exc.message_dict if hasattr(exc, 'message_dict') else str(exc)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if isinstance(exc, Http404):
            return Response({
                'error': True,
                'message': 'Recurso no encontrado',
                'code': 'NOT_FOUND',
                'details': str(exc)
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Excepción no manejada - registrar y devolver error 500
        logger.error(
            f'Excepción no manejada: {exc.__class__.__name__}: {str(exc)}',
            exc_info=True,
            extra={'context': context}
        )
        
        return Response({
            'error': True,
            'message': 'Error interno del servidor',
            'code': 'INTERNAL_SERVER_ERROR',
            'details': str(exc) if logger.level == logging.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Personalizar la respuesta de DRF para que sea consistente
    custom_response = {
        'error': True,
        'message': get_error_message(exc, response),
        'code': get_error_code(exc),
        'details': response.data if should_include_details(exc) else None
    }
    
    # Registrar el error
    log_exception(exc, context, response.status_code)
    
    response.data = custom_response
    return response


def get_error_message(exc, response):
    """
    Extrae un mensaje de error amigable de la excepción
    """
    # Si la excepción tiene un detail, usarlo
    if hasattr(exc, 'detail'):
        detail = exc.detail
        if isinstance(detail, dict):
            # Si detail es un dict, tomar el primer mensaje
            return next(iter(detail.values()))[0] if detail else str(exc)
        elif isinstance(detail, list):
            return detail[0] if detail else str(exc)
        else:
            return str(detail)
    
    # Si no, usar el mensaje por defecto de la respuesta
    if isinstance(response.data, dict):
        return response.data.get('detail', str(exc))
    elif isinstance(response.data, list):
        return response.data[0] if response.data else str(exc)
    
    return str(exc)


def get_error_code(exc):
    """
    Obtiene el código de error de la excepción
    """
    # Si la excepción tiene un código personalizado, usarlo
    if hasattr(exc, 'default_code'):
        return exc.default_code.upper()
    
    # Códigos por defecto según el tipo de excepción
    error_code_map = {
        'AuthenticationFailed': 'AUTHENTICATION_FAILED',
        'NotAuthenticated': 'NOT_AUTHENTICATED',
        'PermissionDenied': 'PERMISSION_DENIED',
        'NotFound': 'NOT_FOUND',
        'MethodNotAllowed': 'METHOD_NOT_ALLOWED',
        'ValidationError': 'VALIDATION_ERROR',
        'ParseError': 'PARSE_ERROR',
        'Throttled': 'THROTTLED',
    }
    
    exc_name = exc.__class__.__name__
    return error_code_map.get(exc_name, 'UNKNOWN_ERROR')


def should_include_details(exc):
    """
    Determina si se deben incluir detalles adicionales en la respuesta
    """
    # Incluir detalles para errores de validación
    if hasattr(exc, 'detail') and isinstance(exc.detail, dict):
        return True
    
    # No incluir detalles para errores de autenticación (seguridad)
    if exc.__class__.__name__ in ['AuthenticationFailed', 'NotAuthenticated']:
        return False
    
    return False


def log_exception(exc, context, status_code):
    """
    Registra la excepción en los logs según su severidad
    """
    request = context.get('request')
    view = context.get('view')
    
    # Información del contexto
    log_context = {
        'exception_type': exc.__class__.__name__,
        'status_code': status_code,
        'path': request.path if request else None,
        'method': request.method if request else None,
        'user': str(request.user) if request and hasattr(request, 'user') else None,
        'view': view.__class__.__name__ if view else None,
    }
    
    # Determinar nivel de log según el código de estado
    if status_code >= 500:
        # Errores del servidor - ERROR level
        logger.error(
            f'{exc.__class__.__name__}: {str(exc)}',
            extra=log_context,
            exc_info=True
        )
    elif status_code >= 400:
        # Errores del cliente - WARNING level
        logger.warning(
            f'{exc.__class__.__name__}: {str(exc)}',
            extra=log_context
        )
    else:
        # Otros - INFO level
        logger.info(
            f'{exc.__class__.__name__}: {str(exc)}',
            extra=log_context
        )
