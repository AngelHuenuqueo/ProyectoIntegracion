import { useState, useEffect } from 'react'
import './NotificationCenter.css'

function NotificationCenter() {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications')
    return saved ? JSON.parse(saved) : []
  })
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Calcular notificaciones no leídas
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length
    setUnreadCount(count)
  }, [notifications])

  // Guardar notificaciones en localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  // Escuchar eventos de nuevas notificaciones
  useEffect(() => {
    const handleNewNotification = () => {
      const saved = localStorage.getItem('notifications')
      if (saved) {
        setNotifications(JSON.parse(saved))
      }
    }

    window.addEventListener('notificationAdded', handleNewNotification)
    return () => window.removeEventListener('notificationAdded', handleNewNotification)
  }, [])

  // Marcar notificación como leída
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }

  // Eliminar notificación
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Limpiar todas
  const clearAll = () => {
    setNotifications([])
  }

  // Obtener icono según tipo
  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      case 'reminder': return '⏰'
      case 'cancel': return '❌'
      default: return '🔔'
    }
  }

  // Formatear tiempo relativo
  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = Math.floor((now - time) / 1000) // segundos

    if (diff < 60) return 'Ahora mismo'
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
    return `Hace ${Math.floor(diff / 86400)} días`
  }

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
                  Marcar todas leídas
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} className="action-btn danger">
                  Limpiar todo
                </button>
              )}
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <span style={{ fontSize: '3em', opacity: 0.3 }}>🔕</span>
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {getIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
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
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Hook personalizado para agregar notificaciones desde cualquier componente
export function useNotifications() {
  const addNotification = (notification) => {
    const saved = localStorage.getItem('notifications')
    const current = saved ? JSON.parse(saved) : []
    
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    }

    const updated = [newNotification, ...current].slice(0, 50) // Límite de 50 notificaciones
    localStorage.setItem('notifications', JSON.stringify(updated))
    
    // Disparar evento personalizado para actualizar el componente
    window.dispatchEvent(new Event('notificationAdded'))
  }

  return { addNotification }
}

export default NotificationCenter
