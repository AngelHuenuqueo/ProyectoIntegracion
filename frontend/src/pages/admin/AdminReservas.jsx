import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Toast from '../../components/Toast'
import AdminLayout from './AdminLayout'
import './Admin.css'

function AdminReservas() {
    const navigate = useNavigate()
    const [reservas, setReservas] = useState([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

    const estados = [
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'confirmada', label: 'Confirmada' },
        { value: 'cancelada', label: 'Cancelada' },
        { value: 'completada', label: 'Completada' },
        { value: 'noshow', label: 'No Show' }
    ]

    const verificarPermiso = useCallback(() => {
        const userStr = localStorage.getItem('user')
        if (userStr) {
            const user = JSON.parse(userStr)
            if (user.rol !== 'administrador') {
                alert('No tienes permisos para acceder a esta sección')
                navigate('/clases')
            }
        }
    }, [navigate])

    const cargarReservas = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get('/reservas/')
            setReservas(res.data.results || res.data || [])
        } catch (error) {
            console.error('Error cargando reservas:', error)
            showToast('Error al cargar reservas', 'error')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        verificarPermiso()
        cargarReservas()
    }, [verificarPermiso, cargarReservas])

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type })
    }

    const confirmarReserva = async (reservaId) => {
        try {
            await api.post(`/reservas/${reservaId}/confirmar/`)
            showToast('✅ Reserva confirmada')
            cargarReservas()
        } catch (error) {
            showToast(error.response?.data?.detail || 'Error al confirmar reserva', 'error')
        }
    }

    const cancelarReserva = async (reservaId) => {
        try {
            await api.post(`/reservas/${reservaId}/cancelar/`)
            showToast('❌ Reserva cancelada')
            cargarReservas()
        } catch (error) {
            showToast(error.response?.data?.detail || 'Error al cancelar reserva', 'error')
        }
    }

    const marcarNoShow = async (reservaId) => {
        try {
            await api.post(`/reservas/${reservaId}/noshow/`)
            showToast('⚠️ Marcado como No Show')
            cargarReservas()
        } catch (error) {
            showToast(error.response?.data?.detail || 'Error al marcar no show', 'error')
        }
    }

    const reservasFiltradas = reservas.filter(reserva => {
        const nombreSocio = reserva.socio ?
            `${reserva.socio.first_name} ${reserva.socio.last_name}`.toLowerCase() : ''
        const nombreClase = reserva.clase?.nombre?.toLowerCase() || ''
        const matchBusqueda = nombreSocio.includes(busqueda.toLowerCase()) ||
            nombreClase.includes(busqueda.toLowerCase())
        const matchEstado = !filtroEstado || reserva.estado === filtroEstado
        return matchBusqueda && matchEstado
    })

    const getEstadoBadgeClass = (estado) => {
        const classes = {
            pendiente: 'badge-estado noshow',
            confirmada: 'badge-estado activo',
            cancelada: 'badge-estado cancelada',
            completada: 'badge-estado completada',
            noshow: 'badge-estado inactivo'
        }
        return classes[estado] || 'badge-estado'
    }

    if (loading) {
        return (
            <AdminLayout title="🎫 Gestión de Reservas" subtitle="Ver y gestionar reservas de clases">
                <div className="loading">Cargando reservas...</div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title="🎫 Gestión de Reservas" subtitle="Ver y gestionar reservas de clases">
            {/* Filtros */}
            <div className="filters-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Buscar por socio o clase..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                <select
                    className="filter-select"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                >
                    <option value="">Todos los estados</option>
                    {estados.map(est => (
                        <option key={est.value} value={est.value}>{est.label}</option>
                    ))}
                </select>
                <span className="filter-stats">{reservasFiltradas.length} reservas</span>
            </div>

            {/* Tabla */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Socio</th>
                            <th>Clase</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservasFiltradas.map(reserva => (
                            <tr key={reserva.id}>
                                <td>
                                    <strong>
                                        {reserva.socio?.first_name} {reserva.socio?.last_name}
                                    </strong>
                                    <br />
                                    <small style={{ color: '#9CA3AF' }}>{reserva.socio?.email}</small>
                                </td>
                                <td>{reserva.clase?.nombre || 'Sin clase'}</td>
                                <td>{reserva.clase?.fecha || '-'}</td>
                                <td>{reserva.clase?.hora_inicio || '-'}</td>
                                <td>
                                    <span className={getEstadoBadgeClass(reserva.estado)}>
                                        {estados.find(e => e.value === reserva.estado)?.label || reserva.estado}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    {reserva.estado === 'pendiente' && (
                                        <>
                                            <button className="btn-action" onClick={() => confirmarReserva(reserva.id)} title="Confirmar">✅</button>
                                            <button className="btn-action danger" onClick={() => cancelarReserva(reserva.id)} title="Cancelar">❌</button>
                                        </>
                                    )}
                                    {reserva.estado === 'confirmada' && (
                                        <>
                                            <button className="btn-action" onClick={() => marcarNoShow(reserva.id)} title="No Show">⚠️</button>
                                            <button className="btn-action danger" onClick={() => cancelarReserva(reserva.id)} title="Cancelar">❌</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {reservasFiltradas.length === 0 && (
                    <div className="no-results">
                        <p>No se encontraron reservas</p>
                    </div>
                )}
            </div>

            {/* Toast */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </AdminLayout>
    )
}

export default AdminReservas
