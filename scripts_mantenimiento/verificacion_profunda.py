import os
import sys
from pathlib import Path
import re

print("=" * 80)
print("VERIFICACIÓN PROFUNDA DE CÓDIGO")
print("=" * 80)

# 1. ARCHIVOS TEMPORALES Y BASURA
print("\n1. ARCHIVOS TEMPORALES Y BASURA")
print("-" * 80)

archivos_temporales = []
extensiones_temporales = ['.pyc', '.pyo', '.tmp', '.bak', '.swp', '.log~']
directorios_ignorar = ['.venv', 'venv', '__pycache__', 'node_modules', '.git']

for archivo in Path('.').rglob('*'):
    if archivo.is_file():
        # Saltar directorios ignorados
        if any(d in archivo.parts for d in directorios_ignorar):
            continue
        
        # Buscar archivos temporales
        if archivo.suffix in extensiones_temporales:
            archivos_temporales.append(str(archivo))
        
        # Buscar archivos con nombres temporales
        if any(x in archivo.name.lower() for x in ['temp', 'tmp', 'test_', 'backup', '.bak']):
            if archivo.suffix in ['.py', '.jsx', '.js']:
                archivos_temporales.append(str(archivo))

if archivos_temporales:
    print(f"⚠ {len(archivos_temporales)} archivos temporales encontrados:")
    for arch in archivos_temporales[:10]:
        print(f"  - {arch}")
else:
    print("✓ No se encontraron archivos temporales")

# 2. ARCHIVOS PYTHON SIN USO
print("\n2. ARCHIVOS DE ANÁLISIS/SCRIPTS DE UNA VEZ")
print("-" * 80)

archivos_analisis = [
    'analisis_bugs.py',
    'corregir_problemas.py',
    'verificar_roles.py',
    'limpiar_roles.py',
    'analizar_db.py',
    'verificacion_completa.py',
    'verificar_problemas.py',
    'corregir_problemas_encontrados.py',
    'limpiar_console_log.py'
]

archivos_encontrados = []
for archivo in archivos_analisis:
    if Path(archivo).exists():
        size_kb = Path(archivo).stat().st_size / 1024
        archivos_encontrados.append(f"{archivo} ({size_kb:.1f} KB)")

if archivos_encontrados:
    print(f"⚠ {len(archivos_encontrados)} scripts de análisis en raíz:")
    for arch in archivos_encontrados:
        print(f"  - {arch}")
    print("\n  Recomendación: Mover a carpeta 'scripts/' o eliminar después de uso")
else:
    print("✓ No hay scripts de análisis en la raíz")

# 3. VERIFICAR IMPORTS NO UTILIZADOS EN PYTHON
print("\n3. IMPORTS EN ARCHIVOS PYTHON")
print("-" * 80)

archivos_python = []
for archivo in Path('.').rglob('*.py'):
    if any(d in str(archivo) for d in ['.venv', 'venv', 'migrations', '__pycache__']):
        continue
    if archivo.name in archivos_analisis:
        continue
    archivos_python.append(archivo)

print(f"✓ Analizando {len(archivos_python)} archivos Python principales")

# 4. VERIFICAR FUNCIONES NO UTILIZADAS EN VIEWS
print("\n4. VERIFICAR VIEWS Y SERIALIZERS")
print("-" * 80)

apps_django = ['usuarios', 'clases', 'reservas', 'lista_espera', 'notificaciones', 'equipamiento']

for app in apps_django:
    views_file = Path(f'{app}/views.py')
    serializers_file = Path(f'{app}/serializers.py')
    
    if views_file.exists():
        with open(views_file, 'r', encoding='utf-8') as f:
            contenido = f.read()
            # Contar clases ViewSet
            viewsets = re.findall(r'class\s+(\w+ViewSet)', contenido)
            # Contar funciones view
            views = re.findall(r'^def\s+(\w+)\(request', contenido, re.MULTILINE)
            
            print(f"✓ {app}/views.py: {len(viewsets)} ViewSets, {len(views)} views")
    
    if serializers_file.exists():
        with open(serializers_file, 'r', encoding='utf-8') as f:
            contenido = f.read()
            serializers = re.findall(r'class\s+(\w+Serializer)', contenido)
            print(f"✓ {app}/serializers.py: {len(serializers)} Serializers")

# 5. VERIFICAR URLS REGISTRADAS
print("\n5. URLS REGISTRADAS")
print("-" * 80)

backend_urls = Path('backend/urls.py')
if backend_urls.exists():
    with open(backend_urls, 'r', encoding='utf-8') as f:
        contenido = f.read()
        includes = re.findall(r"path\(['\"]([^'\"]+)['\"].*include\(['\"]([^'\"]+)", contenido)
        
        print("✓ URLs principales:")
        for url_path, include_path in includes:
            print(f"  - {url_path} → {include_path}")

# 6. COMPONENTES REACT
print("\n6. COMPONENTES REACT")
print("-" * 80)

componentes = list(Path('frontend/src/components').rglob('*.jsx'))
pages = list(Path('frontend/src/pages').rglob('*.jsx'))

print(f"✓ Componentes: {len(componentes)}")
print(f"✓ Páginas: {len(pages)}")

# Buscar componentes que podrían no estar en uso
print("\n  Verificando uso de componentes:")
for componente in componentes:
    nombre_componente = componente.stem
    # Buscar en todos los archivos jsx
    uso_encontrado = False
    for archivo in pages + componentes:
        if archivo != componente:
            try:
                with open(archivo, 'r', encoding='utf-8') as f:
                    contenido = f.read()
                    if f"import {nombre_componente}" in contenido or f"import {{ {nombre_componente}" in contenido:
                        uso_encontrado = True
                        break
            except:
                pass
    
    if not uso_encontrado and nombre_componente not in ['App', 'main']:
        print(f"  ⚠ {nombre_componente}.jsx podría no estar en uso")

# 7. ARCHIVOS DE CONFIGURACIÓN
print("\n7. ARCHIVOS DE CONFIGURACIÓN")
print("-" * 80)

configs_importantes = [
    '.env',
    'requirements.txt',
    'package.json',
    'manage.py',
    'frontend/vite.config.js',
    'frontend/tailwind.config.js'
]

for config in configs_importantes:
    if Path(config).exists():
        print(f"✓ {config}")
    else:
        print(f"⚠ {config} NO ENCONTRADO")

# 8. MIGRACIONES
print("\n8. MIGRACIONES DE BASE DE DATOS")
print("-" * 80)

for app in apps_django:
    migrations_dir = Path(f'{app}/migrations')
    if migrations_dir.exists():
        migraciones = list(migrations_dir.glob('*.py'))
        migraciones = [m for m in migraciones if m.name != '__init__.py']
        print(f"✓ {app}: {len(migraciones)} migraciones")

print("\n" + "=" * 80)
print("VERIFICACIÓN PROFUNDA COMPLETADA")
print("=" * 80)
