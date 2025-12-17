import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import AdminSidebar from './AdminSidebar'
import './AdminSidebar.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSocios: 0,
    sociosActivos: 0,
    totalClases: 0,
    clasesHoy: 0,
    totalReservas: 0,
    reservasPendientes: 0,
    totalInstructores: 0
  })
  const [clasesHoy, setClasesHoy] = useState([])
  const [reservasRecientes, setReservasRecientes] = useState([])
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const verificarPermiso = useCallback(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const userData = JSON.parse(userStr)
      if (userData.rol !== 'administrador') {
        alert('No tienes permisos para acceder a esta sección')
        navigate('/clases')
      }
    }
  }, [navigate])

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true)
      const hoy = new Date().toISOString().split('T')[0]

      const [usersRes, clasesRes, reservasRes, instructoresRes] = await Promise.all([
        api.get('/usuarios/'),
        api.get('/clases/'),
        api.get('/reservas/'),
        api.get('/instructores/')
      ])

      const usuariosData = usersRes.data.results || usersRes.data || []
      const clasesData = clasesRes.data.results || clasesRes.data || []
      const reservasData = reservasRes.data.results || reservasRes.data || []
      const instructoresData = instructoresRes.data.results || instructoresRes.data || []

      // Filtrar datos
      const socios = usuariosData.filter(u => u.rol === 'socio')
      const sociosActivos = socios.filter(u => u.is_active)
      const clasesDeHoy = clasesData.filter(c => c.fecha === hoy)
      const reservasPendientes = reservasData.filter(r => r.estado === 'pendiente')

      setStats({
        totalSocios: socios.length,
        sociosActivos: sociosActivos.length,
        totalClases: clasesData.length,
        clasesHoy: clasesDeHoy.length,
        totalReservas: reservasData.length,
        reservasPendientes: reservasPendientes.length,
        totalInstructores: instructoresData.length
      })

      // Clases de hoy ordenadas por hora
      setClasesHoy(clasesDeHoy.sort((a, b) => a.hora_inicio?.localeCompare(b.hora_inicio)))

      // Últimas 5 reservas
      setReservasRecientes(reservasData.slice(0, 5))

    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    verificarPermiso()
    cargarDatos()
  }, [verificarPermiso, cargarDatos])

  const getFechaHoy = () => {
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return new Date().toLocaleDateString('es-ES', opciones)
  }

  if (loading) {
    return (
      <div className="admin-with-sidebar">
        <AdminSidebar />
        <div className="admin-main-content">
          <div className="dashboard-body">
            <div className="loading-center">
              <p>Cargando panel...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-with-sidebar">
      <AdminSidebar />
      <div className="admin-main-content">
        <div className="dashboard-body">
          {/* Saludo y fecha */}
          <div className="dashboard-welcome">
            <h1>¡Hola, {user.first_name || 'Administrador'}!</h1>
            <p className="fecha-hoy">{getFechaHoy()}</p>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className="stats-grid">
            <div className="stat-card" onClick={() => navigate('/admin/usuarios')}>
              <div className="stat-icon blue">👥</div>
              <div className="stat-content">
                <span className="stat-number">{stats.sociosActivos}</span>
                <span className="stat-label">Socios Activos</span>
                <span className="stat-extra">de {stats.totalSocios} registrados</span>
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('/admin/clases')}>
              <div className="stat-icon green">📅</div>
              <div className="stat-content">
                <span className="stat-number">{stats.clasesHoy}</span>
                <span className="stat-label">Clases Hoy</span>
                <span className="stat-extra">de {stats.totalClases} programadas</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon yellow">🎫</div>
              <div className="stat-content">
                <span className="stat-number">{stats.reservasPendientes}</span>
                <span className="stat-label">Reservas Pendientes</span>
                <span className="stat-extra">de {stats.totalReservas} totales</span>
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('/admin/instructores')}>
              <div className="stat-icon purple">🎓</div>
              <div className="stat-content">
                <span className="stat-number">{stats.totalInstructores}</span>
                <span className="stat-label">Instructores</span>
                <span className="stat-extra">personal activo</span>
              </div>
            </div>
          </div>

          {/* Contenido principal en dos columnas */}
          <div className="dashboard-content-grid">
            {/* Clases de hoy */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>📅 Clases de Hoy</h2>
                <button className="btn-link" onClick={() => navigate('/admin/clases')}>Ver todas</button>
              </div>
              <div className="clases-hoy-list">
                {clasesHoy.length > 0 ? (
                  clasesHoy.map(clase => (
                    <div key={clase.id} className="clase-hoy-item">
                      <div className="clase-hora">{clase.hora_inicio}</div>
                      <div className="clase-info">
                        <span className="clase-nombre">{clase.nombre}</span>
                        <span className="clase-instructor">{clase.instructor_nombre || 'Sin instructor'}</span>
                      </div>
                      <div className="clase-cupos">
                        <span className={`cupos-badge ${clase.cupos_disponibles === 0 ? 'full' : ''}`}>
                          {clase.cupos_disponibles}/{clase.cupos_totales}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No hay clases programadas para hoy</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actividad reciente */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>🔔 Actividad Reciente</h2>
              </div>
              <div className="actividad-list">
                {reservasRecientes.length > 0 ? (
                  reservasRecientes.map(reserva => (
                    <div key={reserva.id} className="actividad-item">
                      <div className={`actividad-icon ${reserva.estado}`}>
                        {reserva.estado === 'confirmada' && '✅'}
                        {reserva.estado === 'pendiente' && '⏳'}
                        {reserva.estado === 'cancelada' && '❌'}
                      </div>
                      <div className="actividad-info">
                        <span className="actividad-titulo">
                          Reserva {reserva.estado}
                        </span>
                        <span className="actividad-detalle">
                          {reserva.clase?.nombre || 'Clase'} - {reserva.socio?.first_name || 'Socio'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No hay actividad reciente</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>⚡ Acciones Rápidas</h2>
            </div>
            <div className="acciones-rapidas">
              <button className="accion-btn" onClick={() => navigate('/admin/usuarios')}>
                <span className="accion-icon">➕</span>
                <span>Nuevo Socio</span>
              </button>
              <button className="accion-btn" onClick={() => navigate('/admin/clases')}>
                <span className="accion-icon">📅</span>
                <span>Programar Clase</span>
              </button>
              <button className="accion-btn" onClick={() => navigate('/admin/reportes')}>
                <span className="accion-icon">📊</span>
                <span>Ver Reportes</span>
              </button>
              <button className="accion-btn" onClick={() => navigate('/clases')}>
                <span className="accion-icon">👁️</span>
                <span>Vista Socios</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
