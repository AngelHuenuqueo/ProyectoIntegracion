import { useState, useEffect } from 'react'
import api from '../../services/api'
import InstructorLayout from '../../components/InstructorLayout'

export default function InstructorPerfil() {
    const [user, setUser] = useState(null)
    const [instructor, setInstructor] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPerfil()
    }, [])

    async function fetchPerfil() {
        setLoading(true)
        try {
            const userRes = await api.get('usuarios/me/')
            setUser(userRes.data)

            // Intentar obtener perfil de instructor
            try {
                const instructorRes = await api.get('instructores/mi-perfil/')
                setInstructor(instructorRes.data)
            } catch {
                // El instructor puede no tener perfil adicional
            }
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <InstructorLayout title="Mi Perfil">
                <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </InstructorLayout>
        )
    }

    return (
        <InstructorLayout title="Mi Perfil">
            {/* Header */}
            <div className="relative overflow-hidden mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-teal-900/30 to-blue-900/40"></div>
                <div className="absolute top-4 right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>

                <div className="relative z-10 py-12 px-8">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-cyan-500 rounded-full blur-xl opacity-50"></div>
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.first_name || 'I')}&background=06b6d4&color=fff&size=120`}
                                alt="Avatar"
                                className="relative w-28 h-28 rounded-full border-4 border-cyan-500"
                            />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-white">
                                {user?.first_name} {user?.last_name}
                            </h2>
                            <p className="text-cyan-400 font-semibold mt-1">Instructor</p>
                            {instructor?.especialidades && (
                                <p className="text-gray-400 mt-2">{instructor.especialidades}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información Personal */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span>👤</span> Información Personal
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl">
                            <span className="text-2xl">📧</span>
                            <div>
                                <p className="text-gray-400 text-sm">Email</p>
                                <p className="text-white font-medium">{user?.email || 'No especificado'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl">
                            <span className="text-2xl">📱</span>
                            <div>
                                <p className="text-gray-400 text-sm">Teléfono</p>
                                <p className="text-white font-medium">{user?.telefono || 'No especificado'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl">
                            <span className="text-2xl">🏷️</span>
                            <div>
                                <p className="text-gray-400 text-sm">Usuario</p>
                                <p className="text-white font-medium">{user?.username}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información Profesional */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span>🏋️</span> Información Profesional
                    </h3>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-800/50 rounded-xl">
                            <p className="text-gray-400 text-sm mb-2">Especialidades</p>
                            <div className="flex flex-wrap gap-2">
                                {(instructor?.especialidades || 'General').split(',').map((esp, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium"
                                    >
                                        {esp.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {instructor?.biografia && (
                            <div className="p-4 bg-gray-800/50 rounded-xl">
                                <p className="text-gray-400 text-sm mb-2">Biografía</p>
                                <p className="text-white">{instructor.biografia}</p>
                            </div>
                        )}

                        <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">✅</span>
                                <div>
                                    <p className="text-cyan-400 font-semibold">Estado: Activo</p>
                                    <p className="text-gray-400 text-sm">Instructor verificado</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </InstructorLayout>
    )
}
