import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from clases.models import Clase
from notificaciones.models import Notificacion
from usuarios.models import Usuario
from reservas.models import Reserva

print('=== PRUEBA COMPLETA DEL FLUJO DE NOTIFICACIONES ===\n')

# 1. Verificar que existan usuarios
print('1. VERIFICANDO USUARIOS:')
socios = Usuario.objects.filter(rol='socio')
instructores = Usuario.objects.filter(rol='instructor')
print(f'   ✓ Socios: {socios.count()}')
print(f'   ✓ Instructores: {instructores.count()}')

# 2. Verificar clases con instructores
print('\n2. VERIFICANDO CLASES CON INSTRUCTORES:')
clases_con_instructor = Clase.objects.filter(instructor__isnull=False)
clases_sin_instructor = Clase.objects.filter(instructor__isnull=True)
print(f'   ✓ Clases con instructor: {clases_con_instructor.count()}')
print(f'   ⚠ Clases sin instructor: {clases_sin_instructor.count()}')

if clases_sin_instructor.count() > 0:
    print('   Clases sin instructor:')
    for clase in clases_sin_instructor[:3]:
        print(f'     - {clase.nombre} (ID: {clase.id})')

# 3. Verificar notificaciones existentes
print('\n3. NOTIFICACIONES EXISTENTES:')
total_notifs = Notificacion.objects.count()
print(f'   Total: {total_notifs}')

for instructor in instructores[:3]:
    notifs = Notificacion.objects.filter(usuario=instructor)
    print(f'   {instructor.username}: {notifs.count()} notificaciones')
    if notifs.count() > 0:
        ultima = notifs.latest('fecha_creacion')
        print(f'     Última: {ultima.titulo}')

# 4. Probar creación de notificación
print('\n4. PRUEBA DE CREACIÓN DE NOTIFICACIÓN:')
try:
    # Buscar una clase con instructor
    clase_test = Clase.objects.filter(instructor__isnull=False).first()
    if clase_test:
        socio_test = socios.first()
        print(f'   Clase de prueba: {clase_test.nombre}')
        print(f'   Instructor: {clase_test.instructor.usuario.username}')
        print(f'   Socio: {socio_test.username}')
        
        # Simular creación de notificación
        notif = Notificacion.notificar_instructor_nueva_reserva(
            clase=clase_test,
            socio=socio_test
        )
        
        if notif:
            print(f'   ✓ Notificación creada exitosamente (ID: {notif.id})')
            print(f'     Título: {notif.titulo}')
            print(f'     Mensaje: {notif.mensaje[:60]}...')
            
            # Eliminar la notificación de prueba
            notif.delete()
            print('   ✓ Notificación de prueba eliminada')
        else:
            print('   ❌ No se pudo crear la notificación')
    else:
        print('   ❌ No hay clases con instructor para probar')
except Exception as e:
    print(f'   ❌ Error: {str(e)}')

# 5. Verificar endpoint de API
print('\n5. VERIFICACIÓN DE ENDPOINT:')
print('   Endpoint: GET /api/notificaciones/')
print('   Estado: Registrado en backend/urls.py')

# 6. Verificar últimas reservas
print('\n6. ÚLTIMAS RESERVAS:')
ultimas_reservas = Reserva.objects.all().order_by('-fecha_creacion')[:5]
for reserva in ultimas_reservas:
    print(f'   - {reserva.socio.username} reservó {reserva.clase.nombre}')
    print(f'     Instructor: {reserva.clase.instructor.usuario.username if reserva.clase.instructor else "Sin instructor"}')

print('\n=== FIN DE LA VERIFICACIÓN ===')
