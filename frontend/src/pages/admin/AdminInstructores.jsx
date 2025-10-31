import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import './Admin.css'

function AdminInstructores() {
  const navigate = useNavigate()
  const [instructores, setInstructores] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [clases, setClases] = useState([])
  const [loading, setLoading] = useState(true)
  const [instructorSeleccionado, setInstructorSeleccionado] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)

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
  }

  const verDetalles = (instructor) => {
    setInstructorSeleccionado(instructor)
    setMostrarModal(true)
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
    return <div className="admin-container"><div className="loading">Cargando instructores...</div></div>
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🎓 Gestión de Instructores</h1>
        <button className="btn-back" onClick={() => navigate('/admin')}>← Volver al Dashboard</button>
      </div>

      {/* Grid de instructores */}
      <div className="instructores-grid">
        {instructores.map(instructor => {
          const stats = obtenerEstadisticas(instructor.id)
          const usuario = usuarios.find(u => u.id === instructor.usuario)

          return (
            <div key={instructor.id} className="instructor-card">
              <div className="instructor-header">
                <div className="instructor-avatar">🎓</div>
                <div className="instructor-info">
                  <h3>{instructor.usuario_nombre || usuario?.username || 'Instructor'}</h3>
                  <p className="instructor-email">{usuario?.email || ''}</p>
                </div>
              </div>

              <div className="instructor-stats">
                <div className="stat-item">
                  <span className="stat-label">Especialidades</span>
                  <span className="stat-value">{instructor.especialidades || 'N/A'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Clases Asignadas</span>
                  <span className="stat-value">{stats.totalClases}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Ocupación Promedio</span>
                  <span className="stat-value">{stats.promedioOcupacion}%</span>
                </div>
              </div>

              <div className="instructor-actions">
                <button 
                  className="btn-details" 
                  onClick={() => verDetalles(instructor)}
                >
                  Ver Detalles
                </button>
              </div>
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
    </div>
  )
}

export default AdminInstructores
