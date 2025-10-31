"""
Views para la API de lista de espera.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ListaEspera
from .serializers import (
    ListaEsperaSerializer, ListaEsperaDetalleSerializer,
    ListaEsperaCrearSerializer
)


class ListaEsperaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar lista de espera.
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Retorna las listas de espera del usuario actual."""
        return ListaEspera.objects.filter(socio=self.request.user).order_by('-fecha_ingreso')
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción."""
        if self.action in ['retrieve', 'list']:
            return ListaEsperaDetalleSerializer
        elif self.action == 'create':
            return ListaEsperaCrearSerializer
        return ListaEsperaSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Agrega al usuario a la lista de espera de una clase.
        POST /api/lista_espera/
        """
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        entrada = serializer.save()
        
        return Response({
            'message': f'Agregado a la lista de espera. Posición: {entrada.posicion}',
            'entrada': ListaEsperaDetalleSerializer(entrada).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """
        Cancela una entrada en lista de espera.
        POST /api/lista_espera/{id}/cancelar/
        """
        entrada = self.get_object()
        
        # Verificar que la entrada pertenezca al usuario
        if entrada.socio != request.user:
            return Response(
                {'error': 'No tienes permiso para cancelar esta entrada'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Intentar cancelar
        if entrada.cancelar():
            return Response({'message': 'Entrada en lista de espera cancelada exitosamente'})
        else:
            return Response(
                {'error': 'No se pudo cancelar la entrada. Verifica el estado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def activas(self, request):
        """
        Retorna solo las listas de espera activas del usuario.
        GET /api/lista_espera/activas/
        """
        listas = self.get_queryset().filter(estado=ListaEspera.ESPERANDO).order_by('posicion')
        serializer = ListaEsperaDetalleSerializer(listas, many=True)
        return Response(serializer.data)
