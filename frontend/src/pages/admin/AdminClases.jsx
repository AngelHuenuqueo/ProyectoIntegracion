import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Toast from '../../components/Toast'
import ConfirmModal from '../../components/ConfirmModal'
import AdminLayout from './AdminLayout'
import './Admin.css'

function AdminClases() {
  const navigate = useNavigate()
  const [clases, setClases] = useState([])
  const [instructores, setInstructores] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false)
  const [claseAEliminar, setClaseAEliminar] = useState(null)
  const [imagenFile, setImagenFile] = useState(null)
  const [imagenPreview, setImagenPreview] = useState(null)

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
    permite_lista_espera: true,
    imagen: null
  })

  const verificarPermiso = useCallback(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user.rol !== 'administrador') {
        setToast({ show: true, message: '⚠️ No tienes permisos para acceder a esta sección', type: 'warning' })
        navigate('/clases')
      }
    }
  }, [navigate])

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true)
      // Obtener TODAS las clases sin paginación
      const clasesRes = await api.get('/clases/admin-all/')
      const clasesData = clasesRes.data || []
      const clasesOrdenadas = clasesData.sort((a, b) => b.id - a.id)
      setClases(clasesOrdenadas)

      const instRes = await api.get('/instructores/')
      const instData = instRes.data.results || instRes.data || []
      setInstructores(instData)
    } catch (error) {
      console.error('Error cargando datos:', error)
      setToast({ show: true, message: '❌ Error al cargar los datos', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    verificarPermiso()
    cargarDatos()
  }, [verificarPermiso, cargarDatos])

  const filtrarClases = () => {
    const clasesFiltradas = clases.filter(clase => {
      const termino = busqueda.toLowerCase()
      return (
        clase.nombre?.toLowerCase().includes(termino) ||
        clase.descripcion?.toLowerCase().includes(termino) ||
        clase.instructor_nombre?.toLowerCase().includes(termino) ||
        (clase.nivel || '').toLowerCase().includes(termino)
      )
    })
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
      permite_lista_espera: true,
      imagen: null
    })
    setImagenFile(null)
    setImagenPreview(null)
    setMostrarModal(true)
  }

  const abrirModalEdicion = (clase) => {
    setModoEdicion(true)
    // Truncar horas a HH:MM (el input time no acepta segundos)
    const horaInicio = clase.hora_inicio ? clase.hora_inicio.substring(0, 5) : ''
    const horaFin = clase.hora_fin ? clase.hora_fin.substring(0, 5) : ''

    setClaseForm({
      id: clase.id,
      nombre: clase.nombre,
      descripcion: clase.descripcion || '',
      instructor: clase.instructor || '',
      fecha: clase.fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      cupos_totales: clase.cupos_totales,
      tipo: clase.tipo || 'spinning',
      estado: clase.estado || 'activa',
      permite_lista_espera: clase.permite_lista_espera,
      imagen: clase.imagen
    })
    setImagenFile(null)
    setImagenPreview(clase.imagen || null)
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
      permite_lista_espera: true,
      imagen: null
    })
    setImagenFile(null)
    setImagenPreview(null)
  }

  const validarYMostrarConfirmacion = () => {
    if (!claseForm.nombre || !claseForm.fecha || !claseForm.hora_inicio || !claseForm.hora_fin) {
      setToast({ show: true, message: '⚠️ Por favor completa todos los campos obligatorios', type: 'warning' })
      return
    }
    setMostrarModal(false)
    setMostrarConfirmacion(true)
  }

  const guardarClase = async () => {
    try {
      setMostrarConfirmacion(false)

      // Usar FormData para enviar imagen
      const formData = new FormData()
      formData.append('nombre', claseForm.nombre)
      formData.append('tipo', claseForm.tipo)
      formData.append('descripcion', claseForm.descripcion)
      formData.append('fecha', claseForm.fecha)
      formData.append('hora_inicio', claseForm.hora_inicio)
      formData.append('hora_fin', claseForm.hora_fin)
      formData.append('cupos_totales', parseInt(claseForm.cupos_totales))
      formData.append('estado', claseForm.estado)
      formData.append('permite_lista_espera', claseForm.permite_lista_espera)

      if (claseForm.instructor) {
        formData.append('instructor', parseInt(claseForm.instructor))
      }

      // Agregar imagen si hay una nueva
      if (imagenFile) {
        formData.append('imagen', imagenFile)
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      }

      if (modoEdicion) {
        await api.put(`/clases/${claseForm.id}/`, formData, config)
        setToast({ show: true, message: '✅ Clase actualizada exitosamente', type: 'success' })
      } else {
        await api.post('/clases/', formData, config)
        setToast({ show: true, message: '✅ Clase creada exitosamente', type: 'success' })
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

      setToast({ show: true, message: `❌ ${errorMsg}`, type: 'error' })
      setMostrarModal(true)
    }
  }

  const cancelarConfirmacion = () => {
    setMostrarConfirmacion(false)
    setMostrarModal(true)
  }

  const handleImagenChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagenFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagenPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const eliminarImagen = () => {
    setImagenFile(null)
    setImagenPreview(null)
    setClaseForm({ ...claseForm, imagen: null })
  }

  const mostrarModalEliminar = (clase) => {
    setClaseAEliminar(clase)
    setMostrarConfirmacionEliminar(true)
  }

  const confirmarEliminarClase = async () => {
    setMostrarConfirmacionEliminar(false)
    try {
      await api.delete(`/clases/${claseAEliminar.id}/`)
      setToast({ show: true, message: '✅ Clase eliminada exitosamente', type: 'success' })
      cargarDatos()
    } catch (error) {
      console.error('Error eliminando clase:', error)
      setToast({ show: true, message: '❌ Error al eliminar la clase', type: 'error' })
    } finally {
      setClaseAEliminar(null)
    }
  }

  const formatearHora = (hora) => {
    if (!hora) return ''
    return hora.substring(0, 5)
  }

  const clasesFiltradas = filtrarClases()

  if (loading) {
    return (
      <AdminLayout title="🏋️ Gestión de Clases" subtitle="Administración de clases del gimnasio">
        <div className="loading">Cargando clases...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="🏋️ Gestión de Clases" subtitle="Administración de clases del gimnasio">

      <div className="classes-toolbar">
        <div className="search-container">
          <span className="search-icon-abs">🔍</span>
          <input
            type="text"
            placeholder="Buscar clase, instructor o nivel..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input-premium"
          />
        </div>

        <button className="btn-new-class" onClick={abrirModalNuevo}>
          <span>⚡</span> Nueva Clase
        </button>
      </div>

      <div className="filter-stats" style={{ marginBottom: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
        Mostrando <strong>{clasesFiltradas.length}</strong> sesiones programadas
      </div>

      <div className="table-premium-container">
        <table className="table-premium">
          <thead>
            <tr>
              <th>Clase</th>
              <th>Instructor</th>
              <th>Horario</th>
              <th>Cupos</th>
              <th>Nivel</th>
              <th>Tipo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clasesFiltradas.map(clase => {
              const ocupacion = clase.cupos_totales - clase.cupos_disponibles
              const porcentaje = (ocupacion / clase.cupos_totales) * 100

              let cupoClass = 'bajo'
              if (porcentaje >= 100) cupoClass = 'lleno'
              else if (porcentaje > 80) cupoClass = 'alto'
              else if (porcentaje > 50) cupoClass = 'medio'

              return (
                <tr key={clase.id} className={`row-accent-${(clase.tipo || 'spinning').toLowerCase()}`}>
                  <td>
                    <div className="cell-info">
                      <h4>{clase.nombre}</h4>
                      {clase.descripcion && (
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#94a3b8',
                          marginTop: '4px',
                          lineHeight: '1.3'
                        }}>
                          {clase.descripcion.length > 35
                            ? clase.descripcion.substring(0, 35) + '...'
                            : clase.descripcion}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="instructor-cell">
                      <div className="instructor-avatar-mini">
                        {(clase.instructor_nombre || 'S').charAt(0).toUpperCase()}
                      </div>
                      <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>
                        {clase.instructor_nombre || <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Sin asignar</span>}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{new Date(clase.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      <span className="cell-time">
                        {formatearHora(clase.hora_inicio)} - {formatearHora(clase.hora_fin)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ minWidth: '100px' }}>
                      <span className={`cupos-text cupo-${cupoClass}`}>
                        {clase.cupos_disponibles === 0 ? 'AGOTADO' : `${clase.cupos_disponibles} Libres`}
                      </span>
                      <div className="cupos-visual">
                        <div
                          className={`cupos-bar bar-${cupoClass}`}
                          style={{ width: `${porcentaje}%` }}
                        ></div>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Capacidad: {clase.cupos_totales}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge-neon ${(clase.nivel || 'intermedio').toLowerCase()}`}>
                      {clase.nivel || 'INTERMEDIO'}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      color: '#cbd5e1',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {clase.tipo || 'SPINNING'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-new">
                      <button
                        className="btn-action-new edit"
                        onClick={() => abrirModalEdicion(clase)}
                        title="Editar clase"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-action-new delete"
                        onClick={() => mostrarModalEliminar(clase)}
                        title="Eliminar clase"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {clasesFiltradas.length === 0 && (
          <div className="no-results" style={{ marginTop: '2rem' }}>
            <p>No se encontraron clases programadas</p>
          </div>
        )}
      </div>

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
                  onChange={(e) => setClaseForm({ ...claseForm, nombre: e.target.value })}
                  placeholder="Ej: Spinning Avanzado"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={claseForm.descripcion}
                  onChange={(e) => setClaseForm({ ...claseForm, descripcion: e.target.value })}
                  placeholder="Descripción de la clase..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Instructor (opcional)</label>
                <select
                  value={claseForm.instructor}
                  onChange={(e) => setClaseForm({ ...claseForm, instructor: e.target.value })}
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
                    onChange={(e) => setClaseForm({ ...claseForm, fecha: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Hora Inicio *</label>
                  <input
                    type="time"
                    value={claseForm.hora_inicio}
                    onChange={(e) => setClaseForm({ ...claseForm, hora_inicio: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Hora Fin *</label>
                  <input
                    type="time"
                    value={claseForm.hora_fin}
                    onChange={(e) => setClaseForm({ ...claseForm, hora_fin: e.target.value })}
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
                    onChange={(e) => setClaseForm({ ...claseForm, cupos_totales: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Clase *</label>
                  <select
                    value={claseForm.tipo}
                    onChange={(e) => setClaseForm({ ...claseForm, tipo: e.target.value })}
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
                    onChange={(e) => setClaseForm({ ...claseForm, estado: e.target.value })}
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
                    onChange={(e) => setClaseForm({ ...claseForm, permite_lista_espera: e.target.checked })}
                  />
                  Permitir lista de espera
                </label>
              </div>

              {/* Sección de Imagen */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}>
                <h4 style={{ 
                  color: '#a78bfa', 
                  marginBottom: '1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontSize: '0.95rem'
                }}>
                  🖼️ Imagen de la Clase (opcional)
                </h4>

                {imagenPreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={imagenPreview}
                      alt="Preview"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid rgba(139, 92, 246, 0.5)'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <label style={{
                        cursor: 'pointer',
                        background: 'rgba(139, 92, 246, 0.2)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        color: '#a78bfa',
                        fontSize: '0.85rem',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        transition: 'all 0.2s ease'
                      }}>
                        📷 Cambiar
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImagenChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={eliminarImagen}
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          color: '#f87171',
                          fontSize: '0.85rem',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    border: '2px dashed rgba(139, 92, 246, 0.4)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: 'rgba(139, 92, 246, 0.05)'
                  }}>
                    <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</span>
                    <span style={{ color: '#a78bfa', fontSize: '0.9rem' }}>Haz clic para subir una imagen</span>
                    <span style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '4px' }}>PNG, JPG, WEBP (máx. 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagenChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={cerrarModal}>Cancelar</button>
              <button className="btn-save" onClick={validarYMostrarConfirmacion}>
                {modoEdicion ? 'Guardar Cambios' : 'Crear Clase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {mostrarConfirmacion && (
        <ConfirmModal
          title={modoEdicion ? 'Confirmar Cambios' : 'Confirmar Creación'}
          message={modoEdicion
            ? `¿Estás seguro de guardar los cambios en la clase "${claseForm.nombre}"?`
            : `¿Estás seguro de crear la clase "${claseForm.nombre}"?`}
          type="info"
          onConfirm={guardarClase}
          onCancel={cancelarConfirmacion}
        />
      )}

      {mostrarConfirmacionEliminar && claseAEliminar && (
        <ConfirmModal
          title="¡Confirmar Eliminación!"
          message={`¿Estás SEGURO de ELIMINAR la clase "${claseAEliminar.nombre}"?

Se eliminarán también todas las reservas asociadas.`}
          type="danger"
          onConfirm={confirmarEliminarClase}
          onCancel={() => {
            setMostrarConfirmacionEliminar(false)
            setClaseAEliminar(null)
          }}
        />
      )}
    </AdminLayout>
  )
}

export default AdminClases
