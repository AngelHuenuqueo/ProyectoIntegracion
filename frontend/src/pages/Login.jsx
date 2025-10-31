import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../services/api'
import { useNotifications } from '../components/NotificationCenter'
import WelcomeModal from '../components/WelcomeModal'

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
        skipGlobalErrorHandler: true // Manejamos el error nosotros
      })
      
      localStorage.setItem('access_token', res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)
      
      // Obtener información del usuario
      const userRes = await api.get('usuarios/me/')
      localStorage.setItem('user', JSON.stringify(userRes.data))
      
      // Mostrar modal de bienvenida
      setWelcomeData({
        userName: data.username,
        userRole: userRes.data.rol
      })
      setShowWelcome(true)
      
      // Redirigir después de mostrar el modal
      setTimeout(() => {
        if (userRes.data.rol === 'ADMINISTRADOR') {
          navigate('/admin')
        } else {
          navigate('/clases')
        }
      }, 3000) // 3 segundos para que vean el modal
      
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error de conexión. Verifica tus credenciales.'
      
      // Mostrar error en el formulario
      setFormError('root', {
        type: 'manual',
        message: errorMsg
      })
      
      // Notificación de error
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
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-lg relative z-10">
        {/* Logo y título */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 blur-2xl opacity-60"></div>
              <svg className="w-20 h-20 text-red-600 relative" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-wider text-white mb-3">
            ENERGÍA<span className="text-red-600">TOTAL</span>
          </h1>
          <p className="text-sm text-gray-400 tracking-widest mb-6">FITNESS CENTER</p>
          <div className="inline-block bg-red-600 text-white px-6 py-2 font-black text-xs tracking-widest transform -skew-x-12">
            <span className="inline-block transform skew-x-12">ACCESO AL SISTEMA</span>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-gray-800 hover:border-red-600/50 transition-all p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-600/10 rounded-full blur-2xl"></div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 space-y-6">
            <div>
              <label className="block text-red-600 font-black text-xs tracking-widest uppercase mb-3">
                USUARIO
              </label>
              <input 
                type="text"
                {...register('username', {
                  required: 'El usuario es obligatorio',
                  minLength: {
                    value: 3,
                    message: 'El usuario debe tener al menos 3 caracteres'
                  }
                })}
                placeholder="Ingresa tu usuario"
                disabled={loading}
                className={`w-full bg-black border-2 ${errors.username ? 'border-red-500' : 'border-gray-800'} text-white px-5 py-4 focus:outline-none focus:border-red-600 transition-colors font-medium placeholder:text-gray-600 text-base`}
              />
            {errors.username && (
              <span className="text-red-500 text-sm font-bold mt-2 block">⚠️ {errors.username.message}</span>
            )}
          </div>
          
          <div>
            <label className="block text-red-600 font-black text-xs tracking-widest uppercase mb-3">
              CONTRASEÑA
            </label>
            <input 
              type="password"
              {...register('password', {
                required: 'La contraseña es obligatoria',
                minLength: {
                  value: 4,
                  message: 'La contraseña debe tener al menos 4 caracteres'
                }
              })}
              placeholder="Ingresa tu contraseña"
              disabled={loading}
              className={`w-full bg-black border-2 ${errors.password ? 'border-red-500' : 'border-gray-800'} text-white px-5 py-4 focus:outline-none focus:border-red-600 transition-colors font-medium placeholder:text-gray-600 text-base`}
            />
            {errors.password && (
              <span className="text-red-500 text-sm font-bold mt-2 block">⚠️ {errors.password.message}</span>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !isValid} 
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 font-black text-base tracking-widest uppercase hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-red-600/50 mt-2"
          >
            {loading ? 'INICIANDO...' : 'INICIAR SESIÓN'}
          </button>

          {/* Botón volver al inicio */}
          <Link 
            to="/" 
            className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 font-black text-sm tracking-wider uppercase hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/50 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Inicio
          </Link>
          
          {errors.root && (
            <div className="mt-4 bg-red-600/20 border-2 border-red-600 p-4 text-red-500 font-bold text-sm">
              ❌ {errors.root.message}
            </div>
          )}
        </form>

        {/* Usuarios de prueba */}
        <div className="mt-6 bg-gradient-to-r from-gray-900 to-black border-2 border-gray-800 p-5 relative overflow-hidden group hover:border-red-600/30 transition-all">
          <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/5 transition-all"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">👤</span>
              <strong className="text-red-600 font-black text-xs tracking-wider uppercase">USUARIOS DE PRUEBA:</strong>
            </div>
            <div className="space-y-2 text-gray-400 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="text-green-500">●</span>
                <span className="text-white font-bold">juan.perez</span> 
                <span className="text-gray-600">/</span> 
                <span className="text-gray-500">prueba123</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500">●</span>
                <span className="text-white font-bold">admin</span> 
                <span className="text-gray-600">/</span> 
                <span className="text-gray-500">admin</span>
              </div>
            </div>
          </div>
        </div>
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
