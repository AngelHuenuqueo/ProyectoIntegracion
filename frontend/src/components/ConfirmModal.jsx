export default function ConfirmModal({ message, onConfirm, onCancel, type = 'warning', title }) {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️'
      case 'danger':
        return '❌'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-4 border-red-600 rounded-lg shadow-2xl shadow-red-600/50 max-w-md w-full animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-center">
          <div className="text-6xl mb-3">{getIcon()}</div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">
            {getTitle()}
          </h2>
        </div>

        {/* Contenido */}
        <div className="p-8">
          <p className="text-white text-lg text-center font-medium mb-6">
            {message}
          </p>

          {/* Botones */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onCancel}
              className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 font-black text-sm uppercase tracking-wider transition-all duration-300 border-2 border-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 font-black text-sm uppercase tracking-wider transition-all duration-300 border-2 border-red-600 shadow-lg shadow-red-600/30"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
