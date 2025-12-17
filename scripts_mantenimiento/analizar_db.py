import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

print("=" * 80)
print("ANÁLISIS DIRECTO DE LA BASE DE DATOS")
print("=" * 80)

# Ver los instructores
cursor.execute("""
    SELECT username, rol, length(rol) as len, hex(rol) as hex_rol
    FROM usuarios_usuario 
    WHERE rol LIKE 'instructor%'
    LIMIT 5
""")

print("\nInstructores en DB:")
for row in cursor.fetchall():
    username, rol, length, hex_rol = row
    print(f"  {username:25s} | rol='{rol}' | length={length} | hex={hex_rol}")

# Ver todos los roles únicos
cursor.execute("""
    SELECT DISTINCT rol, length(rol), COUNT(*) as count
    FROM usuarios_usuario
    GROUP BY rol
    ORDER BY rol
""")

print("\n" + "=" * 80)
print("ROLES ÚNICOS:")
for row in cursor.fetchall():
    rol, length, count = row
    print(f"  '{rol}' (length={length}) -> {count} usuarios")

conn.close()
