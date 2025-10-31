import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useNotifications } from '../components/NotificationCenter'
import ShareModal from '../components/ShareModal'

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

  async function fetchClases() {
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
  }

  useEffect(() => {
    fetchClases()
  }, [])

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
    try {
      const res = await api.post('reservas/', { clase: id })
      const clase = clases.find(c => c.id === id)
      
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-black border-b-4 border-red-600 py-8 px-6 mb-8">
        <div className="flex items-center gap-4 mb-2">
          <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
          </svg>
          <h2 className="text-4xl font-black tracking-wider">
            CLASES <span className="text-red-600">DISPONIBLES</span>
          </h2>
        </div>
        <div className="inline-block bg-red-600 text-white px-4 py-1 font-black text-xs tracking-widest transform -skew-x-12">
          <span className="inline-block transform skew-x-12">RESERVA TU SESIÓN</span>
        </div>
      </div>
      
      <div className="px-6">
        {/* Barra de búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Buscar por clase, instructor o tipo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-gray-900 border-2 border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors font-medium"
          />
        </div>

        {/* Filtros */}
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <label className="font-black text-red-600 text-xs tracking-wider uppercase">Filtrar:</label>
          <select 
            value={filtroTipo} 
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-gray-900 border-2 border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-red-600 font-medium"
          >
            <option value="todas">Todas las clases</option>
            {tiposDisponibles.map(tipo => (
              <option key={tipo} value={tipo}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</option>
            ))}
          </select>
          <span className="text-gray-400 font-medium">
            {clasesMostradas.length} clase{clasesMostradas.length !== 1 ? 's' : ''} encontrada{clasesMostradas.length !== 1 ? 's' : ''}
          </span>
          {(busqueda || filtroTipo !== 'todas') && (
            <button 
              onClick={() => {
                setBusqueda('')
                setFiltroTipo('todas')
              }}
              className="px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 hover:border-red-600 hover:text-white font-bold text-sm uppercase transition-all"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {message && (
          <div className={`mb-6 p-4 border-2 font-bold ${message.type === 'error' ? 'bg-red-600/20 border-red-600 text-red-500' : 'bg-green-600/20 border-green-600 text-green-500'}`}>
            {typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}
          </div>
        )}
      
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-medium">Cargando clases...</p>
          </div>
        ) : clasesMostradas.length === 0 ? (
          <div className="bg-gray-900 border-2 border-gray-800 p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">😕 No hay clases disponibles para "{busqueda || filtroTipo}".</p>
            <button 
              onClick={() => {
                setBusqueda('')
                setFiltroTipo('todas')
              }}
              className="bg-red-600 text-white px-6 py-3 font-black text-sm tracking-wider uppercase hover:bg-red-700 transition-all"
            >
              Ver todas las clases
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clasesMostradas.map((c) => (
              <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-gray-800 hover:border-red-600/50 p-6 transition-all relative overflow-hidden group" key={c.id}>
                <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/5 transition-all"></div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-white mb-2 tracking-wide uppercase">{c.nombre}</h3>
                  <p className="text-red-600 font-black text-xs tracking-widest mb-4">📋 {c.tipo.toUpperCase()}</p>
                  <p className="text-gray-400 font-medium mb-1">📅 {c.fecha} - ⏰ {c.hora_inicio.substring(0, 5)}</p>
                  <p className="text-gray-400 font-medium mb-4">👤 {c.instructor_nombre}</p>
                  <p className={`font-black text-sm mb-4 ${c.cupos_disponibles === 0 ? 'text-red-500' : c.cupos_disponibles <= 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                    Cupos: {c.cupos_disponibles} / {c.cupos_totales}
                    {c.cupos_disponibles === 0 && ' - ¡LLENO!'}
                    {c.cupos_disponibles > 0 && c.cupos_disponibles <= 3 && ' - ¡Últimos cupos!'}
                  </p>
                  <div className="flex gap-2">
                    {c.cupos_disponibles > 0 ? (
                      <button 
                        onClick={() => reservar(c.id)} 
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 font-black text-xs tracking-wider uppercase hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/30"
                      >
                        RESERVAR
                      </button>
                    ) : estaEnListaEspera(c.id) ? (
                      <button 
                        onClick={() => salirListaEspera(c.id)}
                        className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 font-black text-xs tracking-wider uppercase hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg shadow-orange-600/30"
                        title="Click para salir de la lista"
                      >
                        📋 EN LISTA (#{getPosicionEnLista(c.id)})
                      </button>
                    ) : c.permite_lista_espera ? (
                      <button 
                        onClick={() => unirseListaEspera(c.id)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 font-black text-xs tracking-wider uppercase hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-600/30"
                      >
                        📋 UNIRSE A LISTA
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="flex-1 bg-gray-800 text-gray-600 py-3 font-black text-xs tracking-wider uppercase cursor-not-allowed opacity-50"
                      >
                        ❌ CLASE LLENA
                      </button>
                    )}
                    <button 
                      onClick={() => setClaseToShare(c)}
                      className="bg-gray-900 text-red-600 px-4 border-2 border-gray-800 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all font-black text-lg"
                      title="Compartir clase"
                    >
                      🔗
                    </button>
                  </div>
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
      </div>
    </div>
  )
}
