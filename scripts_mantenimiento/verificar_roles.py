import os
import sys
import django

sys.path.insert(0, '')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from usuarios.models import Usuario
from usuarios.serializers import UsuarioSerializer

print("=" * 60)
print("VERIFICACIÓN DE ROLES - TODOS LOS USUARIOS")
print("=" * 60)

usuarios = Usuario.objects.all().order_by('rol', 'username')
print(f"\nTotal usuarios en DB: {usuarios.count()}\n")

for usuario in usuarios:
    serialized = UsuarioSerializer(usuario).data
    print(f"Usuario: {usuario.username:25s} | Rol DB: '{usuario.rol:15s}' | Rol Serializado: '{serialized['rol']:15s}' | Match: {usuario.rol == serialized['rol']}")

print("\n" + "=" * 60)
print("RESUMEN POR ROL")
print("=" * 60)

for rol_key, rol_label in Usuario.ROL_CHOICES:
    count = Usuario.objects.filter(rol=rol_key).count()
    print(f"{rol_label:15s}: {count} usuarios")
