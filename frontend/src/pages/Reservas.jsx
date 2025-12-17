import { useEffect, useState } from 'react'
import api from '../services/api'
import { useNotifications } from '../hooks/useNotifications'
import { useClassReminders } from '../hooks/useReminders'
import { exportarComprobanteReserva, exportarListaReservas } from '../utils/pdfExport'
import ConfirmModal from '../components/ConfirmModal'
import { useConfirm } from '../hooks/useConfirm'
import UserLayout from '../components/UserLayout'

export default function Reservas() {
  const [reservas, setReservas] = useState([])
  const [listaEspera, setListaEspera] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const { addNotification } = useNotifications()
  const { confirm, confirmState } = useConfirm()

  // Hook para recordatorios automáticos
  useClassReminders(reservas)

  async function fetchReservas() {
    setLoading(true)
    try {
      const [reservasRes, usuarioRes, listaEsperaRes] = await Promise.all([
        api.get('reservas/'),
        api.get('usuarios/me/'),
        api.get('lista-espera/')
      ])
      // La API devuelve un objeto paginado con 'results'
      setReservas(reservasRes.data.results || reservasRes.data || [])
      setUsuario(usuarioRes.data)
      setListaEspera(listaEsperaRes.data.results || listaEsperaRes.data || [])
    } catch (err) {
      console.error('Error al cargar reservas:', err)
      setMessage({ type: 'error', text: 'Error al cargar reservas' })
      setReservas([]) // Asegurar que siempre sea un array
      setListaEspera([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservas()
  }, [])

  async function cancelarReserva(id) {
    const reserva = reservas.find(r => r.id === id)

    const confirmed = await confirm({
      message: '¿Estás seguro de que quieres cancelar esta reserva?',
      title: 'Cancelar Reserva',
      type: 'cancel'
    })

    if (!confirmed) return

    try {
      await api.post(`reservas/${id}/cancelar/`)
      setMessage({ type: 'success', text: 'Reserva cancelada exitosamente' })

      // Agregar notificación
      addNotification({
        type: 'cancel',
        title: '🚫 Reserva cancelada',
        message: `Has cancelado ${reserva?.clase?.nombre || 'la clase'} del ${reserva?.clase?.fecha || ''}`
      })

      fetchReservas()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error al cancelar la reserva'
      setMessage({ type: 'error', text: errorMsg })

      // Notificación de error
      addNotification({
        type: 'warning',
        title: '⚠️ Error al cancelar',
        message: errorMsg
      })

      setTimeout(() => setMessage(null), 3000)
    }
  }

  async function eliminarReserva(id) {
    const reserva = reservas.find(r => r.id === id)

    const confirmed = await confirm({
      message: '¿Eliminar esta reserva del historial? Esta acción no se puede deshacer.',
      title: 'Eliminar del Historial',
      type: 'danger'
    })

    if (!confirmed) return

    try {
      await api.delete(`reservas/${id}/`)
      setMessage({ type: 'success', text: 'Reserva eliminada del historial' })

      // Agregar notificación
      addNotification({
        type: 'info',
        title: '🗑️ Eliminado del historial',
        message: `${reserva?.clase?.nombre || 'La reserva'} fue eliminada de tu historial`
      })

      fetchReservas()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error al eliminar la reserva'
      setMessage({ type: 'error', text: errorMsg })

      setTimeout(() => setMessage(null), 3000)
    }
  }

  async function cancelarListaEspera(id) {
    const entrada = listaEspera.find(le => le.id === id)

    const confirmed = await confirm({
      message: '¿Estás seguro de que quieres salir de la lista de espera?',
      title: 'Salir de Lista de Espera',
      type: 'warning'
    })

    if (!confirmed) return

    try {
      await api.post(`lista-espera/${id}/cancelar/`)
      setMessage({ type: 'success', text: 'Saliste de la lista de espera' })

      // Obtener el nombre de la clase
      const claseNombre = entrada?.clase?.nombre || entrada?.clase_nombre || 'la clase'

      addNotification({
        type: 'warning',
        title: '📋 Lista de Espera',
        message: `Has salido de la lista de espera de "${claseNombre}"`
      })

      fetchReservas()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error('Error al salir de la lista de espera:', err)
      setMessage({ type: 'error', text: 'Error al salir de la lista de espera' })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const handleExportarComprobante = (reserva) => {
    if (!usuario) {
      setMessage({ type: 'error', text: 'Error: No se pudo obtener información del usuario' })
      return
    }

    exportarComprobanteReserva(reserva, usuario)

    addNotification({
      type: 'success',
      title: '📄 PDF generado',
      message: `Comprobante de ${reserva.clase.nombre} descargado exitosamente`
    })
  }

  const handleExportarLista = (filtro) => {
    if (!usuario) {
      setMessage({ type: 'error', text: 'Error: No se pudo obtener información del usuario' })
      return
    }

    let reservasFiltradas = reservas
    if (filtro === 'activas') {
      reservasFiltradas = reservas.filter(r => r.estado === 'CONFIRMADA')
    } else if (filtro === 'pasadas') {
      reservasFiltradas = reservas.filter(r => r.estado !== 'CONFIRMADA')
    }

    exportarListaReservas(reservasFiltradas, usuario, filtro)

    addNotification({
      type: 'success',
      title: '📄 PDF generado',
      message: 'Lista de reservas descargada exitosamente'
    })
  }

  const reservasActivas = reservas.filter(r => r.estado?.toLowerCase() === 'confirmada')
  const reservasPasadas = reservas.filter(r => r.estado?.toLowerCase() !== 'confirmada')

  return (
    <UserLayout title="Mis Reservas">
      {/* Hero Header con glassmorphism */}
      <div className="relative overflow-hidden mb-10">
        {/* Background con gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-teal-900/30 to-blue-900/40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-500/20 via-transparent to-transparent"></div>

        {/* Elementos decorativos flotantes */}
        <div className="absolute top-4 right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-4 left-10 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 py-12 px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Icono con efecto glow */}
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-green-500 to-teal-700 p-4 rounded-2xl shadow-2xl shadow-green-500/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">Mis</span>{' '}
                  <span className="bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 bg-clip-text text-transparent">Reservas</span>
                </h2>
                <p className="text-gray-400 mt-2 font-medium">Gestiona tus clases reservadas</p>
              </div>
            </div>

            {/* Botones de exportación */}
            <div className="flex gap-3">
              <button
                onClick={() => handleExportarLista('todas')}
                disabled={reservas.length === 0}
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar Todas
              </button>
              <button
                onClick={() => handleExportarLista('activas')}
                disabled={reservasActivas.length === 0}
                className="group inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Exportar Activas
              </button>
            </div>
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
            {message.text}
          </div>
        )}

        {loading ? (
          /* Loading state premium */
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 border-4 border-gray-800 border-t-green-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-400 font-medium animate-pulse">Cargando reservas...</p>
          </div>
        ) : (
          <>
            {/* Sección: Reservas Activas */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl border border-green-500/20">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Reservas Activas <span className="text-green-400">({reservasActivas.length})</span>
                </h3>
              </div>

              {reservasActivas.length === 0 ? (
                <div className="relative overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl"></div>
                  <div className="relative z-10 p-12 text-center">
                    <div className="relative inline-block mb-4">
                      <div className="relative bg-gradient-to-br from-gray-700 to-gray-800 p-5 rounded-full border border-white/10">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-gray-400 font-medium">No tienes reservas activas</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {reservasActivas.map((r) => (
                    <div
                      key={r.id}
                      className="group relative bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 transition-all duration-500 hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-1 overflow-hidden"
                    >
                      {/* Indicador lateral verde */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-teal-500 rounded-l-3xl"></div>

                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-teal-500/0 group-hover:from-green-500/5 group-hover:to-teal-500/5 rounded-3xl transition-all duration-500"></div>

                      <div className="relative z-10">
                        {/* Header */}
                        <div className="mb-4">
                          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-500/20 to-teal-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-500/20 mb-2">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            {r.clase?.tipo || 'N/A'}
                          </span>
                          <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">{r.clase?.nombre || 'Clase sin nombre'}</h3>
                        </div>

                        {/* Info */}
                        <div className="space-y-3 mb-5">
                          <div className="flex items-center gap-3 text-white/80">
                            <div className="p-2 bg-white/10 rounded-lg">
                              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="font-medium">{r.clase?.fecha || 'Fecha no disponible'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-white/80">
                            <div className="p-2 bg-white/10 rounded-lg">
                              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span className="font-medium">{r.clase?.hora_inicio?.substring(0, 5) || '--:--'} - {r.clase?.hora_fin?.substring(0, 5) || '--:--'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-white/80">
                            <div className="p-2 bg-white/10 rounded-lg">
                              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <span className="font-medium">{r.clase?.instructor_nombre || 'Instructor no asignado'}</span>
                          </div>
                        </div>

                        {/* Estado */}
                        <div className="mb-5 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-bold text-sm text-green-400">{r.estado?.toUpperCase() || 'CONFIRMADA'}</span>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => cancelarReserva(r.id)}
                            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleExportarComprobante(r)}
                            className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sección: Lista de Espera */}
            {listaEspera.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/20">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Lista de Espera <span className="text-purple-400">({listaEspera.filter(le => le.estado === 'esperando').length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {listaEspera
                    .filter(le => le.estado === 'esperando')
                    .map((le) => {
                      const clase = le.clase
                      const claseNombre = clase?.nombre || le.clase_nombre || 'Clase sin nombre'
                      const claseTipo = clase?.tipo || le.clase_tipo || 'N/A'
                      const claseFecha = clase?.fecha || le.clase_fecha || 'Fecha no disponible'
                      const claseHoraInicio = clase?.hora_inicio || le.clase_hora_inicio || '--:--'
                      const claseHoraFin = clase?.hora_fin || le.clase_hora_fin || '--:--'
                      const instructorNombre = clase?.instructor_nombre || le.instructor_nombre || 'Instructor no asignado'

                      return (
                        <div
                          key={le.id}
                          className="group relative bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 transition-all duration-500 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 overflow-hidden"
                        >
                          {/* Indicador lateral púrpura */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-pink-500 rounded-l-3xl"></div>

                          <div className="relative z-10">
                            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-500/20 mb-2">
                              {claseTipo}
                            </span>
                            <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-4">{claseNombre}</h3>

                            <div className="space-y-2 mb-4 text-white/70 text-sm">
                              <p className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {claseFecha}
                              </p>
                              <p className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {claseHoraInicio.substring(0, 5)} - {claseHoraFin.substring(0, 5)}
                              </p>
                              <p className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {instructorNombre}
                              </p>
                            </div>

                            <div className="mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                              <p className="text-purple-400 font-bold text-sm flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                </svg>
                                Posición: #{le.posicion || 'N/A'}
                              </p>
                            </div>

                            <button
                              onClick={() => cancelarListaEspera(le.id)}
                              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
                            >
                              Salir de Lista
                            </button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Sección: Historial */}
            {reservasPasadas.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-xl border border-gray-500/20">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Historial <span className="text-gray-500">({reservasPasadas.length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {reservasPasadas.map((r) => (
                    <div
                      key={r.id}
                      className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-700/30 rounded-3xl p-6 transition-all duration-300 hover:border-gray-600/50 opacity-70 hover:opacity-100 overflow-hidden"
                    >
                      {/* Indicador lateral según estado */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl ${r.estado?.toLowerCase() === 'completada' ? 'bg-gradient-to-b from-green-400 to-green-600' :
                          r.estado?.toLowerCase() === 'cancelada' ? 'bg-gradient-to-b from-orange-400 to-orange-600' :
                            'bg-gradient-to-b from-red-400 to-red-600'
                        }`}></div>

                      <div className="relative z-10">
                        <h3 className="text-lg font-bold text-white mb-3">{r.clase?.nombre || 'Clase sin nombre'}</h3>
                        <div className="space-y-1 mb-4 text-gray-400 text-sm">
                          <p>{r.clase?.fecha || 'Fecha no disponible'}</p>
                          <p>{r.clase?.hora_inicio?.substring(0, 5) || '--:--'} - {r.clase?.hora_fin?.substring(0, 5) || '--:--'}</p>
                        </div>

                        <div className={`mb-4 p-2 rounded-lg inline-flex items-center gap-2 text-xs font-bold ${r.estado?.toLowerCase() === 'completada' ? 'bg-green-500/10 text-green-400' :
                            r.estado?.toLowerCase() === 'cancelada' ? 'bg-orange-500/10 text-orange-400' :
                              'bg-red-500/10 text-red-400'
                          }`}>
                          {r.estado?.toLowerCase() === 'completada' && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {r.estado?.toLowerCase() === 'cancelada' && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {r.estado?.toLowerCase() === 'noshow' && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          )}
                          {r.estado?.toUpperCase() || 'ESTADO'}
                        </div>

                        <button
                          onClick={() => eliminarReserva(r.id)}
                          className="w-full bg-gray-700/50 hover:bg-red-500/20 border border-gray-600/50 hover:border-red-500/30 text-gray-400 hover:text-red-400 py-2 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmación */}
      {confirmState.isOpen && (
        <ConfirmModal
          type={confirmState.type}
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={confirmState.onConfirm}
          onCancel={confirmState.onCancel}
        />
      )}
    </UserLayout>
  )
}
