import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import './Admin.css'

function AdminUsuarios() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  useEffect(() => {
    verificarPermiso()
    cargarUsuarios()
  }, [])

  const verificarPermiso = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user.rol !== 'administrador') {
        alert('No tienes permisos para acceder a esta sección')
        navigate('/clases')
      }
    }
  }

  const cargarUsuarios = async () => {
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
  }

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

  const toggleEstadoUsuario = async (usuario) => {
    const confirmar = window.confirm(
      `¿Estás seguro de ${usuario.is_active ? 'desactivar' : 'activar'} al usuario ${usuario.username}?`
    )
    
    if (!confirmar) return

    try {
      await api.patch(`/usuarios/${usuario.id}/`, {
        is_active: !usuario.is_active
      })
      alert(`Usuario ${usuario.is_active ? 'desactivado' : 'activado'} exitosamente`)
      cargarUsuarios()
    } catch (error) {
      console.error('Error cambiando estado:', error)
      alert('Error al cambiar estado del usuario')
    }
  }

  const eliminarUsuario = async (usuario) => {
    const confirmar = window.confirm(
      `¿Estás SEGURO de ELIMINAR definitivamente al usuario ${usuario.username}?\n\nEsta acción NO se puede deshacer.`
    )
    
    if (!confirmar) return

    try {
      await api.delete(`/usuarios/${usuario.id}/`)
      alert('Usuario eliminado exitosamente')
      cargarUsuarios()
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      alert('Error al eliminar usuario. Puede tener reservas asociadas.')
    }
  }

  const usuariosFiltrados = filtrarUsuarios()

  if (loading) {
    return <div className="admin-container"><div className="loading">Cargando usuarios...</div></div>
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>👥 Gestión de Usuarios</h1>
        <button className="btn-back" onClick={() => navigate('/admin')}>← Volver al Dashboard</button>
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
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(usuario => (
              <tr key={usuario.id} className={!usuario.is_active ? 'inactive-row' : ''}>
                <td>{usuario.id}</td>
                <td><strong>{usuario.username}</strong></td>
                <td>{usuario.first_name} {usuario.last_name}</td>
                <td>{usuario.email}</td>
                <td>{usuario.telefono || '-'}</td>
                <td>
                  <span className={`badge-rol ${usuario.rol}`}>
                    {usuario.rol === 'socio' && '👤'}
                    {usuario.rol === 'instructor' && '🎓'}
                    {usuario.rol === 'administrador' && '👑'}
                    {' ' + usuario.rol}
                  </span>
                </td>
                <td>
                  <span className={`badge-estado ${usuario.is_active ? 'activo' : 'inactivo'}`}>
                    {usuario.is_active ? '✅ Activo' : '❌ Inactivo'}
                  </span>
                </td>
                <td>{new Date(usuario.date_joined).toLocaleDateString('es-ES')}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit" 
                      onClick={() => abrirModalEdicion(usuario)}
                      title="Editar usuario"
                    >
                      ✏️
                    </button>
                    <button 
                      className={`btn-toggle ${usuario.is_active ? 'deactivate' : 'activate'}`}
                      onClick={() => toggleEstadoUsuario(usuario)}
                      title={usuario.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {usuario.is_active ? '🚫' : '✅'}
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => eliminarUsuario(usuario)}
                      title="Eliminar usuario"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
                    onChange={(e) => setUsuarioEditando({...usuarioEditando, first_name: e.target.value})}
                    placeholder="Nombre"
                  />
                </div>

                <div className="form-group">
                  <label>Apellido *</label>
                  <input 
                    type="text" 
                    value={usuarioEditando.last_name}
                    onChange={(e) => setUsuarioEditando({...usuarioEditando, last_name: e.target.value})}
                    placeholder="Apellido"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input 
                  type="email" 
                  value={usuarioEditando.email}
                  onChange={(e) => setUsuarioEditando({...usuarioEditando, email: e.target.value})}
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input 
                  type="tel" 
                  value={usuarioEditando.telefono || ''}
                  onChange={(e) => setUsuarioEditando({...usuarioEditando, telefono: e.target.value})}
                  placeholder="+1234567890"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rol *</label>
                  <select 
                    value={usuarioEditando.rol}
                    onChange={(e) => setUsuarioEditando({...usuarioEditando, rol: e.target.value})}
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
                    onChange={(e) => setUsuarioEditando({...usuarioEditando, is_active: e.target.value === 'true'})}
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
    </div>
  )
}

export default AdminUsuarios
