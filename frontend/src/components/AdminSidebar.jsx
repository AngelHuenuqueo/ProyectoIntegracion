import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ConfirmModal from './ConfirmModal'
import Toast from './Toast'
import './AdminSidebar.css'

function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mostrarConfirmacionLogout, setMostrarConfirmacionLogout] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const isActive = (path) => location.pathname === path

  const menuItems = {
    principal: [
      { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
      { icon: '👥', label: 'Usuarios', path: '/admin/usuarios' },
      { icon: '🏋️', label: 'Clases', path: '/admin/clases' },
      { icon: '�', label: 'Instructores', path: '/admin/instructores' },
      { icon: '📈', label: 'Reportes', path: '/admin/reportes' },
    ],
    gestion: [
      { icon: '✅', label: 'Asistencia', path: '/admin/asistencia' },
      { icon: '📋', label: 'Reservas', path: '/admin/reservas' },
    ],
    sistema: [
      { icon: '👤', label: 'Mi Perfil', path: '/perfil' },
      { icon: '⚙️', label: 'Configuración', path: '/admin/configuracion' },
    ]
  }

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">💪</span>
          <div className="logo-text">
            <h2>Panel Superadmin</h2>
            <p>Gimnasio Control</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3 className="nav-section-title">PRINCIPAL</h3>
          <ul className="nav-list">
            {menuItems.principal.map((item, index) => (
              <li key={index}>
                <button
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="nav-section">
          <h3 className="nav-section-title">GESTIÓN</h3>
          <ul className="nav-list">
            {menuItems.gestion.map((item, index) => (
              <li key={index}>
                <button
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="nav-section">
          <h3 className="nav-section-title">SISTEMA</h3>
          <ul className="nav-list">
            {menuItems.sistema.map((item, index) => (
              <li key={index}>
                <button
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="sidebar-logout">
        <button 
          className="logout-button"
          onClick={() => setMostrarConfirmacionLogout(true)}
        >
          <span className="logout-icon">🚪</span>
          <span className="logout-label">Cerrar Sesión</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="alert-box">
          <div className="alert-header">
            <span className="alert-icon">⚠️</span>
            <span className="alert-badge">ALERTA</span>
          </div>
          <p className="alert-text">2 intentos de acceso fallidos en las últimas 24h. Revisa los logs.</p>
          <button className="alert-button">Ver mantención</button>
        </div>
      </div>

      {/* Modal de confirmación para cerrar sesión */}
      {mostrarConfirmacionLogout && (
        <ConfirmModal
          title="Cerrar Sesión"
          message={`¿Estás seguro de que deseas cerrar sesión?

Serás redirigido a la página de inicio de sesión.`}
          type="warning"
          onConfirm={() => {
            setMostrarConfirmacionLogout(false)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setToast({ show: true, message: '✅ Sesión cerrada exitosamente', type: 'success' })
            setTimeout(() => {
              navigate('/login')
            }, 1500)
          }}
          onCancel={() => setMostrarConfirmacionLogout(false)}
        />
      )}

      {/* Toast de notificaciones */}
      {toast.show && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </aside>
  )
}

export default AdminSidebar
