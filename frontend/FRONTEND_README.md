# 🎨 Frontend - Gimnasio Energía Total

Aplicación React moderna para el sistema de reservas del gimnasio.

## 📁 Estructura del Código

```
frontend/
├── src/
│   ├── pages/              # Páginas de la aplicación
│   │   ├── Login.jsx       # Página de inicio de sesión
│   │   ├── Clases.jsx      # Lista de clases disponibles
│   │   ├── Perfil.jsx      # Perfil del usuario
│   │   └── Reservas.jsx    # Mis reservas
│   │
│   ├── services/           # Servicios y configuraciones
│   │   └── api.js          # Configuración de Axios + JWT
│   │
│   ├── App.jsx             # Componente principal + rutas
│   ├── App.css             # Estilos del componente App
│   ├── main.jsx            # Punto de entrada de React
│   └── index.css           # Estilos globales
│
├── public/                 # Archivos públicos estáticos
├── package.json            # Dependencias y scripts
├── vite.config.js          # Configuración de Vite
└── FRONTEND_README.md      # Este archivo
```

---

## 🚀 Inicio Rápido

### Instalación

```powershell
# Ir a la carpeta frontend
cd frontend

# Instalar dependencias
npm install
```

### Desarrollo

```powershell
# Iniciar servidor de desarrollo
npm run dev

# Disponible en: http://localhost:5173/
```

### Build para Producción

```powershell
npm run build
# Archivos en: dist/
```

---

## 📦 Dependencias Principales

- **react** (^18.3.1) - Biblioteca de UI
- **react-router-dom** (^7.1.1) - Rutas SPA
- **axios** (^1.7.9) - Cliente HTTP
- **vite** (^7.1.12) - Build tool

---

## 🗂️ Archivos Clave

### `src/services/api.js` - Configuración de API

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
})

// Agrega token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

### `src/App.jsx` - Componente Principal
- Navbar con navegación
- Rutas de la aplicación
- Función de logout

### Páginas

| Archivo | Descripción | Endpoint |
|---------|-------------|----------|
| `Login.jsx` | Inicio de sesión | `POST /api/auth/login/` |
| `Clases.jsx` | Ver y reservar clases | `GET /api/clases/disponibles/` |
| `Perfil.jsx` | Información del usuario | `GET /api/usuarios/me/` |
| `Reservas.jsx` | Mis reservas | `GET /api/reservas/` |

---

## 🔐 Autenticación

### Flujo de Login

1. Usuario ingresa credenciales en `/login`
2. POST a `/api/auth/login/`
3. Backend responde con tokens JWT
4. Tokens guardados en `localStorage`
5. Redirección a `/clases`

### Tokens en localStorage

```javascript
// Guardar tokens
localStorage.setItem('access_token', token)
localStorage.setItem('refresh_token', refreshToken)

// Eliminar al hacer logout
localStorage.removeItem('access_token')
localStorage.removeItem('refresh_token')
```

---

## 🌐 Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | Clases | Página principal |
| `/login` | Login | Inicio de sesión |
| `/clases` | Clases | Lista de clases |
| `/perfil` | Perfil | Mi perfil |
| `/reservas` | Reservas | Mis reservas |

---

## 🎨 Estilos

Archivo principal: `src/index.css`

- Navbar morada (`#4f46e5`)
- Cards con sombras
- Grid responsive
- Formularios estilizados

---

## 🐛 Solución de Problemas

### Frontend no conecta al backend
✅ Verifica que Django esté corriendo en `http://127.0.0.1:8000/`
✅ Revisa que CORS esté habilitado en `settings.py`

### Error "No se pudieron obtener las clases"
✅ Debes hacer login primero
✅ Verifica que el token esté en localStorage (DevTools > Application)

### Error 401 Unauthorized
✅ Token expirado - cierra sesión y vuelve a hacer login
✅ Tokens expiran en 5 horas

---

## 📝 Scripts

```powershell
npm run dev      # Servidor desarrollo
npm run build    # Build producción
npm run preview  # Preview del build
```

---

## 🚀 Próximas Mejoras

- [ ] Refresh automático de tokens
- [ ] Protección de rutas privadas
- [ ] Responsive design mejorado
- [ ] Modo oscuro
- [ ] Filtros de clases
- [ ] Calendario visual

---

**Última actualización:** 24 de octubre de 2025
