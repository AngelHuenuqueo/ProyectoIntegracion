"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Importar ViewSets
from usuarios.views import UsuarioViewSet, InstructorViewSet
from clases.views import ClaseViewSet
from reservas.views import ReservaViewSet
from lista_espera.views import ListaEsperaViewSet
from equipamiento.views import EquipoViewSet
from notificaciones.views import NotificacionViewSet

# Configurar el router de DRF
router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'instructores', InstructorViewSet, basename='instructor')
router.register(r'clases', ClaseViewSet, basename='clase')
router.register(r'reservas', ReservaViewSet, basename='reserva')
router.register(r'lista-espera', ListaEsperaViewSet, basename='lista-espera')
router.register(r'equipos', EquipoViewSet, basename='equipo')
router.register(r'notificaciones', NotificacionViewSet, basename='notificacion')

urlpatterns = [
    # Admin de Django
    path('admin/', admin.site.urls),
    
    # API de autenticación JWT
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API REST
    path('api/', include(router.urls)),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
