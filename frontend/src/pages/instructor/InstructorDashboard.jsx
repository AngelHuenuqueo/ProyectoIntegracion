import { useState, useEffect } from 'react'
import api from '../../services/api'
import InstructorLayout from '../../components/InstructorLayout'
import { formatFecha, getHoy, getCurrentUser } from '../../utils/formatters'

export default function InstructorDashboard() {
    const [clases, setClases] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ hoy: 0, semana: 0, totalReservas: 0 })
    const user = getCurrentUser()

    useEffect(() => {
        fetchMisClases()
    }, [])

    async function fetchMisClases() {
        setLoading(true)
        try {
            const res = await api.get('clases/mis-clases/')
            const clasesData = res.data.results || res.data || []
            setClases(clasesData)

            // Calcular stats
            const hoy = getHoy()
            const clasesHoy = clasesData.filter(c => c.fecha === hoy).length
            const totalReservas = clasesData.reduce((acc, c) => acc + (c.cupos_ocupados || 0), 0)

            setStats({
                hoy: clasesHoy,
                semana: clasesData.length,
                totalReservas
            })
        } catch (err) {
            console.error('Error cargando clases:', err)
        } finally {
            setLoading(false)
        }
    }

    const hoy = getHoy()
    const clasesHoy = clases.filter(c => c.fecha === hoy)
    const proximasClases = clases.filter(c => c.fecha > hoy).slice(0, 5)

    return (
        <InstructorLayout title="Panel de Instructor">
            {/* Hero Section */}
            <div className="relative overflow-hidden mb-10">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-teal-900/30 to-blue-900/40"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>

                <div className="absolute top-4 right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-4 left-10 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10 py-12 px-8">
                    <div className="flex items-center gap-5 mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-cyan-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-cyan-500 to-teal-600 p-4 rounded-2xl shadow-2xl shadow-cyan-500/30">
                                <span className="text-3xl">👨‍🏫</span>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">Hola, </span>
                                <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                                    {user.first_name || 'Instructor'}
                                </span>
                            </h2>
                            <p className="text-gray-400 mt-2 font-medium">
                                {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-cyan-400 text-sm font-medium mb-1">Clases Hoy</p>
                            <p className="text-4xl font-black text-white">{stats.hoy}</p>
                        </div>
                        <div className="p-4 bg-cyan-500/20 rounded-xl">
                            <span className="text-3xl">📅</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-teal-500/20 to-teal-600/10 backdrop-blur-xl border border-teal-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-teal-400 text-sm font-medium mb-1">Clases Esta Semana</p>
                            <p className="text-4xl font-black text-white">{stats.semana}</p>
                        </div>
                        <div className="p-4 bg-teal-500/20 rounded-xl">
                            <span className="text-3xl">📋</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-400 text-sm font-medium mb-1">Total Alumnos</p>
                            <p className="text-4xl font-black text-white">{stats.totalReservas}</p>
                        </div>
                        <div className="p-4 bg-blue-500/20 rounded-xl">
                            <span className="text-3xl">👥</span>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Clases de Hoy */}
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span>📅</span> Clases de Hoy
                        </h3>

                        {clasesHoy.length === 0 ? (
                            <div className="text-center py-8">
                                <span className="text-5xl mb-4 block opacity-50">🏖️</span>
                                <p className="text-gray-400">No tienes clases hoy</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {clasesHoy.map(clase => (
                                    <div key={clase.id} className="bg-gray-800/50 rounded-xl p-4 border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-white">{clase.nombre}</h4>
                                                <p className="text-gray-400 text-sm">{clase.hora_inicio} - {clase.hora_fin}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium">
                                                    {clase.cupos_ocupados}/{clase.cupos_totales}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Próximas Clases */}
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span>🗓️</span> Próximas Clases
                        </h3>

                        {proximasClases.length === 0 ? (
                            <div className="text-center py-8">
                                <span className="text-5xl mb-4 block opacity-50">📭</span>
                                <p className="text-gray-400">No hay clases programadas</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {proximasClases.map(clase => (
                                    <div key={clase.id} className="bg-gray-800/50 rounded-xl p-4 border border-teal-500/20 hover:border-teal-500/40 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-white">{clase.nombre}</h4>
                                                <p className="text-gray-400 text-sm capitalize">{formatFecha(clase.fecha)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-teal-400 font-medium">{clase.hora_inicio}</p>
                                                <span className="text-gray-500 text-sm">{clase.cupos_ocupados} inscritos</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </InstructorLayout>
    )
}
