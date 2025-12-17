import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import ShareModal from '../components/ShareModal'
import UserLayout from '../components/UserLayout'

export default function Calendario() {
  const [clases, setClases] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
  const [claseToShare, setClaseToShare] = useState(null)
  const navigate = useNavigate()

  const fetchClases = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('clases/disponibles/')
      setClases(res.data)
      setMessage(null)
    } catch (err) {
      if (err.response?.status === 401) {
        setMessage({ type: 'error', text: 'Debes iniciar sesión' })
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setMessage({ type: 'error', text: 'No se pudieron obtener las clases' })
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    fetchClases()
  }, [fetchClases])

  async function reservar(id) {
    try {
      await api.post('reservas/', { clase: id })
      setMessage({ type: 'success', text: '¡Reserva creada con éxito! 🎉' })
      fetchClases()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data || 'Error al crear la reserva'
      setMessage({ type: 'error', text: errorMsg })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  // Agrupar clases por fecha
  const clasesPorFecha = clases.reduce((acc, clase) => {
    if (!acc[clase.fecha]) {
      acc[clase.fecha] = []
    }
    acc[clase.fecha].push(clase)
    return acc
  }, {})

  // Obtener fechas únicas y ordenarlas
  const fechasDisponibles = Object.keys(clasesPorFecha).sort()

  // Obtener día de la semana
  const getDiaSemana = (fecha) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const date = new Date(fecha + 'T00:00:00')
    return dias[date.getDay()]
  }

  // Formatear fecha bonita
  const formatearFecha = (fecha) => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const date = new Date(fecha + 'T00:00:00')
    return `${date.getDate()} ${meses[date.getMonth()]}`
  }

  return (
    <UserLayout title="Calendario de Clases">
      {/* Hero Header con glassmorphism */}
      <div className="relative overflow-hidden mb-10">
        {/* Background con gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-red-900/40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>

        {/* Elementos decorativos flotantes */}
        <div className="absolute top-4 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-4 left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 py-12 px-8">
          <div className="flex items-center gap-5 mb-4">
            {/* Icono con efecto glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-2xl shadow-2xl shadow-blue-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">Calendario</span>{' '}
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">de Clases</span>
              </h2>
              <p className="text-gray-400 mt-2 font-medium">Planifica tu semana de entrenamiento</p>
            </div>
          </div>

          {/* Badge animado */}
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 shadow-lg">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold text-gray-300">Selecciona un día para ver las clases</span>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8">
        {/* Mensajes de estado */}
        {message && (
          <div className={`mb-8 p-5 rounded-2xl backdrop-blur-xl border font-medium flex items-center gap-3 ${message.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-green-500/10 border-green-500/30 text-green-400'
            }`}>
            <div className={`p-2 rounded-full ${message.type === 'error' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
              {message.type === 'error' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            {typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}
          </div>
        )}

        {loading ? (
          /* Loading state premium */
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-400 font-medium animate-pulse">Cargando calendario...</p>
          </div>
        ) : (
          <div>
            {/* Vista de Calendario con glassmorphism */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
              {fechasDisponibles.map(fecha => {
                const clasesDelDia = clasesPorFecha[fecha]
                const estaSeleccionada = fechaSeleccionada === fecha

                return (
                  <div
                    key={fecha}
                    onClick={() => setFechaSeleccionada(estaSeleccionada ? null : fecha)}
                    className={`group relative p-5 cursor-pointer text-center transition-all duration-300 rounded-2xl ${estaSeleccionada
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 scale-105 shadow-2xl shadow-blue-500/30 border-2 border-blue-400/50'
                        : 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1'
                      }`}
                  >
                    <div className={`text-xs uppercase tracking-wider mb-2 font-semibold ${estaSeleccionada ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                      {getDiaSemana(fecha)}
                    </div>
                    <div className={`text-2xl font-black mb-3 ${estaSeleccionada ? 'text-white' : 'text-white'
                      }`}>
                      {formatearFecha(fecha)}
                    </div>
                    <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${estaSeleccionada
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                      }`}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {clasesDelDia.length} clase{clasesDelDia.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Clases del día seleccionado */}
            {fechaSeleccionada && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/20">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Clases del <span className="text-purple-400">{getDiaSemana(fechaSeleccionada)}</span>, {formatearFecha(fechaSeleccionada)}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {clasesPorFecha[fechaSeleccionada]
                    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                    .map((c) => (
                      <div
                        key={c.id}
                        className="group relative bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 transition-all duration-500 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-orange-500/0 group-hover:from-red-500/5 group-hover:to-orange-500/5 rounded-3xl transition-all duration-500"></div>

                        <div className="relative z-10">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-red-500/20 mb-2">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                                {c.tipo}
                              </span>
                              <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">{c.nombre}</h3>
                            </div>
                            <button
                              onClick={() => setClaseToShare(c)}
                              className="p-2.5 bg-white/5 hover:bg-red-500/20 border border-gray-700/50 hover:border-red-500/30 rounded-xl text-gray-400 hover:text-red-400 transition-all"
                              title="Compartir clase"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                            </button>
                          </div>

                          {/* Info */}
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-white/80">
                              <div className="p-2 bg-white/10 rounded-lg">
                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <span className="font-medium">{c.hora_inicio.substring(0, 5)} - {c.hora_fin.substring(0, 5)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80">
                              <div className="p-2 bg-white/10 rounded-lg">
                                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <span className="font-medium">{c.instructor_nombre}</span>
                            </div>
                          </div>

                          {/* Badge de cupos */}
                          <div className={`mb-5 p-3 rounded-xl flex items-center justify-between ${c.cupos_disponibles === 0
                              ? 'bg-red-500/10 border border-red-500/20'
                              : c.cupos_disponibles <= 3
                                ? 'bg-yellow-500/10 border border-yellow-500/20'
                                : 'bg-green-500/10 border border-green-500/20'
                            }`}>
                            <div className="flex items-center gap-2">
                              <svg className={`w-4 h-4 ${c.cupos_disponibles === 0 ? 'text-red-400' : c.cupos_disponibles <= 3 ? 'text-yellow-400' : 'text-green-400'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className={`font-bold text-sm ${c.cupos_disponibles === 0 ? 'text-red-400' : c.cupos_disponibles <= 3 ? 'text-yellow-400' : 'text-green-400'
                                }`}>
                                {c.cupos_disponibles} / {c.cupos_totales} cupos
                              </span>
                            </div>
                            {c.cupos_disponibles === 0 && (
                              <span className="text-xs font-bold text-red-400 uppercase">Lleno</span>
                            )}
                            {c.cupos_disponibles > 0 && c.cupos_disponibles <= 3 && (
                              <span className="text-xs font-bold text-yellow-400 uppercase animate-pulse">¡Últimos!</span>
                            )}
                          </div>

                          {/* Botón */}
                          <button
                            onClick={() => reservar(c.id)}
                            disabled={c.cupos_disponibles <= 0}
                            className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 ${c.cupos_disponibles > 0
                                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40'
                                : 'bg-gray-800/50 border border-gray-700/50 text-gray-600 cursor-not-allowed'
                              }`}
                          >
                            <span className="flex items-center justify-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              {c.cupos_disponibles <= 0 ? 'SIN CUPOS' : 'RESERVAR AHORA'}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Empty state cuando no hay fecha seleccionada */}
            {!fechaSeleccionada && (
              <div className="relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent"></div>

                <div className="relative z-10 p-16 text-center">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-gray-700 to-gray-800 p-6 rounded-full border border-white/10">
                      <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-white/80 text-lg font-medium">
                    Selecciona un día en el calendario para ver las clases disponibles
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de Compartir */}
        {claseToShare && (
          <ShareModal
            clase={claseToShare}
            onClose={() => setClaseToShare(null)}
          />
        )}
      </div>
    </UserLayout>
  )
}
