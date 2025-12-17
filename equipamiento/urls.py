from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EquipoViewSet


router = DefaultRouter()
router.register(r'equipos', EquipoViewSet, basename='equipo')

urlpatterns = [
    path('', include(router.urls)),
]
