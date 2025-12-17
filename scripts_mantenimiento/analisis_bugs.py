"""
Script para analizar bugs y problemas potenciales en el sistema.
Ejecuta verificaciones en backend (Django) y frontend (estructura).
"""
import os
import sys
import django
import json
from pathlib import Path

# Configurar Django
sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection, IntegrityError, models
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, timedelta
from usuarios.models import Usuario
from clases.models import Clase
from reservas.models import Reserva
from notificaciones.models import Notificacion
from lista_espera.models import ListaEspera

print("\n" + "="*80)
print("🔍 ANÁLISIS EXHAUSTIVO DE BUGS Y PROBLEMAS POTENCIALES")
print("="*80 + "\n")

# CATEGORÍA 1: INTEGRIDAD DE BASE DE DATOS
print("📊 CATEGORÍA 1: INTEGRIDAD DE BASE DE DATOS")
print("-" * 80)

# 1.1 Verificar reservas huérfanas (sin socio o clase)
print("\n1.1 Verificar reservas huérfanas...")
reservas_sin_socio = Reserva.objects.filter(socio__isnull=True).count()
reservas_sin_clase = Reserva.objects.filter(clase__isnull=True).count()
if reservas_sin_socio > 0:
    print(f"⚠️  PROBLEMA: {reservas_sin_socio} reservas sin socio asignado")
else:
    print(f"✅ No hay reservas sin socio")

if reservas_sin_clase > 0:
    print(f"⚠️  PROBLEMA: {reservas_sin_clase} reservas sin clase asignada")
else:
    print(f"✅ No hay reservas sin clase")

# 1.2 Verificar clases sin instructor
print("\n1.2 Verificar clases sin instructor...")
clases_sin_instructor = Clase.objects.filter(instructor__isnull=True).count()
if clases_sin_instructor > 0:
    print(f"⚠️  ADVERTENCIA: {clases_sin_instructor} clases sin instructor asignado")
    clases = Clase.objects.filter(instructor__isnull=True)[:5]
    for clase in clases:
        print(f"   • {clase.nombre} - {clase.fecha} {clase.hora_inicio}")
else:
    print(f"✅ Todas las clases tienen instructor")

# 1.3 Verificar cupos inconsistentes
print("\n1.3 Verificar cupos inconsistentes...")
problemas_cupos = []
clases = Clase.objects.filter(estado=Clase.ACTIVA)
for clase in clases:
    # Contar reservas confirmadas reales
    reservas_confirmadas = clase.reservas.filter(estado=Reserva.CONFIRMADA).count()
    if reservas_confirmadas != clase.cupos_ocupados:
        problemas_cupos.append({
            'clase': clase,
            'cupos_ocupados_registrados': clase.cupos_ocupados,
            'reservas_confirmadas_reales': reservas_confirmadas
        })

if problemas_cupos:
    print(f"⚠️  PROBLEMA: {len(problemas_cupos)} clases con cupos inconsistentes")
    for p in problemas_cupos[:5]:
        print(f"   • {p['clase'].nombre} ({p['clase'].fecha}):")
        print(f"     - Cupos registrados: {p['cupos_ocupados_registrados']}")
        print(f"     - Reservas reales: {p['reservas_confirmadas_reales']}")
else:
    print(f"✅ Todos los cupos están sincronizados correctamente")

# 1.4 Verificar clases sobrecargadas
print("\n1.4 Verificar clases sobrecargadas...")
clases_sobrecargadas = Clase.objects.filter(cupos_ocupados__gt=models.F('cupos_totales'))
if clases_sobrecargadas.exists():
    print(f"⚠️  PROBLEMA CRÍTICO: {clases_sobrecargadas.count()} clases sobrecargadas")
    for clase in clases_sobrecargadas[:5]:
        print(f"   • {clase.nombre}: {clase.cupos_ocupados}/{clase.cupos_totales}")
else:
    print(f"✅ No hay clases sobrecargadas")

# CATEGORÍA 2: CONSISTENCIA DE DATOS
print("\n\n📊 CATEGORÍA 2: CONSISTENCIA DE DATOS")
print("-" * 80)

# 2.1 Verificar clases pasadas sin completar
print("\n2.1 Verificar clases pasadas sin completar...")
hoy = timezone.now().date()
clases_pasadas_activas = Clase.objects.filter(
    fecha__lt=hoy,
    estado=Clase.ACTIVA
).count()
if clases_pasadas_activas > 0:
    print(f"⚠️  ADVERTENCIA: {clases_pasadas_activas} clases pasadas aún marcadas como activas")
    clases = Clase.objects.filter(fecha__lt=hoy, estado=Clase.ACTIVA).order_by('fecha')[:5]
    for clase in clases:
        print(f"   • {clase.nombre} - {clase.fecha} (hace {(hoy - clase.fecha).days} días)")
else:
    print(f"✅ No hay clases pasadas sin completar")

# 2.2 Verificar reservas confirmadas para clases pasadas
print("\n2.2 Verificar reservas confirmadas para clases pasadas...")
reservas_pasadas_confirmadas = Reserva.objects.filter(
    clase__fecha__lt=hoy,
    estado=Reserva.CONFIRMADA
).count()
if reservas_pasadas_confirmadas > 0:
    print(f"⚠️  ADVERTENCIA: {reservas_pasadas_confirmadas} reservas confirmadas para clases pasadas")
    reservas = Reserva.objects.filter(
        clase__fecha__lt=hoy,
        estado=Reserva.CONFIRMADA
    ).select_related('clase', 'socio')[:5]
    for reserva in reservas:
        print(f"   • {reserva.socio.username} - {reserva.clase.nombre} ({reserva.clase.fecha})")
else:
    print(f"✅ No hay reservas confirmadas para clases pasadas")

# 2.3 Verificar notificaciones antiguas pendientes
print("\n2.3 Verificar notificaciones antiguas pendientes...")
hace_una_semana = timezone.now() - timedelta(days=7)
notifs_antiguas_pendientes = Notificacion.objects.filter(
    fecha_creacion__lt=hace_una_semana,
    estado=Notificacion.PENDIENTE
).count()
if notifs_antiguas_pendientes > 0:
    print(f"⚠️  ADVERTENCIA: {notifs_antiguas_pendientes} notificaciones antiguas aún pendientes")
else:
    print(f"✅ No hay notificaciones antiguas pendientes")

# 2.4 Verificar usuarios en lista de espera para clases con cupos
print("\n2.4 Verificar lista de espera innecesaria...")
problemas_lista = []
lista_espera_activa = ListaEspera.objects.filter(estado=ListaEspera.ESPERANDO)
for entrada in lista_espera_activa:
    if entrada.clase.cupos_disponibles > 0:
        problemas_lista.append(entrada)

if problemas_lista:
    print(f"⚠️  PROBLEMA: {len(problemas_lista)} usuarios en lista de espera con cupos disponibles")
    for entrada in problemas_lista[:5]:
        print(f"   • {entrada.socio.username} esperando por {entrada.clase.nombre}")
        print(f"     (Cupos disponibles: {entrada.clase.cupos_disponibles})")
else:
    print(f"✅ Lista de espera está correcta")

# CATEGORÍA 3: VALIDACIONES DE NEGOCIO
print("\n\n📊 CATEGORÍA 3: VALIDACIONES DE NEGOCIO")
print("-" * 80)

# 3.1 Verificar reservas duplicadas activas
print("\n3.1 Verificar reservas duplicadas activas...")
from django.db.models import Count
duplicadas = Reserva.objects.filter(
    estado=Reserva.CONFIRMADA
).values('socio', 'clase').annotate(
    count=Count('id')
).filter(count__gt=1)

if duplicadas.exists():
    print(f"⚠️  PROBLEMA CRÍTICO: {duplicadas.count()} casos de reservas duplicadas")
    for dup in duplicadas[:5]:
        socio = Usuario.objects.get(id=dup['socio'])
        clase = Clase.objects.get(id=dup['clase'])
        print(f"   • {socio.username} tiene {dup['count']} reservas para {clase.nombre}")
else:
    print(f"✅ No hay reservas duplicadas")

# 3.2 Verificar horarios de clases solapados
print("\n3.2 Verificar horarios de clases solapados...")
clases_solapadas = []
clases_activas = Clase.objects.filter(estado=Clase.ACTIVA).order_by('fecha', 'hora_inicio')
for i, clase1 in enumerate(clases_activas):
    for clase2 in clases_activas[i+1:]:
        # Si son el mismo día y el instructor es el mismo
        if clase1.fecha == clase2.fecha and clase1.instructor == clase2.instructor:
            # Verificar solapamiento de horarios
            if (clase1.hora_inicio <= clase2.hora_inicio < clase1.hora_fin or
                clase1.hora_inicio < clase2.hora_fin <= clase1.hora_fin):
                clases_solapadas.append((clase1, clase2))

if clases_solapadas:
    print(f"⚠️  PROBLEMA: {len(clases_solapadas)} casos de horarios solapados")
    for clase1, clase2 in clases_solapadas[:5]:
        print(f"   • {clase1.nombre} ({clase1.hora_inicio}-{clase1.hora_fin})")
        print(f"     solapa con {clase2.nombre} ({clase2.hora_inicio}-{clase2.hora_fin})")
        print(f"     Instructor: {clase1.instructor.usuario.get_full_name()}")
else:
    print(f"✅ No hay horarios solapados")

# 3.3 Verificar usuarios bloqueados con reservas activas
print("\n3.3 Verificar usuarios bloqueados con reservas activas...")
usuarios_bloqueados = Usuario.objects.filter(bloqueado_hasta__isnull=False, bloqueado_hasta__gte=timezone.now())
reservas_usuarios_bloqueados = Reserva.objects.filter(
    socio__bloqueado_hasta__isnull=False,
    socio__bloqueado_hasta__gte=timezone.now(),
    estado=Reserva.CONFIRMADA,
    clase__fecha__gte=hoy
).count()

if reservas_usuarios_bloqueados > 0:
    print(f"⚠️  PROBLEMA: {reservas_usuarios_bloqueados} reservas activas de usuarios bloqueados")
else:
    print(f"✅ No hay reservas activas de usuarios bloqueados")

# CATEGORÍA 4: VERIFICACIÓN DE ARCHIVOS FRONTEND
print("\n\n📊 CATEGORÍA 4: ESTRUCTURA DE ARCHIVOS")
print("-" * 80)

# 4.1 Verificar archivos críticos del frontend
print("\n4.1 Verificar archivos críticos del frontend...")
archivos_criticos = [
    'frontend/src/App.jsx',
    'frontend/src/main.jsx',
    'frontend/src/services/api.js',
    'frontend/src/hooks/useNotificationState.js',
    'frontend/package.json',
    'frontend/vite.config.js',
]

archivos_faltantes = []
for archivo in archivos_criticos:
    if not os.path.exists(archivo):
        archivos_faltantes.append(archivo)

if archivos_faltantes:
    print(f"⚠️  PROBLEMA: {len(archivos_faltantes)} archivos críticos faltantes")
    for archivo in archivos_faltantes:
        print(f"   • {archivo}")
else:
    print(f"✅ Todos los archivos críticos están presentes")

# 4.2 Verificar configuración de Django
print("\n4.2 Verificar configuración crítica de Django...")
from django.conf import settings

problemas_config = []

# Verificar SECRET_KEY
if settings.SECRET_KEY == 'django-insecure-default-key':
    problemas_config.append("SECRET_KEY usa valor por defecto inseguro")

# Verificar DEBUG
if settings.DEBUG:
    problemas_config.append("DEBUG está activado (no recomendado para producción)")

# Verificar ALLOWED_HOSTS
if not settings.ALLOWED_HOSTS or settings.ALLOWED_HOSTS == ['*']:
    problemas_config.append("ALLOWED_HOSTS no está configurado correctamente")

# Verificar CORS
if hasattr(settings, 'CORS_ALLOW_ALL_ORIGINS') and settings.CORS_ALLOW_ALL_ORIGINS:
    problemas_config.append("CORS permite todos los orígenes (riesgo de seguridad)")

if problemas_config:
    print(f"⚠️  ADVERTENCIA: {len(problemas_config)} problemas de configuración")
    for problema in problemas_config:
        print(f"   • {problema}")
else:
    print(f"✅ Configuración de Django correcta")

# RESUMEN FINAL
print("\n\n" + "="*80)
print("📋 RESUMEN DEL ANÁLISIS")
print("="*80)

total_problemas = (
    (1 if reservas_sin_socio > 0 else 0) +
    (1 if reservas_sin_clase > 0 else 0) +
    (1 if len(problemas_cupos) > 0 else 0) +
    (1 if clases_sobrecargadas.exists() else 0) +
    (1 if clases_pasadas_activas > 0 else 0) +
    (1 if reservas_pasadas_confirmadas > 0 else 0) +
    (1 if len(problemas_lista) > 0 else 0) +
    (1 if duplicadas.exists() else 0) +
    (1 if len(clases_solapadas) > 0 else 0) +
    (1 if reservas_usuarios_bloqueados > 0 else 0) +
    len(archivos_faltantes) +
    len(problemas_config)
)

print(f"\n🔍 Total de problemas detectados: {total_problemas}")

if total_problemas == 0:
    print("\n✅ ¡SISTEMA LIMPIO! No se detectaron bugs o problemas críticos.")
    print("🎉 El sistema está funcionando correctamente y listo para usar.")
elif total_problemas <= 3:
    print("\n⚠️  Se detectaron algunos problemas menores.")
    print("💡 Se recomienda revisar y corregir las advertencias mostradas.")
else:
    print("\n🚨 Se detectaron múltiples problemas que requieren atención.")
    print("⚠️  Se recomienda corregir los problemas antes de continuar.")

print("\n" + "="*80)
print("✅ Análisis completado")
print("="*80 + "\n")
