import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useNotifications } from '../components/NotificationCenter'

export default function Perfil() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [changePasswordMode, setChangePasswordMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const { addNotification } = useNotifications()

  // Estados para edición
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telefono: ''
  })

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    password_actual: '',
    password_nueva: '',
    password_nueva2: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setLoading(true)
    Promise.all([
      api.get('usuarios/me/'),
      api.get('usuarios/mis_reservas/')
    ])
    .then(([userRes, reservasRes]) => {
      setUser(userRes.data)
      setEditData({
        first_name: userRes.data.first_name || '',
        last_name: userRes.data.last_name || '',
        email: userRes.data.email || '',
        telefono: userRes.data.telefono || ''
      })
      
      // Calcular estadísticas
      const reservas = reservasRes.data
      const statsData = {
        total: reservas.length,
        activas: reservas.filter(r => r.estado === 'CONFIRMADA').length,
        completadas: reservas.filter(r => r.estado === 'COMPLETADA').length,
        canceladas: reservas.filter(r => r.estado === 'CANCELADA').length,
        noshow: reservas.filter(r => r.estado === 'NOSHOW').length
      }
      setStats(statsData)

      // Notificación informativa sobre no-shows
      if (statsData.noshow > 0 && !sessionStorage.getItem('noshow_warning_shown')) {
        addNotification({
          type: 'warning',
          title: '⚠️ Atención',
          message: `Tienes ${statsData.noshow} inasistencia${statsData.noshow > 1 ? 's' : ''}. Recuerda cancelar tus reservas si no puedes asistir.`
        })
        sessionStorage.setItem('noshow_warning_shown', 'true')
      }

      // Notificación de logro si tiene muchas clases completadas
      if (statsData.completadas >= 10 && !sessionStorage.getItem('achievement_10_shown')) {
        addNotification({
          type: 'success',
          title: '🏆 ¡Logro desbloqueado!',
          message: `¡Felicitaciones! Has completado ${statsData.completadas} clases. ¡Sigue así!`
        })
        sessionStorage.setItem('achievement_10_shown', 'true')
      }
    })
    .catch((error) => {
      console.error('Error cargando datos del perfil:', error)
      addNotification({
        type: 'error',
        title: '❌ Error',
        message: 'No se pudo cargar la información del perfil.'
      })
      setUser(null)
      setStats(null)
    })
    .finally(() => setLoading(false))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const response = await api.patch('usuarios/me/', editData)
      setUser(response.data)
      setEditMode(false)
      addNotification({
        type: 'success',
        title: '✅ Perfil actualizado',
        message: 'Tu información se ha actualizado correctamente.'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: '❌ Error',
        message: error.response?.data?.error || 'No se pudo actualizar el perfil.'
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.password_nueva !== passwordData.password_nueva2) {
      addNotification({
        type: 'error',
        title: '❌ Error',
        message: 'Las contraseñas nuevas no coinciden.'
      })
      return
    }

    setSaving(true)
    
    try {
      await api.post('usuarios/cambiar_password/', passwordData)
      setChangePasswordMode(false)
      setPasswordData({
        password_actual: '',
        password_nueva: '',
        password_nueva2: ''
      })
      addNotification({
        type: 'success',
        title: '✅ Contraseña cambiada',
        message: 'Tu contraseña se ha actualizado correctamente.'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: '❌ Error',
        message: error.response?.data?.error || 'No se pudo cambiar la contraseña.'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-medium">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-gray-900 border-2 border-gray-800 p-8">
        <p className="text-gray-400">No hay información disponible.</p>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen bg-black text-white pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-black border-b-4 border-red-600 py-10 px-6 mb-8 shadow-2xl shadow-red-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <svg className="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <h2 className="text-5xl font-black tracking-wider text-white drop-shadow-lg">
              MI <span className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">PERFIL</span>
            </h2>
          </div>
          <div className="inline-block bg-white text-black px-6 py-2 font-black text-sm tracking-widest transform -skew-x-12 shadow-lg">
            <span className="inline-block transform skew-x-12">GESTIONA TU CUENTA</span>
          </div>
        </div>
      </div>
      
      <div className="px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA - Perfil y Acciones */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Card de Perfil */}
            <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-gray-800 p-6">
              <div className="text-center mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center mx-auto mb-4 text-5xl font-black text-white border-4 border-red-600 shadow-lg shadow-red-600/50">
                  {user.first_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || '👤'}
                </div>
                <h3 className="text-2xl font-black text-white mb-1 tracking-wide uppercase">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-gray-400 font-medium mb-2">@{user.username}</p>
                <span className={`inline-block px-4 py-1 font-black text-xs tracking-wider ${
                  user.rol === 'ADMINISTRADOR' ? 'bg-red-600' : 
                  user.rol === 'INSTRUCTOR' ? 'bg-red-700' : 
                  'bg-red-600'
                } text-white uppercase`}>
                  {user.rol}
                </span>
              </div>

              <div className="border-t-2 border-gray-800 pt-4 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">📧</span>
                  <span className="text-gray-400 text-xs">{user.email || 'No registrado'}</span>
                </div>
                {user.telefono && (
                  <div className="flex items-center gap-2">
                    <span className="text-red-600">📱</span>
                    <span className="text-gray-400 text-xs">{user.telefono}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-red-600">📋</span>
                  <span className={`font-black text-xs ${user.estado_membresia === 'ACTIVA' ? 'text-green-500' : 'text-red-500'}`}>
                    {user.estado_membresia === 'ACTIVA' ? '✓ ' : '✗ '}
                    {user.estado_membresia}
                  </span>
                </div>
                {user.bloqueado_hasta && (
                  <div className="bg-red-900/30 border-l-4 border-red-600 p-2 mt-3">
                    <div className="flex items-center gap-2 text-red-500 text-xs">
                      <span className="font-black">⚠️ BLOQUEADO HASTA:</span>
                      <span>{user.bloqueado_hasta}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  setEditMode(!editMode)
                  setChangePasswordMode(false)
                }}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-6 font-black text-sm tracking-widest uppercase transition-all duration-300 border-2 border-red-600 shadow-lg shadow-red-600/50 hover:shadow-red-600/80 hover:scale-[1.02] transform"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-lg">{editMode ? '❌' : '✏️'}</span>
                  <span>{editMode ? 'Cancelar Edición' : 'Editar Perfil'}</span>
                </span>
              </button>
              
              <button
                onClick={() => {
                  setChangePasswordMode(!changePasswordMode)
                  setEditMode(false)
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 px-6 font-black text-sm tracking-widest uppercase transition-all duration-300 border-2 border-purple-600 shadow-lg shadow-purple-600/50 hover:shadow-purple-600/80 hover:scale-[1.02] transform"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-lg">{changePasswordMode ? '❌' : '🔒'}</span>
                  <span>{changePasswordMode ? 'Cancelar' : 'Cambiar Contraseña'}</span>
                </span>
              </button>

              <Link to="/estadisticas" className="block">
                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 font-black text-sm tracking-widest uppercase transition-all duration-300 border-2 border-blue-600 shadow-lg shadow-blue-600/50 hover:shadow-blue-600/80 hover:scale-[1.02] transform">
                  <span className="flex items-center justify-center gap-3">
                    <span className="text-lg">📊</span>
                    <span>Estadísticas Detalladas</span>
                  </span>
                </button>
              </Link>
            </div>
          </div>

          {/* COLUMNA DERECHA - Formularios y Estadísticas */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Formulario de Edición */}
            {editMode && (
              <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-red-600 p-6">
                <h4 className="text-2xl font-black text-red-600 mb-6 tracking-wide uppercase flex items-center gap-2">
                  ✏️ Editar Información Personal
                </h4>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-400 font-bold text-xs mb-2 uppercase tracking-wider">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={editData.first_name}
                      onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                      className="w-full bg-black border-2 border-gray-700 text-white px-4 py-3 focus:border-red-600 focus:outline-none transition-colors font-medium"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 font-bold text-xs mb-2 uppercase tracking-wider">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={editData.last_name}
                      onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                      className="w-full bg-black border-2 border-gray-700 text-white px-4 py-3 focus:border-red-600 focus:outline-none transition-colors font-medium"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 font-bold text-xs mb-2 uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="w-full bg-black border-2 border-gray-700 text-white px-4 py-3 focus:border-red-600 focus:outline-none transition-colors font-medium"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 font-bold text-xs mb-2 uppercase tracking-wider">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={editData.telefono}
                      onChange={(e) => setEditData({...editData, telefono: e.target.value})}
                      className="w-full bg-black border-2 border-gray-700 text-white px-4 py-3 focus:border-red-600 focus:outline-none transition-colors font-medium"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-red-600 text-white py-4 font-black text-sm tracking-widest uppercase hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-600"
                  >
                    {saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                  </button>
                </form>
              </div>
            )}

            {/* Formulario de Cambio de Contraseña */}
            {changePasswordMode && (
              <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-purple-600 p-6">
                <h4 className="text-2xl font-black text-purple-600 mb-6 tracking-wide uppercase flex items-center gap-2">
                  🔒 Cambiar Contraseña
                </h4>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-400 font-bold text-xs mb-2 uppercase tracking-wider">
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      value={passwordData.password_actual}
                      onChange={(e) => setPasswordData({...passwordData, password_actual: e.target.value})}
                      className="w-full bg-black border-2 border-gray-700 text-white px-4 py-3 focus:border-purple-600 focus:outline-none transition-colors font-medium"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 font-bold text-xs mb-2 uppercase tracking-wider">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordData.password_nueva}
                      onChange={(e) => setPasswordData({...passwordData, password_nueva: e.target.value})}
                      className="w-full bg-black border-2 border-gray-700 text-white px-4 py-3 focus:border-purple-600 focus:outline-none transition-colors font-medium"
                      required
                      minLength={8}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 font-bold text-xs mb-2 uppercase tracking-wider">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordData.password_nueva2}
                      onChange={(e) => setPasswordData({...passwordData, password_nueva2: e.target.value})}
                      className="w-full bg-black border-2 border-gray-700 text-white px-4 py-3 focus:border-purple-600 focus:outline-none transition-colors font-medium"
                      required
                      minLength={8}
                    />
                  </div>
                  
                  <div className="bg-yellow-900/20 border-l-4 border-yellow-600 p-3">
                    <p className="text-yellow-500 text-xs">
                      ⚠️ La contraseña debe tener al menos 8 caracteres.
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-red-600 text-white py-4 font-black text-sm tracking-widest uppercase hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-600"
                  >
                    {saving ? '⏳ Cambiando...' : '🔓 Cambiar Contraseña'}
                  </button>
                </form>
              </div>
            )}

            {/* Estadísticas */}
            {stats && !editMode && !changePasswordMode && (
              <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-gray-800 p-6">
                <h4 className="text-2xl font-black text-red-600 mb-6 tracking-wide uppercase flex items-center gap-2">
                  📊 Estadísticas de Reservas
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-6 bg-gradient-to-br from-purple-900/30 to-purple-600/20 border-2 border-purple-600 shadow-lg shadow-purple-600/20">
                    <div className="text-5xl font-black text-purple-500 mb-2">{stats.total}</div>
                    <div className="text-gray-300 font-bold text-xs uppercase tracking-wider">Total Reservas</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-900/30 to-green-600/20 border-2 border-green-600 shadow-lg shadow-green-600/20">
                    <div className="text-5xl font-black text-green-500 mb-2">{stats.activas}</div>
                    <div className="text-gray-300 font-bold text-xs uppercase tracking-wider">Activas</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-900/30 to-blue-600/20 border-2 border-blue-600 shadow-lg shadow-blue-600/20">
                    <div className="text-5xl font-black text-blue-500 mb-2">{stats.completadas}</div>
                    <div className="text-gray-300 font-bold text-xs uppercase tracking-wider">Completadas</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-orange-900/30 to-orange-600/20 border-2 border-orange-600 shadow-lg shadow-orange-600/20">
                    <div className="text-5xl font-black text-orange-500 mb-2">{stats.canceladas}</div>
                    <div className="text-gray-300 font-bold text-xs uppercase tracking-wider">Canceladas</div>
                  </div>
                </div>
                
                {stats.noshow > 0 && (
                  <div className="bg-yellow-600/20 border-l-4 border-yellow-600 p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <strong className="text-yellow-500 font-black text-sm block mb-1">
                          NO-SHOWS: {stats.noshow}
                        </strong>
                        <span className="text-gray-300 text-xs">
                          Se bloquea automáticamente al llegar a 3 inasistencias en el mes
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {stats.completadas >= 10 && (
                  <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-2 border-yellow-600 p-4 text-center">
                    <div className="text-3xl mb-2">🏆</div>
                    <div className="text-yellow-500 font-black text-sm uppercase tracking-wider">
                      ¡Guerrero del Fitness!
                    </div>
                    <div className="text-gray-300 text-xs mt-1">
                      Has completado {stats.completadas} clases
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Información Adicional */}
            {!editMode && !changePasswordMode && (
              <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-gray-800 p-6">
                <h4 className="text-2xl font-black text-red-600 mb-6 tracking-wide uppercase flex items-center gap-2">
                  ℹ️ Información de la Cuenta
                </h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">Nombre de Usuario:</span>
                    <span className="text-white font-black">{user.username}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">Fecha de Registro:</span>
                    <span className="text-white font-black">
                      {new Date(user.fecha_creacion).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {user.fecha_inicio_membresia && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Inicio Membresía:</span>
                      <span className="text-white font-black">
                        {new Date(user.fecha_inicio_membresia).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                  {user.fecha_fin_membresia && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Fin Membresía:</span>
                      <span className="text-white font-black">
                        {new Date(user.fecha_fin_membresia).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                  <div className="pb-3 border-b border-gray-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Total Inasistencias:</span>
                      <span className={`font-black text-xl ${user.total_noshow > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {user.total_noshow}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs italic">
                      📌 Inasistencias sin cancelar previo aviso (histórico total)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
