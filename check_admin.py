import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from usuarios.models import Usuario

try:
    admin = Usuario.objects.get(username='admin')
    print(f"Usuario: {admin.username}")
    print(f"is_staff: {admin.is_staff}")
    print(f"is_superuser: {admin.is_superuser}")
    print(f"is_active: {admin.is_active}")
except Usuario.DoesNotExist:
    print("Usuario 'admin' no existe")
    print("\nUsuarios disponibles:")
    for u in Usuario.objects.all():
        print(f"  - {u.username} (staff: {u.is_staff}, super: {u.is_superuser})")
