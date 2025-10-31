import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import ShareModal from '../components/ShareModal'

export default function Calendario() {
  const [clases, setClases] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
  const [claseToShare, setClaseToShare] = useState(null)
  const navigate = useNavigate()

  async function fetchClases() {
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
  }

  useEffect(() => {
    fetchClases()
  }, [])

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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-black border-b-4 border-red-600 py-8 px-6 mb-8">
        <div className="flex items-center gap-4 mb-2">
          <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
          </svg>
          <h2 className="text-4xl font-black tracking-wider">
            CALENDARIO <span className="text-red-600">DE CLASES</span>
          </h2>
        </div>
        <div className="inline-block bg-red-600 text-white px-4 py-1 font-black text-xs tracking-widest transform -skew-x-12">
          <span className="inline-block transform skew-x-12">PLANIFICA TU SEMANA</span>
        </div>
      </div>

      <div className="px-6">
        {message && (
          <div className={`mb-6 p-4 border-2 font-bold ${message.type === 'error' ? 'bg-red-600/20 border-red-600 text-red-500' : 'bg-green-600/20 border-green-600 text-green-500'}`}>
          {typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-medium">Cargando calendario...</p>
          </div>
        ) : (
          <div>
            {/* Vista de Calendario */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
              {fechasDisponibles.map(fecha => {
                const clasesDelDia = clasesPorFecha[fecha]
                const estaSeleccionada = fechaSeleccionada === fecha
                
                return (
                  <div
                    key={fecha}
                    onClick={() => setFechaSeleccionada(estaSeleccionada ? null : fecha)}
                    className={`p-4 cursor-pointer text-center transition-all transform ${
                      estaSeleccionada 
                        ? 'bg-gradient-to-br from-red-600 to-red-900 scale-105 border-2 border-red-600' 
                        : 'bg-gradient-to-b from-gray-900 to-black border-2 border-gray-800 hover:border-red-600/50'
                    }`}
                  >
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                      {getDiaSemana(fecha)}
                    </div>
                    <div className="text-3xl font-black mb-2 text-white">
                      {formatearFecha(fecha)}
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 ${
                      estaSeleccionada ? 'bg-white/20' : 'bg-red-600'
                    } text-white`}>
                      {clasesDelDia.length} clase{clasesDelDia.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Clases del día seleccionado */}
            {fechaSeleccionada && (
              <div>
                <h3 className="text-2xl font-black text-red-600 mb-6 tracking-wide uppercase">
                  Clases del {getDiaSemana(fechaSeleccionada)}, {formatearFecha(fechaSeleccionada)}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clasesPorFecha[fechaSeleccionada]
                    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                    .map((c) => (
                      <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-gray-800 hover:border-red-600/50 p-6 transition-all" key={c.id}>
                        <h3 className="text-2xl font-black text-white mb-2 tracking-wide uppercase">{c.nombre}</h3>
                        <p className="text-red-600 font-black text-xs tracking-widest mb-4">📋 {c.tipo.toUpperCase()}</p>
                        <p className="text-gray-400 font-medium mb-4">⏰ {c.hora_inicio.substring(0, 5)} - {c.hora_fin.substring(0, 5)}</p>
                        <p className="text-gray-400 font-medium mb-4">👤 {c.instructor_nombre}</p>
                        <p className={`font-black text-sm mb-4 ${
                          c.cupos_disponibles === 0 ? 'text-red-500' : c.cupos_disponibles <= 3 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          Cupos: {c.cupos_disponibles} / {c.cupos_totales}
                          {c.cupos_disponibles === 0 && ' - ¡LLENO!'}
                          {c.cupos_disponibles > 0 && c.cupos_disponibles <= 3 && ' - ¡Últimos cupos!'}
                        </p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => reservar(c.id)} 
                            disabled={c.cupos_disponibles <= 0}
                            className="flex-1 bg-red-600 text-white py-3 font-black text-xs tracking-wider uppercase hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {c.cupos_disponibles <= 0 ? 'Sin Cupos' : 'Reservar'}
                          </button>
                          <button 
                            onClick={() => setClaseToShare(c)}
                            className="bg-gray-800 text-red-600 px-4 hover:bg-red-600 hover:text-white transition-all font-black text-lg"
                            title="Compartir clase"
                          >
                            🔗
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Mensaje cuando no hay fecha seleccionada */}
            {!fechaSeleccionada && (
              <div className="bg-gray-900 border-2 border-gray-800 p-12 text-center">
                <p className="text-gray-400 text-lg">
                  👆 Selecciona un día en el calendario para ver las clases disponibles
                </p>
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
    </div>
  )
}
