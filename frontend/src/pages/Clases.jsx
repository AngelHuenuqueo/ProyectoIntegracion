import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useNotifications } from '../hooks/useNotifications'
import ShareModal from '../components/ShareModal'
import UserLayout from '../components/UserLayout'
import ConfirmModal from '../components/ConfirmModal'
import { useConfirm } from '../hooks/useConfirm'

export default function Clases() {
  const [clases, setClases] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [claseToShare, setClaseToShare] = useState(null)
  const [listaEspera, setListaEspera] = useState([])
  const navigate = useNavigate()
  const { addNotification } = useNotifications()
  const { confirm, confirmState } = useConfirm()

  const fetchClases = useCallback(async () => {
    setLoading(true)
    try {
      const [clasesRes, listaEsperaRes] = await Promise.all([
        api.get('clases/disponibles/'),
        api.get('lista-espera/')
      ])
      // Ordenar clases por ID descendente (las más recientes primero)
      const clasesOrdenadas = (clasesRes.data || []).sort((a, b) => b.id - a.id)
      setClases(clasesOrdenadas)
      setListaEspera(listaEsperaRes.data.results || listaEsperaRes.data || [])
      setMessage(null)
    } catch (err) {
      if (err.response?.status === 401) {
        setMessage({ type: 'error', text: 'Debes iniciar sesión para ver las clases' })
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

  // Notificar sobre clases con pocos cupos
  useEffect(() => {
    if (clases.length > 0) {
      const clasesConPocosCupos = clases.filter(c => {
        const cuposDisponibles = c.cupos_totales - c.cupos_reservados
        return cuposDisponibles > 0 && cuposDisponibles <= 3
      })

      clasesConPocosCupos.forEach(clase => {
        const cuposDisponibles = clase.cupos_totales - clase.cupos_reservados
        const notificationKey = `low_capacity_${clase.id}`
        const yaNotificado = sessionStorage.getItem(notificationKey)

        if (!yaNotificado) {
          addNotification({
            type: 'warning',
            title: '⚡ Últimos cupos disponibles',
            message: `Solo quedan ${cuposDisponibles} lugares en "${clase.nombre}" - ${clase.fecha}`
          })
          sessionStorage.setItem(notificationKey, 'true')
        }
      })
    }
  }, [clases, addNotification])

  async function reservar(id) {
    const clase = clases.find(c => c.id === id)

    // Pedir confirmación antes de reservar
    const confirmed = await confirm({
      message: `¿Estás seguro de que quieres reservar esta clase?\n\n📚 ${clase?.nombre || 'Clase'}\n📅 ${clase?.fecha || ''}\n⏰ ${clase?.hora_inicio || ''} - ${clase?.hora_fin || ''}\n👤 ${clase?.instructor_nombre || 'Instructor'}`,
      title: 'Confirmar Reserva',
      type: 'confirm'
    })

    if (!confirmed) return

    try {
      await api.post('reservas/', { clase: id })

      setMessage({ type: 'success', text: '¡Reserva creada con éxito! 🎉' })

      // Agregar notificación
      addNotification({
        type: 'success',
        title: '✅ Reserva confirmada',
        message: `Has reservado ${clase?.nombre || 'la clase'} - ${clase?.fecha || ''} ${clase?.hora_inicio || ''}`
      })

      // refresh
      fetchClases()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data || 'Error al crear la reserva'
      setMessage({ type: 'error', text: errorMsg })

      // Notificación de error
      addNotification({
        type: 'cancel',
        title: '❌ Error en reserva',
        message: typeof errorMsg === 'string' ? errorMsg : 'No se pudo completar la reserva'
      })

      setTimeout(() => setMessage(null), 5000)
    }
  }

  async function unirseListaEspera(claseId) {
    try {
      await api.post('lista-espera/', { clase: claseId })
      const clase = clases.find(c => c.id === claseId)

      setMessage({ type: 'success', text: '¡Te has unido a la lista de espera! 📋' })

      addNotification({
        type: 'success',
        title: '📋 Lista de Espera',
        message: `Te avisaremos cuando haya cupo en "${clase?.nombre || 'la clase'}"`
      })

      fetchClases()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || 'Error al unirse a la lista de espera'
      setMessage({ type: 'error', text: errorMsg })

      addNotification({
        type: 'cancel',
        title: '❌ Error',
        message: typeof errorMsg === 'string' ? errorMsg : 'No pudiste unirte a la lista de espera'
      })

      setTimeout(() => setMessage(null), 5000)
    }
  }

  async function salirListaEspera(claseId) {
    try {
      const entrada = listaEspera.find(le => le.clase?.id === claseId || le.clase === claseId)
      if (entrada) {
        await api.post(`lista-espera/${entrada.id}/cancelar/`)
        const clase = clases.find(c => c.id === claseId)

        setMessage({ type: 'success', text: 'Saliste de la lista de espera' })

        addNotification({
          type: 'warning',
          title: '📋 Lista de Espera',
          message: `Has salido de la lista de espera de "${clase?.nombre || 'la clase'}"`
        })

        fetchClases()
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (err) {
      console.error('Error al salir de la lista de espera:', err)
      setMessage({ type: 'error', text: 'Error al salir de la lista de espera' })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const estaEnListaEspera = (claseId) => {
    return listaEspera.some(le => {
      const claseIdComparar = le.clase?.id || le.clase
      return claseIdComparar === claseId && le.estado === 'esperando'
    })
  }

  const getPosicionEnLista = (claseId) => {
    const entrada = listaEspera.find(le => {
      const claseIdComparar = le.clase?.id || le.clase
      return claseIdComparar === claseId && le.estado === 'esperando'
    })
    return entrada?.posicion
  }

  const clasesFiltradas = filtroTipo === 'todas'
    ? clases
    : clases.filter(c => c.tipo.toLowerCase() === filtroTipo.toLowerCase())

  // Filtrar por búsqueda (nombre de clase o instructor) y mantener orden por ID
  const clasesMostradas = clasesFiltradas
    .filter(c =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.instructor_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.tipo.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => b.id - a.id) // Mantener orden por ID descendente

  const tiposDisponibles = [...new Set(clases.map(c => c.tipo))]

  return (
    <UserLayout title="Clases Disponibles">
      {/* Hero Header con glassmorphism */}
      <div className="relative overflow-hidden mb-10">
        {/* Background con gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-red-900/30 to-orange-900/40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent"></div>

        {/* Elementos decorativos flotantes */}
        <div className="absolute top-4 right-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-4 left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 py-12 px-8">
          <div className="flex items-center gap-5 mb-4">
            {/* Icono con efecto glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-red-500 to-red-700 p-4 rounded-2xl shadow-2xl shadow-red-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">Clases</span>{' '}
                <span className="bg-gradient-to-r from-red-400 via-red-500 to-orange-500 bg-clip-text text-transparent">Disponibles</span>
              </h2>
              <p className="text-white/90 mt-2 font-medium">Reserva tu próxima sesión de entrenamiento</p>
            </div>
          </div>

          {/* Badge animado */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-red-400/30 rounded-full px-5 py-2.5 shadow-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-sm font-semibold text-gray-300">Sesiones abiertas para reserva</span>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8">
        {/* Barra de búsqueda con glassmorphism */}
        <div className="mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-red-400/30 rounded-2xl overflow-hidden transition-all duration-300 group-focus-within:border-red-500/50 group-focus-within:shadow-lg group-focus-within:shadow-red-500/10">
              <div className="pl-5 pr-3 text-white/90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por clase, instructor o tipo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-transparent text-white px-4 py-4 focus:outline-none font-medium placeholder-gray-500"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="pr-5 text-white/90 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros mejorados */}
        <div className="mb-8 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-red-400/30 rounded-xl px-4 py-2">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-medium cursor-pointer"
            >
              <option value="todas" className="bg-gray-900">Todas las clases</option>
              {tiposDisponibles.map(tipo => (
                <option key={tipo} value={tipo} className="bg-gray-900">{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-white/90">
            <span className="font-semibold text-white">{clasesMostradas.length}</span>
            <span>clase{clasesMostradas.length !== 1 ? 's' : ''} encontrada{clasesMostradas.length !== 1 ? 's' : ''}</span>
          </div>

          {(busqueda || filtroTipo !== 'todas') && (
            <button
              onClick={() => {
                setBusqueda('')
                setFiltroTipo('todas')
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-red-400/30 hover:border-red-500/50 rounded-xl text-gray-300 hover:text-white font-medium text-sm transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar
            </button>
          )}
        </div>

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
              <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 border-4 border-gray-800 border-t-red-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-white/90 font-medium animate-pulse">Cargando clases disponibles...</p>
          </div>
        ) : clasesMostradas.length === 0 ? (
          /* Empty state premium con glassmorphism */
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/5 via-transparent to-transparent"></div>

            <div className="relative z-10 p-16 text-center">
              {/* Icono grande con animación */}
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-full border border-red-400/30">
                  <svg className="w-16 h-16 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">No encontramos clases</h3>
              <p className="text-white/90 mb-8 max-w-md mx-auto">
                No hay clases disponibles que coincidan con "{busqueda || filtroTipo}". Intenta ajustar los filtros o buscar algo diferente.
              </p>

              <button
                onClick={() => {
                  setBusqueda('')
                  setFiltroTipo('todas')
                }}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 shadow-xl shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Ver todas las clases
              </button>
            </div>
          </div>
        ) : (
          /* Grid de clases con diseño premium */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {clasesMostradas.map((c) => (
              <div
                key={c.id}
                className="group relative bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 transition-all duration-500 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-1"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-orange-500/0 group-hover:from-red-500/5 group-hover:to-orange-500/5 rounded-3xl transition-all duration-500"></div>

                <div className="relative z-10">
                  {/* Header de la card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-red-500/20">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          {c.tipo}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors duration-300">{c.nombre}</h3>
                    </div>

                    {/* Botón compartir */}
                    <button
                      onClick={() => setClaseToShare(c)}
                      className="p-2.5 bg-white/5 hover:bg-red-500/20 border border-red-400/30 hover:border-red-500/30 rounded-xl text-white/90 hover:text-red-400 transition-all duration-300"
                      title="Compartir clase"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>

                  {/* Info de la clase */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-white/90">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">{c.fecha}</span>
                      <span className="text-white/90">•</span>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{c.hora_inicio.substring(0, 5)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-white/90">
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
                      <div className={`p-1.5 rounded-lg ${c.cupos_disponibles === 0
                        ? 'bg-red-500/20'
                        : c.cupos_disponibles <= 3
                          ? 'bg-yellow-500/20'
                          : 'bg-green-500/20'
                        }`}>
                        <svg className={`w-4 h-4 ${c.cupos_disponibles === 0
                          ? 'text-red-400'
                          : c.cupos_disponibles <= 3
                            ? 'text-yellow-400'
                            : 'text-green-400'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <span className={`font-bold text-sm ${c.cupos_disponibles === 0
                        ? 'text-red-400'
                        : c.cupos_disponibles <= 3
                          ? 'text-yellow-400'
                          : 'text-green-400'
                        }`}>
                        {c.cupos_disponibles} / {c.cupos_totales} cupos
                      </span>
                    </div>
                    {c.cupos_disponibles === 0 && (
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Lleno</span>
                    )}
                    {c.cupos_disponibles > 0 && c.cupos_disponibles <= 3 && (
                      <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider animate-pulse">¡Últimos!</span>
                    )}
                  </div>

                  {/* Botón de acción */}
                  {c.cupos_disponibles > 0 ? (
                    <button
                      onClick={() => reservar(c.id)}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 group/btn"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        RESERVAR AHORA
                      </span>
                    </button>
                  ) : estaEnListaEspera(c.id) ? (
                    <button
                      onClick={() => salirListaEspera(c.id)}
                      className="w-full bg-gradient-to-r from-orange-500/20 to-orange-600/20 hover:from-orange-500/30 hover:to-orange-600/30 border border-orange-500/30 text-orange-400 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300"
                      title="Click para salir de la lista"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        EN LISTA #{getPosicionEnLista(c.id)}
                      </span>
                    </button>
                  ) : c.permite_lista_espera ? (
                    <button
                      onClick={() => unirseListaEspera(c.id)}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        UNIRSE A LISTA DE ESPERA
                      </span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-white/10 border border-gray-700/50 text-red-100 py-4 rounded-2xl font-bold text-sm tracking-wide cursor-not-allowed"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        CLASE LLENA
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Compartir */}
        {claseToShare && (
          <ShareModal
            clase={claseToShare}
            onClose={() => setClaseToShare(null)}
          />
        )}

        {/* Modal de Confirmación */}
        <ConfirmModal {...confirmState} />
      </div>
    </UserLayout>
  )
}
