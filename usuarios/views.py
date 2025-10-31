"""
Views para la API de usuarios.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import update_session_auth_hash
import logging

from .models import Usuario, Instructor
from .serializers import (
    UsuarioSerializer, UsuarioDetalleSerializer, UsuarioRegistroSerializer,
    InstructorSerializer, CambiarPasswordSerializer
)

# Logger para este módulo
logger = logging.getLogger('usuarios')


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar usuarios.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción."""
        if self.action == 'retrieve':
            return UsuarioDetalleSerializer
        elif self.action == 'registro':
            return UsuarioRegistroSerializer
        elif self.action == 'cambiar_password':
            return CambiarPasswordSerializer
        return UsuarioSerializer
    
    def get_permissions(self):
        """Define permisos según la acción."""
        if self.action == 'registro':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def registro(self, request):
        """
        Endpoint para registro de nuevos socios.
        POST /api/usuarios/registro/
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        
        logger.info(
            f'Nuevo usuario registrado: {usuario.username} (ID: {usuario.id}) '
            f'- Email: {usuario.email} - Rol: {usuario.rol}'
        )
        
        return Response({
            'message': 'Usuario registrado exitosamente',
            'usuario': UsuarioSerializer(usuario).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        """
        Endpoint para obtener y actualizar información del usuario actual.
        GET /api/usuarios/me/
        PATCH /api/usuarios/me/
        """
        usuario = request.user
        
        if request.method == 'GET':
            serializer = UsuarioDetalleSerializer(usuario)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            # Solo permitir actualizar ciertos campos
            campos_permitidos = ['first_name', 'last_name', 'email', 'telefono']
            data = {k: v for k, v in request.data.items() if k in campos_permitidos}
            
            serializer = UsuarioSerializer(usuario, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            logger.info(
                f'Usuario actualizado: {usuario.username} (ID: {usuario.id}) '
                f'- Campos: {", ".join(data.keys())}'
            )
            
            return Response(UsuarioDetalleSerializer(usuario).data)
    
    @action(detail=False, methods=['post'])
    def cambiar_password(self, request):
        """
        Endpoint para cambiar contraseña del usuario actual.
        POST /api/usuarios/cambiar_password/
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        usuario = request.user
        
        # Verificar contraseña actual
        if not usuario.check_password(serializer.validated_data['password_actual']):
            return Response(
                {'error': 'La contraseña actual es incorrecta'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cambiar contraseña
        usuario.set_password(serializer.validated_data['password_nueva'])
        usuario.save()
        
        # Mantener la sesión activa
        update_session_auth_hash(request, usuario)
        
        return Response({'message': 'Contraseña cambiada exitosamente'})
    
    @action(detail=False, methods=['get'])
    def mis_reservas(self, request):
        """
        Endpoint para obtener reservas del usuario actual.
        GET /api/usuarios/mis_reservas/
        """
        from reservas.models import Reserva
        from reservas.serializers import ReservaDetalleSerializer
        
        reservas = Reserva.objects.filter(socio=request.user).order_by('-fecha_reserva')
        serializer = ReservaDetalleSerializer(reservas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def mis_listas_espera(self, request):
        """
        Endpoint para obtener listas de espera del usuario actual.
        GET /api/usuarios/mis_listas_espera/
        """
        from lista_espera.models import ListaEspera
        from lista_espera.serializers import ListaEsperaDetalleSerializer
        
        listas = ListaEspera.objects.filter(
            socio=request.user,
            estado=ListaEspera.ESPERANDO
        ).order_by('posicion')
        serializer = ListaEsperaDetalleSerializer(listas, many=True)
        return Response(serializer.data)


class InstructorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de solo lectura para instructores.
    Los socios pueden ver la lista de instructores.
    """
    queryset = Instructor.objects.filter(activo=True)
    serializer_class = InstructorSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def clases(self, request, pk=None):
        """
        Obtiene las clases de un instructor específico.
        GET /api/instructores/{id}/clases/
        """
        from clases.models import Clase
        from clases.serializers import ClaseSerializer
        
        instructor = self.get_object()
        clases = Clase.objects.filter(
            instructor=instructor,
            estado=Clase.ACTIVA
        ).order_by('fecha', 'hora_inicio')
        
        serializer = ClaseSerializer(clases, many=True)
        return Response(serializer.data)
