import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Toast from '../../components/Toast'
import ConfirmModal from '../../components/ConfirmModal'
import './Admin.css'

function AdminAsistencia() {
  const navigate = useNavigate()
  const [clases, setClases] = useState([])
  const [claseSeleccionada, setClaseSeleccionada] = useState(null)
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [seleccionadas, setSeleccionadas] = useState(new Set())
  const [filtro, setFiltro] = useState('pasadas') // pasadas, hoy, todas
  const [toast, setToast] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  useEffect(() => {
    verificarPermiso()
    cargarClases()
  }, [filtro])

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

  const cargarClases = async () => {
    try {
      setLoading(true)
      const res = await api.get('/clases/')
      const clasesData = res.data.results || res.data || []
      
      const hoy = new Date().toISOString().split('T')[0]
      const ahora = new Date()
      
      let clasesFiltradas = clasesData
      
      if (filtro === 'pasadas') {
        // Clases que ya pasaron
        clasesFiltradas = clasesData.filter(c => {
          const fechaClase = new Date(c.fecha + 'T' + c.hora_fin)
          return fechaClase < ahora
        })
      } else if (filtro === 'hoy') {
        clasesFiltradas = clasesData.filter(c => c.fecha === hoy)
      }
      
      setClases(clasesFiltradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)))
    } catch (error) {
      console.error('Error cargando clases:', error)
      alert('Error al cargar las clases')
    } finally {
      setLoading(false)
    }
  }

  const cargarReservas = async (claseId) => {
    try {
      const res = await api.get(`/reservas/clase_asistencia/?clase_id=${claseId}`)
      setReservas(res.data || [])
      setClaseSeleccionada(clases.find(c => c.id === claseId))
      setSeleccionadas(new Set())
    } catch (error) {
      console.error('Error cargando reservas:', error)
      alert('Error al cargar las reservas')
    }
  }

  const toggleSeleccion = (reservaId) => {
    const nuevas = new Set(seleccionadas)
    if (nuevas.has(reservaId)) {
      nuevas.delete(reservaId)
    } else {
      nuevas.add(reservaId)
    }
    setSeleccionadas(nuevas)
  }

  const seleccionarTodas = () => {
    const confirmadas = reservas.filter(r => r.estado === 'confirmada')
    setSeleccionadas(new Set(confirmadas.map(r => r.id)))
  }

  const marcarAsistencia = async (reservaId) => {
    try {
      await api.post(`/reservas/${reservaId}/marcar_asistencia/`)
      showToast('✅ Marcado como PRESENTE', 'success')
      cargarReservas(claseSeleccionada.id)
    } catch (error) {
      console.error('Error:', error)
      showToast(error.response?.data?.error || 'Error al marcar asistencia', 'error')
    }
  }

  const marcarNoShow = async (reservaId) => {
    setConfirmModal({
      message: '¿Estás seguro de marcar como AUSENTE? Esto afectará el historial del socio.',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(null)
        try {
          const res = await api.post(`/reservas/${reservaId}/marcar_noshow/`)
          
          let mensaje = '❌ Marcado como AUSENTE'
          let tipo = 'warning'
          
          if (res.data.bloqueado) {
            mensaje += '\n⚠️ El usuario ha sido BLOQUEADO por 30 días'
            tipo = 'error'
          } else if (res.data.total_noshow_mes >= 2) {
            mensaje += `\n⚠️ ADVERTENCIA: ${res.data.total_noshow_mes}/3 ausencias este mes`
          }
          
          showToast(mensaje, tipo)
          cargarReservas(claseSeleccionada.id)
        } catch (error) {
          console.error('Error:', error)
          showToast(error.response?.data?.error || 'Error al marcar ausencia', 'error')
        }
      }
    })
  }

  const marcarAsistenciaMasiva = async () => {
    if (seleccionadas.size === 0) {
      showToast('Selecciona al menos una reserva', 'warning')
      return
    }
    
    setConfirmModal({
      message: `¿Marcar asistencia para ${seleccionadas.size} reservas?`,
      type: 'info',
      onConfirm: async () => {
        setConfirmModal(null)
        try {
          await api.post('/reservas/marcar_asistencia_masiva/', {
            clase_id: claseSeleccionada.id,
            reservas_ids: Array.from(seleccionadas)
          })
          
          showToast(`✅ ${seleccionadas.size} personas marcadas como PRESENTES`, 'success')
          setSeleccionadas(new Set())
          cargarReservas(claseSeleccionada.id)
        } catch (error) {
          console.error('Error:', error)
          showToast('Error al marcar asistencias', 'error')
        }
      }
    })
  }

  const marcarTodasAsistencia = async () => {
    const confirmadas = reservas.filter(r => r.estado === 'confirmada').length
    
    if (confirmadas === 0) {
      showToast('No hay reservas confirmadas para marcar', 'warning')
      return
    }
    
    setConfirmModal({
      message: `¿Marcar TODAS las reservas confirmadas (${confirmadas}) como asistieron?`,
      type: 'warning',
      onConfirm: async () => {
        setConfirmModal(null)
        try {
          const res = await api.post('/reservas/marcar_asistencia_masiva/', {
            clase_id: claseSeleccionada.id,
            todas: true
          })
          
          showToast(`✅ ${res.data.count} personas marcadas como PRESENTES`, 'success')
          setSeleccionadas(new Set())
          cargarReservas(claseSeleccionada.id)
        } catch (error) {
          console.error('Error:', error)
          showToast('Error al marcar asistencias', 'error')
        }
      }
    })
  }

  if (loading) {
    return <div className="admin-container"><div className="loading">Cargando...</div></div>
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>✅ Control de Asistencia</h1>
          <p>Marcar presentes y ausentes de las clases</p>
        </div>
        <div className="header-actions">
          <button className="btn-back" onClick={() => navigate('/admin')}>← Volver</button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-bar">
        <label style={{ fontWeight: '600' }}>Mostrar:</label>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="filter-select">
          <option value="pasadas">Clases Pasadas</option>
          <option value="hoy">Clases de Hoy</option>
          <option value="todas">Todas las Clases</option>
        </select>
        <span className="filter-stats">{clases.length} clases</span>
      </div>

      {/* Lista de Clases */}
      {!claseSeleccionada ? (
        <div className="table-container">
          <h3>Selecciona una clase para marcar asistencia</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Clase</th>
                <th>Hora</th>
                <th>Instructor</th>
                <th>Reservas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clases.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No hay clases {filtro === 'pasadas' ? 'pasadas' : filtro === 'hoy' ? 'hoy' : ''} disponibles
                  </td>
                </tr>
              ) : (
                clases.map(clase => (
                  <tr key={clase.id}>
                    <td>{clase.fecha}</td>
                    <td><strong>{clase.nombre}</strong></td>
                    <td>{clase.hora_inicio.substring(0,5)} - {clase.hora_fin.substring(0,5)}</td>
                    <td>{clase.instructor_nombre}</td>
                    <td>{clase.cupos_ocupados} / {clase.cupos_totales}</td>
                    <td>
                      <button
                        className="btn-primary"
                        onClick={() => cargarReservas(clase.id)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      >
                        Ver Reservas
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // Vista de reservas de la clase seleccionada
        <div>
          <div style={{ marginBottom: '1.5rem', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <button 
              onClick={() => {
                setClaseSeleccionada(null)
                setReservas([])
              }}
              style={{ marginBottom: '1rem', background: '#666', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              ← Volver a lista de clases
            </button>
            <h2>{claseSeleccionada.nombre}</h2>
            <p>📅 {claseSeleccionada.fecha} - ⏰ {claseSeleccionada.hora_inicio.substring(0,5)} - {claseSeleccionada.hora_fin.substring(0,5)}</p>
            <p>👤 {claseSeleccionada.instructor_nombre}</p>
            <p>Total reservas: {reservas.length}</p>
          </div>

          {/* Botones de acción masiva */}
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={seleccionarTodas}
              style={{ background: '#2196F3', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              ✓ Seleccionar Todas
            </button>
            <button
              onClick={marcarAsistenciaMasiva}
              disabled={seleccionadas.size === 0}
              style={{ background: seleccionadas.size === 0 ? '#ccc' : '#4CAF50', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', cursor: seleccionadas.size === 0 ? 'not-allowed' : 'pointer', fontWeight: '600' }}
            >
              ✅ Marcar Seleccionadas ({seleccionadas.size})
            </button>
            <button
              onClick={marcarTodasAsistencia}
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              ✅ Marcar TODAS como Asistencia
            </button>
          </div>

          {/* Tabla de reservas */}
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={seleccionadas.size === reservas.filter(r => r.estado === 'confirmada').length && reservas.filter(r => r.estado === 'confirmada').length > 0}
                      onChange={seleccionarTodas}
                    />
                  </th>
                  <th>Socio</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservas.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay reservas para esta clase
                    </td>
                  </tr>
                ) : (
                  reservas.map(reserva => (
                    <tr key={reserva.id} style={{ 
                      background: reserva.estado === 'completada' ? '#e8f5e9' : 
                                 reserva.estado === 'noshow' ? '#ffebee' :
                                 reserva.estado === 'cancelada' ? '#f5f5f5' : 'white'
                    }}>
                      <td>
                        {reserva.estado === 'confirmada' && (
                          <input
                            type="checkbox"
                            checked={seleccionadas.has(reserva.id)}
                            onChange={() => toggleSeleccion(reserva.id)}
                          />
                        )}
                      </td>
                      <td>
                        <strong>{reserva.socio?.first_name} {reserva.socio?.last_name}</strong>
                      </td>
                      <td>{reserva.socio?.email}</td>
                      <td>
                        <span className={`badge-estado ${reserva.estado}`}>
                          {reserva.estado === 'confirmada' && '🕐 Confirmada'}
                          {reserva.estado === 'completada' && '✅ Presente'}
                          {reserva.estado === 'noshow' && '❌ Ausente'}
                          {reserva.estado === 'cancelada' && '🚫 Cancelada'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {reserva.estado === 'confirmada' && (
                            <>
                              <button
                                className="btn-edit"
                                onClick={() => marcarAsistencia(reserva.id)}
                                title="Marcar como presente"
                              >
                                ✅
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => marcarNoShow(reserva.id)}
                                title="Marcar como ausente"
                              >
                                ❌
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          type={confirmModal.type}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  )
}

export default AdminAsistencia
