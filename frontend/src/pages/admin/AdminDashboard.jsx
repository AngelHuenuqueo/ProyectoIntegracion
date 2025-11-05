import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import './Admin.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalSocios: 0,
    totalInstructores: 0,
    totalClases: 0,
    clasesHoy: 0,
    reservasMes: 0,
    reservasHoy: 0,
    ocupacionPromedio: 0
  })
  const [usuarios, setUsuarios] = useState([])
  const [clases, setClases] = useState([])
  const [reservas, setReservas] = useState([])

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
      
      const usuariosRes = await api.get('/usuarios/')
      const usuariosData = usuariosRes.data.results || usuariosRes.data || []
      setUsuarios(usuariosData)

      const clasesRes = await api.get('/clases/')
      const clasesData = clasesRes.data.results || clasesRes.data || []
      setClases(clasesData)

      const reservasRes = await api.get('/reservas/')
      const reservasData = reservasRes.data.results || reservasRes.data || []
      setReservas(reservasData)

      calcularEstadisticas(usuariosData, clasesData, reservasData)
    } catch (error) {
      console.error('Error cargando datos:', error)
      alert('Error al cargar los datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  const calcularEstadisticas = (usuarios, clases, reservas) => {
    const hoy = new Date().toISOString().split('T')[0]
    const mesActual = new Date().getMonth()
    const añoActual = new Date().getFullYear()

    const socios = usuarios.filter(u => u.rol === 'socio')
    const instructores = usuarios.filter(u => u.rol === 'instructor')
    const clasesHoy = clases.filter(c => c.fecha === hoy)
    
    const reservasMes = reservas.filter(r => {
      if (!r.fecha_reserva) return false
      const fecha = new Date(r.fecha_reserva)
      return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual
    })

    const reservasHoy = reservas.filter(r => {
      if (!r.clase?.fecha) return false
      return r.clase.fecha === hoy
    })

    let totalOcupacion = 0
    let clasesConReservas = 0
    clases.forEach(clase => {
      const reservasClase = reservas.filter(r => r.clase?.id === clase.id && r.estado === 'confirmada')
      if (clase.cupos_totales > 0) {
        totalOcupacion += (reservasClase.length / clase.cupos_totales) * 100
        clasesConReservas++
      }
    })

    setStats({
      totalUsuarios: usuarios.length,
      totalSocios: socios.length,
      totalInstructores: instructores.length,
      totalClases: clases.length,
      clasesHoy: clasesHoy.length,
      reservasMes: reservasMes.length,
      reservasHoy: reservasHoy.length,
      ocupacionPromedio: clasesConReservas > 0 ? (totalOcupacion / clasesConReservas).toFixed(1) : 0
    })
  }

  if (loading) {
    return (
      <div className="admin-layout-no-sidebar">
        <div className="admin-main-full">
          <div className="loading">Cargando dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-layout-no-sidebar">
      <div className="admin-main-full">
        <div className="admin-top-header">
          <div className="header-content">
            <div className="header-title-section">
              <h1 className="dashboard-title">Dashboard Gimnasio</h1>
              <p className="dashboard-subtitle">Estado actual del gimnasio y actividad de socios</p>
            </div>
            <div className="header-actions">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Buscar socio, clase o pago..." />
              </div>
              <button className="notification-btn">
                <span className="notification-icon">🔔</span>
                <span className="notification-badge">3</span>
              </button>
              <div className="user-menu">
                <div className="user-avatar">A</div>
                <div className="user-info">
                  <span className="user-name">Angel</span>
                  <span className="user-role">SUPERADMIN</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="main-content">
            <div className="stats-row">
              <div className="stat-card-modern">
                <div className="stat-icon-modern orange">🏋️</div>
                <div className="stat-details">
                  <span className="stat-label">SOCIOS ACTIVOS</span>
                  <div className="stat-value-row">
                    <h2 className="stat-number">{stats.totalSocios}</h2>
                    <span className="stat-badge positive">+7 nuevos hoy</span>
                  </div>
                  <p className="stat-description">Membresía al día</p>
                </div>
              </div>

              <div className="stat-card-modern">
                <div className="stat-icon-modern red">💵</div>
                <div className="stat-details">
                  <span className="stat-label">MOROSOS</span>
                  <div className="stat-value-row">
                    <h2 className="stat-number">23</h2>
                    <span className="stat-badge negative">-4</span>
                  </div>
                  <p className="stat-description">Pago vencido & acceso bloqueado</p>
                </div>
              </div>

              <div className="stat-card-modern">
                <div className="stat-icon-modern blue">💰</div>
                <div className="stat-details">
                  <span className="stat-label">INGRESOS DE HOY</span>
                  <div className="stat-value-row">
                    <h2 className="stat-number">$410.000 CLP</h2>
                    <span className="stat-badge positive">+12%</span>
                  </div>
                  <p className="stat-description">Ventas de planes y pases diarios</p>
                </div>
              </div>

              <div className="stat-card-modern">
                <div className="stat-icon-modern purple">📊</div>
                <div className="stat-details">
                  <span className="stat-label">OCUPACIÓN CLASES</span>
                  <div className="stat-value-row">
                    <h2 className="stat-number">{stats.ocupacionPromedio}%</h2>
                    <span className="stat-badge positive">+3%</span>
                  </div>
                  <p className="stat-description">Promedio últimas 24h</p>
                </div>
              </div>
            </div>

            <div className="table-section">
              <div className="table-header">
                <div>
                  <h3>Socios recientes</h3>
                  <p>Últimos registros / renovaciones de plan</p>
                </div>
                <div className="table-actions">
                  <button className="btn-success" onClick={() => navigate('/admin/usuarios')}>
                    + Nuevo Socio
                  </button>
                  <button className="btn-secondary">Sincronizar</button>
                </div>
              </div>

              <div className="modern-table">
                <table>
                  <thead>
                    <tr>
                      <th>NOMBRE</th>
                      <th>PLAN</th>
                      <th>ESTADO</th>
                      <th>ÚLTIMO ACCESO</th>
                      <th>PAGO HASTA</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.filter(u => u.rol === 'socio').slice(0, 4).map((usuario, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-small">{usuario.first_name?.[0] || usuario.username[0]}</div>
                            <span>{usuario.first_name} {usuario.last_name || usuario.username}</span>
                          </div>
                        </td>
                        <td>
                          <span className="plan-badge">PLAN FULL 24H</span>
                        </td>
                        <td>
                          <span className="status-badge active">● Activo</span>
                        </td>
                        <td>31/10/2025 20:41 (GYM)</td>
                        <td>30/11/2025</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-view" onClick={() => navigate(`/admin/usuarios`)}>Ver Perfil</button>
                            <button className="btn-suspend">Suspender</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="quick-actions-panel">
            <div className="actions-header">
              <h3>Acciones rápidas</h3>
              <p>Atajos para el superadmin del gimnasio</p>
            </div>

            <div className="action-card" onClick={() => navigate('/admin/clases')}>
              <div className="action-icon-badge green">🎓</div>
              <div className="action-content">
                <h4>Programar nueva clase grupal</h4>
                <p>Agrega Zumba, Funcional, Spinning, etc. Define cupos y coach.</p>
              </div>
              <span className="action-tag">CLASE</span>
            </div>

            <div className="action-card" onClick={() => navigate('/admin/instructores')}>
              <div className="action-icon-badge blue">👤</div>
              <div className="action-content">
                <h4>Asignar entrenador personal</h4>
                <p>Vincula un entrenador a un socio o plan premium.</p>
              </div>
              <span className="action-tag">PT</span>
            </div>

            <div className="action-card" onClick={() => navigate('/admin/usuarios')}>
              <div className="action-icon-badge red">🚫</div>
              <div className="action-content">
                <h4>Bloquear acceso por deuda</h4>
                <p>Marca moroso y desactiva QR/torniquete automáticamente.</p>
              </div>
              <span className="action-tag">ACCESO</span>
            </div>

            <div className="action-card" onClick={() => navigate('/admin/reportes')}>
              <div className="action-icon-badge yellow">📊</div>
              <div className="action-content">
                <h4>Reportar máquina en mal estado</h4>
                <p>Cinta, bici, etc. Queda como "No usar" en la sala.</p>
              </div>
              <span className="action-tag">MANTENCIÓN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
