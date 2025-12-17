# 🔧 Configuración del Proyecto

## Variables de Entorno

### Frontend

Crea un archivo `.env` en la carpeta `frontend/` con el siguiente contenido:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/
```

**Nota:** Para producción, cambia la URL por la del servidor real.

### Backend

El archivo `.env` en la raíz del proyecto ya existe y contiene:

```env
SECRET_KEY=tu_clave_secreta
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

**Importante:** 
- En producción, cambia `DEBUG=False`
- Genera una nueva `SECRET_KEY` segura
- Actualiza `ALLOWED_HOSTS` con tu dominio

## Configuración Centralizada

Todas las constantes de la aplicación están en `frontend/src/utils/constants.js`:

### Constantes Disponibles

- **API_BASE_URL**: URL base de la API
- **IMAGES**: URLs de imágenes (fondo, hero, cards)
- **EXTERNAL_SERVICES**: URLs de servicios externos (WhatsApp, Facebook, Twitter, Avatares)
- **USER_ROLES**: Roles de usuario
- **CLASS_STATES**: Estados de clases
- **EQUIPMENT_STATES**: Estados de equipamiento
- **EQUIPMENT_CATEGORIES**: Categorías de equipamiento
- **VALIDATION**: Configuración de validación (tamaños, tipos de archivo, etc.)
- **TIMEOUTS**: Tiempos de espera (toasts, modales, etc.)

### Ejemplo de Uso

```javascript
import { VALIDATION, getAvatarUrl } from '../utils/constants'

// Validar tamaño de imagen
if (file.size > VALIDATION.MAX_IMAGE_SIZE) {
  console.error('Imagen muy grande')
}

// Generar URL de avatar
const avatarUrl = getAvatarUrl('Juan Pérez', {
  background: 'e94560',
  size: 120
})
```

## Buenas Prácticas

✅ **SÍ hacer:**
- Usar constantes de `constants.js` en lugar de valores hardcodeados
- Mantener las URLs de API en variables de entorno
- Usar `getAvatarUrl()` para generar URLs de avatares
- Usar `console.error()` solo para errores críticos que necesiten debugging

❌ **NO hacer:**
- Hardcodear URLs, números mágicos o strings repetidos
- Usar `console.log()` en código de producción
- Duplicar lógica de validación
- Commitear archivos `.env` al repositorio

## Actualizar Imágenes

Para cambiar las imágenes de fondo del gimnasio, actualiza las URLs en `constants.js`:

```javascript
export const IMAGES = {
  GYM_BACKGROUND: 'tu-nueva-url-aqui',
  GYM_HERO: 'tu-nueva-url-aqui',
  GYM_CARD: 'tu-nueva-url-aqui',
}
```

## Estructura de Archivos

```
ProyectoInt/
├── frontend/
│   ├── .env                          # Variables de entorno (NO commitear)
│   ├── .env.example                  # Ejemplo de configuración
│   └── src/
│       ├── utils/
│       │   └── constants.js          # ⭐ Todas las constantes aquí
│       └── services/
│           └── api.js                # Cliente HTTP configurado
└── .env                              # Variables del backend (NO commitear)
```

## Validación de Imágenes

La validación está centralizada en `VALIDATION`:

```javascript
MAX_IMAGE_SIZE: 5 * 1024 * 1024  // 5MB
ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
```

Para cambiar estos valores, edita `frontend/src/utils/constants.js`.
