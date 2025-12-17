import { useState, useEffect } from 'react'
import api from '../../services/api'
import InstructorLayout from '../../components/InstructorLayout'
import { formatFechaCorta, getHoy } from '../../utils/formatters'

export default function InstructorAsistencia() {
    const [clases, setClases] = useState([])
    const [claseSeleccionada, setClaseSeleccionada] = useState(null)
    const [reservas, setReservas] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingReservas, setLoadingReservas] = useState(false)

    useEffect(() => {
        fetchMisClases()
    }, [])

    async function fetchMisClases() {
        setLoading(true)
        try {
            const res = await api.get('clases/mis-clases/')
            const clasesData = res.data.results || res.data || []
            // Filtrar solo clases de hoy o futuras
            const hoy = getHoy()
            const clasesFiltradas = clasesData.filter(c => c.fecha >= hoy)
            clasesFiltradas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
            setClases(clasesFiltradas)
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }

    async function fetchReservasClase(claseId) {
        setLoadingReservas(true)
        try {
            const res = await api.get(`clases/${claseId}/reservas/`)
            setReservas(res.data.results || res.data || [])
        } catch (err) {
            console.error('Error cargando reservas:', err)
            setReservas([])
        } finally {
            setLoadingReservas(false)
        }
    }

    const handleSelectClase = (clase) => {
        setClaseSeleccionada(clase)
        fetchReservasClase(clase.id)
    }

    return (
        <InstructorLayout title="Asistencia">
            {/* Header */}
            <div className="relative overflow-hidden mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-teal-900/30 to-cyan-900/40"></div>
                <div className="relative z-10 py-8 px-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-green-500 to-teal-600 p-3 rounded-xl">
                            <span className="text-2xl">✅</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white">Control de Asistencia</h2>
                            <p className="text-gray-400">Ver los inscritos en tus clases</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lista de clases */}
                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                        <h3 className="text-lg font-bold text-white mb-4">Selecciona una clase</h3>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : clases.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No hay clases programadas</p>
                        ) : (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {clases.map(clase => (
                                    <button
                                        key={clase.id}
                                        onClick={() => handleSelectClase(clase)}
                                        className={`w-full text-left p-4 rounded-xl transition-all ${claseSeleccionada?.id === clase.id
                                            ? 'bg-cyan-500/20 border-2 border-cyan-500'
                                            : 'bg-gray-800/50 border border-gray-700/50 hover:border-cyan-500/30'
                                            }`}
                                    >
                                        <p className="font-bold text-white text-sm">{clase.nombre}</p>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-gray-400 text-xs">{formatFechaCorta(clase.fecha)}</span>
                                            <span className="text-cyan-400 text-xs">{clase.hora_inicio}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Detalle de asistencia */}
                <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        {!claseSeleccionada ? (
                            <div className="text-center py-16">
                                <span className="text-6xl mb-4 block opacity-30">👈</span>
                                <p className="text-gray-400">Selecciona una clase para ver los inscritos</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{claseSeleccionada.nombre}</h3>
                                        <p className="text-gray-400 capitalize">
                                            {formatFechaCorta(claseSeleccionada.fecha)} - {claseSeleccionada.hora_inicio}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-cyan-400">{reservas.length}</p>
                                        <p className="text-gray-500 text-sm">inscritos</p>
                                    </div>
                                </div>

                                {loadingReservas ? (
                                    <div className="flex justify-center py-12">
                                        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : reservas.length === 0 ? (
                                    <div className="text-center py-12">
                                        <span className="text-5xl mb-4 block opacity-30">👥</span>
                                        <p className="text-gray-400">No hay alumnos inscritos</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {reservas.map((reserva, idx) => (
                                            <div
                                                key={reserva.id}
                                                className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/30"
                                            >
                                                <span className="text-gray-500 font-mono w-6">{idx + 1}</span>
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(reserva.socio?.first_name || 'U')}&background=06b6d4&color=fff&size=40`}
                                                    alt=""
                                                    className="w-10 h-10 rounded-full"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-white">
                                                        {reserva.socio?.first_name} {reserva.socio?.last_name}
                                                    </p>
                                                    <p className="text-gray-500 text-sm">{reserva.socio?.email}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${reserva.estado === 'CONFIRMADA'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : reserva.estado === 'COMPLETADA'
                                                        ? 'bg-blue-500/20 text-blue-400'
                                                        : 'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {reserva.estado}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </InstructorLayout>
    )
}
