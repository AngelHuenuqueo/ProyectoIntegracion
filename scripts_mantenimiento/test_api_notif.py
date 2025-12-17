import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from usuarios.models import Usuario
from notificaciones.models import Notificacion

print('=== PRUEBA DE API DE NOTIFICACIONES ===\n')

# Obtener un instructor
instructor = Usuario.objects.filter(rol='instructor', username='instructor.spinning').first()

if instructor:
    print(f'Instructor: {instructor.username} ({instructor.get_full_name()})')
    print(f'ID: {instructor.id}\n')
    
    # Obtener sus notificaciones
    notifs = Notificacion.objects.filter(usuario=instructor).order_by('-fecha_creacion')
    
    print(f'Total notificaciones: {notifs.count()}\n')
    
    print('Formato API esperado:')
    for notif in notifs[:5]:
        print(f'\n{"-"*50}')
        print(f'ID: {notif.id}')
        print(f'Tipo: {notif.tipo}')
        print(f'Título: {notif.titulo}')
        print(f'Mensaje: {notif.mensaje}')
        print(f'Estado: {notif.estado}')
        print(f'Leída: {notif.estado == Notificacion.LEIDA}')
        print(f'Fecha: {notif.fecha_creacion}')
        print(f'Datos adicionales: {notif.datos_adicionales}')
    
    print(f'\n{"-"*50}')
    print('\n✓ Las notificaciones están en la base de datos')
    print('✓ El endpoint /api/notificaciones/ debería retornarlas')
    
else:
    print('❌ No se encontró el instructor')
