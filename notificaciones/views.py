"""
Views para la API de notificaciones.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notificacion


class NotificacionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para gestionar notificaciones (solo lectura para usuarios).
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Retorna solo las notificaciones del usuario actual."""
        return Notificacion.objects.filter(
            usuario=self.request.user
        ).order_by('-fecha_creacion')
    
    def list(self, request, *args, **kwargs):
        """Lista todas las notificaciones del usuario."""
        queryset = self.get_queryset()[:20]  # Últimas 20 notificaciones
        
        notificaciones_data = []
        for notif in queryset:
            notificaciones_data.append({
                'id': notif.id,
                'tipo': notif.tipo,
                'titulo': notif.titulo,
                'mensaje': notif.mensaje,
                'leida': notif.estado == Notificacion.LEIDA,
                'fecha': notif.fecha_creacion,
                'datos_adicionales': notif.datos_adicionales
            })
        
        return Response(notificaciones_data)
    
    @action(detail=True, methods=['post'])
    def marcar_leida(self, request, pk=None):
        """Marca una notificación como leída."""
        notificacion = self.get_object()
        # Usar el método del modelo que valida el estado
        if notificacion.marcar_como_leida():
            return Response({'message': 'Notificación marcada como leída'})
        else:
            return Response(
                {'error': 'La notificación no puede ser marcada como leída (estado inválido)'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def marcar_todas_leidas(self, request):
        """Marca todas las notificaciones del usuario como leídas."""
        count = self.get_queryset().filter(
            estado__in=[Notificacion.PENDIENTE, Notificacion.ENVIADA]
        ).update(estado=Notificacion.LEIDA)
        
        return Response({
            'message': f'{count} notificaciones marcadas como leídas'
        })
    
    @action(detail=False, methods=['get'])
    def no_leidas(self, request):
        """Retorna el conteo de notificaciones no leídas."""
        count = self.get_queryset().exclude(
            estado=Notificacion.LEIDA
        ).count()
        
        return Response({'count': count})
