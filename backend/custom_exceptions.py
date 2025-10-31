"""
Excepciones personalizadas para el sistema de reservas de gimnasio
"""

from rest_framework.exceptions import APIException
from rest_framework import status


class ReservaNoDisponibleException(APIException):
    """
    Excepción cuando una clase no está disponible para reserva
    (por ejemplo, la clase ya pasó o está cancelada)
    """
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'La clase no está disponible para reserva'
    default_code = 'RESERVA_NO_DISPONIBLE'


class CuposAgotadosException(APIException):
    """
    Excepción cuando una clase no tiene cupos disponibles
    """
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'No hay cupos disponibles para esta clase'
    default_code = 'CUPOS_AGOTADOS'


class UsuarioBloqueadoException(APIException):
    """
    Excepción cuando un usuario está bloqueado por exceso de no-shows
    """
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Tu cuenta está bloqueada por exceso de inasistencias. Contacta al administrador.'
    default_code = 'USUARIO_BLOQUEADO'


class ClaseNoEncontradaException(APIException):
    """
    Excepción cuando no se encuentra una clase
    """
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'La clase solicitada no existe'
    default_code = 'CLASE_NO_ENCONTRADA'


class ReservaDuplicadaException(APIException):
    """
    Excepción cuando un usuario intenta reservar una clase que ya tiene reservada
    """
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Ya tienes una reserva para esta clase'
    default_code = 'RESERVA_DUPLICADA'


class CancelacionTardiaException(APIException):
    """
    Excepción cuando se intenta cancelar una reserva con menos de 2 horas de anticipación
    """
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'No puedes cancelar con menos de 2 horas de anticipación'
    default_code = 'CANCELACION_TARDIA'


class PermisosDenegadosException(APIException):
    """
    Excepción cuando el usuario no tiene permisos para realizar una acción
    """
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'No tienes permisos para realizar esta acción'
    default_code = 'PERMISOS_DENEGADOS'


class ValidacionException(APIException):
    """
    Excepción genérica para errores de validación
    """
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Error en la validación de datos'
    default_code = 'VALIDACION_ERROR'
