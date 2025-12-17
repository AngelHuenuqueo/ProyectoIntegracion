import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import ConfirmModal from './ConfirmModal'

function UserSidebar() {
    const navigate = useNavigate()
    const [showLogoutModal, setShowLogoutModal] = useState(false)

    const handleLogoutClick = () => {
        setShowLogoutModal(true)
    }

    const confirmLogout = () => {
        setShowLogoutModal(false)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    const cancelLogout = () => {
        setShowLogoutModal(false)
    }

    return (
        <>
            <aside className="user-sidebar">
                {/* Logo */}
                <div className="sidebar-brand">
                    <div className="brand-icon">🔥</div>
                    <div className="brand-text">
                        <span className="brand-name">ENERGÍA</span>
                        <span className="brand-sub">TOTAL</span>
                    </div>
                </div>

                {/* Navegación Principal */}
                <nav className="sidebar-nav-user">
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-link-user ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon-user">🏠</span>
                        <span className="nav-text-user">Inicio</span>
                    </NavLink>

                    <NavLink to="/clases" className={({ isActive }) => `nav-link-user ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon-user">📋</span>
                        <span className="nav-text-user">Clases</span>
                    </NavLink>

                    <NavLink to="/estadisticas" className={({ isActive }) => `nav-link-user ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon-user">📊</span>
                        <span className="nav-text-user">Progreso</span>
                    </NavLink>

                    <NavLink to="/calendario" className={({ isActive }) => `nav-link-user ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon-user">📅</span>
                        <span className="nav-text-user">Calendario</span>
                    </NavLink>

                    <NavLink to="/reservas" className={({ isActive }) => `nav-link-user ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon-user">🎫</span>
                        <span className="nav-text-user">Mis Reservas</span>
                    </NavLink>

                    <NavLink to="/equipamiento" className={({ isActive }) => `nav-link-user ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon-user">🏋️</span>
                        <span className="nav-text-user">Equipamiento</span>
                    </NavLink>

                    <NavLink to="/perfil" className={({ isActive }) => `nav-link-user ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon-user">👤</span>
                        <span className="nav-text-user">Mi Perfil</span>
                    </NavLink>
                </nav>

                {/* Footer */}
                <div className="sidebar-footer-user">
                    <div className="gym-status">
                        <span className="status-indicator online"></span>
                        <span className="status-text">Gimnasio Abierto (24h)</span>
                    </div>

                    <button className="logout-btn-user" onClick={handleLogoutClick}>
                        <span className="logout-icon">↪</span>
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Modal de confirmación para cerrar sesión */}
            {showLogoutModal && (
                <ConfirmModal
                    title="Cerrar Sesión"
                    message="¿Estás seguro de que deseas cerrar sesión?"
                    type="warning"
                    onConfirm={confirmLogout}
                    onCancel={cancelLogout}
                />
            )}
        </>
    )
}

export default UserSidebar

