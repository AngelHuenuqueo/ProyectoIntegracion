import { NavLink, useNavigate } from 'react-router-dom'
import './AdminSidebar.css'

function AdminSidebar() {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span className="logo-icon">🏋️</span>
                    <div className="logo-text">
                        <span className="logo-title">Energía Total</span>
                        <span className="logo-subtitle">Panel Administrativo</span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {/* PRINCIPAL */}
                <div className="nav-section">
                    <span className="nav-section-title">PRINCIPAL</span>
                    <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">📊</span>
                        <span className="nav-label">Dashboard</span>
                    </NavLink>
                </div>

                {/* SOCIOS */}
                <div className="nav-section">
                    <span className="nav-section-title">SOCIOS</span>
                    <NavLink to="/admin/usuarios" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">👥</span>
                        <span className="nav-label">Ver Socios</span>
                    </NavLink>
                </div>

                {/* CLASES */}
                <div className="nav-section">
                    <span className="nav-section-title">CLASES</span>
                    <NavLink to="/admin/clases" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">📅</span>
                        <span className="nav-label">Ver Clases</span>
                    </NavLink>
                </div>

                {/* PERSONAL */}
                <div className="nav-section">
                    <span className="nav-section-title">PERSONAL</span>
                    <NavLink to="/admin/instructores" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">🎓</span>
                        <span className="nav-label">Instructores</span>
                    </NavLink>
                </div>

                {/* EQUIPAMIENTO */}
                <div className="nav-section">
                    <span className="nav-section-title">EQUIPAMIENTO</span>
                    <NavLink to="/admin/equipamiento" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">🏋️</span>
                        <span className="nav-label">Máquinas</span>
                    </NavLink>
                </div>

                {/* RESERVAS */}
                <div className="nav-section">
                    <span className="nav-section-title">RESERVAS</span>
                    <NavLink to="/admin/reservas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">🎫</span>
                        <span className="nav-label">Ver Reservas</span>
                    </NavLink>
                </div>

                {/* ANÁLISIS */}
                <div className="nav-section">
                    <span className="nav-section-title">ANÁLISIS</span>
                    <NavLink to="/admin/reportes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">📈</span>
                        <span className="nav-label">Reportes</span>
                    </NavLink>
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar-sidebar">{user.first_name?.[0] || user.username?.[0] || 'A'}</div>
                    <div className="user-info-sidebar">
                        <span className="user-name-sidebar">{user.first_name || user.username || 'Admin'}</span>
                        <span className="user-role-sidebar">Administrador</span>
                    </div>
                </div>
                <button className="logout-btn-sidebar" onClick={handleLogout}>
                    <span>🚪</span>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    )
}

export default AdminSidebar
