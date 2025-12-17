import { useNavigate } from 'react-router-dom'
import UserSidebar from './UserSidebar'
import NotificationCenter from './NotificationCenter'
import './User.css'

function UserLayout({ children, title }) {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    const handleProfile = () => {
        navigate('/perfil')
    }

    return (
        <div className="user-layout">
            <UserSidebar />

            <main className="user-main-content">
                {/* Header superior */}
                <header className="user-top-header">
                    <div className="header-title-section">
                        <h1 className="page-title-user">{title || 'Panel Principal'}</h1>
                    </div>

                    <div className="header-actions-user">
                        <div className="header-time">
                            <span className="time-icon">🕐</span>
                            <span className="time-text">
                                {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <NotificationCenter />

                        <div
                            className="user-profile-header"
                            onClick={handleProfile}
                            style={{ cursor: 'pointer' }}
                            title="Ver perfil"
                        >
                            <div className="profile-info">
                                <span className="profile-name">
                                    {user.first_name || user.username || 'Usuario'}
                                </span>
                                <span className="profile-badge">VIP</span>
                            </div>
                            <div className="profile-avatar-header">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || user.username || 'U')}&background=e94560&color=fff`}
                                    alt="Avatar"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Contenido */}
                <div className="user-page-content">
                    {children}
                </div>
            </main>
        </div>
    )
}

export default UserLayout

