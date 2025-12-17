import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from clases.models import Clase
from notificaciones.models import Notificacion
from usuarios.models import Usuario

print('=== VERIFICACIÓN DE NOTIFICACIONES ===\n')

# Verificar clase burpees
try:
    clase = Clase.objects.get(id=29)
    print(f'Clase: {clase.nombre} (ID: {clase.id})')
    print(f'Instructor asignado: {clase.instructor}')
    if clase.instructor:
        print(f'Usuario del instructor: {clase.instructor.usuario}')
        print(f'Email del instructor: {clase.instructor.usuario.email}')
    else:
        print('⚠️  ESTA CLASE NO TIENE INSTRUCTOR ASIGNADO')
    print()
except Clase.DoesNotExist:
    print('❌ Clase ID 29 no existe\n')

# Verificar notificaciones totales
total_notifs = Notificacion.objects.count()
print(f'Total de notificaciones en el sistema: {total_notifs}')

# Listar notificaciones por usuario
print('\n=== NOTIFICACIONES POR USUARIO ===')
for usuario in Usuario.objects.all():
    notifs = Notificacion.objects.filter(usuario=usuario)
    if notifs.count() > 0:
        print(f'\n{usuario.username} ({usuario.get_full_name()}) - Rol: {usuario.rol}')
        print(f'  Total notificaciones: {notifs.count()}')
        for n in notifs[:3]:
            print(f'  - {n.titulo}: {n.mensaje[:50]}...')
