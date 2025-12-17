"""
Views para la API de reservas.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from datetime import datetime, timedelta
import logging

from .models import Reserva
from .serializers import (
    ReservaSerializer, ReservaDetalleSerializer,
    ReservaCrearSerializer, ReservaCancelarSerializer
)
from backend.custom_exceptions import (
    ReservaNoDisponibleException,
    CuposAgotadosException,
    UsuarioBloqueadoException,
    CancelacionTardiaException,
    PermisosDenegadosException,
    ReservaDuplicadaException
)

# Logger para este módulo
logger = logging.getLogger('reservas')


class ReservaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar reservas.
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Retorna las reservas según el rol del usuario."""
        # Los administradores pueden ver todas las reservas
        if self.request.user.is_staff:
            return Reserva.objects.all().order_by('-fecha_reserva')
        return Reserva.objects.filter(socio=self.request.user).order_by('-fecha_reserva')
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción."""
        if self.action in ['retrieve', 'list']:
            return ReservaDetalleSerializer
        elif self.action == 'create':
            return ReservaCrearSerializer
        elif self.action == 'cancelar':
            return ReservaCancelarSerializer
        return ReservaSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Crea una nueva reserva.
        POST /api/reservas/
        """
        try:
            serializer = self.get_serializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            reserva = serializer.save()
            
            # Log de reserva exitosa
            logger.info(
                f'Reserva creada: Usuario {request.user.username} (ID: {request.user.id}) '
                f'reservó clase {reserva.clase.nombre} (ID: {reserva.clase.id}) '
                f'para {reserva.clase.fecha} {reserva.clase.hora_inicio}'
            )
            
            # Crear notificaciones
            from notificaciones.models import Notificacion
            # Notificación para el socio
            Notificacion.crear_notificacion_reserva(
                socio=request.user,
                clase=reserva.clase,
                tipo=Notificacion.RESERVA_CONFIRMADA
            )
            # Notificación para el instructor
            logger.info(f'Intentando notificar al instructor de la clase {reserva.clase.nombre}')
            logger.info(f'Clase tiene instructor: {reserva.clase.instructor}')
            if reserva.clase.instructor:
                logger.info(f'Usuario del instructor: {reserva.clase.instructor.usuario}')
            notif_instructor = Notificacion.notificar_instructor_nueva_reserva(
                clase=reserva.clase,
                socio=request.user
            )
            if notif_instructor:
                logger.info(f'Notificación creada para instructor: ID {notif_instructor.id}')
            else:
                logger.warning('No se pudo crear notificación para el instructor')
            
            return Response({
                'message': 'Reserva creada exitosamente',
                'reserva': ReservaDetalleSerializer(reserva).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Log de error al crear reserva
            logger.error(
                f'Error al crear reserva: Usuario {request.user.username} '
                f'intentó reservar clase {request.data.get("clase")} - Error: {str(e)}'
            )
            raise
    
    def destroy(self, request, pk=None):
        """
        Elimina una reserva del historial.
        DELETE /api/reservas/{id}/
        Solo se pueden eliminar reservas canceladas, completadas o no-show.
        """
        reserva = self.get_object()
        
        # Verificar que la reserva pertenezca al usuario (o sea admin)
        if reserva.socio != request.user and not request.user.is_staff:
            logger.warning(
                f'Intento de eliminación no autorizado: Usuario {request.user.username} '
                f'intentó eliminar reserva {pk} de {reserva.socio.username}'
            )
            raise PermisosDenegadosException('No tienes permiso para eliminar esta reserva')
        
        # Solo permitir eliminar reservas que no estén confirmadas
        if reserva.estado == Reserva.CONFIRMADA:
            return Response(
                {'error': 'No puedes eliminar una reserva confirmada. Primero debes cancelarla.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Log antes de eliminar
        logger.info(
            f'Reserva eliminada: Usuario {request.user.username} eliminó reserva {pk} '
            f'de clase {reserva.clase.nombre} ({reserva.clase.fecha}) - Estado: {reserva.estado}'
        )
        
        # Eliminar la reserva
        reserva.delete()
        
        return Response(
            {'message': 'Reserva eliminada del historial'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """
        Cancela una reserva existente.
        POST /api/reservas/{id}/cancelar/
        """
        reserva = self.get_object()
        
        # Verificar que la reserva pertenezca al usuario (admins pueden cancelar cualquiera)
        if reserva.socio != request.user and not request.user.is_staff:
            logger.warning(
                f'Intento de cancelación no autorizado: Usuario {request.user.username} '
                f'intentó cancelar reserva {pk} de {reserva.socio.username}'
            )
            raise PermisosDenegadosException('No tienes permiso para cancelar esta reserva')
        
        # Verificar si la clase ya pasó
        clase_datetime = timezone.make_aware(
            datetime.combine(reserva.clase.fecha, reserva.clase.hora_inicio)
        )
        clase_paso = clase_datetime < timezone.now()
        
        # Si la clase ya pasó, permitir cancelar pero registrar en el log
        if clase_paso:
            logger.info(
                f'Cancelación de clase pasada: Usuario {request.user.username} '
                f'canceló reserva {pk} de clase {reserva.clase.nombre} que ya pasó el {reserva.clase.fecha}'
            )
        # Si la clase no ha pasado, verificar tiempo mínimo (solo para usuarios normales, no admins)
        elif not request.user.is_staff and not reserva.puede_cancelar(horas_minimas=1):
            tiempo_restante = clase_datetime - timezone.now()
            minutos_restantes = tiempo_restante.total_seconds() / 60
            
            mensaje = f'No puedes cancelar con menos de 1 hora de anticipación. Faltan {int(minutos_restantes)} minutos para la clase.'
            
            logger.warning(
                f'Cancelación tardía rechazada: Usuario {request.user.username} '
                f'intentó cancelar reserva {pk} con {minutos_restantes:.1f} minutos de anticipación'
            )
            raise CancelacionTardiaException(mensaje)
        
        # Intentar cancelar
        if reserva.cancelar():
            logger.info(
                f'Reserva cancelada: Usuario {request.user.username} canceló reserva {pk} '
                f'para clase {reserva.clase.nombre} del {reserva.clase.fecha}'
            )
            
            # Notificar al instructor sobre la cancelación
            from notificaciones.models import Notificacion
            Notificacion.notificar_instructor_cancelacion(
                clase=reserva.clase,
                socio=request.user
            )
            logger.info(f'Notificación de cancelación enviada al instructor de {reserva.clase.nombre}')
            
            # Solo procesar lista de espera si la clase no ha pasado
            mensaje = 'Reserva cancelada exitosamente'
            if not clase_paso:
                from lista_espera.models import ListaEspera
                siguiente_reserva = ListaEspera.procesar_siguiente_en_lista(reserva.clase)
                
                if siguiente_reserva:
                    mensaje += '. Se asignó el cupo al siguiente en lista de espera.'
            else:
                mensaje += '. La clase ya había pasado, pero se ha registrado la cancelación en tu historial.'
            
            return Response({'message': mensaje})
        else:
            return Response(
                {'error': 'No se pudo cancelar la reserva. Verifica el estado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def activas(self, request):
        """
        Retorna solo las reservas activas/confirmadas del usuario.
        GET /api/reservas/activas/
        """
        reservas = self.get_queryset().filter(estado=Reserva.CONFIRMADA)
        serializer = ReservaDetalleSerializer(reservas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def historial(self, request):
        """
        Retorna el historial completo de reservas del usuario.
        GET /api/reservas/historial/
        """
        reservas = self.get_queryset()
        serializer = ReservaSerializer(reservas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def proximas(self, request):
        """
        Retorna las reservas próximas (futuras) del usuario.
        GET /api/reservas/proximas/
        """
        reservas = self.get_queryset().filter(
            estado=Reserva.CONFIRMADA,
            clase__fecha__gte=timezone.now().date()
        ).order_by('clase__fecha', 'clase__hora_inicio')
        
        serializer = ReservaDetalleSerializer(reservas, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def marcar_asistencia(self, request, pk=None):
        """
        Marca una reserva como completada (asistió).
        POST /api/reservas/{id}/marcar_asistencia/
        Solo para administradores.
        """
        reserva = self.get_object()
        
        if reserva.estado != Reserva.CONFIRMADA:
            logger.warning(
                f'Intento de marcar asistencia en reserva no confirmada: '
                f'Admin {request.user.username} intentó marcar reserva {pk} con estado {reserva.estado}'
            )
            return Response(
                {'error': 'Solo se puede marcar asistencia en reservas confirmadas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que la clase ya haya pasado
        clase_datetime = timezone.make_aware(
            timezone.datetime.combine(reserva.clase.fecha, reserva.clase.hora_fin)
        )
        
        if timezone.now() < clase_datetime:
            return Response(
                {'error': 'No se puede marcar asistencia antes de que termine la clase'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reserva.estado = Reserva.COMPLETADA
        reserva.save()
        
        logger.info(
            f'Asistencia marcada: Admin {request.user.username} marcó asistencia de '
            f'{reserva.socio.username} en clase {reserva.clase.nombre} del {reserva.clase.fecha}'
        )
        
        return Response({
            'message': 'Asistencia marcada exitosamente',
            'reserva': ReservaDetalleSerializer(reserva).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def marcar_noshow(self, request, pk=None):
        """
        Marca una reserva como no-show (no asistió).
        POST /api/reservas/{id}/marcar_noshow/
        Solo para administradores.
        """
        reserva = self.get_object()
        
        if reserva.estado != Reserva.CONFIRMADA:
            return Response(
                {'error': 'Solo se puede marcar no-show en reservas confirmadas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que la clase ya haya pasado
        clase_datetime = timezone.make_aware(
            timezone.datetime.combine(reserva.clase.fecha, reserva.clase.hora_fin)
        )
        
        if timezone.now() < clase_datetime:
            return Response(
                {'error': 'No se puede marcar no-show antes de que termine la clase'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Marcar como no-show
        reserva.estado = Reserva.NOSHOW
        reserva.save()
        
        # Incrementar contador de no-shows del socio
        socio = reserva.socio
        socio.incrementar_noshow()
        
        # Log de no-show
        logger.warning(
            f'NO-SHOW registrado: Usuario {socio.username} (ID: {socio.id}) '
            f'no asistió a clase {reserva.clase.nombre} del {reserva.clase.fecha}. '
            f'Total no-shows: {socio.total_noshow}'
        )
        
        # Si el usuario fue bloqueado, registrar
        if socio.esta_bloqueado():
            logger.error(
                f'USUARIO BLOQUEADO: {socio.username} (ID: {socio.id}) fue bloqueado '
                f'por exceso de no-shows ({socio.total_noshow}). '
                f'Bloqueado hasta: {socio.bloqueado_hasta}'
            )
        
        # Crear notificación de advertencia
        from notificaciones.models import Notificacion
        mensaje = f"Se registró tu inasistencia a {reserva.clase.nombre}."
        if socio.noshow_mes_actual >= 3:
            mensaje += " Tu cuenta ha sido suspendida temporalmente por 30 días."
        elif socio.noshow_mes_actual == 2:
            mensaje += " ADVERTENCIA: Un no-show más y serás bloqueado por 30 días."
        
        Notificacion.objects.create(
            usuario=socio,
            tipo=Notificacion.OTROS,
            titulo='⚠️ No-Show Registrado',
            mensaje=mensaje
        )
        
        return Response({
            'message': f'No-show registrado. Total del mes: {socio.noshow_mes_actual}',
            'reserva': ReservaDetalleSerializer(reserva).data,
            'bloqueado': socio.esta_bloqueado(),
            'total_noshow_mes': socio.noshow_mes_actual
        })
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def marcar_asistencia_masiva(self, request):
        """
        Marca asistencia para múltiples reservas de una clase.
        POST /api/reservas/marcar_asistencia_masiva/
        Body: {
            "clase_id": 1,
            "reservas_ids": [1, 2, 3] o "todas": true
        }
        Solo para administradores.
        """
        clase_id = request.data.get('clase_id')
        reservas_ids = request.data.get('reservas_ids', [])
        marcar_todas = request.data.get('todas', False)
        
        if not clase_id:
            return Response(
                {'error': 'Se requiere clase_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener reservas de la clase
        reservas = Reserva.objects.filter(
            clase_id=clase_id,
            estado=Reserva.CONFIRMADA
        )
        
        if not marcar_todas and reservas_ids:
            reservas = reservas.filter(id__in=reservas_ids)
        
        # Marcar como completadas
        count = reservas.update(estado=Reserva.COMPLETADA)
        
        return Response({
            'message': f'{count} asistencias marcadas exitosamente',
            'count': count
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def clase_asistencia(self, request):
        """
        Obtiene las reservas de una clase para marcar asistencia.
        GET /api/reservas/clase_asistencia/?clase_id=1
        Solo para administradores.
        """
        clase_id = request.query_params.get('clase_id')
        
        if not clase_id:
            return Response(
                {'error': 'Se requiere clase_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reservas = Reserva.objects.filter(
            clase_id=clase_id
        ).select_related('socio', 'clase').order_by('socio__first_name')
        
        serializer = ReservaDetalleSerializer(reservas, many=True)
        return Response(serializer.data)
