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
