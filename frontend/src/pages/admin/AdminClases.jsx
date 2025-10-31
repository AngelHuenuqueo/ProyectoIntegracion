import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import './Admin.css'

function AdminClases() {
  const navigate = useNavigate()
  const [clases, setClases] = useState([])
  const [instructores, setInstructores] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [claseForm, setClaseForm] = useState({
    nombre: '',
    descripcion: '',
    instructor: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    cupos_totales: 20,
    tipo: 'spinning',
    estado: 'activa',
    permite_lista_espera: true
  })

  useEffect(() => {
    verificarPermiso()
    cargarDatos()
  }, [])

  const verificarPermiso = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user.rol !== 'administrador') {
        alert('No tienes permisos para acceder a esta sección')
        navigate('/clases')
      }
    }
  }

  const cargarDatos = async () => {
    try {
      setLoading(true)
      
      // Cargar clases
      const clasesRes = await api.get('/clases/')
      const clasesData = clasesRes.data.results || clasesRes.data || []
      // Ordenar por ID descendente (las más recientes primero)
      const clasesOrdenadas = clasesData.sort((a, b) => b.id - a.id)
      setClases(clasesOrdenadas)

      // Cargar instructores
      const instRes = await api.get('/instructores/')
      const instData = instRes.data.results || instRes.data || []
      setInstructores(instData)
    } catch (error) {
      console.error('Error cargando datos:', error)
      alert('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const filtrarClases = () => {
    const clasesFiltradas = clases.filter(clase => {
      return clase.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
             clase.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
             clase.instructor_nombre?.toLowerCase().includes(busqueda.toLowerCase())
    })
    // Mantener ordenamiento por ID descendente
    return clasesFiltradas.sort((a, b) => b.id - a.id)
  }

  const abrirModalNuevo = () => {
    setModoEdicion(false)
    setClaseForm({
      nombre: '',
      descripcion: '',
      instructor: '',
      fecha: '',
      hora_inicio: '',
      hora_fin: '',
      cupos_totales: 20,
      tipo: 'spinning',
      estado: 'activa',
      permite_lista_espera: true
    })
    setMostrarModal(true)
  }

  const abrirModalEdicion = (clase) => {
    setModoEdicion(true)
    setClaseForm({
      id: clase.id,
      nombre: clase.nombre,
      descripcion: clase.descripcion || '',
      instructor: clase.instructor || '',
      fecha: clase.fecha,
      hora_inicio: clase.hora_inicio,
      hora_fin: clase.hora_fin,
      cupos_totales: clase.cupos_totales,
      tipo: clase.tipo || 'spinning',
      estado: clase.estado || 'activa',
      permite_lista_espera: clase.permite_lista_espera !== false
    })
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setClaseForm({
      nombre: '',
      descripcion: '',
      instructor: '',
      fecha: '',
      hora_inicio: '',
      hora_fin: '',
      cupos_totales: 20,
      tipo: 'spinning',
      estado: 'activa',
      permite_lista_espera: true
    })
  }

  const guardarClase = async () => {
    try {
      // Validaciones
      if (!claseForm.nombre || !claseForm.fecha || !claseForm.hora_inicio || !claseForm.hora_fin) {
        alert('Por favor completa todos los campos obligatorios')
        return
      }

      // Preparar datos - solo enviar instructor si tiene valor
      const dataToSend = {
        nombre: claseForm.nombre,
        tipo: claseForm.tipo,
        descripcion: claseForm.descripcion,
        fecha: claseForm.fecha,
        hora_inicio: claseForm.hora_inicio,
        hora_fin: claseForm.hora_fin,
        cupos_totales: parseInt(claseForm.cupos_totales),
        estado: claseForm.estado,
        permite_lista_espera: claseForm.permite_lista_espera
      }

      // Solo agregar instructor si se seleccionó uno
      if (claseForm.instructor) {
        dataToSend.instructor = parseInt(claseForm.instructor)
      }
      
      if (modoEdicion) {
        await api.put(`/clases/${claseForm.id}/`, dataToSend)
        alert('Clase actualizada exitosamente')
      } else {
        await api.post('/clases/', dataToSend)
        alert('Clase creada exitosamente')
      }
      
      cerrarModal()
      cargarDatos()
    } catch (error) {
      console.error('Error guardando clase:', error)
      const errorDetail = error.response?.data
      let errorMsg = 'Error al guardar la clase'
      
      if (typeof errorDetail === 'object') {
        errorMsg = Object.entries(errorDetail).map(([key, value]) => 
          `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
        ).join('\n')
      } else if (errorDetail) {
        errorMsg = errorDetail
      }
      
      alert(errorMsg)
    }
  }

  const eliminarClase = async (clase) => {
    const confirmar = window.confirm(
      `¿Estás SEGURO de ELIMINAR la clase "${clase.nombre}"?\n\nSe eliminarán también todas las reservas asociadas.`
    )
    
    if (!confirmar) return

    try {
      await api.delete(`/clases/${clase.id}/`)
      alert('Clase eliminada exitosamente')
      cargarDatos()
    } catch (error) {
      console.error('Error eliminando clase:', error)
      alert('Error al eliminar la clase')
    }
  }

  const clasesFiltradas = filtrarClases()

  if (loading) {
    return <div className="admin-container"><div className="loading">Cargando clases...</div></div>
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🏋️ Gestión de Clases</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={abrirModalNuevo}>➕ Nueva Clase</button>
          <button className="btn-back" onClick={() => navigate('/admin')}>← Volver</button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="filters-bar">
        <input
          type="text"
          placeholder="🔍 Buscar clases por nombre, descripción o instructor..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input"
        />
        
        <div className="filter-stats">
          Mostrando {clasesFiltradas.length} de {clases.length} clases
        </div>
      </div>

      {/* Tabla de clases */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Instructor</th>
              <th>Fecha</th>
              <th>Horario</th>
              <th>Cupos</th>
              <th>Nivel</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clasesFiltradas.map(clase => (
              <tr key={clase.id}>
                <td>{clase.id}</td>
                <td><strong>{clase.nombre}</strong></td>
                <td>{clase.instructor_nombre || 'Sin instructor'}</td>
                <td>{new Date(clase.fecha).toLocaleDateString('es-ES')}</td>
                <td>{clase.hora_inicio} - {clase.hora_fin}</td>
                <td>
                  <span className={`badge-cupos ${clase.cupos_disponibles === 0 ? 'lleno' : ''}`}>
                    {clase.cupos_disponibles}/{clase.cupos_totales}
                  </span>
                </td>
                <td>
                  <span className={`badge-nivel ${clase.nivel || 'intermedio'}`}>
                    {clase.nivel || 'intermedio'}
                  </span>
                </td>
                <td>{clase.tipo_clase || 'fitness'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit" 
                      onClick={() => abrirModalEdicion(clase)}
                      title="Editar clase"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => eliminarClase(clase)}
                      title="Eliminar clase"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clasesFiltradas.length === 0 && (
          <div className="no-results">
            <p>No se encontraron clases</p>
          </div>
        )}
      </div>

      {/* Modal de creación/edición */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modoEdicion ? 'Editar Clase' : 'Nueva Clase'}</h2>
              <button className="btn-close" onClick={cerrarModal}>✖</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre de la Clase *</label>
                <input 
                  type="text" 
                  value={claseForm.nombre}
                  onChange={(e) => setClaseForm({...claseForm, nombre: e.target.value})}
                  placeholder="Ej: Spinning Avanzado"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea 
                  value={claseForm.descripcion}
                  onChange={(e) => setClaseForm({...claseForm, descripcion: e.target.value})}
                  placeholder="Descripción de la clase..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Instructor (opcional)</label>
                <select 
                  value={claseForm.instructor}
                  onChange={(e) => setClaseForm({...claseForm, instructor: e.target.value})}
                >
                  <option value="">Sin instructor asignado</option>
                  {instructores.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.usuario_nombre || inst.nombre || `Instructor ${inst.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha *</label>
                  <input 
                    type="date" 
                    value={claseForm.fecha}
                    onChange={(e) => setClaseForm({...claseForm, fecha: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Hora Inicio *</label>
                  <input 
                    type="time" 
                    value={claseForm.hora_inicio}
                    onChange={(e) => setClaseForm({...claseForm, hora_inicio: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Hora Fin *</label>
                  <input 
                    type="time" 
                    value={claseForm.hora_fin}
                    onChange={(e) => setClaseForm({...claseForm, hora_fin: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cupos Totales *</label>
                  <input 
                    type="number" 
                    min="1"
                    max="100"
                    value={claseForm.cupos_totales}
                    onChange={(e) => setClaseForm({...claseForm, cupos_totales: parseInt(e.target.value)})}
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Clase *</label>
                  <select 
                    value={claseForm.tipo}
                    onChange={(e) => setClaseForm({...claseForm, tipo: e.target.value})}
                  >
                    <option value="spinning">Spinning</option>
                    <option value="yoga">Yoga</option>
                    <option value="pilates">Pilates</option>
                    <option value="musculacion">Musculación</option>
                    <option value="cardio">Cardio</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select 
                    value={claseForm.estado}
                    onChange={(e) => setClaseForm({...claseForm, estado: e.target.value})}
                  >
                    <option value="activa">Activa</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={claseForm.permite_lista_espera}
                    onChange={(e) => setClaseForm({...claseForm, permite_lista_espera: e.target.checked})}
                  />
                  Permitir lista de espera
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={cerrarModal}>Cancelar</button>
              <button className="btn-save" onClick={guardarClase}>
                {modoEdicion ? 'Guardar Cambios' : 'Crear Clase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminClases
