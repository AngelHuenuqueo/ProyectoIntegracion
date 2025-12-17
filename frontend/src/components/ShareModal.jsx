import { useState } from 'react'
import './ShareModal.css'

export default function ShareModal({ clase, onClose }) {
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  // Generar URL para compartir (simulado)
  const shareUrl = `${window.location.origin}/clases?highlight=${clase.id}`
  
  // Mensaje para compartir
  const shareMessage = `¡Únete a la clase de ${clase.nombre}! 🏋️\n\n` +
    `📋 Tipo: ${clase.tipo?.toUpperCase() || 'N/A'}\n` +
    `📅 Fecha: ${clase.fecha}\n` +
    `⏰ Hora: ${clase.hora_inicio?.substring(0, 5)}\n` +
    `👤 Instructor: ${clase.instructor_nombre}\n` +
    `📍 Energía Total\n\n` +
    `Cupos disponibles: ${clase.cupos_totales - clase.cupos_reservados}/${clase.cupos_totales}`

  // Copiar al portapapeles
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copiando al portapapeles:', err)
      // Fallback para navegadores antiguos
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Copiar mensaje completo
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage + '\n\n' + shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copiando mensaje:', err)
    }
  }

  // Compartir por email (simulado - requeriría backend real)
  const handleEmailShare = (e) => {
    e.preventDefault()
    if (!email) return

    // En un caso real, aquí llamarías a tu API


    // Simular envío
    setEmailSent(true)
    setTimeout(() => {
      setEmailSent(false)
      setEmail('')
    }, 3000)
  }

  // Compartir en WhatsApp
  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(shareMessage + '\n\n' + shareUrl)
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  // Compartir en Facebook
  const handleFacebookShare = () => {
    const url = encodeURIComponent(shareUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  }

  // Compartir en Twitter/X
  const handleTwitterShare = () => {
    const text = encodeURIComponent(`¡Clase de ${clase.nombre} en Energía Total! 🏋️`)
    const url = encodeURIComponent(shareUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  // Compartir por email nativo
  const handleNativeEmail = () => {
    const subject = encodeURIComponent(`Invitación: ${clase.nombre} - Energía Total`)
    const body = encodeURIComponent(shareMessage + '\n\n' + shareUrl)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-header">
          <h2>🔗 Compartir Clase</h2>
          <p className="modal-subtitle">{clase.nombre}</p>
        </div>

        <div className="modal-body">
          {/* Información de la clase */}
          <div className="share-class-info">
            <div className="info-row">
              <span className="info-label">📋 Tipo:</span>
              <span className="info-value">{clase.tipo?.toUpperCase() || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">📅 Fecha:</span>
              <span className="info-value">{clase.fecha}</span>
            </div>
            <div className="info-row">
              <span className="info-label">⏰ Hora:</span>
              <span className="info-value">{clase.hora_inicio?.substring(0, 5)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">👤 Instructor:</span>
              <span className="info-value">{clase.instructor_nombre}</span>
            </div>
            <div className="info-row">
              <span className="info-label">💺 Disponibles:</span>
              <span className="info-value">{clase.cupos_totales - clase.cupos_reservados}/{clase.cupos_totales}</span>
            </div>
          </div>

          {/* Enlace para copiar */}
          <div className="share-section">
            <h3>📎 Enlace directo</h3>
            <div className="link-container">
              <input 
                type="text" 
                value={shareUrl} 
                readOnly 
                className="link-input"
              />
              <button onClick={handleCopyLink} className="copy-btn">
                {copied ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
          </div>

          {/* Redes sociales */}
          <div className="share-section">
            <h3>🌐 Compartir en redes sociales</h3>
            <div className="social-buttons">
              <button onClick={handleWhatsAppShare} className="social-btn whatsapp">
                <span className="social-icon">💬</span>
                WhatsApp
              </button>
              <button onClick={handleFacebookShare} className="social-btn facebook">
                <span className="social-icon">📘</span>
                Facebook
              </button>
              <button onClick={handleTwitterShare} className="social-btn twitter">
                <span className="social-icon">🐦</span>
                Twitter
              </button>
              <button onClick={handleNativeEmail} className="social-btn email">
                <span className="social-icon">📧</span>
                Email
              </button>
            </div>
          </div>

          {/* Copiar mensaje completo */}
          <div className="share-section">
            <h3>📝 Mensaje completo</h3>
            <textarea 
              value={shareMessage} 
              readOnly 
              className="message-textarea"
              rows="7"
            />
            <button onClick={handleCopyMessage} className="copy-message-btn">
              {copied ? '✓ Mensaje copiado' : '📋 Copiar mensaje completo'}
            </button>
          </div>

          {/* Formulario de email (simulado) */}
          <div className="share-section">
            <h3>✉️ Enviar por email</h3>
            <form onSubmit={handleEmailShare} className="email-form">
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="email-input"
                required
              />
              <button type="submit" className="send-email-btn">
                Enviar invitación
              </button>
            </form>
            {emailSent && (
              <div className="email-success">
                ✓ Invitación enviada exitosamente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
