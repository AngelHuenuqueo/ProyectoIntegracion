import { useEffect } from 'react'
import { useNotifications } from '../components/NotificationCenter'

// Hook para generar recordatorios automáticos de clases próximas
export function useClassReminders(reservas) {
  const { addNotification } = useNotifications()

  useEffect(() => {
    if (!reservas || reservas.length === 0) return

    // Verificar clases próximas (dentro de las próximas 24 horas)
    const ahora = new Date()
    const en24Horas = new Date(ahora.getTime() + 24 * 60 * 60 * 1000)

    reservas.forEach(reserva => {
      if (reserva.estado !== 'CONFIRMADA') return

      try {
        // Combinar fecha y hora para comparación
        const fechaHora = new Date(`${reserva.clase.fecha}T${reserva.clase.hora_inicio}`)
        
        // Si la clase es dentro de las próximas 24 horas
        if (fechaHora > ahora && fechaHora <= en24Horas) {
          const horasRestantes = Math.floor((fechaHora - ahora) / (1000 * 60 * 60))
          const minutosRestantes = Math.floor(((fechaHora - ahora) % (1000 * 60 * 60)) / (1000 * 60))

          // Verificar si ya enviamos este recordatorio
          const recordatorioKey = `reminder_${reserva.id}_24h`
          const yaEnviado = localStorage.getItem(recordatorioKey)

          if (!yaEnviado) {
            let mensaje = ''
            if (horasRestantes === 0) {
              mensaje = `Tu clase empieza en ${minutosRestantes} minutos`
            } else if (horasRestantes === 1) {
              mensaje = `Tu clase empieza en 1 hora y ${minutosRestantes} minutos`
            } else {
              mensaje = `Tu clase empieza en ${horasRestantes} horas`
            }

            addNotification({
              type: 'reminder',
              title: `⏰ Recordatorio: ${reserva.clase.nombre}`,
              message: `${mensaje}. ¡No olvides asistir!`
            })

            // Marcar como enviado
            localStorage.setItem(recordatorioKey, 'true')
          }
        }
      } catch (error) {
        console.error('Error procesando recordatorio:', error)
      }
    })
  }, [reservas, addNotification])
}

// Hook para notificaciones informativas
export function useInfoNotifications() {
  const { addNotification } = useNotifications()

  const notifyNewClasses = (count) => {
    addNotification({
      type: 'info',
      title: '🆕 Nuevas clases disponibles',
      message: `Hay ${count} nuevas clases disponibles para reservar`
    })
  }

  const notifyLowCapacity = (className) => {
    addNotification({
      type: 'warning',
      title: '⚡ Últimos cupos',
      message: `Quedan pocos lugares en ${className}. ¡Reserva ahora!`
    })
  }

  const notifyFullClass = (className) => {
    addNotification({
      type: 'info',
      title: '🔴 Clase llena',
      message: `${className} ya no tiene cupos disponibles`
    })
  }

  return { notifyNewClasses, notifyLowCapacity, notifyFullClass }
}

export default { useClassReminders, useInfoNotifications }
