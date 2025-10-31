import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
})

// Variable global para mostrar Toasts (será inicializada desde App.jsx)
let showToastGlobal = null

export const setShowToast = (toastFunction) => {
  showToastGlobal = toastFunction
}

// Interceptor de REQUEST: Adjuntar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de RESPONSE: Manejo global de errores
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, simplemente la retornamos
    return response
  },
  (error) => {
    // Verificar si el error tiene una configuración para NO mostrar Toast
    // Esto permite que componentes específicos manejen sus propios errores
    if (error.config?.skipGlobalErrorHandler) {
      return Promise.reject(error)
    }

    // Extraer información del error
    const status = error.response?.status
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message
    
    // Variable para el mensaje que mostraremos al usuario
    let userMessage = ''
    let shouldRedirect = false

    // Manejo específico por código de error
    switch (status) {
      case 400:
        // Bad Request - generalmente errores de validación
        userMessage = errorMessage || 'Datos inválidos. Verifica tu información.'
        break

      case 401:
        // Unauthorized - token expirado o inválido
        userMessage = 'Tu sesión ha expirado. Inicia sesión nuevamente.'
        shouldRedirect = true
        
        // Limpiar tokens del localStorage
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_role')
        break

      case 403:
        // Forbidden - sin permisos
        userMessage = 'No tienes permisos para realizar esta acción.'
        break

      case 404:
        // Not Found
        userMessage = 'El recurso solicitado no fue encontrado.'
        break

      case 409:
        // Conflict - ejemplo: reserva duplicada
        userMessage = errorMessage || 'Ya existe un registro similar.'
        break

      case 500:
      case 502:
      case 503:
        // Server errors
        userMessage = 'Error del servidor. Por favor, intenta de nuevo más tarde.'
        break

      default:
        // Network error o cualquier otro error
        if (!error.response) {
          userMessage = 'Sin conexión a internet. Verifica tu conexión.'
        } else {
          userMessage = errorMessage || 'Ocurrió un error inesperado.'
        }
    }

    // Mostrar Toast si tenemos la función global configurada
    if (showToastGlobal && userMessage) {
      const toastType = status >= 500 ? 'error' : status >= 400 ? 'warning' : 'error'
      showToastGlobal(userMessage, toastType)
    }

    // Redirigir al login si es necesario (con un pequeño delay para que se vea el Toast)
    if (shouldRedirect) {
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
    }

    // Rechazar la promesa para que el componente pueda manejar el error si lo necesita
    return Promise.reject(error)
  }
)

export default api
