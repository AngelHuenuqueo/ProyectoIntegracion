import os
import sys
import django

sys.path.insert(0, '')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings

print("\n" + "="*60)
print("🔍 VERIFICACIÓN DE CONFIGURACIÓN")
print("="*60)

print(f"\nDEBUG: {settings.DEBUG}")
print(f"CORS_ALLOW_ALL_ORIGINS: {getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', 'No definido')}")
print(f"CORS_ALLOWED_ORIGINS: {getattr(settings, 'CORS_ALLOWED_ORIGINS', [])}")
print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
print(f"SECRET_KEY (primeros 10 chars): {settings.SECRET_KEY[:10]}...")

print("\n" + "="*60)
