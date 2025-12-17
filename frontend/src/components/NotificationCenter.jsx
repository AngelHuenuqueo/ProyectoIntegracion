import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotificationState, getNotificationIcon, getTimeAgo } from '../hooks/useNotificationState'
import './NotificationCenter.css'

function NotificationCenter() {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        requestNotificationPermission
    } = useNotificationState()

    const [isOpen, setIsOpen] = useState(false)
    const [showPushPrompt, setShowPushPrompt] = useState(
        'Notification' in window && Notification.permission === 'default'
    )

    const handleEnablePush = async () => {
        const granted = await requestNotificationPermission()
        if (granted) {
            setShowPushPrompt(false)
        }
    }

    // Mostrar máximo 3 notificaciones en el dropdown
    const displayedNotifications = notifications.slice(0, 3)

    return (
        <div className="notification-center">
            <button
                className="notification-bell"
                onClick={() => setIsOpen(!isOpen)}
                title="Notificaciones"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notificaciones</h3>
                        <div className="notification-actions">
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="action-btn">
                                    Marcar leídas
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button onClick={clearAll} className="action-btn danger">
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </div>

                    {showPushPrompt && (
                        <div className="notification-push-prompt" style={{
                            padding: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'white' }}>
                                🔔 Activa las notificaciones push
                            </p>
                            <button 
                                onClick={handleEnablePush}
                                style={{
                                    background: 'white',
                                    color: '#667eea',
                                    border: 'none',
                                    padding: '6px 16px',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Activar
                            </button>
                        </div>
                    )}

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="notification-empty">
                                <span style={{ fontSize: '3em', opacity: 0.3 }}>🔕</span>
                                <p>No tienes notificaciones</p>
                            </div>
                        ) : (
                            <>
                                {displayedNotifications.map(notification => {
                                    // Validar que la notificación tenga datos válidos
                                    if (!notification || !notification.id) return null
                                    
                                    return (
                                        <div
                                            key={notification.id}
                                            className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type || 'info'}`}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="notification-icon">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="notification-content">
                                                <div className="notification-title">{notification.title || 'Notificación'}</div>
                                                <div className="notification-message">{notification.message || ''}</div>
                                                <div className="notification-time">{getTimeAgo(notification.timestamp)}</div>
                                            </div>
                                            <button
                                                className="notification-delete"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    deleteNotification(notification.id)
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )
                                })}
                            </>
                        )}
                    </div>

                    {/* Enlace a la página completa de notificaciones */}
                    <Link
                        to="/notificaciones"
                        className="notification-view-all"
                        onClick={() => setIsOpen(false)}
                    >
                        <span>Ver todas las notificaciones</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            )}
        </div>
    )
}

export default NotificationCenter
