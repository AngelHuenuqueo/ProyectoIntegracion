import React from 'react'
import './ErrorBoundary.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError() {
    // Actualizar estado para mostrar UI de error
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Registrar error para debugging
    console.error('ErrorBoundary capturó un error:', error, errorInfo)

    // Guardar información del error en el estado
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Aquí podrías enviar el error a un servicio de logging como Sentry
    // this.logErrorToService(error, errorInfo)
  }

  handleReload = () => {
    // Recargar la página
    window.location.reload()
  }

  handleGoHome = () => {
    // Resetear el estado y navegar al inicio
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h1>¡Oops! Algo salió mal</h1>
            <p className="error-message">
              Lo sentimos, ha ocurrido un error inesperado en la aplicación.
            </p>

            {import.meta.env.MODE === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Detalles del error (solo en desarrollo)</summary>
                <div className="error-stack">
                  <strong>Error:</strong> {this.state.error.toString()}
                  <br />
                  <strong>Stack trace:</strong>
                  <pre>{this.state.errorInfo?.componentStack}</pre>
                </div>
              </details>
            )}

            <div className="error-actions">
              <button className="btn-primary" onClick={this.handleReload}>
                🔄 Recargar Página
              </button>
              <button className="btn-secondary" onClick={this.handleGoHome}>
                🏠 Volver al Inicio
              </button>
            </div>

            <p className="error-help">
              Si el problema persiste, por favor contacta al administrador.
            </p>
          </div>
        </div>
      )
    }

    // Si no hay error, renderizar los componentes hijos normalmente
    return this.props.children
  }
}

export default ErrorBoundary
