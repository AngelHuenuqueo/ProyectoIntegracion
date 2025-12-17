import UserLayout from '../components/UserLayout'
import { useNotificationState, getNotificationIcon, getTimeAgo } from '../hooks/useNotificationState'

export default function Notificaciones() {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll
    } = useNotificationState()

    return (
        <UserLayout title="Notificaciones">
            {/* Hero Header con glassmorphism */}
            <div className="relative overflow-hidden mb-10">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-red-900/40"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>

                <div className="absolute top-4 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-4 left-10 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10 py-12 px-8">
                    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                                <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-2xl shadow-2xl shadow-purple-500/30">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                                    <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">Mis</span>{' '}
                                    <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">Notificaciones</span>
                                </h2>
                                <p className="text-gray-400 mt-2 font-medium">
                                    {unreadCount > 0 ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer` : 'Todas las notificaciones leídas'}
                                </p>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-3">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-purple-500/25"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Marcar todas leídas
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="group inline-flex items-center gap-2 bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-500/30 text-white hover:text-red-400 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Limpiar todo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 lg:px-8 max-w-6xl mx-auto">
                {notifications.length === 0 ? (
                    /* Empty State */
                    <div className="relative overflow-hidden rounded-3xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl"></div>
                        <div className="relative z-10 p-16 text-center">
                            <div className="relative inline-block mb-6">
                                <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                                <div className="relative bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-full border border-white/10">
                                    <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Sin notificaciones</h3>
                            <p className="text-gray-400 font-medium">No tienes notificaciones por el momento</p>
                        </div>
                    </div>
                ) : (
                    /* Lista de notificaciones */
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`group relative bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-xl border rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden ${notification.read
                                    ? 'border-gray-700/30 opacity-70 hover:opacity-100'
                                    : 'border-purple-500/30 hover:border-purple-500/50'
                                    }`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                {/* Indicador de no leído */}
                                {!notification.read && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-pink-500 rounded-l-2xl"></div>
                                )}

                                <div className="flex items-start gap-4">
                                    {/* Icono */}
                                    <div className={`flex-shrink-0 p-3 rounded-xl ${notification.type === 'success' ? 'bg-green-500/20 text-green-400' :
                                        notification.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                            notification.type === 'error' ? 'bg-red-500/20 text-red-400' :
                                                notification.type === 'reminder' ? 'bg-blue-500/20 text-blue-400' :
                                                    notification.type === 'cancel' ? 'bg-orange-500/20 text-orange-400' :
                                                        'bg-purple-500/20 text-purple-400'
                                        }`}>
                                        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                                    </div>

                                    {/* Contenido */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className="font-bold text-white text-lg">{notification.title}</h4>
                                                <p className="text-gray-400 mt-1">{notification.message}</p>
                                            </div>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">{getTimeAgo(notification.timestamp)}</span>
                                        </div>
                                    </div>

                                    {/* Botón eliminar */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteNotification(notification.id)
                                        }}
                                        className="flex-shrink-0 p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </UserLayout>
    )
}
