import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import UserLayout from '../components/UserLayout'

function UserDashboard() {
    const navigate = useNavigate()
    const [proximaClase, setProximaClase] = useState(null)
    const [stats, setStats] = useState({
        hidratacion: 4,
        calorias: 450,
        racha: 12
    })
    const [loading, setLoading] = useState(true)

    // Obtener datos del usuario
    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null
    const userName = user?.first_name || user?.username || 'Usuario'

    useEffect(() => {
        // Scroll al inicio cuando carga el componente
        const mainContent = document.querySelector('.user-main-content')
        if (mainContent) {
            mainContent.scrollTop = 0
        }
        window.scrollTo(0, 0)
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        try {
            // Cargar próxima clase disponible
            const clasesRes = await api.get('clases/disponibles/')
            const clases = clasesRes.data || []

            if (clases.length > 0) {
                // Ordenar por fecha y hora
                const clasesOrdenadas = clases.sort((a, b) => {
                    const fechaA = new Date(`${a.fecha}T${a.hora_inicio}`)
                    const fechaB = new Date(`${b.fecha}T${b.hora_inicio}`)
                    return fechaA - fechaB
                })
                setProximaClase(clasesOrdenadas[0])
            }

            // Cargar estadísticas guardadas en localStorage
            const statsGuardadas = localStorage.getItem('userStats')
            if (statsGuardadas) {
                setStats(JSON.parse(statsGuardadas))
            }

            // Cargar estadísticas reales del usuario
            try {
                const reservasRes = await api.get('usuarios/mis_reservas/')
                const reservas = reservasRes.data.results || reservasRes.data || []

                // Calcular racha de días consecutivos
                const reservasCompletadas = reservas.filter(r => r.estado === 'COMPLETADA')
                const racha = calcularRacha(reservasCompletadas)

                // Actualizar solo la racha con datos reales
                setStats(prev => ({
                    ...prev,
                    racha: racha
                }))
            } catch {

            }
        } catch (error) {
            console.error('Error cargando datos:', error)
        } finally {
            setLoading(false)
        }
    }

    const registrarVaso = () => {
        setStats(prev => {
            const nuevasStats = {
                ...prev,
                hidratacion: Math.min(prev.hidratacion + 1, 8)
            }
            // Guardar en localStorage
            localStorage.setItem('userStats', JSON.stringify(nuevasStats))
            return nuevasStats
        })
    }

    const calcularRacha = (reservasCompletadas) => {
        if (reservasCompletadas.length === 0) return 0

        // Ordenar reservas por fecha
        const fechas = reservasCompletadas
            .map(r => new Date(r.clase?.fecha || r.fecha_reserva))
            .sort((a, b) => b - a)

        if (fechas.length === 0) return 0

        let racha = 1
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)

        // Si la última clase no fue hoy ni ayer, la racha se rompió
        const ultimaFecha = new Date(fechas[0])
        ultimaFecha.setHours(0, 0, 0, 0)
        const diffDias = Math.floor((hoy - ultimaFecha) / (1000 * 60 * 60 * 24))

        if (diffDias > 1) return 0

        // Contar días consecutivos
        for (let i = 1; i < fechas.length; i++) {
            const fecha1 = new Date(fechas[i - 1])
            fecha1.setHours(0, 0, 0, 0)
            const fecha2 = new Date(fechas[i])
            fecha2.setHours(0, 0, 0, 0)

            const diff = Math.floor((fecha1 - fecha2) / (1000 * 60 * 60 * 24))

            if (diff === 1) {
                racha++
            } else {
                break
            }
        }

        return racha
    }

    const formatHora = (hora) => {
        if (!hora) return ''
        return hora.slice(0, 5)
    }

    const calcularTiempoRestante = () => {
        if (!proximaClase) return null

        const ahora = new Date()
        const fechaClase = new Date(`${proximaClase.fecha}T${proximaClase.hora_inicio}`)
        const diff = fechaClase - ahora

        if (diff < 0) return null

        const horas = Math.floor(diff / (1000 * 60 * 60))
        const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        if (horas > 24) {
            const dias = Math.floor(horas / 24)
            return `EN ${dias} DÍA${dias > 1 ? 'S' : ''}`
        }

        if (horas > 0) {
            return `EN ${horas} HORA${horas > 1 ? 'S' : ''}`
        }

        return `EN ${minutos} MIN`
    }

    const calcularDuracion = () => {
        if (!proximaClase) return ''
        const inicio = proximaClase.hora_inicio?.split(':') || [0, 0]
        const fin = proximaClase.hora_fin?.split(':') || [0, 0]
        const minInicio = parseInt(inicio[0]) * 60 + parseInt(inicio[1])
        const minFin = parseInt(fin[0]) * 60 + parseInt(fin[1])
        return `${minFin - minInicio} min`
    }

    if (loading) {
        return (
            <UserLayout title="Panel Principal">
                <div className="loading-center">Cargando...</div>
            </UserLayout>
        )
    }

    return (
        <UserLayout title="Panel Principal">
            {/* Bienvenida */}
            <div className="dashboard-welcome-user">
                <div className="welcome-card">
                    <div className="welcome-text">
                        <h2>Hola, {userName} <span>👋</span></h2>
                        <p>Hoy es un día perfecto para romper tus RPs.</p>
                    </div>
                    <button className="access-pass-btn" onClick={() => navigate('/perfil')}>
                        <span>🎫</span>
                        Pase de Acceso
                    </button>
                </div>
            </div>

            {/* Widgets de Estadísticas */}
            <div className="stats-widgets-user">
                {/* Hidratación */}
                <div className="widget-card hydration">
                    <div className="widget-header">
                        <span className="widget-title">HIDRATACIÓN</span>
                        <span className="widget-icon">💧</span>
                    </div>
                    <div className="widget-value">
                        <span className="widget-number">{stats.hidratacion}</span>
                        <span className="widget-unit">/ 8 vasos</span>
                    </div>
                    <div className="widget-progress">
                        <div
                            className="widget-progress-fill"
                            style={{ width: `${(stats.hidratacion / 8) * 100}%` }}
                        ></div>
                    </div>
                    <div className="widget-action" onClick={registrarVaso}>
                        <span>+</span>
                        <span>Registrar Vaso</span>
                    </div>
                </div>

                {/* Calorías */}
                <div className="widget-card calories">
                    <div className="widget-header">
                        <span className="widget-title">CALORÍAS ACTIVAS</span>
                        <span className="widget-icon">👆</span>
                    </div>
                    <div className="widget-value">
                        <span className="widget-number">{stats.calorias}</span>
                        <span className="widget-unit">kcal</span>
                    </div>
                    <div className="widget-progress">
                        <div
                            className="widget-progress-fill"
                            style={{ width: `${Math.min((stats.calorias / 600) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Racha */}
                <div className="widget-card streak">
                    <div className="widget-header">
                        <span className="widget-title">RACHA</span>
                        <span className="widget-icon">⚡</span>
                    </div>
                    <div className="widget-value">
                        <span className="widget-number">{stats.racha}</span>
                        <span className="widget-unit">días seguidos</span>
                    </div>
                    <p className="widget-subtitle">¡Sigue así! Estás en el top 5% del gym.</p>
                </div>
            </div>

            {/* Próxima Clase Destacada */}
            {proximaClase ? (
                <div className="featured-class-section">
                    <div className="featured-class-card">
                        <div className="featured-class-content">
                            <div className="featured-badges">
                                <span className="featured-badge time">{calcularTiempoRestante()}</span>
                                <span className="featured-badge intensity">
                                    {proximaClase.tipo?.toUpperCase() || 'CLASE'}
                                </span>
                            </div>

                            <h3 className="featured-class-title">
                                <span className="main-title">{proximaClase.nombre?.split(' ')[0] || 'CLASE'}</span>
                                <span className="sub-title">{proximaClase.nombre?.split(' ').slice(1).join(' ') || 'DISPONIBLE'}</span>
                            </h3>

                            <div className="featured-class-meta">
                                <div className="meta-item">
                                    <span className="meta-icon">🕐</span>
                                    <span>{formatHora(proximaClase.hora_inicio)} ({calcularDuracion()})</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-icon">📍</span>
                                    <span>Sala Principal</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-icon">👤</span>
                                    <span>{proximaClase.instructor_nombre || 'Instructor'}</span>
                                </div>
                            </div>

                            <button className="checkin-btn" onClick={() => navigate('/clases')}>
                                Hacer Check-in
                                <span>→</span>
                            </button>
                        </div>

                        <div className="featured-class-image">
                            <img
                                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
                                alt="Gym"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="featured-class-section">
                    <div className="no-classes-card">
                        <div className="no-classes-icon">📅</div>
                        <h3 className="no-classes-title">No hay clases disponibles</h3>
                        <p className="no-classes-text">Las próximas clases aparecerán aquí cuando estén disponibles para reservar.</p>
                        <button className="explore-classes-btn" onClick={() => navigate('/clases')}>
                            Ver Todas las Clases
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Admin/User para testing */}
            {user?.rol?.toLowerCase() === 'administrador' && (
                <div className="role-toggle">
                    <button className="role-btn active">Usuario</button>
                    <button className="role-btn" onClick={() => navigate('/admin')}>Admin</button>
                </div>
            )}
        </UserLayout>
    )
}

export default UserDashboard
