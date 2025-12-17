import os
import sys
import django

sys.path.insert(0, '')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from usuarios.models import Usuario

print("=" * 60)
print("LIMPIANDO ESPACIOS EN ROLES")
print("=" * 60)

usuarios = Usuario.objects.all()
actualizados = 0

for usuario in usuarios:
    rol_original = usuario.rol
    rol_limpio = usuario.rol.strip()
    
    if rol_original != rol_limpio:
        print(f"Usuario: {usuario.username:25s} | '{rol_original}' -> '{rol_limpio}'")
        usuario.rol = rol_limpio
        usuario.save()
        actualizados += 1

print(f"\n✅ Total usuarios actualizados: {actualizados}")

print("\n" + "=" * 60)
print("VERIFICACIÓN FINAL")
print("=" * 60)

for rol_value in [Usuario.SOCIO, Usuario.INSTRUCTOR, Usuario.ADMINISTRADOR]:
    count = Usuario.objects.filter(rol=rol_value).count()
    print(f"{rol_value:15s}: {count} usuarios")

print("\n✅ Proceso completado")
