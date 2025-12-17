import { useState, useEffect } from 'react'
import api from '../../services/api'
import InstructorLayout from '../../components/InstructorLayout'
import { formatFecha, esHoy, esPasada } from '../../utils/formatters'
import Toast from '../../components/Toast'

export default function InstructorClases() {
    const [clases, setClases] = useState([])
    const [loading, setLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)
    const [claseEditando, setClaseEditando] = useState(null)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

    useEffect(() => {
        fetchMisClases()
    }, [])

    async function fetchMisClases() {
        setLoading(true)
        try {
            const res = await api.get('clases/mis-clases/')
            const clasesData = res.data.results || res.data || []
            // Ordenar por fecha
            clasesData.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
            setClases(clasesData)
        } catch (err) {
            console.error('Error cargando clases:', err)
        } finally {
            setLoading(false)
        }
    }

    function abrirModalEdicion(clase) {
        setClaseEditando({ ...clase })
        setShowEditModal(true)
    }

    function cerrarModalEdicion() {
        setShowEditModal(false)
        setClaseEditando(null)
    }

    async function guardarCambios() {
        if (!claseEditando) return

        try {
            await api.patch(`clases/${claseEditando.id}/instructor-actualizar/`, {
                nombre: claseEditando.nombre,
                descripcion: claseEditando.descripcion,
                fecha: claseEditando.fecha,
                hora_inicio: claseEditando.hora_inicio,
                hora_fin: claseEditando.hora_fin,
                cupos_totales: claseEditando.cupos_totales,
                tipo: claseEditando.tipo
            })

            setToast({ show: true, message: 'Clase actualizada correctamente', type: 'success' })
            cerrarModalEdicion()
            fetchMisClases()
        } catch (err) {
            console.error('Error actualizando clase:', err)
            setToast({ 
                show: true, 
                message: err.response?.data?.detail || 'Error al actualizar la clase', 
                type: 'error' 
            })
        }
    }

    function handleInputChange(campo, valor) {
        setClaseEditando(prev => ({ ...prev, [campo]: valor }))
    }

    return (
        <InstructorLayout title="Mis Clases">
            {/* Header */}
            <div className="relative overflow-hidden mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-teal-900/30 to-blue-900/40"></div>
                <div className="relative z-10 py-8 px-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-cyan-500 to-teal-600 p-3 rounded-xl">
                            <span className="text-2xl">📋</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white">Mis Clases</h2>
                            <p className="text-gray-400">Gestiona las clases que impartes</p>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : clases.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-16 text-center">
                    <span className="text-6xl mb-4 block opacity-50">📭</span>
                    <h3 className="text-xl font-bold text-white mb-2">No tienes clases asignadas</h3>
                    <p className="text-gray-400">Contacta al administrador para asignarte clases</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {clases.map(clase => (
                        <div
                            key={clase.id}
                            className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border rounded-2xl p-6 transition-all hover:shadow-lg ${esHoy(clase.fecha)
                                ? 'border-cyan-500/50 shadow-cyan-500/10'
                                : esPasada(clase.fecha)
                                    ? 'border-gray-700/30 opacity-60'
                                    : 'border-white/10 hover:border-cyan-500/30'
                                }`}
                        >
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${esHoy(clase.fecha)
                                        ? 'bg-cyan-500/20'
                                        : esPasada(clase.fecha)
                                            ? 'bg-gray-700/50'
                                            : 'bg-teal-500/20'
                                        }`}>
                                        <span className="text-2xl">
                                            {clase.tipo === 'spinning' ? '🚴' :
                                                clase.tipo === 'yoga' ? '🧘' :
                                                    clase.tipo === 'pilates' ? '🤸' :
                                                        clase.tipo === 'cardio' ? '💪' :
                                                            clase.tipo === 'musculacion' ? '🏋️' : '🏃'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{clase.nombre}</h3>
                                        <p className="text-gray-400 text-sm capitalize">{formatFecha(clase.fecha)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-white">{clase.hora_inicio}</p>
                                        <p className="text-gray-500 text-xs">Hora inicio</p>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-cyan-400">{clase.cupos_ocupados}/{clase.cupos_totales}</p>
                                        <p className="text-gray-500 text-xs">Inscritos</p>
                                    </div>

                                    {esHoy(clase.fecha) && (
                                        <span className="px-4 py-2 bg-cyan-500 text-white rounded-full text-sm font-bold animate-pulse">
                                            HOY
                                        </span>
                                    )}

                                    {!esPasada(clase.fecha) && (
                                        <button
                                            onClick={() => abrirModalEdicion(clase)}
                                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all"
                                        >
                                            ✏️ Editar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de edición */}
            {showEditModal && claseEditando && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
                        <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-teal-600 p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">✏️ Editar Clase</h2>
                            <button
                                onClick={cerrarModalEdicion}
                                className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    value={claseEditando.nombre}
                                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Descripción</label>
                                <textarea
                                    value={claseEditando.descripcion}
                                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Tipo</label>
                                    <select
                                        value={claseEditando.tipo}
                                        onChange={(e) => handleInputChange('tipo', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    >
                                        <option value="spinning">🚴 Spinning</option>
                                        <option value="yoga">🧘 Yoga</option>
                                        <option value="pilates">🤸 Pilates</option>
                                        <option value="cardio">💪 Cardio</option>
                                        <option value="musculacion">🏋️ Musculación</option>
                                        <option value="funcional">🏃 Funcional</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Fecha</label>
                                    <input
                                        type="date"
                                        value={claseEditando.fecha}
                                        onChange={(e) => handleInputChange('fecha', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Hora Inicio</label>
                                    <input
                                        type="time"
                                        value={claseEditando.hora_inicio}
                                        onChange={(e) => handleInputChange('hora_inicio', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Hora Fin</label>
                                    <input
                                        type="time"
                                        value={claseEditando.hora_fin}
                                        onChange={(e) => handleInputChange('hora_fin', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Cupos Totales</label>
                                    <input
                                        type="number"
                                        value={claseEditando.cupos_totales}
                                        onChange={(e) => handleInputChange('cupos_totales', parseInt(e.target.value))}
                                        min="1"
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={guardarCambios}
                                    className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all"
                                >
                                    💾 Guardar Cambios
                                </button>
                                <button
                                    onClick={cerrarModalEdicion}
                                    className="px-6 bg-gray-700 text-white py-3 rounded-lg font-bold hover:bg-gray-600 transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </InstructorLayout>
    )
}
