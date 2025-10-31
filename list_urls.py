import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.urls import get_resolver
from rest_framework.routers import DefaultRouter

# Imprimir todas las rutas
resolver = get_resolver()

print("=" * 80)
print("RUTAS DISPONIBLES:")
print("=" * 80)

def show_urls(urlpatterns, depth=0):
    for pattern in urlpatterns:
        if hasattr(pattern, 'url_patterns'):
            show_urls(pattern.url_patterns, depth + 1)
        else:
            print("  " * depth + str(pattern.pattern))

show_urls(resolver.url_patterns)

# Verificar específicamente las rutas de reservas
print("\n" + "=" * 80)
print("VERIFICANDO ROUTER DE RESERVAS:")
print("=" * 80)

from backend.urls import router
for url in router.urls:
    if 'reservas' in str(url.pattern):
        print(str(url.pattern))
