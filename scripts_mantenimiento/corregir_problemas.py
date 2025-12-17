"""
Script para corregir todos los problemas detectados en el análisis.
Ejecuta correcciones automáticas de:
1. Sincronización de cupos
2. Actualización de clases pasadas
3. Actualización de reservas pasadas
4. Procesamiento de lista de espera con cupos disponibles
5. Identificación de horarios solapados
"""
import os
import sys
import django
from pathlib import Path

# Configurar Django
sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import transaction, models
from django.utils import timezone
from datetime import datetime, timedelta
from usuarios.models import Usuario
from clases.models import Clase
from reservas.models import Reserva
from notificaciones.models import Notificacion
from lista_espera.models import ListaEspera

print("\n" + "="*80)
print("🔧 CORRECCIÓN AUTOMÁTICA DE PROBLEMAS DETECTADOS")
print("="*80 + "\n")

# PROBLEMA 1: Sincronizar cupos
print("🔄 1. SINCRONIZANDO CUPOS DE CLASES...")
print("-" * 80)

clases_corregidas = 0
with transaction.atomic():
    clases = Clase.objects.filter(estado=Clase.ACTIVA)
    for clase in clases:
        reservas_confirmadas = clase.reservas.filter(estado=Reserva.CONFIRMADA).count()
        if reservas_confirmadas != clase.cupos_ocupados:
            print(f"   Corrigiendo: {clase.nombre} ({clase.fecha})")
            print(f"   • Cupos registrados: {clase.cupos_ocupados}")
            print(f"   • Reservas reales: {reservas_confirmadas}")
            clase.cupos_ocupados = reservas_confirmadas
            clase.save()
            clases_corregidas += 1

print(f"\n✅ {clases_corregidas} clases corregidas")

# PROBLEMA 2: Actualizar clases pasadas
print("\n\n🔄 2. ACTUALIZANDO CLASES PASADAS...")
print("-" * 80)

hoy = timezone.now().date()
clases_actualizadas = 0

with transaction.atomic():
    clases_pasadas = Clase.objects.filter(
        fecha__lt=hoy,
        estado=Clase.ACTIVA
    )
    
    total = clases_pasadas.count()
    print(f"Encontradas {total} clases pasadas por actualizar\n")
    
    for clase in clases_pasadas:
        dias_pasados = (hoy - clase.fecha).days
        print(f"   • {clase.nombre} - {clase.fecha} (hace {dias_pasados} días)")
        clase.estado = Clase.COMPLETADA
        clase.save()
        clases_actualizadas += 1

print(f"\n✅ {clases_actualizadas} clases marcadas como completadas")

# PROBLEMA 3: Actualizar reservas de clases pasadas
print("\n\n🔄 3. ACTUALIZANDO RESERVAS DE CLASES PASADAS...")
print("-" * 80)

reservas_actualizadas = 0

with transaction.atomic():
    reservas_pasadas = Reserva.objects.filter(
        clase__fecha__lt=hoy,
        estado=Reserva.CONFIRMADA
    ).select_related('clase', 'socio')
    
    total = reservas_pasadas.count()
    print(f"Encontradas {total} reservas pasadas por actualizar\n")
    
    for reserva in reservas_pasadas[:10]:  # Mostrar solo las primeras 10
        print(f"   • {reserva.socio.username} - {reserva.clase.nombre} ({reserva.clase.fecha})")
    
    if total > 10:
        print(f"   ... y {total - 10} más")
    
    # Actualizar todas las reservas pasadas a COMPLETADA
    reservas_pasadas.update(estado=Reserva.COMPLETADA)
    reservas_actualizadas = total

print(f"\n✅ {reservas_actualizadas} reservas marcadas como completadas")

# PROBLEMA 4: Procesar lista de espera con cupos disponibles
print("\n\n🔄 4. PROCESANDO LISTA DE ESPERA...")
print("-" * 80)

usuarios_asignados = 0

with transaction.atomic():
    lista_espera_activa = ListaEspera.objects.filter(
        estado=ListaEspera.ESPERANDO
    ).select_related('clase', 'socio').order_by('clase', 'posicion')
    
    clases_procesadas = set()
    
    for entrada in lista_espera_activa:
        if entrada.clase.id in clases_procesadas:
            continue
            
        cupos_disponibles = entrada.clase.cupos_disponibles
        
        if cupos_disponibles > 0:
            print(f"\n   Clase: {entrada.clase.nombre} ({entrada.clase.fecha})")
            print(f"   Cupos disponibles: {cupos_disponibles}")
            
            # Obtener usuarios en espera para esta clase
            usuarios_en_espera = ListaEspera.objects.filter(
                clase=entrada.clase,
                estado=ListaEspera.ESPERANDO
            ).order_by('posicion')[:cupos_disponibles]
            
            for usuario_espera in usuarios_en_espera:
                # Verificar que el usuario no tenga ya una reserva para esta clase
                reserva_existente = Reserva.objects.filter(
                    socio=usuario_espera.socio,
                    clase=usuario_espera.clase,
                    estado__in=[Reserva.CONFIRMADA, Reserva.COMPLETADA]
                ).exists()
                
                if not reserva_existente:
                    # Crear reserva
                    reserva = Reserva.objects.create(
                        socio=usuario_espera.socio,
                        clase=usuario_espera.clase,
                        estado=Reserva.CONFIRMADA
                    )
                    
                    # Actualizar cupos
                    usuario_espera.clase.cupos_ocupados += 1
                    usuario_espera.clase.save()
                    
                    # Marcar como asignado
                    usuario_espera.estado = ListaEspera.ASIGNADO
                    usuario_espera.fecha_asignacion = timezone.now()
                    usuario_espera.save()
                    
                    # Crear notificación
                    Notificacion.objects.create(
                        usuario=usuario_espera.socio,
                        tipo=Notificacion.CUPO_DISPONIBLE,
                        canal=Notificacion.SISTEMA,
                        titulo="¡Cupo disponible!",
                        mensaje=f"Se ha liberado un cupo para {usuario_espera.clase.nombre} el {usuario_espera.clase.fecha}. Tu reserva ha sido confirmada automáticamente.",
                        datos_adicionales={'clase_id': usuario_espera.clase.id}
                    )
                    
                    print(f"   ✅ Asignado: {usuario_espera.socio.username}")
                    usuarios_asignados += 1
                else:
                    # Ya tiene reserva, marcar como asignado
                    usuario_espera.estado = ListaEspera.ASIGNADO
                    usuario_espera.fecha_asignacion = timezone.now()
                    usuario_espera.save()
                    print(f"   ⚠️  {usuario_espera.socio.username} ya tiene reserva")
            
            clases_procesadas.add(entrada.clase.id)

print(f"\n✅ {usuarios_asignados} usuarios asignados desde lista de espera")

# PROBLEMA 5: Identificar horarios solapados
print("\n\n🔍 5. IDENTIFICANDO HORARIOS SOLAPADOS...")
print("-" * 80)

clases_activas = Clase.objects.filter(estado=Clase.ACTIVA).order_by('fecha', 'hora_inicio')
solapamientos = []

for i, clase1 in enumerate(clases_activas):
    for clase2 in clases_activas[i+1:]:
        # Si son el mismo día y el instructor es el mismo
        if clase1.fecha == clase2.fecha and clase1.instructor == clase2.instructor:
            # Verificar solapamiento de horarios
            if (clase1.hora_inicio <= clase2.hora_inicio < clase1.hora_fin or
                clase1.hora_inicio < clase2.hora_fin <= clase1.hora_fin or
                clase2.hora_inicio <= clase1.hora_inicio < clase2.hora_fin):
                solapamientos.append({
                    'clase1': clase1,
                    'clase2': clase2,
                    'instructor': clase1.instructor
                })

if solapamientos:
    print(f"\n⚠️  Encontrados {len(solapamientos)} solapamientos de horarios:")
    print("\nREQUIEREN CORRECCIÓN MANUAL:\n")
    
    for i, solap in enumerate(solapamientos, 1):
        print(f"{i}. Instructor: {solap['instructor'].usuario.get_full_name()}")
        print(f"   Clase 1: {solap['clase1'].nombre}")
        print(f"   • Fecha: {solap['clase1'].fecha}")
        print(f"   • Horario: {solap['clase1'].hora_inicio} - {solap['clase1'].hora_fin}")
        print(f"   • ID: {solap['clase1'].id}")
        print(f"   Clase 2: {solap['clase2'].nombre}")
        print(f"   • Fecha: {solap['clase2'].fecha}")
        print(f"   • Horario: {solap['clase2'].hora_inicio} - {solap['clase2'].hora_fin}")
        print(f"   • ID: {solap['clase2'].id}")
        print(f"   SUGERENCIA: Cambiar horario de una clase o asignar otro instructor")
        print()
else:
    print("\n✅ No se encontraron horarios solapados")

# RESUMEN FINAL
print("\n" + "="*80)
print("📋 RESUMEN DE CORRECCIONES")
print("="*80)
print(f"\n✅ Cupos sincronizados: {clases_corregidas} clases")
print(f"✅ Clases actualizadas: {clases_actualizadas} clases pasadas → completadas")
print(f"✅ Reservas actualizadas: {reservas_actualizadas} reservas pasadas → completadas")
print(f"✅ Lista de espera procesada: {usuarios_asignados} usuarios asignados")

if solapamientos:
    print(f"\n⚠️  REQUIERE ATENCIÓN MANUAL:")
    print(f"   • {len(solapamientos)} horarios solapados (ver detalles arriba)")
else:
    print(f"\n✅ Horarios: Sin solapamientos")

print("\n" + "="*80)
print("🎉 CORRECCIÓN COMPLETADA")
print("="*80 + "\n")

# Verificación final
print("🔍 VERIFICACIÓN FINAL...")
print("-" * 80)

# Contar problemas restantes
cupos_inconsistentes = 0
clases = Clase.objects.filter(estado=Clase.ACTIVA)
for clase in clases:
    reservas_confirmadas = clase.reservas.filter(estado=Reserva.CONFIRMADA).count()
    if reservas_confirmadas != clase.cupos_ocupados:
        cupos_inconsistentes += 1

clases_pasadas_activas = Clase.objects.filter(
    fecha__lt=hoy,
    estado=Clase.ACTIVA
).count()

reservas_pasadas_confirmadas = Reserva.objects.filter(
    clase__fecha__lt=hoy,
    estado=Reserva.CONFIRMADA
).count()

lista_espera_innecesaria = 0
for entrada in ListaEspera.objects.filter(estado=ListaEspera.ESPERANDO):
    if entrada.clase.cupos_disponibles > 0:
        lista_espera_innecesaria += 1

print(f"\n📊 Estado después de las correcciones:")
print(f"   • Cupos inconsistentes: {cupos_inconsistentes}")
print(f"   • Clases pasadas activas: {clases_pasadas_activas}")
print(f"   • Reservas pasadas confirmadas: {reservas_pasadas_confirmadas}")
print(f"   • Lista espera innecesaria: {lista_espera_innecesaria}")
print(f"   • Horarios solapados: {len(solapamientos)}")

problemas_totales = (cupos_inconsistentes + clases_pasadas_activas + 
                    reservas_pasadas_confirmadas + lista_espera_innecesaria + 
                    len(solapamientos))

if problemas_totales == 0:
    print("\n🎉 ¡TODOS LOS PROBLEMAS AUTOMÁTICOS HAN SIDO CORREGIDOS!")
elif problemas_totales == len(solapamientos):
    print(f"\n✅ Todos los problemas automáticos corregidos")
    print(f"⚠️  Solo quedan {len(solapamientos)} horarios solapados que requieren corrección manual")
else:
    print(f"\n⚠️  Quedan {problemas_totales} problemas por resolver")

print("\n" + "="*80 + "\n")
