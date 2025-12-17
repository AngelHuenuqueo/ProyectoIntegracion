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
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def admin_crear(self, request):
        """
        Endpoint para que un administrador cree usuarios con cualquier rol.
        POST /api/usuarios/admin_crear/
        """
        # Verificar que el solicitante sea administrador
        if request.user.rol != 'administrador':
            return Response(
                {'error': 'No tienes permisos para realizar esta acción'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validar campos requeridos
        required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not request.data.get(field):
                return Response(
                    {'error': f'El campo {field} es requerido'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Validar longitud de contraseña
        password = request.data.get('password')
        if len(password) < 6:
            return Response(
                {'error': 'La contraseña debe tener al menos 6 caracteres'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear usuario
        try:
            usuario = Usuario.objects.create_user(
                username=request.data['username'],
                email=request.data['email'],
                first_name=request.data['first_name'],
                last_name=request.data['last_name'],
                telefono=request.data.get('telefono', ''),
                rol=request.data.get('rol', Usuario.SOCIO),
                estado_membresia=Usuario.ACTIVA,
                password=password
            )
            
            logger.info(
                f'Admin {request.user.username} creó usuario: {usuario.username} '
                f'(ID: {usuario.id}) - Rol: {usuario.rol}'
            )
            
            return Response({
                'message': 'Usuario creado exitosamente',
                'usuario': UsuarioSerializer(usuario).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f'Error creando usuario: {str(e)}')
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
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

    @action(detail=True, methods=['post'])
    def admin_cambiar_password(self, request, pk=None):
        """
        Endpoint para que un administrador cambie la contraseña de un usuario.
        POST /api/usuarios/{id}/admin_cambiar_password/
        """
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError as DjangoValidationError
        
        usuario = self.get_object()
        
        # Verificar que el solicitante sea administrador
        if request.user.rol != 'administrador':
            return Response(
                {'error': 'No tienes permisos para realizar esta acción'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        password = request.data.get('password')
        if not password:
            return Response(
                {'error': 'La contraseña es requerida'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar contraseña con validadores de Django
        try:
            validate_password(password, usuario)
        except DjangoValidationError as e:
            return Response(
                {'error': list(e.messages)},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        usuario.set_password(password)
        usuario.save()
        
        logger.info(f'Admin {request.user.username} cambió contraseña de: {usuario.username}')
        
        return Response({'message': 'Contraseña actualizada exitosamente'})
    
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


class InstructorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de instructores.
    Los administradores pueden crear/editar instructores.
    """
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtra instructores activos para usuarios regulares."""
        if self.request.user.rol == 'administrador':
            return Instructor.objects.all()
        return Instructor.objects.filter(activo=True)
    
    @action(detail=False, methods=['get'], url_path='mi-perfil')
    def mi_perfil(self, request):
        """
        Obtiene el perfil del instructor actual.
        GET /api/instructores/mi-perfil/
        """
        try:
            instructor = Instructor.objects.get(usuario=request.user)
            serializer = self.get_serializer(instructor)
            return Response(serializer.data)
        except Instructor.DoesNotExist:
            return Response(
                {'detail': 'Usuario no es instructor'},
                status=status.HTTP_404_NOT_FOUND
            )
    
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
