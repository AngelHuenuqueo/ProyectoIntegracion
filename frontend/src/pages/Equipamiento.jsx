import { useState, useEffect } from 'react'
import api from '../services/api'
import UserLayout from '../components/UserLayout'
import './Equipamiento.css'

function Equipamiento() {
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null)

  const categorias = [
    { value: '', label: 'Todas las categorías' },
    { value: 'cardio', label: '🏃 Cardio', icon: '🏃' },
    { value: 'fuerza', label: '💪 Fuerza', icon: '💪' },
    { value: 'peso_libre', label: '🏋️ Peso Libre', icon: '🏋️' },
    { value: 'funcional', label: '🤸 Funcional', icon: '🤸' },
    { value: 'otro', label: '🔧 Otro', icon: '🔧' }
  ]

  useEffect(() => {
    cargarEquipos()
  }, [])

  const cargarEquipos = async () => {
    try {
      setLoading(true)
      const res = await api.get('/equipos/')
      const equiposData = res.data.results || res.data || []
      // Solo mostrar equipos activos y disponibles
      setEquipos(equiposData.filter(e => e.activo && e.estado !== 'fuera_servicio'))
    } catch (error) {
      console.error('Error cargando equipos:', error)
    } finally {
      setLoading(false)
    }
  }

  const equiposFiltrados = equipos.filter(equipo => {
    const matchCategoria = !filtroCategoria || equipo.categoria === filtroCategoria
    const matchBusqueda = !busqueda || 
      equipo.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (equipo.marca && equipo.marca.toLowerCase().includes(busqueda.toLowerCase())) ||
      (equipo.descripcion && equipo.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    return matchCategoria && matchBusqueda
  })

  const getEstadoBadge = (estado) => {
    const badges = {
      'disponible': { color: '#10b981', text: '✓ Disponible' },
      'en_uso': { color: '#f59e0b', text: '👤 En Uso' },
      'mantenimiento': { color: '#ef4444', text: '🔧 Mantenimiento' }
    }
    return badges[estado] || badges['disponible']
  }

  const getCategoriaIcon = (categoria) => {
    const icons = {
      'cardio': '🏃',
      'fuerza': '💪',
      'peso_libre': '🏋️',
      'funcional': '🤸',
      'otro': '🔧'
    }
    return icons[categoria] || '🏋️'
  }

  if (loading) {
    return (
      <UserLayout title="Equipamiento">
        <div className="equipamiento-container">
          <div className="loading-equipamiento">Cargando equipamiento...</div>
        </div>
      </UserLayout>
    )
  }

  return (
    <UserLayout title="Equipamiento">
      <div className="equipamiento-container">
      <div className="equipamiento-header">
        <div className="header-content">
          <h1>🏋️ Equipamiento del Gimnasio</h1>
          <p>Conoce todo el equipamiento disponible en nuestras instalaciones</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="equipamiento-filters">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Buscar equipo, marca o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select
          className="filter-select"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          {categorias.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <span className="results-count">{equiposFiltrados.length} equipos</span>
      </div>

      {/* Grid de equipos */}
      <div className="equipos-grid">
        {equiposFiltrados.map(equipo => {
          const estadoBadge = getEstadoBadge(equipo.estado)
          return (
            <div 
              key={equipo.id} 
              className="equipo-card"
              onClick={() => setEquipoSeleccionado(equipo)}
            >
              <div className="equipo-imagen">
                {equipo.imagen ? (
                  <img src={equipo.imagen} alt={equipo.nombre} />
                ) : (
                  <div className="equipo-placeholder">
                    <span className="placeholder-icon">{getCategoriaIcon(equipo.categoria)}</span>
                  </div>
                )}
                <span 
                  className="estado-badge"
                  style={{ backgroundColor: estadoBadge.color }}
                >
                  {estadoBadge.text}
                </span>
              </div>

              <div className="equipo-info">
                <h3>{equipo.nombre}</h3>
                <div className="equipo-detalles">
                  <span className="categoria-tag">
                    {getCategoriaIcon(equipo.categoria)} {equipo.categoria_display}
                  </span>
                  {equipo.marca && (
                    <span className="marca-text">
                      📦 {equipo.marca} {equipo.modelo}
                    </span>
                  )}
                  {equipo.ubicacion && (
                    <span className="ubicacion-text">
                      📍 {equipo.ubicacion}
                    </span>
                  )}
                </div>
                {equipo.descripcion && (
                  <p className="equipo-descripcion">
                    {equipo.descripcion.length > 100 
                      ? equipo.descripcion.substring(0, 100) + '...' 
                      : equipo.descripcion
                    }
                  </p>
                )}
              </div>

              <div className="equipo-footer">
                <button className="ver-detalles-btn">
                  Ver detalles →
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {equiposFiltrados.length === 0 && (
        <div className="no-equipos">
          <span className="no-equipos-icon">🔍</span>
          <h3>No se encontraron equipos</h3>
          <p>Intenta con otros filtros o búsqueda</p>
        </div>
      )}

      {/* Modal de detalles */}
      {equipoSeleccionado && (
        <div className="modal-overlay-equipamiento" onClick={() => setEquipoSeleccionado(null)}>
          <div className="modal-equipamiento" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setEquipoSeleccionado(null)}>×</button>
            
            <div className="modal-content-equipamiento">
              <div className="modal-imagen">
                {equipoSeleccionado.imagen ? (
                  <img src={equipoSeleccionado.imagen} alt={equipoSeleccionado.nombre} />
                ) : (
                  <div className="modal-placeholder">
                    <span>{getCategoriaIcon(equipoSeleccionado.categoria)}</span>
                  </div>
                )}
              </div>

              <div className="modal-info">
                <div className="modal-header-info">
                  <h2>{equipoSeleccionado.nombre}</h2>
                  <span 
                    className="estado-badge-large"
                    style={{ backgroundColor: getEstadoBadge(equipoSeleccionado.estado).color }}
                  >
                    {getEstadoBadge(equipoSeleccionado.estado).text}
                  </span>
                </div>

                <div className="modal-detalles-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Categoría</span>
                    <span className="detalle-valor">
                      {getCategoriaIcon(equipoSeleccionado.categoria)} {equipoSeleccionado.categoria_display}
                    </span>
                  </div>

                  {equipoSeleccionado.marca && (
                    <div className="detalle-item">
                      <span className="detalle-label">Marca</span>
                      <span className="detalle-valor">{equipoSeleccionado.marca}</span>
                    </div>
                  )}

                  {equipoSeleccionado.modelo && (
                    <div className="detalle-item">
                      <span className="detalle-label">Modelo</span>
                      <span className="detalle-valor">{equipoSeleccionado.modelo}</span>
                    </div>
                  )}

                  {equipoSeleccionado.ubicacion && (
                    <div className="detalle-item">
                      <span className="detalle-label">Ubicación</span>
                      <span className="detalle-valor">📍 {equipoSeleccionado.ubicacion}</span>
                    </div>
                  )}
                </div>

                {equipoSeleccionado.descripcion && (
                  <div className="modal-descripcion">
                    <h4>Descripción</h4>
                    <p>{equipoSeleccionado.descripcion}</p>
                  </div>
                )}

                <div className="modal-footer-info">
                  <button 
                    className="btn-cerrar"
                    onClick={() => setEquipoSeleccionado(null)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </UserLayout>
  )
}

export default Equipamiento
