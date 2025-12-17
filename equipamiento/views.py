from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Equipo
from .serializers import EquipoSerializer, EquipoCreateUpdateSerializer


class EquipoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar equipos del gimnasio.
    
    Proporciona operaciones CRUD completas:
    - list: Listar todos los equipos
    - retrieve: Obtener detalle de un equipo
    - create: Crear nuevo equipo
    - update: Actualizar equipo
    - destroy: Eliminar equipo
    """
    queryset = Equipo.objects.filter(activo=True)
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return EquipoCreateUpdateSerializer
        return EquipoSerializer
    
    def get_queryset(self):
        queryset = Equipo.objects.all()
        
        # Filtros opcionales
        categoria = self.request.query_params.get('categoria')
        estado = self.request.query_params.get('estado')
        activo = self.request.query_params.get('activo')
        
        if categoria:
            queryset = queryset.filter(categoria=categoria)
        if estado:
            queryset = queryset.filter(estado=estado)
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
            
        return queryset.order_by('categoria', 'nombre')
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Retorna estadísticas de equipamiento."""
        equipos = Equipo.objects.filter(activo=True)
        
        return Response({
            'total': equipos.count(),
            'por_categoria': {
                'cardio': equipos.filter(categoria='cardio').count(),
                'fuerza': equipos.filter(categoria='fuerza').count(),
                'peso_libre': equipos.filter(categoria='peso_libre').count(),
                'funcional': equipos.filter(categoria='funcional').count(),
                'otro': equipos.filter(categoria='otro').count(),
            },
            'por_estado': {
                'disponible': equipos.filter(estado='disponible').count(),
                'en_uso': equipos.filter(estado='en_uso').count(),
                'mantenimiento': equipos.filter(estado='mantenimiento').count(),
                'fuera_servicio': equipos.filter(estado='fuera_servicio').count(),
            },
            'necesitan_mantenimiento': equipos.filter(
                proximo_mantenimiento__lte=timezone.now().date()
            ).count(),
        })
    
    @action(detail=True, methods=['post'])
    def marcar_mantenimiento(self, request, pk=None):
        """Marca un equipo como en mantenimiento."""
        equipo = self.get_object()
        equipo.estado = Equipo.MANTENIMIENTO
        equipo.save()
        return Response({'status': 'Equipo marcado en mantenimiento'})
    
    @action(detail=True, methods=['post'])
    def finalizar_mantenimiento(self, request, pk=None):
        """Finaliza el mantenimiento de un equipo."""
        equipo = self.get_object()
        equipo.estado = Equipo.DISPONIBLE
        equipo.ultimo_mantenimiento = timezone.now().date()
        equipo.save()
        return Response({'status': 'Mantenimiento finalizado'})
