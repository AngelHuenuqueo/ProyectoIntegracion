import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

// Hook para manejar el estado de las notificaciones
export function useNotificationState() {
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('notifications')
        return saved ? JSON.parse(saved) : []
    })
    
    const previousNotifIdsRef = useRef(new Set())

    // Función para solicitar permisos (debe ser llamada desde un evento de usuario)
    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission()
            if (permission === 'granted') {

                return true
            }
        }
        return Notification.permission === 'granted'
    }

    // Función para mostrar notificación push del navegador
    const showBrowserNotification = (title, message, type) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const icon = type === 'success' ? '✅' : 
                        type === 'cancel' ? '🚫' : 
                        type === 'reminder' ? '⏰' : 'ℹ️'
            
            try {
                const notification = new Notification(icon + ' ' + title, {
                    body: message,
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    vibrate: [200, 100, 200],
                    tag: 'gym-notification-' + Date.now(),
                    requireInteraction: false
                })
                
                // Auto-cerrar después de 5 segundos
                setTimeout(() => notification.close(), 5000)
            } catch (error) {
                console.error('Error mostrando notificación push:', error)
            }
        }
    }

    // Cargar notificaciones desde el backend
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // Verificar si hay token de autenticación
                const token = localStorage.getItem('access_token')
                if (!token) {
                    return
                }

                const response = await api.get('notificaciones/')
                if (response.data && Array.isArray(response.data)) {
                    // Convertir formato del backend al formato local
                    const backendNotifs = response.data
                        .filter(n => n && !n.leida) // Solo mostrar no leídas del backend
                        .map(n => {
                            // Asegurar que n.id sea string
                            const backendId = String(n.id || Date.now())
                            return {
                                id: `backend_${backendId}`,
                                type: n.tipo === 'reserva_confirmada' ? 'success' : 
                                      n.tipo === 'reserva_cancelada' ? 'cancel' :
                                      n.tipo === 'recordatorio' ? 'reminder' : 'info',
                                title: String(n.titulo || 'Notificación'),
                                message: String(n.mensaje || ''),
                                timestamp: n.fecha ? new Date(n.fecha).getTime() : Date.now(),
                                read: false,
                                backendId: backendId
                            }
                        })
                    
                    // Detectar nuevas notificaciones y mostrar push
                    const previousIds = previousNotifIdsRef.current
                    if (previousIds.size > 0) {
                        backendNotifs.forEach(notif => {
                            if (notif && notif.id && !previousIds.has(notif.id)) {
                                // Nueva notificación, mostrar push

                                showBrowserNotification(notif.title, notif.message, notif.type)
                            }
                        })
                    }
                    
                    // Actualizar IDs previos
                    previousNotifIdsRef.current = new Set(backendNotifs.map(n => n.id).filter(Boolean))
                    
                    // Combinar con notificaciones locales (si las hay)
                    const localNotifs = JSON.parse(localStorage.getItem('notifications') || '[]')
                    const localOnlyNotifs = localNotifs.filter(n => {
                        if (!n || !n.id) return false
                        const notifId = String(n.id)
                        return !notifId.startsWith('backend_')
                    })
                    
                    const allNotifs = [...backendNotifs, ...localOnlyNotifs]
                    
                    setNotifications(allNotifs)
                    localStorage.setItem('notifications', JSON.stringify(allNotifs))
                }
            } catch (error) {
                // Si es error de autenticación, solo usar notificaciones locales
                if (error.response?.status === 401) {

                } else {
                    console.error('Error cargando notificaciones:', error)
                }
            }
        }

        // Cargar inmediatamente
        fetchNotifications()
        
        // Polling cada 3 segundos para notificaciones en tiempo real
        const interval = setInterval(fetchNotifications, 3000)
        return () => clearInterval(interval)
    }, [])

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

    // Calcular no leídas (con validación)
    const unreadCount = notifications.filter(n => n && !n.read).length

    // Marcar notificación como leída
    const markAsRead = async (id) => {
        if (!id) return
        
        // Actualizar localmente primero (UI instantánea)
        setNotifications(prev =>
            prev.map(n => (n && n.id === id) ? { ...n, read: true } : n)
        )
        
        // Si es del backend, sincronizar con la API
        const notifId = String(id)
        if (notifId.startsWith('backend_')) {
            try {
                const backendId = notifId.replace('backend_', '')
                await api.post(`notificaciones/${backendId}/marcar_leida/`)

            } catch (error) {
                console.error('❌ Error al marcar como leída:', error)
            }
        }
    }

    // Marcar todas como leídas
    const markAllAsRead = async () => {
        // Actualizar localmente primero
        setNotifications(prev =>
            prev.map(n => (n ? { ...n, read: true } : n))
        )
        
        // Sincronizar con el backend
        try {
            await api.post('notificaciones/marcar_todas_leidas/')

        } catch (error) {
            console.error('❌ Error al marcar todas como leídas:', error)
        }
    }

    // Eliminar notificación
    const deleteNotification = (id) => {
        if (!id) return
        setNotifications(prev => prev.filter(n => n && n.id !== id))
    }

    // Limpiar todas (marca como leídas en backend y limpia localmente)
    const clearAll = async () => {
        try {
            // Marcar todas como leídas en el backend
            await api.post('notificaciones/marcar_todas_leidas/')

        } catch (error) {
            console.error('❌ Error al limpiar notificaciones:', error)
        }
        
        // Limpiar localmente
        setNotifications([])
        localStorage.setItem('notifications', JSON.stringify([]))
        
        // Limpiar el set de IDs previos para evitar mostrar push de notificaciones antiguas
        previousNotifIdsRef.current = new Set()
    }

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        requestNotificationPermission
    }
}

// Obtener icono según tipo
export function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✅'
        case 'warning': return '⚠️'
        case 'info': return 'ℹ️'
        case 'reminder': return '⏰'
        case 'cancel': return '❌'
        case 'error': return '🚫'
        default: return '🔔'
    }
}

// Formatear tiempo relativo
export function getTimeAgo(timestamp) {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = Math.floor((now - time) / 1000)

    if (diff < 60) return 'Ahora mismo'
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
    return `Hace ${Math.floor(diff / 86400)} días`
}
