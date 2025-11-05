import { useEffect } from 'react'

export default function WelcomeModal({ isOpen, onClose, userName, userRole }) {
  useEffect(() => {
    if (isOpen) {
      // Cerrar automáticamente después de 3 segundos
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isAdmin = userRole === 'ADMINISTRADOR' || userRole === 'administrador'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-4 border-red-600 rounded-lg shadow-2xl shadow-red-600/50 max-w-md w-full animate-scaleIn overflow-hidden">
        {/* Header con efecto */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          <div className="relative z-10 text-center">
            <div className="text-6xl mb-3 animate-bounce">
              {isAdmin ? '🔐' : '👋'}
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-wider">
              {isAdmin ? '¡Bienvenido Admin!' : '¡Bienvenido!'}
            </h2>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8 text-center">
          <div className="mb-6">
            <p className="text-white text-xl font-bold mb-2">
              {isAdmin ? 'Acceso Administrativo' : 'Has iniciado sesión como'}
            </p>
            <p className="text-red-600 text-2xl font-black uppercase tracking-wide">
              {userName}
            </p>
          </div>

          <div className="mb-6 p-4 bg-red-600/20 border-2 border-red-600/50 rounded-lg">
            <p className="text-white font-bold text-lg">
              {isAdmin ? '⚙️ Panel de Control Activado' : '🎯 ¡Disfruta de tus clases!'}
            </p>
            {isAdmin && (
              <p className="text-gray-300 text-sm mt-2">
                Gestiona usuarios, clases e instructores
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span>Redirigiendo...</span>
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse delay-100"></div>
          </div>
        </div>

        {/* Footer con botón de cerrar */}
        <div className="bg-gray-900/50 p-4 border-t-2 border-gray-800">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 font-black text-sm uppercase tracking-widest transition-all duration-300 border-2 border-red-600"
          >
            Continuar
          </button>
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

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .delay-100 {
          animation-delay: 100ms;
        }
      `}</style>
    </div>
  )
}
