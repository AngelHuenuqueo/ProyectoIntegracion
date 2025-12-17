import os
import sys
import django

sys.path.insert(0, '')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db.models import Count
from usuarios.models import Usuario
from clases.models import Clase
from reservas.models import Reserva
from django.utils import timezone

print("=" * 80)
print("CORRIGIENDO PROBLEMAS ENCONTRADOS")
print("=" * 80)

# 1. ELIMINAR RESERVAS DUPLICADAS (mantener solo la más reciente)
print("\n1. ELIMINANDO RESERVAS DUPLICADAS")
print("-" * 80)

duplicados = Reserva.objects.values('socio', 'clase').annotate(
    count=Count('id')
).filter(count__gt=1)

reservas_eliminadas = 0
for dup in duplicados:
    socio = Usuario.objects.get(id=dup['socio'])
    clase = Clase.objects.get(id=dup['clase'])
    reservas = Reserva.objects.filter(socio=socio, clase=clase).order_by('-fecha_reserva')
    
    # Mantener solo la más reciente (la primera después del order by)
    mas_reciente = reservas.first()
    reservas_a_eliminar = reservas.exclude(id=mas_reciente.id)
    
    print(f"Socio: {socio.username} | Clase: {clase.nombre}")
    print(f"  Manteniendo: ID:{mas_reciente.id} ({mas_reciente.estado})")
    print(f"  Eliminando: {reservas_a_eliminar.count()} reservas")
    
    for r in reservas_a_eliminar:
        print(f"    - ID:{r.id} ({r.estado})")
        r.delete()
        reservas_eliminadas += 1

print(f"\n✓ Total reservas eliminadas: {reservas_eliminadas}")

# 2. ACTUALIZAR USUARIO SIN NOMBRE
print("\n\n2. ACTUALIZANDO USUARIO SIN NOMBRE")
print("-" * 80)

usuario_sin_nombre = Usuario.objects.filter(first_name='', last_name='').first()
if usuario_sin_nombre:
    print(f"Usuario: {usuario_sin_nombre.username}")
    usuario_sin_nombre.first_name = "Administrador"
    usuario_sin_nombre.last_name = "Sistema"
    usuario_sin_nombre.save()
    print(f"✓ Actualizado a: {usuario_sin_nombre.first_name} {usuario_sin_nombre.last_name}")
else:
    print("✓ No hay usuarios sin nombre")

# 3. ACTUALIZAR ESTADO DE CLASES FUTURAS
print("\n\n3. ACTUALIZANDO ESTADO DE CLASES FUTURAS")
print("-" * 80)

clases_futuras = Clase.objects.filter(
    fecha__gte=timezone.now().date(),
    estado='activa'
)

if clases_futuras.exists():
    print(f"Actualizando {clases_futuras.count()} clases futuras a 'programada':")
    for clase in clases_futuras:
        print(f"  - {clase.nombre} ({clase.fecha}): activa → programada")
        clase.estado = 'programada'
        clase.save()
    print(f"✓ {clases_futuras.count()} clases actualizadas")
else:
    print("✓ No hay clases futuras con estado incorrecto")

# 4. SINCRONIZAR CUPOS
print("\n\n4. SINCRONIZANDO CUPOS")
print("-" * 80)

clases_actualizadas = 0
for clase in Clase.objects.all():
    reservas_count = Reserva.objects.filter(clase=clase, estado='confirmada').count()
    if clase.cupos_ocupados != reservas_count:
        print(f"{clase.nombre} ({clase.fecha}): {clase.cupos_ocupados} → {reservas_count}")
        clase.cupos_ocupados = reservas_count
        clase.save()
        clases_actualizadas += 1

print(f"\n✓ Total clases actualizadas: {clases_actualizadas}")

# 5. VERIFICACIÓN FINAL
print("\n\n" + "=" * 80)
print("VERIFICACIÓN FINAL")
print("=" * 80)

# Reservas duplicadas
duplicados_finales = Reserva.objects.values('socio', 'clase').annotate(
    count=Count('id')
).filter(count__gt=1).count()
print(f"✓ Reservas duplicadas: {duplicados_finales}")

# Usuarios sin nombre
usuarios_sin_nombre = Usuario.objects.filter(first_name='', last_name='').count()
print(f"✓ Usuarios sin nombre: {usuarios_sin_nombre}")

# Clases futuras programadas
clases_futuras_programadas = Clase.objects.filter(
    fecha__gte=timezone.now().date(),
    estado='programada'
).count()
print(f"✓ Clases futuras programadas: {clases_futuras_programadas}")

# Cupos desincronizados
cupos_desincronizados = 0
for clase in Clase.objects.all():
    reservas_count = Reserva.objects.filter(clase=clase, estado='confirmada').count()
    if clase.cupos_ocupados != reservas_count:
        cupos_desincronizados += 1
print(f"✓ Cupos desincronizados: {cupos_desincronizados}")

print("\n✓ CORRECCIONES COMPLETADAS")
