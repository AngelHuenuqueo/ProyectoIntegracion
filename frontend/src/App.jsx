import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Clases from './pages/Clases'
import Calendario from './pages/Calendario'
import Perfil from './pages/Perfil'
import Reservas from './pages/Reservas'
import Estadisticas from './pages/Estadisticas'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsuarios from './pages/admin/AdminUsuarios'
import AdminClases from './pages/admin/AdminClases'
import AdminInstructores from './pages/admin/AdminInstructores'
import AdminReportes from './pages/admin/AdminReportes'
import AdminAsistencia from './pages/admin/AdminAsistencia'
import PrivateRoute from './components/PrivateRoute'
import NotificationCenter from './components/NotificationCenter'
import ErrorBoundary from './components/ErrorBoundary'
import Toast from './components/Toast'
import ConfirmModal from './components/ConfirmModal'
import { setShowToast } from './services/api'
import './App.css'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLogged, setIsLogged] = useState(!!localStorage.getItem('access_token'))
  const [userRole, setUserRole] = useState(null)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  // Toast state
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('info')
  const [showToast, setShowToastState] = useState(false)
  const [mostrarConfirmacionLogout, setMostrarConfirmacionLogout] = useState(false)

  // Función para mostrar Toast
  const displayToast = (message, type = 'info') => {
    setToastMessage(message)
    setToastType(type)
    setShowToastState(true)
  }

  // Configurar el Toast global para el interceptor de Axios
  useEffect(() => {
    setShowToast(displayToast)
  }, [])

  // Update logged state and user role when location changes
  useEffect(() => {
    setIsLogged(!!localStorage.getItem('access_token'))
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserRole(user.rol)
    }
  }, [location])

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  function mostrarModalLogout() {
    setMostrarConfirmacionLogout(true)
  }

  function confirmarLogout() {
    setMostrarConfirmacionLogout(false)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setIsLogged(false)
    setUserRole(null)
    displayToast('✅ Sesión cerrada exitosamente', 'success')
    setTimeout(() => {
      navigate('/login')
    }, 1500)
  }

  function toggleDarkMode() {
    setDarkMode(!darkMode)
  }

  // Check if we're on the Home page
  const isHomePage = location.pathname === '/'
  const isLoginPage = location.pathname === '/login'

  // Estado para menú móvil
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <ErrorBoundary>
      <div className="app-root min-h-screen bg-black">
        {/* Solo mostrar el navbar del sistema si NO estamos en Home ni en Login */}
        {!isHomePage && !isLoginPage && (
          <nav className="bg-black/95 backdrop-blur-md border-b-4 border-red-600 fixed top-0 w-full z-50">
            <div className="px-4 md:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-600 blur-lg opacity-50"></div>
                  <svg className="w-8 h-8 text-red-600 relative" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-black tracking-wider text-white">
                    ENERGÍA<span className="text-red-600">TOTAL</span>
                  </div>
                  <p className="text-xs text-gray-400 tracking-widest">FITNESS CENTER</p>
                </div>
              </div>

              {/* Desktop Menu */}
              <div className="hidden lg:flex items-center gap-4">
                {isLogged && userRole === 'administrador' ? (
                  <>
                    <Link to="/admin" className="text-gray-300 hover:text-red-600 transition-all font-bold text-sm tracking-wide uppercase">📊 Dashboard</Link>
                    <Link to="/admin/usuarios" className="text-gray-300 hover:text-red-600 transition-all font-bold text-sm tracking-wide uppercase">👥 Usuarios</Link>
                    <Link to="/admin/clases" className="text-gray-300 hover:text-red-600 transition-all font-bold text-sm tracking-wide uppercase">🏋️ Clases</Link>
                    <Link to="/admin/instructores" className="text-gray-300 hover:text-red-600 transition-all font-bold text-sm tracking-wide uppercase">🎓 Instructores</Link>
                    <Link to="/admin/reportes" className="text-gray-300 hover:text-red-600 transition-all font-bold text-sm tracking-wide uppercase">📈 Reportes</Link>
                    <Link to="/perfil" className="text-gray-300 hover:text-red-600 transition-all font-bold text-sm tracking-wide uppercase">Mi Perfil</Link>
                  </>
                ) : isLogged ? (
                  <>
                    <Link to="/clases" className="text-gray-300 hover:text-red-600 transition-all font-bold text-sm tracking-wide uppercase">Clases</Link>
                    <Link to="/calendario" className="text-gray-300 hover:text-red-600 transition-all font-bold text-sm tracking-wide uppercase">Calendario</Link>
                    <Link to="/reservas" className="text-gray-300 hover:text-red-600 transition-all font-bold text-sm tracking-wide uppercase">Mis Reservas</Link>
                    <Link to="/estadisticas" className="text-gray-300 hover:text-red-600 transition-all font-bold text-sm tracking-wide uppercase">Estadísticas</Link>
                    <Link to="/perfil" className="text-gray-300 hover:text-red-600 transition-all font-bold text-sm tracking-wide uppercase">Mi Perfil</Link>
                  </>
                ) : null}
                {isLogged && <NotificationCenter />}
                {!isLogged ? (
                  <Link to="/login" className="bg-red-600 text-white px-6 py-2 md:px-8 md:py-3 font-black tracking-wider uppercase text-xs md:text-sm hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-red-600/50">
                    Iniciar Sesión
                  </Link>
                ) : (
                  <button 
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 md:px-8 md:py-3 font-black tracking-wider uppercase text-xs md:text-sm hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-red-600/50 border-2 border-red-500 hover:border-red-400 relative overflow-hidden group" 
                    onClick={mostrarModalLogout}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="hidden md:inline">CERRAR SESIÓN</span>
                      <span className="md:hidden">SALIR</span>
                    </span>
                    <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></span>
                  </button>
                )}
              </div>

              {/* Mobile Menu Button - ROJO */}
              <button 
                className="lg:hidden text-red-600 hover:text-red-700 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden border-t-2 border-red-600 bg-black/98 backdrop-blur-md">
                <div className="px-4 py-4 space-y-3">
                  {isLogged && userRole === 'administrador' ? (
                    <>
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-red-600 transition-colors font-bold text-sm uppercase py-2 border-b border-gray-800">📊 Dashboard</Link>
                      <Link to="/admin/usuarios" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-red-600 transition-colors font-bold text-sm uppercase py-2 border-b border-gray-800">👥 Usuarios</Link>
                      <Link to="/admin/clases" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-red-600 transition-colors font-bold text-sm uppercase py-2 border-b border-gray-800">🏋️ Clases</Link>
                      <Link to="/admin/instructores" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-red-600 transition-colors font-bold text-sm uppercase py-2 border-b border-gray-800">🎓 Instructores</Link>
                      <Link to="/admin/reportes" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-red-600 transition-colors font-bold text-sm uppercase py-2 border-b border-gray-800">📈 Reportes</Link>
                      <Link to="/perfil" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-red-600 transition-colors font-bold text-sm uppercase py-2 border-b border-gray-800">Mi Perfil</Link>
                    </>
                  ) : isLogged ? (
                    <>
                      <Link to="/clases" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-red-600 transition-colors font-bold text-sm uppercase py-2 border-b border-gray-800">Clases</Link>
                      <Link to="/calendario" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-red-600 transition-colors font-bold text-sm uppercase py-2 border-b border-gray-800">Calendario</Link>
                      <Link to="/reservas" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-red-600 transition-colors font-bold text-sm uppercase py-2 border-b border-gray-800">Mis Reservas</Link>
                      <Link to="/estadisticas" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-red-600 transition-colors font-bold text-sm uppercase py-2 border-b border-gray-800">Estadísticas</Link>
                      <Link to="/perfil" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-red-600 transition-colors font-bold text-sm uppercase py-2">Mi Perfil</Link>
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </nav>
        )}

        <main className={!isHomePage && !isLoginPage ? "pt-24" : ""}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/clases" element={
              <PrivateRoute>
                <Clases />
              </PrivateRoute>
            } />
            <Route path="/calendario" element={
              <PrivateRoute>
                <Calendario />
              </PrivateRoute>
            } />
            <Route path="/perfil" element={
              <PrivateRoute>
                <Perfil />
              </PrivateRoute>
            } />
            <Route path="/reservas" element={
              <PrivateRoute>
                <Reservas />
              </PrivateRoute>
            } />
            <Route path="/estadisticas" element={
              <PrivateRoute>
                <Estadisticas />
              </PrivateRoute>
            } />
            {/* Rutas de administración */}
            <Route path="/admin" element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/admin/usuarios" element={
              <PrivateRoute>
                <AdminUsuarios />
              </PrivateRoute>
            } />
            <Route path="/admin/clases" element={
              <PrivateRoute>
                <AdminClases />
              </PrivateRoute>
            } />
            <Route path="/admin/instructores" element={
              <PrivateRoute>
                <AdminInstructores />
              </PrivateRoute>
            } />
            <Route path="/admin/reportes" element={
              <PrivateRoute>
                <AdminReportes />
              </PrivateRoute>
            } />
            <Route path="/admin/asistencia" element={
              <PrivateRoute>
                <AdminAsistencia />
              </PrivateRoute>
            } />
          </Routes>
        </main>

        {/* Toast global para errores de API */}
        {showToast && (
          <Toast 
            message={toastMessage} 
            type={toastType} 
            onClose={() => setShowToastState(false)} 
          />
        )}

        {/* Modal de confirmación para cerrar sesión */}
        {mostrarConfirmacionLogout && (
          <ConfirmModal
            title="Cerrar Sesión"
            message={`¿Estás seguro de que deseas cerrar sesión?

Serás redirigido a la página de inicio de sesión.`}
            type="warning"
            onConfirm={confirmarLogout}
            onCancel={() => setMostrarConfirmacionLogout(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App
