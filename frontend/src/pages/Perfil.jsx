import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useNotifications } from '../hooks/useNotifications'
import UserLayout from '../components/UserLayout'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      <UserLayout title="Mi Perfil">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative w-20 h-20 border-4 border-gray-800 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-400 font-medium animate-pulse">Cargando perfil...</p>
        </div>
      </UserLayout>
    )
  }

  if (!user) {
    return (
      <UserLayout title="Mi Perfil">
        <div className="relative overflow-hidden rounded-3xl mx-6">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl"></div>
          <div className="relative z-10 p-12 text-center">
            <div className="relative inline-block mb-4">
              <div className="relative bg-gradient-to-br from-gray-700 to-gray-800 p-5 rounded-full border border-white/10">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-400 font-medium">No hay información disponible.</p>
          </div>
        </div>
      </UserLayout>
    )
  }

  return (
    <UserLayout title="Mi Perfil">
      {/* Hero Header con glassmorphism */}
      <div className="relative overflow-hidden mb-10">
        {/* Background con gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 via-amber-900/30 to-yellow-900/40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent"></div>

        {/* Elementos decorativos flotantes */}
        <div className="absolute top-4 right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-4 left-10 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 py-12 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-5 mb-4">
              {/* Icono con efecto glow */}
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-orange-500 to-amber-700 p-4 rounded-2xl shadow-2xl shadow-orange-500/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">Mi</span>{' '}
                  <span className="bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 bg-clip-text text-transparent">Perfil</span>
                </h2>
                <p className="text-gray-400 mt-2 font-medium">Gestiona tu cuenta y preferencias</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* COLUMNA IZQUIERDA - Perfil y Acciones */}
          <div className="lg:col-span-1 space-y-6">

            {/* Card de Perfil con glassmorphism */}
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-3xl"></div>

              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto text-4xl font-black text-white border-4 border-orange-400/50 shadow-2xl shadow-orange-500/30">
                      {user.first_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || '👤'}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-4 mb-1">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-gray-500 font-medium text-sm mb-3">@{user.username}</p>
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${user.rol === 'ADMINISTRADOR' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                    user.rol === 'INSTRUCTOR' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                    }`}>
                    {user.rol === 'ADMINISTRADOR' && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {user.rol}
                  </span>
                </div>

                <div className="border-t border-gray-700/50 pt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-gray-400">{user.email || 'No registrado'}</span>
                  </div>
                  {user.telefono && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span className="text-gray-400">{user.telefono}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <svg className={`w-4 h-4 ${user.estado_membresia === 'ACTIVA' ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className={`font-bold ${user.estado_membresia === 'ACTIVA' ? 'text-green-400' : 'text-red-400'}`}>
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
                      onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
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
                      onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
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
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
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
                      onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
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
                      onChange={(e) => setPasswordData({ ...passwordData, password_actual: e.target.value })}
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
                      onChange={(e) => setPasswordData({ ...passwordData, password_nueva: e.target.value })}
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
                      onChange={(e) => setPasswordData({ ...passwordData, password_nueva2: e.target.value })}
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
    </UserLayout>
  )
}
