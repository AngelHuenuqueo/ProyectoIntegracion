import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../services/api'
import { useNotifications } from '../hooks/useNotifications'
import WelcomeModal from '../components/WelcomeModal'
import { VALIDATION, TIMEOUTS } from '../utils/constants'
import './Login.css'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [welcomeData, setWelcomeData] = useState({ userName: '', userRole: '' })
  const navigate = useNavigate()
  const { addNotification } = useNotifications()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError: setFormError
  } = useForm({ mode: 'onChange' })

  async function onSubmit(data) {
    setLoading(true)

    try {
      const res = await api.post('auth/login/', {
        username: data.username,
        password: data.password
      }, {
        skipGlobalErrorHandler: true
      })

      localStorage.setItem('access_token', res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)

      const userRes = await api.get('usuarios/me/')
      localStorage.setItem('user', JSON.stringify(userRes.data))

      setWelcomeData({
        userName: data.username,
        userRole: userRes.data.rol
      })
      setShowWelcome(true)

      setTimeout(() => {
        const rol = userRes.data.rol?.toLowerCase()
        if (rol === 'administrador') {
          navigate('/admin')
        } else if (rol === 'instructor') {
          navigate('/instructor')
        } else {
          navigate('/dashboard')
        }
      }, TIMEOUTS.WELCOME_MODAL)

    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error de conexión. Verifica tus credenciales.'

      setFormError('root', {
        type: 'manual',
        message: errorMsg
      })

      addNotification({
        type: 'cancel',
        title: '🔒 Error de acceso',
        message: 'Credenciales incorrectas. Verifica tu usuario y contraseña.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Fondo con imagen de gimnasio */}
      <div className="fixed inset-0 bg-gym-image animate-fade-in"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-black/90 via-black/80 to-[#D90429]/20 animate-fade-in"></div>

      {/* Contenedor Principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full p-4">
        
        {/* Logo y Título Principal */}
        <div className="text-center mb-8 animate-slide-up opacity-0" style={{animationDelay: '0.1s'}}>
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-[#D90429]/10 border border-[#D90429]/30 shadow-[0_0_15px_rgba(217,4,41,0.5)]">
            <svg className="w-10 h-10 text-[#D90429]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight uppercase">
            Energía<span className="text-[#D90429]">Total</span>
          </h1>
          <p className="text-gray-400 tracking-[0.2em] text-sm mt-2 font-semibold">FITNESS CENTER</p>
        </div>

        {/* Tarjeta de Login */}
        <div className="w-full max-w-md relative glow-effect animate-slide-up opacity-0" style={{animationDelay: '0.2s'}}>
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            
            {/* Badge de Sistema */}
            <div className="flex justify-center -mt-12 mb-6">
              <span className="bg-[#D90429] text-white text-xs font-bold px-4 py-1.5 rounded shadow-lg tracking-wider uppercase transform hover:scale-105 transition-transform duration-300">
                Acceso al Sistema
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Campo Usuario */}
              <div className="space-y-2 group">
                <label htmlFor="username" className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 group-hover:text-[#D90429] transition-colors">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500 group-focus-within:text-[#D90429] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="username"
                    {...register('username', {
                      required: 'El usuario es obligatorio',
                      minLength: {
                        value: VALIDATION.MIN_USERNAME_LENGTH,
                        message: `El usuario debe tener al menos ${VALIDATION.MIN_USERNAME_LENGTH} caracteres`
                      }
                    })}
                    disabled={loading}
                    className={`block w-full pl-10 pr-3 py-3 bg-white/5 border ${
                      errors.username ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D90429] focus:border-transparent transition-all duration-300`}
                    placeholder="Ingresa tu usuario"
                  />
                </div>
                {errors.username && (
                  <span className="text-red-400 text-xs mt-1 block">⚠️ {errors.username.message}</span>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2 group">
                <label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 group-hover:text-[#D90429] transition-colors">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500 group-focus-within:text-[#D90429] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    {...register('password', {
                      required: 'La contraseña es obligatoria',
                      minLength: {
                        value: VALIDATION.MIN_PASSWORD_LENGTH,
                        message: `La contraseña debe tener al menos ${VALIDATION.MIN_PASSWORD_LENGTH} caracteres`
                      }
                    })}
                    disabled={loading}
                    className={`block w-full pl-10 pr-3 py-3 bg-white/5 border ${
                      errors.password ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D90429] focus:border-transparent transition-all duration-300`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <span className="text-red-400 text-xs mt-1 block">⚠️ {errors.password.message}</span>
                )}
              </div>

              {/* Error general */}
              {errors.root && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                  <span className="font-bold">❌ {errors.root.message}</span>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={loading || !isValid}
                  className="w-full flex items-center justify-center bg-[#D90429] hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-lg shadow-lg hover:shadow-red-900/50 transform hover:-translate-y-0.5 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span>INICIAR SESIÓN</span>
                      <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
                
                <Link
                  to="/"
                  className="w-full flex items-center justify-center bg-transparent border border-gray-600 hover:border-[#D90429] text-gray-300 hover:text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:bg-white/5"
                >
                  <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  VOLVER AL INICIO
                </Link>
              </div>
            </form>
          </div>
          
          {/* Footer pequeño */}
          <p className="text-center text-gray-500 text-xs mt-6">
            &copy; 2025 Energía Total Gym. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Modal de Bienvenida */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        userName={welcomeData.userName}
        userRole={welcomeData.userRole}
      />
    </div>
  )
}
