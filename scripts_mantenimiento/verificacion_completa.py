import os
import sys
import django
import ast
import re
from pathlib import Path

sys.path.insert(0, '')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.apps import apps
from django.db.models import Count, F
from usuarios.models import Usuario
from clases.models import Clase
from reservas.models import Reserva
from lista_espera.models import ListaEspera
from notificaciones.models import Notificacion
from equipamiento.models import Equipo

print("=" * 80)
print("VERIFICACIÓN COMPLETA DEL SISTEMA")
print("=" * 80)

# 1. VERIFICAR INTEGRIDAD DE BASE DE DATOS
print("\n1. INTEGRIDAD DE BASE DE DATOS")
print("-" * 80)

# Usuarios
usuarios_total = Usuario.objects.count()
usuarios_activos = Usuario.objects.filter(is_active=True).count()
usuarios_duplicados = Usuario.objects.values('username').annotate(count=Count('username')).filter(count__gt=1)
usuarios_sin_email = Usuario.objects.filter(email='').count()
usuarios_sin_nombre = Usuario.objects.filter(first_name='', last_name='').count()

print(f"✓ Usuarios: {usuarios_total} total, {usuarios_activos} activos")
print(f"  - Duplicados: {usuarios_duplicados.count()}")
print(f"  - Sin email: {usuarios_sin_email}")
print(f"  - Sin nombre: {usuarios_sin_nombre}")

# Roles
for rol_value in [Usuario.SOCIO, Usuario.INSTRUCTOR, Usuario.ADMINISTRADOR]:
    count = Usuario.objects.filter(rol=rol_value).count()
    usuarios_rol = Usuario.objects.filter(rol=rol_value)
    print(f"  - {rol_value}: {count} usuarios")
    for u in usuarios_rol[:3]:
        print(f"    · {u.username} (rol='{u.rol}', len={len(u.rol)})")

# Clases
clases_total = Clase.objects.count()
clases_activas = Clase.objects.filter(estado='programada').count()
clases_cupos_negativos = Clase.objects.filter(cupos_ocupados__lt=0).count()
clases_cupos_excedidos = Clase.objects.filter(cupos_ocupados__gt=F('cupos_totales')).count()
clases_sin_instructor = Clase.objects.filter(instructor__isnull=True).count()

print(f"\n✓ Clases: {clases_total} total, {clases_activas} activas")
print(f"  - Cupos negativos: {clases_cupos_negativos}")
print(f"  - Cupos excedidos: {clases_cupos_excedidos}")
print(f"  - Sin instructor: {clases_sin_instructor}")

# Reservas
reservas_total = Reserva.objects.count()
reservas_activas = Reserva.objects.filter(estado='confirmada').count()
reservas_duplicadas = Reserva.objects.values('socio', 'clase').annotate(
    count=Count('id')
).filter(count__gt=1).count()
reservas_huerfanas = Reserva.objects.filter(clase__isnull=True).count()

print(f"\n✓ Reservas: {reservas_total} total, {reservas_activas} confirmadas")
print(f"  - Duplicadas: {reservas_duplicadas}")
print(f"  - Huérfanas: {reservas_huerfanas}")

# Lista de espera
lista_espera_total = ListaEspera.objects.count()
lista_espera_activa = ListaEspera.objects.filter(estado='en_espera').count()

print(f"\n✓ Lista de espera: {lista_espera_total} total, {lista_espera_activa} en espera")

# Notificaciones
notificaciones_total = Notificacion.objects.count()
notificaciones_no_leidas = Notificacion.objects.filter(leida=False).count()

print(f"\n✓ Notificaciones: {notificaciones_total} total, {notificaciones_no_leidas} no leídas")

# 2. VERIFICAR CONSISTENCIA DE DATOS
print("\n\n2. CONSISTENCIA DE DATOS")
print("-" * 80)

from django.utils import timezone
from datetime import datetime, timedelta

# Clases pasadas sin completar
ahora = timezone.now()
clases_pasadas_sin_completar = Clase.objects.filter(
    fecha__lt=ahora.date(),
    estado='programada'
).count()
print(f"✓ Clases pasadas sin completar: {clases_pasadas_sin_completar}")

# Reservas confirmadas en clases pasadas
reservas_pasadas_confirmadas = Reserva.objects.filter(
    clase__fecha__lt=ahora.date(),
    estado='confirmada'
).count()
print(f"✓ Reservas confirmadas en clases pasadas: {reservas_pasadas_confirmadas}")

# Verificar sincronización de cupos
print("\n✓ Sincronización de cupos:")
clases_con_problemas = []
for clase in Clase.objects.all()[:10]:
    reservas_count = Reserva.objects.filter(
        clase=clase,
        estado='confirmada'
    ).count()
    if clase.cupos_ocupados != reservas_count:
        clases_con_problemas.append({
            'clase': clase.nombre,
            'fecha': clase.fecha,
            'cupos_db': clase.cupos_ocupados,
            'reservas_reales': reservas_count
        })

if clases_con_problemas:
    print(f"  ⚠ {len(clases_con_problemas)} clases con cupos desincronizados:")
    for problema in clases_con_problemas[:5]:
        print(f"    · {problema['clase']} - DB:{problema['cupos_db']} Real:{problema['reservas_reales']}")
else:
    print("  ✓ Todos los cupos sincronizados correctamente")

# 3. VERIFICAR CÓDIGO DUPLICADO
print("\n\n3. ANÁLISIS DE CÓDIGO")
print("-" * 80)

# Buscar imports duplicados en archivos Python
print("✓ Verificando imports duplicados...")
archivos_python = list(Path('.').rglob('*.py'))
archivos_con_imports_duplicados = []

for archivo in archivos_python:
    if 'venv' in str(archivo) or '.venv' in str(archivo) or 'migrations' in str(archivo):
        continue
    
    try:
        with open(archivo, 'r', encoding='utf-8') as f:
            contenido = f.read()
            imports = re.findall(r'^import .*|^from .* import .*', contenido, re.MULTILINE)
            if len(imports) != len(set(imports)):
                duplicados = [imp for imp in imports if imports.count(imp) > 1]
                if duplicados:
                    archivos_con_imports_duplicados.append({
                        'archivo': str(archivo),
                        'duplicados': list(set(duplicados))
                    })
    except:
        pass

if archivos_con_imports_duplicados:
    print(f"  ⚠ {len(archivos_con_imports_duplicados)} archivos con imports duplicados:")
    for item in archivos_con_imports_duplicados[:5]:
        print(f"    · {item['archivo']}")
        for dup in item['duplicados'][:2]:
            print(f"      - {dup}")
else:
    print("  ✓ No se encontraron imports duplicados")

# 4. VERIFICAR ARCHIVOS DE CONFIGURACIÓN
print("\n\n4. CONFIGURACIÓN")
print("-" * 80)

from django.conf import settings

print(f"✓ DEBUG: {settings.DEBUG}")
print(f"✓ SECRET_KEY: {'***' + settings.SECRET_KEY[-10:] if len(settings.SECRET_KEY) > 20 else '⚠ INSEGURA'}")
print(f"✓ ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
print(f"✓ CORS_ALLOW_ALL_ORIGINS: {getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', 'No configurado')}")
print(f"✓ CORS_ALLOWED_ORIGINS: {getattr(settings, 'CORS_ALLOWED_ORIGINS', [])}")

# 5. VERIFICAR LOGS
print("\n\n5. LOGS")
print("-" * 80)

logs_dir = Path('logs')
if logs_dir.exists():
    archivos_log = list(logs_dir.glob('*.log'))
    print(f"✓ Archivos de log encontrados: {len(archivos_log)}")
    for log_file in archivos_log[:5]:
        size_kb = log_file.stat().st_size / 1024
        print(f"  - {log_file.name}: {size_kb:.2f} KB")
else:
    print("  ⚠ Directorio de logs no existe")

# 6. VERIFICAR MODELOS
print("\n\n6. MODELOS")
print("-" * 80)

from django.db import models as django_models

for model in apps.get_models():
    if model._meta.app_label in ['usuarios', 'clases', 'reservas', 'lista_espera', 'notificaciones', 'equipamiento']:
        campos_con_blank = []
        campos_con_null = []
        
        for field in model._meta.fields:
            if field.blank:
                campos_con_blank.append(field.name)
            if field.null:
                campos_con_null.append(field.name)
        
        print(f"\n✓ {model.__name__}")
        print(f"  - Campos totales: {len(model._meta.fields)}")
        if campos_con_blank:
            print(f"  - Campos con blank=True: {', '.join(campos_con_blank[:5])}")
        if campos_con_null:
            print(f"  - Campos con null=True: {', '.join(campos_con_null[:5])}")

print("\n\n" + "=" * 80)
print("VERIFICACIÓN COMPLETADA")
print("=" * 80)
