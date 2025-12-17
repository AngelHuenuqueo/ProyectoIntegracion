import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Toast from '../../components/Toast'
import ConfirmModal from '../../components/ConfirmModal'
import AdminLayout from './AdminLayout'
import { VALIDATION } from '../../utils/constants'
import './Admin.css'

function AdminEquipamiento() {
    const navigate = useNavigate()
    const [equipos, setEquipos] = useState([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')
    const [mostrarModal, setMostrarModal] = useState(false)
    const [modoEdicion, setModoEdicion] = useState(false)
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
    const [equipoAEliminar, setEquipoAEliminar] = useState(null)

    const [equipoForm, setEquipoForm] = useState({
        id: null,
        nombre: '',
        categoria: 'fuerza',
        marca: '',
        modelo: '',
        numero_serie: '',
        descripcion: '',
        imagen: null,
        imagen_preview: null,
        ubicacion: '',
        estado: 'disponible',
        fecha_compra: '',
        ultimo_mantenimiento: '',
        proximo_mantenimiento: '',
        notas_mantenimiento: ''
    })

    const categorias = [
        { value: 'cardio', label: 'Cardio' },
        { value: 'fuerza', label: 'Fuerza' },
        { value: 'peso_libre', label: 'Peso Libre' },
        { value: 'funcional', label: 'Funcional' },
        { value: 'otro', label: 'Otro' }
    ]

    const estados = [
        { value: 'disponible', label: 'Disponible' },
        { value: 'en_uso', label: 'En Uso' },
        { value: 'mantenimiento', label: 'En Mantenimiento' },
        { value: 'fuera_servicio', label: 'Fuera de Servicio' }
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

    const cargarEquipos = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get('/equipos/')
            setEquipos(res.data.results || res.data || [])
        } catch (error) {
            console.error('Error cargando equipos:', error)
            showToast('Error al cargar equipos', 'error')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        verificarPermiso()
        cargarEquipos()
    }, [verificarPermiso, cargarEquipos])

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type })
    }

    const abrirModalNuevo = () => {
        setEquipoForm({
            id: null,
            nombre: '',
            categoria: 'fuerza',
            marca: '',
            modelo: '',
            numero_serie: '',
            descripcion: '',
            imagen: null,
            imagen_preview: null,
            ubicacion: '',
            estado: 'disponible',
            fecha_compra: '',
            ultimo_mantenimiento: '',
            proximo_mantenimiento: '',
            notas_mantenimiento: ''
        })
        setModoEdicion(false)
        setMostrarModal(true)
    }

    const abrirModalEditar = (equipo) => {
        setEquipoForm({
            id: equipo.id,
            nombre: equipo.nombre || '',
            categoria: equipo.categoria || 'fuerza',
            marca: equipo.marca || '',
            modelo: equipo.modelo || '',
            numero_serie: equipo.numero_serie || '',
            descripcion: equipo.descripcion || '',
            imagen: null,
            imagen_preview: equipo.imagen || null,
            ubicacion: equipo.ubicacion || '',
            estado: equipo.estado || 'disponible',
            fecha_compra: equipo.fecha_compra || '',
            ultimo_mantenimiento: equipo.ultimo_mantenimiento || '',
            proximo_mantenimiento: equipo.proximo_mantenimiento || '',
            notas_mantenimiento: equipo.notas_mantenimiento || ''
        })
        setModoEdicion(true)
        setMostrarModal(true)
    }

    const handleImagenChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validar tamaño
            if (file.size > VALIDATION.MAX_IMAGE_SIZE) {
                showToast(`La imagen no debe superar ${VALIDATION.MAX_IMAGE_SIZE / 1024 / 1024}MB`, 'error')
                return
            }

            // Validar tipo
            if (!VALIDATION.ALLOWED_IMAGE_TYPES.includes(file.type)) {
                showToast('El archivo debe ser una imagen válida (JPG, PNG, GIF, WEBP)', 'error')
                return
            }

            // Crear preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setEquipoForm({
                    ...equipoForm,
                    imagen: file,
                    imagen_preview: reader.result
                })
            }
            reader.readAsDataURL(file)
        }
    }

    const guardarEquipo = async () => {
        try {
            const formData = new FormData()
            
            // Agregar todos los campos
            formData.append('nombre', equipoForm.nombre)
            formData.append('categoria', equipoForm.categoria)
            formData.append('marca', equipoForm.marca || '')
            formData.append('modelo', equipoForm.modelo || '')
            if (equipoForm.numero_serie) formData.append('numero_serie', equipoForm.numero_serie)
            formData.append('descripcion', equipoForm.descripcion || '')
            formData.append('ubicacion', equipoForm.ubicacion || '')
            formData.append('estado', equipoForm.estado)
            if (equipoForm.fecha_compra) formData.append('fecha_compra', equipoForm.fecha_compra)
            if (equipoForm.ultimo_mantenimiento) formData.append('ultimo_mantenimiento', equipoForm.ultimo_mantenimiento)
            if (equipoForm.proximo_mantenimiento) formData.append('proximo_mantenimiento', equipoForm.proximo_mantenimiento)
            formData.append('notas_mantenimiento', equipoForm.notas_mantenimiento || '')
            formData.append('activo', 'true')

            // Agregar imagen si existe
            if (equipoForm.imagen) {
                formData.append('imagen', equipoForm.imagen)
            }

            if (modoEdicion) {
                await api.put(`/equipos/${equipoForm.id}/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                showToast('✅ Equipo actualizado correctamente')
            } else {
                await api.post('/equipos/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                showToast('✅ Equipo creado correctamente')
            }
            setMostrarModal(false)
            cargarEquipos()
        } catch (error) {
            console.error('Error guardando equipo:', error)
            showToast(error.response?.data?.detail || 'Error al guardar equipo', 'error')
        }
    }

    const confirmarEliminar = (equipo) => {
        setEquipoAEliminar(equipo)
        setMostrarConfirmacion(true)
    }

    const eliminarEquipo = async () => {
        try {
            await api.delete(`/equipos/${equipoAEliminar.id}/`)
            showToast('✅ Equipo eliminado correctamente')
            setMostrarConfirmacion(false)
            setEquipoAEliminar(null)
            cargarEquipos()
        } catch (error) {
            console.error('Error eliminando equipo:', error)
            showToast('Error al eliminar equipo', 'error')
        }
    }

    const marcarMantenimiento = async (equipo) => {
        try {
            await api.post(`/equipos/${equipo.id}/marcar_mantenimiento/`)
            showToast('🔧 Equipo marcado en mantenimiento')
            cargarEquipos()
        } catch (error) {
            console.error('Error al marcar mantenimiento:', error)
            showToast('Error al marcar mantenimiento', 'error')
        }
    }

    const finalizarMantenimiento = async (equipo) => {
        try {
            await api.post(`/equipos/${equipo.id}/finalizar_mantenimiento/`)
            showToast('✅ Mantenimiento finalizado')
            cargarEquipos()
        } catch (error) {
            console.error('Error al finalizar mantenimiento:', error)
            showToast('Error al finalizar mantenimiento', 'error')
        }
    }

    const equiposFiltrados = equipos.filter(equipo => {
        const matchBusqueda = equipo.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            equipo.marca?.toLowerCase().includes(busqueda.toLowerCase())
        const matchCategoria = !filtroCategoria || equipo.categoria === filtroCategoria
        const matchEstado = !filtroEstado || equipo.estado === filtroEstado
        return matchBusqueda && matchCategoria && matchEstado
    })

    const getEstadoBadgeClass = (estado) => {
        const classes = {
            disponible: 'badge-estado activo',
            en_uso: 'badge-estado completada',
            mantenimiento: 'badge-estado noshow',
            fuera_servicio: 'badge-estado cancelada'
        }
        return classes[estado] || 'badge-estado'
    }

    if (loading) {
        return (
            <AdminLayout title="🏋️ Gestión de Equipamiento" subtitle="Administrar máquinas y equipos del gimnasio">
                <div className="loading">Cargando equipos...</div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title="🏋️ Gestión de Equipamiento" subtitle="Administrar máquinas y equipos del gimnasio">
            {/* Acciones */}
            <div className="header-actions" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                <button className="btn-primary" onClick={abrirModalNuevo}>➕ Nuevo Equipo</button>
            </div>

            {/* Filtros */}
            <div className="filters-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Buscar por nombre o marca..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                <select
                    className="filter-select"
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </select>
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
                <span className="filter-stats">{equiposFiltrados.length} equipos</span>
            </div>

            {/* Tabla */}
            <div className="table-container">
                <table className="admin-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>Imagen</th>
                            <th style={{ width: '18%' }}>Equipo</th>
                            <th style={{ width: '12%' }}>Categoría</th>
                            <th style={{ width: '15%' }}>Marca/Modelo</th>
                            <th style={{ width: '15%' }}>Ubicación</th>
                            <th style={{ width: '12%' }}>Estado</th>
                            <th style={{ width: '140px' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equiposFiltrados.map(equipo => (
                            <tr key={equipo.id}>
                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                    {equipo.imagen ? (
                                        <img 
                                            src={equipo.imagen} 
                                            alt={equipo.nombre}
                                            style={{
                                                width: '55px',
                                                height: '55px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                border: '2px solid #e2e8f0'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '55px',
                                            height: '55px',
                                            backgroundColor: '#f1f5f9',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '24px'
                                        }}>
                                            🏋️
                                        </div>
                                    )}
                                </td>
                                <td style={{ fontWeight: '600', wordBreak: 'break-word' }}>{equipo.nombre}</td>
                                <td>
                                    <span className="badge-rol instructor" style={{ fontSize: '0.75rem', padding: '4px 8px', whiteSpace: 'nowrap' }}>
                                        {categorias.find(c => c.value === equipo.categoria)?.label || equipo.categoria}
                                    </span>
                                </td>
                                <td style={{ fontSize: '0.85rem', color: '#cbd5e1', wordBreak: 'break-word' }}>
                                    <div>{equipo.marca || '-'}</div>
                                    {equipo.modelo && <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{equipo.modelo}</div>}
                                </td>
                                <td style={{ fontSize: '0.85rem', color: '#cbd5e1', wordBreak: 'break-word' }}>{equipo.ubicacion || '-'}</td>
                                <td>
                                    <span className={getEstadoBadgeClass(equipo.estado)} style={{ fontSize: '0.75rem', padding: '4px 8px', whiteSpace: 'nowrap' }}>
                                        {estados.find(e => e.value === equipo.estado)?.label || equipo.estado}
                                    </span>
                                </td>
                                <td className="actions-cell" style={{ whiteSpace: 'nowrap' }}>
                                    <button className="btn-action" onClick={() => abrirModalEditar(equipo)} title="Editar">✏️</button>
                                    {equipo.estado === 'disponible' && (
                                        <button className="btn-action" onClick={() => marcarMantenimiento(equipo)} title="Marcar mantenimiento">🔧</button>
                                    )}
                                    {equipo.estado === 'mantenimiento' && (
                                        <button className="btn-action" onClick={() => finalizarMantenimiento(equipo)} title="Finalizar mantenimiento">✅</button>
                                    )}
                                    <button className="btn-action danger" onClick={() => confirmarEliminar(equipo)} title="Eliminar">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {equiposFiltrados.length === 0 && (
                    <div className="no-results">
                        <p>No se encontraron equipos</p>
                    </div>
                )}
            </div>

            {/* Modal Crear/Editar */}
            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '650px' }}>
                        <div className="modal-header">
                            <h2>{modoEdicion ? '✏️ Editar Equipo' : '➕ Nuevo Equipo'}</h2>
                            <button className="modal-close" onClick={() => setMostrarModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {/* Sección: Información Principal */}
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📦 Información Principal</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Nombre *</label>
                                        <input
                                            type="text"
                                            value={equipoForm.nombre}
                                            onChange={(e) => setEquipoForm({ ...equipoForm, nombre: e.target.value })}
                                            placeholder="Ej: Cinta de correr Pro 500"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Categoría</label>
                                        <select
                                            value={equipoForm.categoria}
                                            onChange={(e) => setEquipoForm({ ...equipoForm, categoria: e.target.value })}
                                        >
                                            {categorias.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Descripción</label>
                                        <textarea
                                            value={equipoForm.descripcion}
                                            onChange={(e) => setEquipoForm({ ...equipoForm, descripcion: e.target.value })}
                                            placeholder="Descripción del equipo..."
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sección: Detalles del Producto */}
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏷️ Detalles del Producto</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Marca</label>
                                        <input
                                            type="text"
                                            value={equipoForm.marca}
                                            onChange={(e) => setEquipoForm({ ...equipoForm, marca: e.target.value })}
                                            placeholder="Ej: Technogym"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Modelo</label>
                                        <input
                                            type="text"
                                            value={equipoForm.modelo}
                                            onChange={(e) => setEquipoForm({ ...equipoForm, modelo: e.target.value })}
                                            placeholder="Ej: Excite Run 700"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Número de Serie</label>
                                        <input
                                            type="text"
                                            value={equipoForm.numero_serie}
                                            onChange={(e) => setEquipoForm({ ...equipoForm, numero_serie: e.target.value })}
                                            placeholder="Opcional"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Fecha de Compra</label>
                                        <input
                                            type="date"
                                            value={equipoForm.fecha_compra}
                                            onChange={(e) => setEquipoForm({ ...equipoForm, fecha_compra: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sección: Ubicación y Estado */}
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📍 Ubicación y Estado</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Ubicación</label>
                                        <input
                                            type="text"
                                            value={equipoForm.ubicacion}
                                            onChange={(e) => setEquipoForm({ ...equipoForm, ubicacion: e.target.value })}
                                            placeholder="Ej: Sala de Cardio"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Estado</label>
                                        <select
                                            value={equipoForm.estado}
                                            onChange={(e) => setEquipoForm({ ...equipoForm, estado: e.target.value })}
                                        >
                                            {estados.map(est => (
                                                <option key={est.value} value={est.value}>{est.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Sección: Imagen */}
                            <div style={{ padding: '1rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🖼️ Imagen del Equipo</h3>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div style={{ flex: '1', minWidth: '200px' }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImagenChange}
                                            style={{ marginBottom: '0.5rem', width: '100%' }}
                                        />
                                        <small style={{ display: 'block', color: '#64748b', fontSize: '0.8rem' }}>
                                            📎 Máximo 5MB. Formatos: JPG, PNG, GIF, WEBP
                                        </small>
                                    </div>
                                    {equipoForm.imagen_preview && (
                                        <div style={{ position: 'relative' }}>
                                            <img 
                                                src={equipoForm.imagen_preview} 
                                                alt="Preview"
                                                style={{
                                                    width: '100px',
                                                    height: '100px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    border: '2px solid #8b5cf6'
                                                }}
                                            />
                                            {equipoForm.imagen && (
                                                <button
                                                    type="button"
                                                    onClick={() => setEquipoForm({ ...equipoForm, imagen: null, imagen_preview: null })}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-8px',
                                                        right: '-8px',
                                                        width: '22px',
                                                        height: '22px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        lineHeight: '1',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    title="Eliminar imagen"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-back" onClick={() => setMostrarModal(false)}>Cancelar</button>
                            <button
                                className="btn-save"
                                onClick={guardarEquipo}
                                disabled={!equipoForm.nombre}
                            >
                                {modoEdicion ? 'Guardar Cambios' : 'Crear Equipo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {/* Modal Confirmación Eliminar */}
            {mostrarConfirmacion && (
                <ConfirmModal
                    title="Eliminar Equipo"
                    message={`¿Estás seguro de eliminar "${equipoAEliminar?.nombre}"?`}
                    type="danger"
                    onConfirm={eliminarEquipo}
                    onCancel={() => {
                        setMostrarConfirmacion(false)
                        setEquipoAEliminar(null)
                    }}
                />
            )}
        </AdminLayout>
    )
}

export default AdminEquipamiento
