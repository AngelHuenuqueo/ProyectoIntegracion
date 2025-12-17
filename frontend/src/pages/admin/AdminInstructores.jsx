import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import AdminLayout from './AdminLayout'
import './Admin.css'

function AdminInstructores() {
  const navigate = useNavigate()
  const [instructores, setInstructores] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [clases, setClases] = useState([])
  const [loading, setLoading] = useState(true)
  const [instructorSeleccionado, setInstructorSeleccionado] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modalCrear, setModalCrear] = useState(false)
  const [nuevoInstructor, setNuevoInstructor] = useState({
    usuario: '',
    especialidades: '',
    certificaciones: '',
    biografia: ''
  })

  const verificarPermiso = useCallback(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user.rol !== 'administrador') {
        alert('No tienes permisos para acceder a esta sección')
        navigate('/clases')
      }
    }
  }, [navigate])

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true)

      const [instRes, userRes, clasesRes] = await Promise.all([
        api.get('/instructores/'),
        api.get('/usuarios/'),
        api.get('/clases/')
      ])

      setInstructores(instRes.data.results || instRes.data || [])
      setUsuarios(userRes.data.results || userRes.data || [])
      setClases(clasesRes.data.results || clasesRes.data || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
      alert('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    verificarPermiso()
    cargarDatos()
  }, [verificarPermiso, cargarDatos])

  const verDetalles = (instructor) => {
    setInstructorSeleccionado(instructor)
    setMostrarModal(true)
  }

  const abrirModalCrear = () => {
    setNuevoInstructor({
      usuario: '',
      especialidades: '',
      certificaciones: '',
      biografia: ''
    })
    setModalCrear(true)
  }

  const cerrarModalCrear = () => {
    setModalCrear(false)
    setNuevoInstructor({
      usuario: '',
      especialidades: '',
      certificaciones: '',
      biografia: ''
    })
  }

  const crearInstructor = async () => {
    try {
      if (!nuevoInstructor.usuario) {
        alert('Debes seleccionar un usuario')
        return
      }

      if (!nuevoInstructor.especialidades.trim()) {
        alert('Debes ingresar al menos una especialidad')
        return
      }

      await api.post('/instructores/', nuevoInstructor)
      alert('✅ Instructor creado exitosamente')
      cerrarModalCrear()
      cargarDatos()
    } catch (error) {
      console.error('Error creando instructor:', error)
      alert(error.response?.data?.detail || 'Error al crear instructor')
    }
  }

  const obtenerClasesInstructor = (instructorId) => {
    return clases.filter(c => c.instructor === instructorId)
  }

  const obtenerEstadisticas = (instructorId) => {
    const clasesInst = obtenerClasesInstructor(instructorId)
    const totalClases = clasesInst.length
    const totalCupos = clasesInst.reduce((sum, c) => sum + c.cupos_totales, 0)
    const cuposOcupados = clasesInst.reduce((sum, c) => sum + (c.cupos_totales - c.cupos_disponibles), 0)
    const promedioOcupacion = totalCupos > 0 ? ((cuposOcupados / totalCupos) * 100).toFixed(1) : 0

    return { totalClases, totalCupos, cuposOcupados, promedioOcupacion }
  }

  if (loading) {
    return (
      <AdminLayout title="🎓 Gestión de Instructores" subtitle="Ver y gestionar instructores del gimnasio">
        <div className="loading">Cargando instructores...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="🎓 Gestión de Instructores" subtitle="Ver y gestionar instructores del gimnasio">

      {/* Header con botón crear */}
      <div className="admin-page-header" style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem' }}>
          Instructores Registrados ({instructores.length})
        </h2>
        <button className="btn-primary" onClick={abrirModalCrear}>
          ➕ Crear Instructor
        </button>
      </div>

      {/* Grid de instructores */}
      <div className="instructores-grid-premium">
        {instructores.map(instructor => {
          const stats = obtenerEstadisticas(instructor.id)
          const usuario = usuarios.find(u => u.id === instructor.usuario)
          const ocupacion = parseFloat(stats.promedioOcupacion)

          // Determinar color según ocupación
          const getOcupacionColor = (pct) => {
            if (pct >= 70) return { color: '#22c55e', label: 'Excelente' }
            if (pct >= 40) return { color: '#eab308', label: 'Buena' }
            if (pct > 0) return { color: '#f97316', label: 'Regular' }
            return { color: '#64748b', label: 'Sin datos' }
          }

          const ocupacionInfo = getOcupacionColor(ocupacion)
          const initials = (instructor.usuario_nombre || usuario?.username || 'IN')
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)

          return (
            <div key={instructor.id} className="instructor-card-premium">
              {/* Fondo decorativo */}
              <div className="card-glow"></div>

              {/* Header con avatar y nombre */}
              <div className="instructor-header-premium">
                <div className="instructor-avatar-premium">
                  <span className="avatar-initials">{initials}</span>
                  <div className="avatar-ring"></div>
                </div>
                <div className="instructor-identity">
                  <h3 className="instructor-name">{instructor.usuario_nombre || usuario?.username || 'Instructor'}</h3>
                  <span className="instructor-role">
                    <span className="role-icon">🎯</span>
                    Instructor Certificado
                  </span>
                </div>
                <div className="instructor-status active">
                  <span className="status-dot"></span>
                  Activo
                </div>
              </div>

              {/* Especialidades */}
              <div className="instructor-especialidades">
                <div className="especialidades-label">
                  <span className="label-icon">💪</span>
                  Especialidades
                </div>
                <div className="especialidades-tags">
                  {(instructor.especialidades || 'General').split(',').map((esp, idx) => (
                    <span key={idx} className="especialidad-tag">
                      {esp.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="instructor-stats-premium">
                <div className="stat-box">
                  <div className="stat-icon-box blue">
                    <span>📚</span>
                  </div>
                  <div className="stat-info">
                    <span className="stat-number-premium">{stats.totalClases}</span>
                    <span className="stat-label-premium">Clases</span>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-icon-box green">
                    <span>👥</span>
                  </div>
                  <div className="stat-info">
                    <span className="stat-number-premium">{stats.cuposOcupados}</span>
                    <span className="stat-label-premium">Alumnos</span>
                  </div>
                </div>
              </div>

              {/* Barra de ocupación */}
              <div className="ocupacion-section">
                <div className="ocupacion-header">
                  <span className="ocupacion-label">Ocupación promedio</span>
                  <span className="ocupacion-value" style={{ color: ocupacionInfo.color }}>
                    {stats.promedioOcupacion}%
                  </span>
                </div>
                <div className="ocupacion-bar-container">
                  <div
                    className="ocupacion-bar-fill"
                    style={{
                      width: `${Math.min(ocupacion, 100)}%`,
                      background: `linear-gradient(90deg, ${ocupacionInfo.color}, ${ocupacionInfo.color}88)`
                    }}
                  ></div>
                </div>
                <span className="ocupacion-status" style={{ color: ocupacionInfo.color }}>
                  {ocupacionInfo.label}
                </span>
              </div>

              {/* Botón de acción */}
              <button
                className="btn-ver-perfil"
                onClick={() => verDetalles(instructor)}
              >
                <span>Ver Perfil Completo</span>
                <span className="btn-arrow">→</span>
              </button>
            </div>
          )
        })}
      </div>

      {instructores.length === 0 && (
        <div className="no-results">
          <p>No hay instructores registrados</p>
        </div>
      )}

      {/* Modal de detalles */}
      {mostrarModal && instructorSeleccionado && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Detalles del Instructor</h2>
              <button className="btn-close" onClick={() => setMostrarModal(false)}>✖</button>
            </div>

            <div className="modal-body">
              <div className="instructor-details">
                <h3>{instructorSeleccionado.usuario_nombre}</h3>
                <p><strong>Especialidades:</strong> {instructorSeleccionado.especialidades || 'N/A'}</p>
                <p><strong>Certificaciones:</strong> {instructorSeleccionado.certificaciones || 'N/A'}</p>
                <p><strong>Biografía:</strong> {instructorSeleccionado.biografia || 'No disponible'}</p>
              </div>

              <h3>Clases Asignadas</h3>
              <div className="clases-list">
                {obtenerClasesInstructor(instructorSeleccionado.id).length > 0 ? (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Clase</th>
                        <th>Fecha</th>
                        <th>Horario</th>
                        <th>Cupos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {obtenerClasesInstructor(instructorSeleccionado.id).map(clase => (
                        <tr key={clase.id}>
                          <td><strong>{clase.nombre}</strong></td>
                          <td>{new Date(clase.fecha).toLocaleDateString('es-ES')}</td>
                          <td>{clase.hora_inicio} - {clase.hora_fin}</td>
                          <td>{clase.cupos_totales - clase.cupos_disponibles}/{clase.cupos_totales}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-results">No tiene clases asignadas</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setMostrarModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Instructor */}
      {modalCrear && (
        <div className="modal-overlay" onClick={cerrarModalCrear}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Crear Nuevo Instructor</h2>
              <button className="btn-close" onClick={cerrarModalCrear}>✖</button>
            </div>

            <div className="modal-body">
              <div className="form-section">
                <div className="form-group">
                  <label>Usuario (debe tener rol instructor) *</label>
                  <select
                    value={nuevoInstructor.usuario}
                    onChange={(e) => setNuevoInstructor({ ...nuevoInstructor, usuario: e.target.value })}
                  >
                    <option value="">Seleccionar usuario...</option>
                    {usuarios
                      .filter(u => u.rol === 'instructor')
                      .filter(u => !instructores.some(i => i.usuario === u.id))
                      .map(usuario => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.first_name} {usuario.last_name} (@{usuario.username})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Especialidades *</label>
                  <input
                    type="text"
                    value={nuevoInstructor.especialidades}
                    onChange={(e) => setNuevoInstructor({ ...nuevoInstructor, especialidades: e.target.value })}
                    placeholder="Ej: Yoga, Pilates, Spinning"
                  />
                  <small>Separa con comas si son varias</small>
                </div>

                <div className="form-group">
                  <label>Certificaciones</label>
                  <input
                    type="text"
                    value={nuevoInstructor.certificaciones}
                    onChange={(e) => setNuevoInstructor({ ...nuevoInstructor, certificaciones: e.target.value })}
                    placeholder="Ej: Certificado NSCA, ACE Personal Trainer"
                  />
                </div>

                <div className="form-group">
                  <label>Biografía</label>
                  <textarea
                    value={nuevoInstructor.biografia}
                    onChange={(e) => setNuevoInstructor({ ...nuevoInstructor, biografia: e.target.value })}
                    placeholder="Breve descripción del instructor..."
                    rows="4"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={cerrarModalCrear}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={crearInstructor}>
                ✅ Crear Instructor
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminInstructores
