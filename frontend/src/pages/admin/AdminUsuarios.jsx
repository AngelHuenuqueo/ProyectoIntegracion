import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import AdminSidebar from './AdminSidebar'
import ConfirmModal from '../../components/ConfirmModal'
import Toast from '../../components/Toast'
import './Admin.css'
import './AdminSidebar.css'

function AdminUsuarios() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  // Estados para Modal de Confirmación y Toast
  const [modalConfirmacion, setModalConfirmacion] = useState({
    show: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => { },
    onCancel: () => { }
  })

  // Estado para Modal de Cambio de Contraseña
  const [modalPassword, setModalPassword] = useState({
    show: false,
    usuario: null,
    newPassword: ''
  })

  // Estado para Modal de Crear Usuario
  const [modalCrear, setModalCrear] = useState({
    show: false,
    nuevoUsuario: {
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      telefono: '',
      rol: 'socio'
    }
  })

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  })

  const mostrarNotificacion = (message, type = 'success') => {
    setToast({ show: true, message, type })
  }

  const cerrarConfirmacion = () => {
    setModalConfirmacion(prev => ({ ...prev, show: false }))
  }

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

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/usuarios/')
      const data = response.data.results || response.data || []
      setUsuarios(data)
    } catch (error) {
      console.error('Error cargando usuarios:', error)
      alert('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    verificarPermiso()
    cargarUsuarios()
  }, [verificarPermiso, cargarUsuarios])

  const filtrarUsuarios = () => {
    return usuarios.filter(usuario => {
      const matchBusqueda = usuario.username?.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.first_name?.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.last_name?.toLowerCase().includes(busqueda.toLowerCase())

      const matchRol = filtroRol === 'todos' || usuario.rol === filtroRol
      const matchEstado = filtroEstado === 'todos' ||
        (filtroEstado === 'activo' && usuario.is_active) ||
        (filtroEstado === 'inactivo' && !usuario.is_active)

      return matchBusqueda && matchRol && matchEstado
    })
  }

  const abrirModalEdicion = (usuario) => {
    setUsuarioEditando({ ...usuario })
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setUsuarioEditando(null)
    setMostrarModal(false)
  }

  const guardarCambios = async () => {
    try {
      await api.patch(`/usuarios/${usuarioEditando.id}/`, {
        first_name: usuarioEditando.first_name,
        last_name: usuarioEditando.last_name,
        email: usuarioEditando.email,
        telefono: usuarioEditando.telefono,
        rol: usuarioEditando.rol,
        is_active: usuarioEditando.is_active
      })
      alert('Usuario actualizado exitosamente')
      cerrarModal()
      cargarUsuarios()
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      alert('Error al actualizar usuario')
    }
  }

  const toggleEstadoUsuario = (usuario) => {
    setModalConfirmacion({
      show: true,
      title: usuario.is_active ? 'Desactivar Usuario' : 'Activar Usuario',
      message: `¿Estás seguro de ${usuario.is_active ? 'desactivar' : 'activar'} al usuario ${usuario.username}?`,
      type: usuario.is_active ? 'warning' : 'info',
      onCancel: cerrarConfirmacion,
      onConfirm: async () => {
        try {
          await api.patch(`/usuarios/${usuario.id}/`, {
            is_active: !usuario.is_active
          })
          mostrarNotificacion(`Usuario ${usuario.is_active ? 'desactivado' : 'activado'} exitosamente`, 'success')
          cargarUsuarios()
          cerrarConfirmacion()
        } catch (error) {
          console.error('Error cambiando estado:', error)
          mostrarNotificacion('Error al cambiar estado del usuario', 'error')
          cerrarConfirmacion()
        }
      }
    })
  }

  const eliminarUsuario = (usuario) => {
    setModalConfirmacion({
      show: true,
      title: 'Eliminar Usuario',
      message: `¿Estás SEGURO de ELIMINAR definitivamente al usuario ${usuario.username}? Esta acción NO se puede deshacer.`,
      type: 'danger',
      onCancel: cerrarConfirmacion,
      onConfirm: async () => {
        try {
          await api.delete(`/usuarios/${usuario.id}/`)
          mostrarNotificacion('Usuario eliminado exitosamente', 'success')
          cargarUsuarios()
          cerrarConfirmacion()
        } catch (error) {
          console.error('Error eliminando usuario:', error)
          mostrarNotificacion('Error al eliminar usuario. Puede tener reservas asociadas.', 'error')
          cerrarConfirmacion()
        }
      }
    })
  }

  // Funciones para cambio de contraseña
  const abrirModalPassword = (usuario) => {
    setModalPassword({
      show: true,
      usuario: usuario,
      newPassword: ''
    })
  }

  const cerrarModalPassword = () => {
    setModalPassword({
      show: false,
      usuario: null,
      newPassword: ''
    })
  }

  const enviarPasswordAdmin = async (e) => {
    e.preventDefault()
    if (!modalPassword.newPassword || modalPassword.newPassword.length < 6) {
      mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error')
      return
    }

    try {
      await api.post(`/usuarios/${modalPassword.usuario.id}/admin_cambiar_password/`, {
        password: modalPassword.newPassword
      })
      mostrarNotificacion(`Contraseña actualizada para ${modalPassword.usuario.username}`, 'success')
      cerrarModalPassword()
    } catch (error) {
      console.error('Error cambiando contraseña:', error)
      mostrarNotificacion('Error al cambiar contraseña', 'error')
    }
  }

  // Funciones para crear usuario
  const abrirModalCrear = () => {
    setModalCrear({
      show: true,
      nuevoUsuario: {
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        telefono: '',
        rol: 'socio'
      }
    })
  }

  const cerrarModalCrear = () => {
    setModalCrear({
      show: false,
      nuevoUsuario: {
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        telefono: '',
        rol: 'socio'
      }
    })
  }

  const crearUsuario = async (e) => {
    e.preventDefault()
    const { username, email, password, first_name, last_name, telefono, rol } = modalCrear.nuevoUsuario

    // Validaciones
    if (!username || !email || !password || !first_name || !last_name) {
      mostrarNotificacion('Por favor completa todos los campos obligatorios', 'error')
      return
    }

    if (password.length < 6) {
      mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error')
      return
    }

    try {
      await api.post('/usuarios/admin_crear/', {
        username,
        email,
        password,
        first_name,
        last_name,
        telefono,
        rol
      })
      mostrarNotificacion(`Usuario ${username} creado exitosamente`, 'success')
      cerrarModalCrear()
      cargarUsuarios()
    } catch (error) {
      console.error('Error creando usuario:', error)
      const errorMsg = error.response?.data?.error ||
                      error.response?.data?.username?.[0] || 
                      error.response?.data?.email?.[0] || 
                      'Error al crear usuario'
      mostrarNotificacion(errorMsg, 'error')
    }
  }

  const usuariosFiltrados = filtrarUsuarios()

  if (loading) {
    return (
      <div className="admin-with-sidebar">
        <AdminSidebar />
        <div className="admin-main-content">
          <div className="dashboard-body">
            <div className="loading">Cargando usuarios...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-with-sidebar">
      <AdminSidebar />
      <div className="admin-main-content">
        <div className="dashboard-body">
          <div className="admin-page-header">
            <div>
              <h1>👥 Gestión de Socios</h1>
              <p>Administración completa de usuarios del gimnasio</p>
            </div>
            <button 
              onClick={abrirModalCrear}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              <span style={{ fontSize: '20px' }}>➕</span>
              Crear Usuario
            </button>
          </div>

          {/* Filtros y búsqueda */}
          <div className="filters-bar">
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, usuario o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />

            <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} className="filter-select">
              <option value="todos">Todos los Roles</option>
              <option value="socio">Socios</option>
              <option value="instructor">Instructores</option>
              <option value="administrador">Administradores</option>
            </select>

            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="filter-select">
              <option value="todos">Todos los Estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>

            <div className="filter-stats">
              Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
            </div>
          </div>

          {/* Tabla de usuarios */}
          <div className="table-container">
            <table className="admin-table users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map(usuario => {
                  const iniciales = `${usuario.first_name?.charAt(0) || ''}${usuario.last_name?.charAt(0) || ''}`.toUpperCase() || usuario.username.substring(0, 2).toUpperCase();
                  const coloresAvatar = ['#e94560', '#3b82f6', '#a855f7', '#22c55e', '#f59e0b', '#ec4899'];
                  const colorAvatar = coloresAvatar[usuario.id % coloresAvatar.length];

                  return (
                    <tr key={usuario.id} className={!usuario.is_active ? 'inactive-row' : ''}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar" style={{ background: colorAvatar }}>
                            {iniciales}
                          </div>
                          <div className="user-info">
                            <div className="user-name">{usuario.first_name} {usuario.last_name}</div>
                            <div className="user-username">@{usuario.username}</div>
                            {usuario.telefono && <div className="user-phone">📱 {usuario.telefono}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="email-cell">
                          <span className="email-text">{usuario.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge-rol-new ${usuario.rol}`}>
                          {usuario.rol === 'socio' && '👤 '}
                          {usuario.rol === 'instructor' && '🎓 '}
                          {usuario.rol === 'administrador' && '👑 '}
                          {usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`status-toggle ${usuario.is_active ? 'active' : 'inactive'}`}
                          onClick={() => toggleEstadoUsuario(usuario)}
                          title={usuario.is_active ? 'Click para desactivar' : 'Click para activar'}
                        >
                          {usuario.is_active ? '✓ Activo' : '✕ Inactivo'}
                        </button>
                      </td>
                      <td>
                        <div className="action-buttons-new">
                          <button
                            className="btn-action-new edit"
                            onClick={() => abrirModalEdicion(usuario)}
                            title="Editar usuario"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-action-new password"
                            onClick={() => abrirModalPassword(usuario)}
                            title="Cambiar contraseña"
                          >
                            🔑
                          </button>
                          <button
                            className="btn-action-new delete"
                            onClick={() => eliminarUsuario(usuario)}
                            title="Eliminar usuario"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {usuariosFiltrados.length === 0 && (
              <div className="no-results">
                <p>No se encontraron usuarios con los filtros aplicados</p>
              </div>
            )}
          </div>

          {/* Modal de edición */}
          {mostrarModal && usuarioEditando && (
            <div className="modal-overlay" onClick={cerrarModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Editar Usuario</h2>
                  <button className="btn-close" onClick={cerrarModal}>✖</button>
                </div>

                <div className="modal-body">
                  <div className="form-group">
                    <label>Usuario</label>
                    <input
                      type="text"
                      value={usuarioEditando.username}
                      disabled
                      className="input-disabled"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre *</label>
                      <input
                        type="text"
                        value={usuarioEditando.first_name}
                        onChange={(e) => setUsuarioEditando({ ...usuarioEditando, first_name: e.target.value })}
                        placeholder="Nombre"
                      />
                    </div>

                    <div className="form-group">
                      <label>Apellido *</label>
                      <input
                        type="text"
                        value={usuarioEditando.last_name}
                        onChange={(e) => setUsuarioEditando({ ...usuarioEditando, last_name: e.target.value })}
                        placeholder="Apellido"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={usuarioEditando.email}
                      onChange={(e) => setUsuarioEditando({ ...usuarioEditando, email: e.target.value })}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={usuarioEditando.telefono || ''}
                      onChange={(e) => setUsuarioEditando({ ...usuarioEditando, telefono: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Rol *</label>
                      <select
                        value={usuarioEditando.rol}
                        onChange={(e) => setUsuarioEditando({ ...usuarioEditando, rol: e.target.value })}
                      >
                        <option value="socio">Socio</option>
                        <option value="instructor">Instructor</option>
                        <option value="administrador">Administrador</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Estado *</label>
                      <select
                        value={usuarioEditando.is_active ? 'true' : 'false'}
                        onChange={(e) => setUsuarioEditando({ ...usuarioEditando, is_active: e.target.value === 'true' })}
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn-cancel" onClick={cerrarModal}>Cancelar</button>
                  <button className="btn-save" onClick={guardarCambios}>Guardar Cambios</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Crear Usuario */}
          {modalCrear.show && (
            <div className="modal-overlay" onClick={cerrarModalCrear}>
              <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>➕ Crear Nuevo Usuario</h2>
                  <button className="btn-close" onClick={cerrarModalCrear}>✖</button>
                </div>

                <form onSubmit={crearUsuario}>
                  <div className="modal-body">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Usuario * <span style={{fontSize: '12px', color: '#666'}}>(único)</span></label>
                        <input
                          type="text"
                          value={modalCrear.nuevoUsuario.username}
                          onChange={(e) => setModalCrear({
                            ...modalCrear,
                            nuevoUsuario: { ...modalCrear.nuevoUsuario, username: e.target.value }
                          })}
                          placeholder="nombre.apellido"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Email * <span style={{fontSize: '12px', color: '#666'}}>(único)</span></label>
                        <input
                          type="email"
                          value={modalCrear.nuevoUsuario.email}
                          onChange={(e) => setModalCrear({
                            ...modalCrear,
                            nuevoUsuario: { ...modalCrear.nuevoUsuario, email: e.target.value }
                          })}
                          placeholder="correo@ejemplo.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Contraseña * <span style={{fontSize: '12px', color: '#666'}}>(mínimo 6 caracteres)</span></label>
                      <input
                        type="password"
                        value={modalCrear.nuevoUsuario.password}
                        onChange={(e) => setModalCrear({
                          ...modalCrear,
                          nuevoUsuario: { ...modalCrear.nuevoUsuario, password: e.target.value }
                        })}
                        placeholder="Contraseña segura"
                        minLength={6}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Nombre *</label>
                        <input
                          type="text"
                          value={modalCrear.nuevoUsuario.first_name}
                          onChange={(e) => setModalCrear({
                            ...modalCrear,
                            nuevoUsuario: { ...modalCrear.nuevoUsuario, first_name: e.target.value }
                          })}
                          placeholder="Juan"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Apellido *</label>
                        <input
                          type="text"
                          value={modalCrear.nuevoUsuario.last_name}
                          onChange={(e) => setModalCrear({
                            ...modalCrear,
                            nuevoUsuario: { ...modalCrear.nuevoUsuario, last_name: e.target.value }
                          })}
                          placeholder="Pérez"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Teléfono</label>
                        <input
                          type="tel"
                          value={modalCrear.nuevoUsuario.telefono}
                          onChange={(e) => setModalCrear({
                            ...modalCrear,
                            nuevoUsuario: { ...modalCrear.nuevoUsuario, telefono: e.target.value }
                          })}
                          placeholder="+56912345678"
                        />
                      </div>

                      <div className="form-group">
                        <label>Rol *</label>
                        <select
                          value={modalCrear.nuevoUsuario.rol}
                          onChange={(e) => setModalCrear({
                            ...modalCrear,
                            nuevoUsuario: { ...modalCrear.nuevoUsuario, rol: e.target.value }
                          })}
                          required
                        >
                          <option value="socio">👤 Socio</option>
                          <option value="instructor">🏋️ Instructor</option>
                          <option value="administrador">👨‍💼 Administrador</option>
                        </select>
                      </div>
                    </div>

                    <div className="info-box" style={{
                      background: 'linear-gradient(135deg, #667eea22, #764ba222)',
                      border: '1px solid #667eea',
                      borderRadius: '8px',
                      padding: '12px',
                      marginTop: '16px'
                    }}>
                      <p style={{margin: 0, fontSize: '14px', color: '#999'}}>
                        ℹ️ El usuario se creará activo por defecto y podrá iniciar sesión inmediatamente.
                      </p>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn-cancel" onClick={cerrarModalCrear}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-save">
                      ➕ Crear Usuario
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal de Cambio de Contraseña */}
          {/* Modal de Cambio de Contraseña (Diseño Neon) */}
          {modalPassword.show && (
            <div className="modal-overlay" onClick={cerrarModalPassword}>
              <div className="modal-neon" onClick={(e) => e.stopPropagation()}>
                <div className="modal-neon-header">
                  <h2 className="modal-neon-title">CAMBIAR<br />CONTRASEÑA</h2>
                  <button className="modal-neon-close" onClick={cerrarModalPassword}>×</button>
                </div>
                <form onSubmit={enviarPasswordAdmin}>
                  <div className="modal-neon-body">
                    <p className="modal-neon-text">
                      Ingresa la nueva contraseña para<br />
                      <strong style={{ color: 'white' }}>{modalPassword.usuario?.username}</strong>
                    </p>

                    <div style={{ textAlign: 'center' }}>
                      <label className="modal-neon-label">NUEVA CONTRASEÑA</label>
                      <input
                        type="text"
                        className="modal-neon-input"
                        value={modalPassword.newPassword}
                        onChange={(e) => setModalPassword({ ...modalPassword, newPassword: e.target.value })}
                        placeholder="Mínimo 6 caracteres"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="modal-neon-footer">
                    <button type="button" className="btn-neon-cancel" onClick={cerrarModalPassword}>
                      CANCELAR
                    </button>
                    <button type="submit" className="btn-neon-save">
                      ACTUALIZAR CONTRASEÑA
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal de Confirmación */}
          {modalConfirmacion.show && (
            <ConfirmModal
              title={modalConfirmacion.title}
              message={modalConfirmacion.message}
              type={modalConfirmacion.type}
              onConfirm={modalConfirmacion.onConfirm}
              onCancel={modalConfirmacion.onCancel}
            />
          )}

          {/* Toast de Notificación */}
          {toast.show && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast({ ...toast, show: false })}
            />
          )}

        </div>
      </div>
    </div>
  )
}

export default AdminUsuarios
