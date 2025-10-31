import { useEffect, useState } from 'react'
import api from '../services/api'
import { useNotifications } from '../components/NotificationCenter'
import { useClassReminders } from '../hooks/useReminders'
import { exportarComprobanteReserva, exportarListaReservas } from '../utils/pdfExport'
import ConfirmModal from '../components/ConfirmModal'
import { useConfirm } from '../hooks/useConfirm'

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

  async function salirListaEspera(id) {
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-black border-b-4 border-red-600 py-8 px-6 mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
            </svg>
            <h2 className="text-4xl font-black tracking-wider">
              MIS <span className="text-red-600">RESERVAS</span>
            </h2>
          </div>
          <div className="inline-block bg-red-600 text-white px-4 py-1 font-black text-xs tracking-widest transform -skew-x-12">
            <span className="inline-block transform skew-x-12">GESTIONA TUS CLASES</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleExportarLista('todas')}
            className="bg-purple-600 text-white px-4 py-2 font-black text-xs tracking-wider uppercase hover:bg-purple-700 transition-all disabled:opacity-50"
            disabled={reservas.length === 0}
          >
            📄 Exportar Todas
          </button>
          <button 
            onClick={() => handleExportarLista('activas')}
            className="bg-blue-600 text-white px-4 py-2 font-black text-xs tracking-wider uppercase hover:bg-blue-700 transition-all disabled:opacity-50"
            disabled={reservasActivas.length === 0}
          >
            📄 Exportar Activas
          </button>
        </div>
      </div>
      
      <div className="px-6">
        {message && (
          <div className={`mb-6 p-4 border-2 font-bold ${message.type === 'error' ? 'bg-red-600/20 border-red-600 text-red-500' : 'bg-green-600/20 border-green-600 text-green-500'}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-medium">Cargando reservas...</p>
          </div>
        ) : (
          <>
            {/* Reservas Activas */}
            <h3 className="text-2xl font-black text-red-600 mb-6 tracking-wide uppercase">
              Reservas Activas ({reservasActivas.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {reservasActivas.length === 0 ? (
                <div className="bg-gray-900 border-2 border-gray-800 p-8 text-center col-span-full">
                  <p className="text-gray-400">No tienes reservas activas</p>
                </div>
              ) : (
                reservasActivas.map((r) => (
                  <div className="bg-gradient-to-b from-gray-900 to-black border-l-4 border-green-600 border-2 border-gray-800 hover:border-green-600/50 p-6 transition-all relative overflow-hidden group" key={r.id}>
                    <div className="absolute inset-0 bg-green-600/0 group-hover:bg-green-600/5 transition-all"></div>
                    
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black text-white mb-2 tracking-wide uppercase">{r.clase?.nombre || 'Clase sin nombre'}</h3>
                      <p className="text-green-600 font-black text-xs tracking-widest mb-4">📋 {r.clase?.tipo?.toUpperCase() || 'N/A'}</p>
                      <p className="text-gray-400 font-medium mb-1">📅 {r.clase?.fecha || 'Fecha no disponible'}</p>
                      <p className="text-gray-400 font-medium mb-1">⏰ {r.clase?.hora_inicio?.substring(0, 5) || '--:--'} - {r.clase?.hora_fin?.substring(0, 5) || '--:--'}</p>
                      <p className="text-gray-400 font-medium mb-4">👤 {r.clase?.instructor_nombre || 'Instructor no asignado'}</p>
                      <p className="text-green-500 font-black text-sm mb-4">✓ {r.estado?.toUpperCase() || 'ESTADO DESCONOCIDO'}</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => cancelarReserva(r.id)}
                          className="flex-1 bg-red-600 text-white py-3 font-black text-xs tracking-wider uppercase hover:bg-red-700 transition-all"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={() => handleExportarComprobante(r)}
                          className="flex-1 bg-purple-600 text-white py-3 font-black text-xs tracking-wider uppercase hover:bg-purple-700 transition-all"
                          title="Descargar comprobante PDF"
                        >
                          📄 PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Lista de Espera */}
            {listaEspera.length > 0 && (
              <>
                <h3 className="text-2xl font-black text-purple-600 mb-6 mt-12 tracking-wide uppercase">
                  📋 Lista de Espera ({listaEspera.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
                        <div className="bg-gradient-to-b from-gray-900 to-black border-l-4 border-purple-600 border-2 border-gray-800 hover:border-purple-600/50 p-6 transition-all" key={le.id}>
                          <h3 className="text-2xl font-black text-white mb-2 tracking-wide uppercase">{claseNombre}</h3>
                          <p className="text-purple-600 font-black text-xs tracking-widest mb-4">📋 {claseTipo.toUpperCase()}</p>
                          <p className="text-gray-400 font-medium mb-1">📅 {claseFecha}</p>
                          <p className="text-gray-400 font-medium mb-1">⏰ {claseHoraInicio.substring(0, 5)} - {claseHoraFin.substring(0, 5)}</p>
                          <p className="text-gray-400 font-medium mb-4">👤 {instructorNombre}</p>
                          <p className="text-purple-500 font-black text-sm mb-2">
                            🎯 Posición: {le.posicion || 'N/A'}
                          </p>
                          <p className="text-gray-500 text-xs mb-4">
                            📆 {new Date(le.fecha_ingreso).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <button 
                            onClick={() => salirListaEspera(le.id)}
                            className="w-full bg-orange-600 text-white py-3 font-black text-xs tracking-wider uppercase hover:bg-orange-700 transition-all"
                          >
                            Salir de Lista
                          </button>
                        </div>
                      )
                    })}
                </div>
              </>
            )}

            {/* Historial */}
            {reservasPasadas.length > 0 && (
              <>
                <h3 className="text-2xl font-black text-gray-500 mb-6 mt-12 tracking-wide uppercase">
                  Historial ({reservasPasadas.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reservasPasadas.map((r) => (
                    <div className="bg-gradient-to-b from-gray-900 to-black border-l-4 border-gray-700 border-2 border-gray-800 p-6 opacity-70" key={r.id}>
                      <h3 className="text-2xl font-black text-white mb-2 tracking-wide uppercase">{r.clase?.nombre || 'Clase sin nombre'}</h3>
                      <p className="text-gray-400 font-medium mb-4">📅 {r.clase?.fecha || 'Fecha no disponible'}</p>
                      <p className={`font-black text-sm ${
                        r.estado?.toLowerCase() === 'completada' ? 'text-green-500' : 
                        r.estado?.toLowerCase() === 'cancelada' ? 'text-orange-500' : 'text-red-500'
                      }`}>
                        {r.estado?.toLowerCase() === 'completada' && '✓ '}
                        {r.estado?.toLowerCase() === 'cancelada' && '✗ '}
                        {r.estado?.toLowerCase() === 'noshow' && '⚠ '}
                        {r.estado?.toUpperCase() || 'ESTADO DESCONOCIDO'}
                      </p>
                    </div>
                  ))}
                </div>
              </>
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
    </div>
  )
}
