# Script de configuración de base de datos PostgreSQL
# Ejecutar en psql o pgAdmin

-- Crear la base de datos
CREATE DATABASE gimnasio_energia_total;

-- Crear usuario (opcional, si no usas el usuario postgres por defecto)
-- CREATE USER gimnasio_user WITH PASSWORD 'tu_password_seguro';

-- Dar privilegios al usuario
-- GRANT ALL PRIVILEGES ON DATABASE gimnasio_energia_total TO gimnasio_user;

-- Conectar a la base de datos
\c gimnasio_energia_total

-- Verificar la conexión
SELECT version();
