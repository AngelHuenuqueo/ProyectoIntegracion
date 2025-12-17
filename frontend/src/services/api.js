import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Variable global para mostrar Toasts (será inicializada desde App.jsx)
let showToastGlobal = null

// Flag para evitar múltiples refrescos simultáneos
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

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

// Interceptor de RESPONSE: Manejo global de errores con auto-refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Verificar si el error tiene una configuración para NO mostrar Toast
    if (error.config?.skipGlobalErrorHandler) {
      return Promise.reject(error)
    }

    // Si es 401 y no es un retry, intentar refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Si es el endpoint de login o refresh, no intentar refrescar
      if (originalRequest.url?.includes('auth/login') || originalRequest.url?.includes('auth/refresh')) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Si ya estamos refrescando, encolar esta petición
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')

      if (refreshToken) {
        try {
          // Intentar refrescar el token
          const response = await axios.post(`${API_BASE_URL}auth/refresh/`, {
            refresh: refreshToken
          })

          const newAccessToken = response.data.access

          // Guardar el nuevo token
          localStorage.setItem('access_token', newAccessToken)

          // Actualizar header de la petición original
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

          // Procesar cola de peticiones pendientes
          processQueue(null, newAccessToken)

          // Reintentar la petición original
          return api(originalRequest)
        } catch (refreshError) {
          // El refresh también falló, limpiar todo y redirigir
          processQueue(refreshError, null)

          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')

          if (showToastGlobal) {
            showToastGlobal('Tu sesión ha expirado. Inicia sesión nuevamente.', 'warning')
          }

          setTimeout(() => {
            window.location.href = '/login'
          }, 1500)

          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      } else {
        // No hay refresh token, redirigir al login
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')

        if (showToastGlobal) {
          showToastGlobal('Tu sesión ha expirado. Inicia sesión nuevamente.', 'warning')
        }

        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)

        return Promise.reject(error)
      }
    }

    // Manejo de otros errores
    const status = error.response?.status
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message

    let userMessage = ''

    switch (status) {
      case 400:
        userMessage = errorMessage || 'Datos inválidos. Verifica tu información.'
        break
      case 403:
        userMessage = 'No tienes permisos para realizar esta acción.'
        break
      case 404:
        userMessage = 'El recurso solicitado no fue encontrado.'
        break
      case 409:
        userMessage = errorMessage || 'Ya existe un registro similar.'
        break
      case 500:
      case 502:
      case 503:
        userMessage = 'Error del servidor. Por favor, intenta de nuevo más tarde.'
        break
      default:
        if (!error.response) {
          userMessage = 'Sin conexión a internet. Verifica tu conexión.'
        } else {
          userMessage = errorMessage || 'Ocurrió un error inesperado.'
        }
    }

    if (showToastGlobal && userMessage) {
      const toastType = status >= 500 ? 'error' : status >= 400 ? 'warning' : 'error'
      showToastGlobal(userMessage, toastType)
    }

    return Promise.reject(error)
  }
)

export default api

