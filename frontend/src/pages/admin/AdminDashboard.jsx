import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import './Admin.css'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ChartDataLabels)

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
      
      // Cargar usuarios
      const usuariosRes = await api.get('/usuarios/')
      const usuariosData = usuariosRes.data.results || usuariosRes.data || []
      setUsuarios(usuariosData)

      // Cargar clases
      const clasesRes = await api.get('/clases/')
      const clasesData = clasesRes.data.results || clasesRes.data || []
      setClases(clasesData)

      // Cargar reservas
      const reservasRes = await api.get('/reservas/')
      const reservasData = reservasRes.data.results || reservasRes.data || []
      setReservas(reservasData)

      // Calcular estadísticas
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

    // Calcular ocupación promedio
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

  // Datos para gráfico de usuarios por rol
  const usuariosPorRol = {
    labels: ['Socios', 'Instructores', 'Administradores'],
    datasets: [{
      label: 'Usuarios por Rol',
      data: [
        usuarios.filter(u => u.rol === 'socio').length,
        usuarios.filter(u => u.rol === 'instructor').length,
        usuarios.filter(u => u.rol === 'administrador').length
      ],
      backgroundColor: [
        'rgba(220, 38, 38, 0.9)',    // Rojo brillante
        'rgba(245, 158, 11, 0.9)',    // Naranja
        'rgba(147, 51, 234, 0.9)'     // Púrpura
      ],
      borderWidth: 3,
      borderColor: '#000000',
      hoverBackgroundColor: [
        'rgba(220, 38, 38, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(147, 51, 234, 1)'
      ],
      hoverBorderWidth: 4,
      hoverBorderColor: '#FFFFFF'
    }]
  }

  // Datos para gráfico de reservas por estado
  const reservasPorEstado = {
    labels: ['Confirmadas', 'Canceladas', 'No Show', 'Completadas'],
    datasets: [{
      label: 'Reservas por Estado',
      data: [
        reservas.filter(r => r.estado === 'confirmada').length,
        reservas.filter(r => r.estado === 'cancelada').length,
        reservas.filter(r => r.estado === 'noshow').length,
        reservas.filter(r => r.estado === 'completada').length
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.9)',     // Verde
        'rgba(239, 68, 68, 0.9)',     // Rojo
        'rgba(251, 191, 36, 0.9)',    // Amarillo
        'rgba(59, 130, 246, 0.9)'     // Azul
      ],
      borderWidth: 3,
      borderColor: '#000000',
      hoverBackgroundColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(251, 191, 36, 1)',
        'rgba(59, 130, 246, 1)'
      ],
      hoverBorderWidth: 4,
      hoverBorderColor: '#FFFFFF'
    }]
  }

  // Datos para gráfico de clases más populares
  const getClasesPopulares = () => {
    const clasesConReservas = clases.map(clase => ({
      nombre: clase.nombre,
      reservas: reservas.filter(r => r.clase?.id === clase.id && r.estado === 'confirmada').length
    }))
    .sort((a, b) => b.reservas - a.reservas)
    .slice(0, 5)

    return {
      labels: clasesConReservas.map(c => c.nombre),
      datasets: [{
        label: 'Número de Reservas',
        data: clasesConReservas.map(c => c.reservas),
        backgroundColor: [
          'rgba(220, 38, 38, 0.9)',
          'rgba(245, 158, 11, 0.9)',
          'rgba(34, 197, 94, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(147, 51, 234, 0.9)'
        ],
        borderColor: [
          'rgba(220, 38, 38, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(147, 51, 234, 1)'
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(220, 38, 38, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(147, 51, 234, 1)'
        ]
      }]
    }
  }

  if (loading) {
    return <div className="admin-container"><div className="loading">Cargando dashboard...</div></div>
  }

  return (
    <div className="admin-container">
      {/* HEADER PRINCIPAL */}
      <div className="admin-header">
        <div>
          <h1>PANEL DE <span>ADMINISTRACIÓN</span></h1>
          <p>Dashboard ejecutivo - Energía Total Gym</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate('/admin/reportes')}>
            📊 VER REPORTES COMPLETOS
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: ESTADÍSTICAS PRINCIPALES */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">📈 MÉTRICAS CLAVE</h2>
          <p className="section-subtitle">Rendimiento en tiempo real</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{stats.totalUsuarios}</h3>
              <p>Total Usuarios</p>
              <small>{stats.totalSocios} socios | {stats.totalInstructores} instructores</small>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">🏋️</div>
            <div className="stat-info">
              <h3>{stats.totalClases}</h3>
              <p>Clases Totales</p>
              <small>{stats.clasesHoy} programadas hoy</small>
            </div>
          </div>

          <div className="stat-card orange">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{stats.reservasMes}</h3>
              <p>Reservas Mes Actual</p>
              <small>{stats.reservasHoy} reservas confirmadas hoy</small>
            </div>
          </div>

          <div className="stat-card purple">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <h3>{stats.ocupacionPromedio}%</h3>
              <p>Tasa de Ocupación</p>
              <small>Promedio general del gimnasio</small>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: ACCESOS RÁPIDOS */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">⚡ ACCESOS RÁPIDOS</h2>
          <p className="section-subtitle">Navega directamente a las secciones principales</p>
        </div>

        <div className="quick-buttons">
          <button className="quick-btn" onClick={() => navigate('/admin/usuarios')}>
            <span className="quick-btn-icon">👥</span>
            <span className="quick-btn-text">Usuarios</span>
            <span className="quick-btn-desc">Gestionar socios</span>
          </button>
          
          <button className="quick-btn" onClick={() => navigate('/admin/clases')}>
            <span className="quick-btn-icon">🏋️</span>
            <span className="quick-btn-text">Clases</span>
            <span className="quick-btn-desc">Programación</span>
          </button>
          
          <button className="quick-btn" onClick={() => navigate('/admin/instructores')}>
            <span className="quick-btn-icon">🎓</span>
            <span className="quick-btn-text">Instructores</span>
            <span className="quick-btn-desc">Personal</span>
          </button>
          
          <button className="quick-btn" onClick={() => navigate('/admin/asistencia')}>
            <span className="quick-btn-icon">✅</span>
            <span className="quick-btn-text">Asistencia</span>
            <span className="quick-btn-desc">Control diario</span>
          </button>
          
          <button className="quick-btn" onClick={() => navigate('/admin/reportes')}>
            <span className="quick-btn-icon">📊</span>
            <span className="quick-btn-text">Reportes</span>
            <span className="quick-btn-desc">Análisis</span>
          </button>
        </div>
      </section>

      {/* SECCIÓN 3: GRÁFICOS Y ANÁLISIS */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">📊 ANÁLISIS Y ESTADÍSTICAS</h2>
          <p className="section-subtitle">Visualización de datos del gimnasio</p>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>👥 DISTRIBUCIÓN DE USUARIOS</h3>
            <div className="chart-container">
              <Doughnut 
                data={usuariosPorRol} 
                options={{ 
                  maintainAspectRatio: true,
                  responsive: true,
                  backgroundColor: 'transparent',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { 
                        color: '#FFFFFF', 
                        font: { weight: 'bold', size: 13 },
                        padding: 15,
                        boxWidth: 15,
                        boxHeight: 15
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.95)',
                      titleColor: '#FFFFFF',
                      bodyColor: '#FFFFFF',
                      borderColor: '#DC2626',
                      borderWidth: 3,
                      padding: 15,
                      displayColors: true,
                      boxWidth: 12,
                      boxHeight: 12,
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed || 0;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value} usuarios (${percentage}%)`;
                        }
                      }
                    },
                    datalabels: {
                      color: '#FFFFFF',
                      font: {
                        weight: 'bold',
                        size: 18
                      },
                      formatter: (value, context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${percentage}%`;
                      },
                      textShadowColor: '#000000',
                      textShadowBlur: 8
                    }
                  }
                }} 
              />
            </div>
          </div>

          <div className="chart-card">
            <h3>📅 ESTADO DE RESERVAS</h3>
            <div className="chart-container">
              {reservas.length > 0 ? (
                <Doughnut 
                  data={reservasPorEstado} 
                  options={{ 
                    maintainAspectRatio: true,
                    responsive: true,
                    backgroundColor: 'transparent',
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { 
                          color: '#FFFFFF', 
                          font: { weight: 'bold', size: 13 },
                          padding: 15,
                          boxWidth: 15,
                          boxHeight: 15
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                        titleColor: '#FFFFFF',
                        bodyColor: '#FFFFFF',
                        borderColor: '#DC2626',
                        borderWidth: 3,
                        padding: 15,
                        displayColors: true,
                        boxWidth: 12,
                        boxHeight: 12,
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} reservas (${percentage}%)`;
                          }
                        }
                      },
                      datalabels: {
                        color: '#FFFFFF',
                        font: {
                          weight: 'bold',
                          size: 18
                        },
                        formatter: (value, context) => {
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          if (total === 0 || value === 0) return '';
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${percentage}%`;
                        },
                        textShadowColor: '#000000',
                        textShadowBlur: 8
                      }
                    }
                  }} 
                />
              ) : (
                <div className="no-data-chart">
                  <div className="no-data-icon">📊</div>
                  <p className="no-data-text">Sin reservas registradas</p>
                  <span className="no-data-desc">Los datos aparecerán cuando haya reservas</span>
                </div>
              )}
            </div>
          </div>

          <div className="chart-card wide">
            <h3>🔥 TOP 5 CLASES MÁS DEMANDADAS</h3>
            <div className="chart-container">
              {clases.length > 0 && getClasesPopulares().labels.length > 0 ? (
                <Bar 
                  data={getClasesPopulares()} 
                  options={{ 
                    maintainAspectRatio: true,
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                        titleColor: '#FFFFFF',
                        bodyColor: '#FFFFFF',
                        borderColor: '#DC2626',
                        borderWidth: 3,
                        padding: 15,
                        displayColors: true,
                        callbacks: {
                          label: function(context) {
                            return `Reservas: ${context.parsed.y}`;
                          }
                        }
                      },
                      datalabels: {
                        anchor: 'end',
                        align: 'top',
                        color: '#FFFFFF',
                        backgroundColor: '#DC2626',
                        borderRadius: 4,
                        padding: 6,
                        font: {
                          weight: 'bold',
                          size: 14
                        },
                        formatter: (value) => {
                          return value > 0 ? value : '';
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { 
                          stepSize: 1,
                          color: '#9CA3AF',
                          font: { weight: 'bold', size: 12 }
                        },
                        grid: { 
                          color: '#374151',
                          lineWidth: 1
                        }
                      },
                      x: {
                        ticks: { 
                          color: '#FFFFFF',
                          font: { weight: 'bold', size: 12 }
                        },
                        grid: { 
                          display: false
                        }
                      }
                    }
                  }} 
                />
              ) : (
                <div className="no-data-chart">
                  <div className="no-data-icon">🏋️</div>
                  <p className="no-data-text">Sin clases registradas</p>
                  <span className="no-data-desc">Crea clases para ver las más populares</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: ACTIVIDAD RECIENTE */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">🕐 ACTIVIDAD RECIENTE</h2>
          <p className="section-subtitle">Últimas reservas registradas en el sistema</p>
        </div>

        <div className="recent-activity">
          <div className="activity-list">
            {reservas.length > 0 ? (
              reservas.slice(0, 8).map((reserva, idx) => (
                <div key={idx} className="activity-item">
                  <span className="activity-icon">
                    {reserva.estado === 'confirmada' ? '✅' : 
                     reserva.estado === 'cancelada' ? '❌' : 
                     reserva.estado === 'completada' ? '🎯' : '⚠️'}
                  </span>
                  <div className="activity-content">
                    <p>
                      <strong>{reserva.socio?.first_name || reserva.socio?.username || 'Usuario'}</strong> 
                      {' '}{reserva.estado === 'confirmada' ? 'reservó' : 
                          reserva.estado === 'cancelada' ? 'canceló' : 
                          reserva.estado === 'completada' ? 'completó' : 'registró'}{' '}
                      <strong>{reserva.clase?.nombre || 'una clase'}</strong>
                    </p>
                    <small>
                      {new Date(reserva.fecha_reserva).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </div>
                  <span className={`activity-badge ${reserva.estado}`}>
                    {reserva.estado?.toUpperCase()}
                  </span>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No hay actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECCIÓN 5: RESUMEN RÁPIDO */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">💡 RESUMEN EJECUTIVO</h2>
          <p className="section-subtitle">Información clave de un vistazo</p>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon">🎯</div>
            <div className="summary-content">
              <h4>CLASES HOY</h4>
              <p className="summary-number">{stats.clasesHoy}</p>
              <span className="summary-label">Sesiones programadas</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">👥</div>
            <div className="summary-content">
              <h4>SOCIOS ACTIVOS</h4>
              <p className="summary-number">{stats.totalSocios}</p>
              <span className="summary-label">Membresías vigentes</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">🏆</div>
            <div className="summary-content">
              <h4>RESERVAS HOY</h4>
              <p className="summary-number">{stats.reservasHoy}</p>
              <span className="summary-label">Confirmadas para hoy</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">⚡</div>
            <div className="summary-content">
              <h4>INSTRUCTORES</h4>
              <p className="summary-number">{stats.totalInstructores}</p>
              <span className="summary-label">Equipo profesional</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminDashboard
