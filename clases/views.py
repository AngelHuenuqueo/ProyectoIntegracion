"""
Views para la API de clases.
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import models
from datetime import timedelta
from .models import Clase
from .serializers import ClaseSerializer, ClaseDetalleSerializer, ClaseCrearSerializer


class ClaseViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar clases.
    """
    queryset = Clase.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['fecha', 'hora_inicio', 'cupos_disponibles']
    ordering = ['fecha', 'hora_inicio']
    
    def check_instructor_permission(self, clase_id):
        """Verifica si el usuario actual es el instructor de la clase."""
        from usuarios.models import Instructor
        try:
            instructor = Instructor.objects.get(usuario=self.request.user)
            clase = Clase.objects.get(id=clase_id)
            return clase.instructor == instructor
        except (Instructor.DoesNotExist, Clase.DoesNotExist):
            return False
    
    def get_paginate_by(self, queryset):
        """Desactiva paginación si se solicita todas"""
        if self.request.query_params.get('all') == 'true':
            return None
        return super().get_paginate_by(queryset)
    
    @action(detail=False, methods=['get'], url_path='admin-all')
    def admin_all(self, request):
        """
        Retorna todas las clases sin paginación para el panel admin.
        GET /api/clases/admin-all/
        """
        clases = Clase.objects.all().order_by('-id')
        serializer = ClaseSerializer(clases, many=True)
        return Response(serializer.data)
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción."""
        if self.action == 'retrieve':
            return ClaseDetalleSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ClaseCrearSerializer
        return ClaseSerializer
    
    def get_queryset(self):
        """
        Filtra las clases según parámetros de query.
        """
        queryset = Clase.objects.all()
        
        # Filtro por rango de fechas
        fecha_desde = self.request.query_params.get('fecha_desde', None)
        fecha_hasta = self.request.query_params.get('fecha_hasta', None)
        
        if fecha_desde:
            queryset = queryset.filter(fecha__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha__lte=fecha_hasta)
        
        # Solo clases futuras
        solo_futuras = self.request.query_params.get('futuras', None)
        if solo_futuras == 'true':
            queryset = queryset.filter(fecha__gte=timezone.now().date())
        
        # Solo clases con cupos disponibles
        con_cupos = self.request.query_params.get('con_cupos', None)
        if con_cupos == 'true':
            queryset = queryset.filter(cupos_ocupados__lt=models.F('cupos_totales'))
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        """
        Retorna solo clases disponibles para reservar.
        GET /api/clases/disponibles/
        """
        hoy = timezone.now().date()
        clases = Clase.objects.filter(
            estado=Clase.ACTIVA,
            fecha__gte=hoy
        ).order_by('fecha', 'hora_inicio')
        
        serializer = self.get_serializer(clases, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def proxima_semana(self, request):
        """
        Retorna clases de la próxima semana.
        GET /api/clases/proxima_semana/
        """
        hoy = timezone.now().date()
        proxima_semana = hoy + timedelta(days=7)
        
        clases = Clase.objects.filter(
            estado=Clase.ACTIVA,
            fecha__gte=hoy,
            fecha__lte=proxima_semana
        ).order_by('fecha', 'hora_inicio')
        
        serializer = self.get_serializer(clases, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def reservas(self, request, pk=None):
        """
        Obtiene las reservas de una clase específica.
        GET /api/clases/{id}/reservas/
        """
        from reservas.models import Reserva
        from reservas.serializers import ReservaSerializer
        
        clase = self.get_object()
        reservas = Reserva.objects.filter(
            clase=clase,
            estado=Reserva.CONFIRMADA
        ).select_related('socio')
        
        serializer = ReservaSerializer(reservas, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def lista_espera(self, request, pk=None):
        """
        Obtiene la lista de espera de una clase específica.
        GET /api/clases/{id}/lista_espera/
        """
        from lista_espera.models import ListaEspera
        from lista_espera.serializers import ListaEsperaSerializer
        
        clase = self.get_object()
        lista = ListaEspera.objects.filter(
            clase=clase,
            estado=ListaEspera.ESPERANDO
        ).select_related('socio').order_by('posicion')
        
        serializer = ListaEsperaSerializer(lista, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def por_tipo(self, request):
        """
        Agrupa las clases por tipo.
        GET /api/clases/por_tipo/
        """
        from django.db.models import Count
        
        estadisticas = Clase.objects.filter(
            estado=Clase.ACTIVA,
            fecha__gte=timezone.now().date()
        ).values('tipo').annotate(total=Count('id')).order_by('-total')
        
        return Response(estadisticas)
    
    @action(detail=False, methods=['get'], url_path='mis-clases')
    def mis_clases(self, request):
        """
        Retorna las clases del instructor actual.
        GET /api/clases/mis-clases/
        """
        # Verificar si el usuario es instructor
        try:
            from usuarios.models import Instructor
            instructor = Instructor.objects.get(usuario=request.user)
            
            # Filtrar clases del instructor
            clases = Clase.objects.filter(
                instructor=instructor
            ).order_by('-fecha', '-hora_inicio')
            
            serializer = self.get_serializer(clases, many=True)
            return Response(serializer.data)
        except Instructor.DoesNotExist:
            return Response(
                {'detail': 'Usuario no es instructor'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    @action(detail=True, methods=['put', 'patch'], url_path='instructor-actualizar')
    def instructor_actualizar(self, request, pk=None):
        """
        Permite al instructor actualizar su propia clase.
        PUT/PATCH /api/clases/{id}/instructor-actualizar/
        """
        from usuarios.models import Instructor
        
        try:
            # Verificar que el usuario es instructor
            instructor = Instructor.objects.get(usuario=request.user)
            clase = self.get_object()
            
            # Verificar que la clase pertenece al instructor
            if clase.instructor != instructor:
                return Response(
                    {'detail': 'No tienes permiso para editar esta clase'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Actualizar clase
            serializer = ClaseCrearSerializer(clase, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Instructor.DoesNotExist:
            return Response(
                {'detail': 'Usuario no es instructor'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    @action(detail=False, methods=['post'], url_path='instructor-crear')
    def instructor_crear(self, request):
        """
        Permite al instructor crear su propia clase.
        POST /api/clases/instructor-crear/
        """
        from usuarios.models import Instructor
        
        try:
            # Verificar que el usuario es instructor
            instructor = Instructor.objects.get(usuario=request.user)
            
            # Crear clase asignando automáticamente al instructor actual
            serializer = ClaseCrearSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(instructor=instructor)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Instructor.DoesNotExist:
            return Response(
                {'detail': 'Usuario no es instructor'},
                status=status.HTTP_403_FORBIDDEN
            )
