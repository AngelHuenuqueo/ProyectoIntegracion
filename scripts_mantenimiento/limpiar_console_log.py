import re
from pathlib import Path

print("=" * 80)
print("LIMPIANDO CONSOLE.LOG DEL FRONTEND")
print("=" * 80)

archivos_jsx = list(Path('frontend/src').rglob('*.jsx'))
archivos_js = list(Path('frontend/src').rglob('*.js'))
todos_archivos = archivos_jsx + archivos_js

total_eliminados = 0
archivos_modificados = []

for archivo in todos_archivos:
    try:
        with open(archivo, 'r', encoding='utf-8') as f:
            contenido = f.read()
            contenido_original = contenido
        
        # Contar console.log antes
        console_logs_antes = len(re.findall(r'console\.(log|debug|info)\(', contenido))
        
        if console_logs_antes > 0:
            # Eliminar líneas completas con solo console.log/debug/info
            contenido = re.sub(r'^\s*console\.(log|debug|info)\([^)]*\);?\s*$', '', contenido, flags=re.MULTILINE)
            
            # Eliminar console.log en línea (pero mantener otras partes de la línea)
            # NO eliminamos console.error ni console.warn (útiles para errores)
            
            # Contar después
            console_logs_despues = len(re.findall(r'console\.(log|debug|info)\(', contenido))
            
            if console_logs_antes != console_logs_despues:
                # Escribir archivo modificado
                with open(archivo, 'w', encoding='utf-8') as f:
                    f.write(contenido)
                
                eliminados = console_logs_antes - console_logs_despues
                total_eliminados += eliminados
                archivos_modificados.append({
                    'archivo': str(archivo).replace('frontend\\src\\', ''),
                    'eliminados': eliminados
                })
                print(f"✓ {archivo.name}: {eliminados} console.log eliminados")
    
    except Exception as e:
        print(f"⚠ Error procesando {archivo}: {e}")

print(f"\n{'=' * 80}")
print(f"RESUMEN")
print(f"{'=' * 80}")
print(f"✓ Archivos modificados: {len(archivos_modificados)}")
print(f"✓ Console.log eliminados: {total_eliminados}")

if archivos_modificados:
    print(f"\nARCHIVOS MODIFICADOS:")
    for item in sorted(archivos_modificados, key=lambda x: x['eliminados'], reverse=True):
        print(f"  - {item['archivo']}: {item['eliminados']} líneas")
