import './ConfirmModal.css'

export default function ConfirmModal({ message, onConfirm, onCancel, type = 'warning', title }) {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️'
      case 'danger':
        return '🚨'
      case 'info':
        return 'ℹ️'
      case 'cancel':
        return '🚫'
      default:
        return '❓'
    }
  }

  const getTitle = () => {
    if (title) return title
    
    switch (type) {
      case 'warning':
        return 'Advertencia'
      case 'danger':
        return 'Peligro'
      case 'cancel':
        return 'Cancelar Reserva'
      default:
        return 'Confirmación'
    }
  }

  return (
    <div className="modal-overlay">
      <div className={`modal-content modal-${type}`}>
        <div className="modal-icon">{getIcon()}</div>
        
        <h2 className="modal-title">{getTitle()}</h2>

        <p className="modal-message">{message}</p>

        <div className="modal-actions">
          <button onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button onClick={onConfirm} className={`btn-confirm btn-confirm-${type}`}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
