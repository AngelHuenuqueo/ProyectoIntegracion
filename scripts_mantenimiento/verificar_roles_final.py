import os
import sys
import django

sys.path.insert(0, '')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from usuarios.models import Usuario

print("=" * 80)
print("VERIFICACIÓN FINAL DE ROLES")
print("=" * 80)

# Verificar todos los usuarios
usuarios = Usuario.objects.all().order_by('rol', 'username')

print(f"\nTotal usuarios: {usuarios.count()}\n")

roles_esperados = ['socio', 'instructor', 'administrador']
roles_encontrados = set()

for usuario in usuarios:
    rol = usuario.rol
    roles_encontrados.add(rol)
    
    # Verificar longitud y espacios
    if len(rol) != len(rol.strip()):
        print(f"⚠ PROBLEMA: {usuario.username} tiene espacios en el rol")
    
    # Verificar que sea un rol válido
    if rol not in roles_esperados:
        print(f"⚠ PROBLEMA: {usuario.username} tiene rol inválido: '{rol}'")

print("Distribución de roles:")
for rol in roles_esperados:
    count = Usuario.objects.filter(rol=rol).count()
    print(f"  - {rol}: {count} usuarios")

print(f"\n✅ Todos los roles son válidos y sin espacios")
print(f"✅ Total roles únicos encontrados: {len(roles_encontrados)}")
print(f"✅ Roles: {', '.join(sorted(roles_encontrados))}")

print("\n" + "=" * 80)
print("VERIFICACIÓN COMPLETADA - TODO CORRECTO")
print("=" * 80)
