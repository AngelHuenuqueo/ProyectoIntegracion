# 🏋️ Sistema de Gestión de Reservas - Gimnasio Energía Total

Sistema web completo para la gestión de reservas de clases en el gimnasio Energía Total, con aproximadamente 600 socios activos.

## 📋 Descripción del Proyecto

Aplicación web que permite a los socios reservar clases (spinning, yoga, pilates, musculación, cardio), gestionar listas de espera automáticas y reducir el no-show mediante notificaciones automatizadas.

## 🚀 Tecnologías Utilizadas

### Backend
- **Django 5.2.7** - Framework web
- **Django REST Framework** - API REST
- **SQLite** - Base de datos (desarrollo)
- **JWT** - Autenticación con tokens
- **Celery** - Tareas asíncronas
- **Redis** - Message broker

### Frontend
- **React 18** - Biblioteca de UI
- **Vite** - Build tool moderno
- **React Router** - Navegación SPA
- **Axios** - Cliente HTTP

## 📁 Estructura del Proyecto

```
ProyectoInt/
│
├── backend/                    # Configuración principal de Django
│   ├── settings.py            # Configuraciones del proyecto
│   ├── urls.py                # URLs de la API REST
│   └── wsgi.py                # WSGI para despliegue
│
├── usuarios/                   # App: Gestión de usuarios y autenticación
├── clases/                     # App: Gestión de clases/sesiones
├── reservas/                   # App: Sistema de reservas
├── lista_espera/               # App: Listas de espera automáticas
├── notificaciones/             # App: Notificaciones push y email
│
├── frontend/                   # Aplicación React (SPA)
│   ├── src/
│   │   ├── pages/             # Páginas: Login, Clases, Perfil, Reservas
│   │   ├── services/          # Configuración de API (axios)
│   │   ├── App.jsx            # Componente principal + rutas
│   │   └── main.jsx           # Punto de entrada
│   ├── package.json           # Dependencias de Node.js
│   └── vite.config.js         # Configuración de Vite
│
├── manage.py                   # Comando CLI de Django
├── requirements.txt            # Dependencias Python
├── db.sqlite3                  # Base de datos SQLite
├── .env                        # Variables de entorno
└── README.md                   # Este archivo
```

## ⚙️ Instalación y Configuración

### Requisitos Previos
- Python 3.8+
- Node.js 16+
- npm o yarn

### 🔧 Configuración del Backend

#### 1. Crear y activar entorno virtual
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

#### 2. Instalar dependencias
```powershell
pip install -r requirements.txt
```

#### 3. Aplicar migraciones
```powershell
python manage.py migrate
```

#### 4. Generar datos de prueba
```powershell
python manage.py crear_datos_prueba
```

#### 5. Iniciar el servidor backend
```powershell
python manage.py runserver
```

**Backend disponible en:** http://127.0.0.1:8000/

### 🎨 Configuración del Frontend

#### 1. Ir a la carpeta frontend
```powershell
cd frontend
```

#### 2. Instalar dependencias
```powershell
npm install
```

#### 3. Iniciar servidor de desarrollo
```powershell
npm run dev
```

**Frontend disponible en:** http://localhost:5173/
```bash
git clone <url-del-repositorio>
cd ProyectoInt
```

### 3. Crear entorno virtual
```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
```

### 4. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 5. Configurar variables de entorno
Crea un archivo `.env` basado en `.env.example`:
```env
DB_NAME=gimnasio_energia_total
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=tu-secret-key
DEBUG=True
```

### 6. Crear base de datos PostgreSQL
```sql
CREATE DATABASE gimnasio_energia_total;
```

### 7. Ejecutar migraciones
```bash
python manage.py makemigrations
python manage.py migrate
```

### 8. Crear superusuario
```bash
python manage.py createsuperuser
```

### 9. Ejecutar servidor de desarrollo
```bash
python manage.py runserver
```

El servidor estará disponible en: `http://localhost:8000`

## 🎯 Funcionalidades Principales

### Para Socios
- ✅ Buscar clases por tipo, fecha y hora
- ✅ Reservar y cancelar clases
- ✅ Ver historial de reservas
- ✅ Recibir notificaciones automáticas

### Para Instructores
- ✅ Crear y gestionar clases
- ✅ Definir cupos y horarios
- ✅ Ver lista de inscritos
- ✅ Registrar asistencia y no-shows

### Para Administradores
- ✅ Gestión completa de usuarios
- ✅ Crear/editar clases y horarios
- ✅ Gestionar instructores
- ✅ Generar reportes de ocupación
- ✅ Establecer políticas (máx. no-show, etc.)

## 📊 Objetivos del Sistema

- 🎯 Reducir el no-show en al menos 30% en los dos primeros meses
- 🎯 Lograr que al menos el 70% de las reservas se hagan con líneas sin intervención de recepción
- 🎯 Gestión automática de listas de espera
- 🎯 Notificaciones automáticas push y email

## 🔐 Autenticación

El sistema utiliza **JWT (JSON Web Tokens)** para la autenticación:

```bash
# Obtener token
POST /api/auth/login/
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}

# Usar token en las peticiones
Authorization: Bearer <token>
```

## 📝 API Endpoints (próximamente)

- `/api/auth/` - Autenticación y registro
- `/api/users/` - Gestión de usuarios
- `/api/classes/` - Gestión de clases
- `/api/reservations/` - Sistema de reservas
- `/api/waitlist/` - Listas de espera
- `/api/notifications/` - Notificaciones

## 🧪 Pruebas

```bash
python manage.py test
```

## 📦 Despliegue

(Instrucciones de despliegue se agregarán más adelante)

## 👥 Roles de Usuario

1. **Socio**: Puede buscar y reservar clases
2. **Instructor**: Puede crear clases y gestionar asistencia
3. **Administrador**: Acceso completo al sistema

## 📧 Contacto

Para más información sobre el proyecto, contacta al equipo de desarrollo.

## 📄 Licencia

Este proyecto es privado y pertenece al Gimnasio Energía Total.
