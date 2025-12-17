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
print("VERIFICACIÓN DE PROBLEMAS CRÍTICOS")
print("=" * 80)

# 1. RESERVAS DUPLICADAS
print("\n1. RESERVAS DUPLICADAS")
print("-" * 80)

duplicados = Reserva.objects.values('socio', 'clase').annotate(
    count=Count('id')
).filter(count__gt=1)

if duplicados.exists():
    print(f"⚠ Se encontraron {duplicados.count()} pares socio-clase duplicados:\n")
    for dup in duplicados:
        socio = Usuario.objects.get(id=dup['socio'])
        clase = Clase.objects.get(id=dup['clase'])
        reservas = Reserva.objects.filter(socio=socio, clase=clase).order_by('fecha_reserva')
        
        print(f"Socio: {socio.username} | Clase: {clase.nombre} ({clase.fecha} {clase.hora_inicio})")
        for i, reserva in enumerate(reservas, 1):
            print(f"  {i}. ID:{reserva.id} | Estado:{reserva.estado} | Fecha:{reserva.fecha_reserva}")
        print()
else:
    print("✓ No se encontraron reservas duplicadas")

# 2. USUARIO SIN NOMBRE
print("\n2. USUARIOS SIN NOMBRE")
print("-" * 80)

usuarios_sin_nombre = Usuario.objects.filter(first_name='', last_name='')
if usuarios_sin_nombre.exists():
    print(f"⚠ {usuarios_sin_nombre.count()} usuarios sin nombre:")
    for u in usuarios_sin_nombre:
        print(f"  - {u.username} | Email: {u.email} | Rol: {u.rol}")
else:
    print("✓ Todos los usuarios tienen nombre")

# 3. CLASES SIN ESTADO ACTIVO
print("\n3. CLASES PROGRAMADAS")
print("-" * 80)

clases_programadas = Clase.objects.filter(estado='programada').count()
clases_futuras = Clase.objects.filter(fecha__gte=timezone.now().date()).count()
print(f"✓ Clases programadas: {clases_programadas}")
print(f"✓ Clases futuras: {clases_futuras}")

if clases_programadas == 0 and clases_futuras > 0:
    print("⚠ Hay clases futuras pero ninguna está en estado 'programada'")
    clases = Clase.objects.filter(fecha__gte=timezone.now().date())[:5]
    for clase in clases:
        print(f"  - {clase.nombre} ({clase.fecha}) | Estado: {clase.estado}")

# 4. SINCRONIZACIÓN DE CUPOS
print("\n4. SINCRONIZACIÓN DE CUPOS")
print("-" * 80)

problemas_cupos = []
for clase in Clase.objects.all():
    reservas_count = Reserva.objects.filter(clase=clase, estado='confirmada').count()
    if clase.cupos_ocupados != reservas_count:
        problemas_cupos.append({
            'clase': clase,
            'cupos_db': clase.cupos_ocupados,
            'reservas_reales': reservas_count,
            'diferencia': abs(clase.cupos_ocupados - reservas_count)
        })

if problemas_cupos:
    print(f"⚠ {len(problemas_cupos)} clases con cupos desincronizados:\n")
    for problema in sorted(problemas_cupos, key=lambda x: x['diferencia'], reverse=True)[:10]:
        clase = problema['clase']
        print(f"  {clase.nombre} ({clase.fecha} {clase.hora_inicio})")
        print(f"    DB: {problema['cupos_db']} | Real: {problema['reservas_reales']} | Diferencia: {problema['diferencia']}")
else:
    print("✓ Todos los cupos están sincronizados")

# 5. VERIFICAR DEBUG EN CONSOLE.LOG
print("\n5. CÓDIGO DE DEBUG EN FRONTEND")
print("-" * 80)

import re
from pathlib import Path

archivos_jsx = list(Path('frontend/src').rglob('*.jsx'))
archivos_con_debug = []

for archivo in archivos_jsx:
    try:
        with open(archivo, 'r', encoding='utf-8') as f:
            contenido = f.read()
            console_logs = re.findall(r'console\.(log|debug|info|warn|error)\(', contenido)
            if console_logs:
                archivos_con_debug.append({
                    'archivo': str(archivo),
                    'count': len(console_logs)
                })
    except:
        pass

if archivos_con_debug:
    print(f"⚠ {len(archivos_con_debug)} archivos con console.log:")
    for item in sorted(archivos_con_debug, key=lambda x: x['count'], reverse=True)[:10]:
        print(f"  - {item['archivo'].replace('frontend\\src\\', '')}: {item['count']} console.log")
else:
    print("✓ No se encontraron console.log en el frontend")

# 6. IMPORTS DUPLICADOS
print("\n6. IMPORTS DUPLICADOS")
print("-" * 80)

archivos_python = list(Path('.').rglob('*.py'))
imports_duplicados_encontrados = []

for archivo in archivos_python:
    if any(x in str(archivo) for x in ['venv', '.venv', 'migrations', '__pycache__']):
        continue
    
    try:
        with open(archivo, 'r', encoding='utf-8') as f:
            contenido = f.read()
            imports = re.findall(r'^(import .*|from .* import .*)', contenido, re.MULTILINE)
            if len(imports) != len(set(imports)):
                duplicados = [imp for imp in set(imports) if imports.count(imp) > 1]
                if duplicados:
                    imports_duplicados_encontrados.append({
                        'archivo': str(archivo),
                        'duplicados': duplicados
                    })
    except:
        pass

if imports_duplicados_encontrados:
    print(f"⚠ {len(imports_duplicados_encontrados)} archivos con imports duplicados:")
    for item in imports_duplicados_encontrados:
        print(f"\n  {item['archivo']}:")
        for dup in item['duplicados']:
            count = sum(1 for _ in re.finditer(re.escape(dup), open(item['archivo'], encoding='utf-8').read()))
            print(f"    - {dup} ({count}x)")
else:
    print("✓ No se encontraron imports duplicados")

print("\n" + "=" * 80)
print("VERIFICACIÓN COMPLETADA")
print("=" * 80)
