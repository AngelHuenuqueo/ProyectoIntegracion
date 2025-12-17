import os
import sys
import django

sys.path.insert(0, '')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from usuarios.models import Usuario, Instructor

print("=" * 80)
print("VERIFICACIÓN: CREAR INSTRUCTOR")
print("=" * 80)

# Verificar usuarios con rol instructor
usuarios_instructor = Usuario.objects.filter(rol='instructor')
print(f"\nUsuarios con rol instructor: {usuarios_instructor.count()}")

for usuario in usuarios_instructor:
    print(f"\n  Usuario: {usuario.username} ({usuario.get_full_name()})")
    
    # Ver si ya tiene perfil de instructor
    try:
        instructor = Instructor.objects.get(usuario=usuario)
        print(f"  ✓ Ya tiene perfil de instructor (ID: {instructor.id})")
        print(f"    - Especialidades: {instructor.especialidades}")
        print(f"    - Certificaciones: {instructor.certificaciones}")
    except Instructor.DoesNotExist:
        print(f"  ⚠ NO tiene perfil de instructor (puede ser creado)")

# Verificar total de instructores
total_instructores = Instructor.objects.count()
print(f"\n{'=' * 80}")
print(f"Total instructores en el sistema: {total_instructores}")
print(f"Usuarios instructor sin perfil: {usuarios_instructor.count() - total_instructores}")
print("=" * 80)
