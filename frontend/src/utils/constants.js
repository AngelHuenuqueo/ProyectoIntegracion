// Constantes de configuración de la aplicación

// URLs de API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/'

// URLs de imágenes
export const IMAGES = {
  GYM_BACKGROUND: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
  GYM_HERO: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop',
  GYM_CARD: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
}

// URLs de servicios externos
export const EXTERNAL_SERVICES = {
  AVATAR_API: 'https://ui-avatars.com/api/',
  WHATSAPP_SHARE: 'https://wa.me/',
  FACEBOOK_SHARE: 'https://www.facebook.com/sharer/sharer.php',
  TWITTER_SHARE: 'https://twitter.com/intent/tweet',
}

// Configuración de avatares
export const getAvatarUrl = (name, options = {}) => {
  const {
    background = 'e94560',
    color = 'fff',
    size = 40,
  } = options

  return `${EXTERNAL_SERVICES.AVATAR_API}?name=${encodeURIComponent(name || 'U')}&background=${background}&color=${color}&size=${size}`
}

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'administrador',
  INSTRUCTOR: 'instructor',
  SOCIO: 'socio',
}

// Estados de clases
export const CLASS_STATES = {
  ACTIVA: 'activa',
  CANCELADA: 'cancelada',
  COMPLETA: 'completa',
}

// Estados de equipamiento
export const EQUIPMENT_STATES = {
  DISPONIBLE: 'disponible',
  EN_USO: 'en_uso',
  MANTENIMIENTO: 'mantenimiento',
  FUERA_SERVICIO: 'fuera_servicio',
}

// Categorías de equipamiento
export const EQUIPMENT_CATEGORIES = {
  CARDIO: 'cardio',
  FUERZA: 'fuerza',
  PESO_LIBRE: 'peso_libre',
  FUNCIONAL: 'funcional',
  OTRO: 'otro',
}

// Configuración de validación
export const VALIDATION = {
  MIN_USERNAME_LENGTH: 3,
  MIN_PASSWORD_LENGTH: 4,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
}

// Tiempos (en milisegundos)
export const TIMEOUTS = {
  TOAST_DURATION: 3000,
  WELCOME_MODAL: 3000,
  AUTO_REFRESH: 30000,
}
