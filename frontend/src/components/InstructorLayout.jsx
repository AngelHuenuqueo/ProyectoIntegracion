import { useNavigate } from 'react-router-dom'
import InstructorSidebar from './InstructorSidebar'
import NotificationCenter from './NotificationCenter'
import './InstructorLayout.css'

function InstructorLayout({ children, title }) {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    const handleProfile = () => {
        navigate('/instructor/perfil')
    }

    return (
        <div className="instructor-layout">
            <InstructorSidebar />

            <main className="instructor-main-content">
                {/* Top Header */}
                <header className="instructor-top-header">
                    <h1 className="page-title">{title || 'Panel Instructor'}</h1>

                    <div className="header-actions">
                        <div className="header-time">
                            <span>🕐</span>
                            <span>
                                {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <NotificationCenter />

                        <div
                            className="instructor-profile"
                            onClick={handleProfile}
                            title="Ver perfil"
                        >
                            <div>
                                <span className="profile-name">
                                    {user.first_name || user.username || 'Instructor'}
                                </span>
                                <span className="profile-role">Instructor</span>
                            </div>
                            <div className="profile-avatar">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || user.username || 'I')}&background=06b6d4&color=fff`}
                                    alt="Avatar"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="instructor-page-content">
                    {children}
                </div>
            </main>
        </div>
    )
}

export default InstructorLayout
