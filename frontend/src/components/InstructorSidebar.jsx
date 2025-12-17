import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import ConfirmModal from './ConfirmModal'

function InstructorSidebar() {
    const navigate = useNavigate()
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const user = JSON.parse(localStorage.getItem('user') || '{}')

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

    return (
        <>
            <aside className="instructor-sidebar">
                {/* Brand */}
                <div className="sidebar-brand">
                    <div className="brand-icon">🏋️</div>
                    <div className="brand-text">
                        <span className="brand-name">ENERGÍA TOTAL</span>
                        <span className="brand-sub">Panel Instructor</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <NavLink
                        to="/instructor"
                        end
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">🏠</span>
                        <span>Inicio</span>
                    </NavLink>

                    <NavLink
                        to="/instructor/mis-clases"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">📋</span>
                        <span>Mis Clases</span>
                    </NavLink>

                    <NavLink
                        to="/instructor/asistencia"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">✅</span>
                        <span>Asistencia</span>
                    </NavLink>

                    <NavLink
                        to="/instructor/perfil"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">👤</span>
                        <span>Mi Perfil</span>
                    </NavLink>
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <div className="instructor-badge">
                        <div className="instructor-badge-icon">👨‍🏫</div>
                        <span className="instructor-badge-text">
                            {user.first_name || 'Instructor'}
                        </span>
                    </div>

                    <button className="logout-btn" onClick={handleLogoutClick}>
                        <span>↪</span>
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {showLogoutModal && (
                <ConfirmModal
                    title="Cerrar Sesión"
                    message="¿Estás seguro de que deseas cerrar sesión?"
                    type="warning"
                    onConfirm={confirmLogout}
                    onCancel={() => setShowLogoutModal(false)}
                />
            )}
        </>
    )
}

export default InstructorSidebar
