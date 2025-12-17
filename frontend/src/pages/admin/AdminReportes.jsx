import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { Bar, Line, Pie } from 'react-chartjs-2'
import jsPDF from 'jspdf'
import AdminLayout from './AdminLayout'

function AdminReportes() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [reservas, setReservas] = useState([])
  const [clases, setClases] = useState([])
  const [usuarios, setUsuarios] = useState([])

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

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true)

      const [reservasRes, clasesRes, usuariosRes] = await Promise.all([
        api.get('/reservas/'),
        api.get('/clases/'),
        api.get('/usuarios/')
      ])

      setReservas(reservasRes.data.results || reservasRes.data || [])
      setClases(clasesRes.data.results || clasesRes.data || [])
      setUsuarios(usuariosRes.data.results || usuariosRes.data || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
      alert('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    verificarPermiso()
    cargarDatos()
  }, [verificarPermiso, cargarDatos])

  // Top 5 clases más populares
  const getClasesPopulares = () => {
    const clasesConReservas = clases.map(clase => ({
      nombre: clase.nombre,
      reservas: reservas.filter(r => r.clase?.id === clase.id && r.estado === 'confirmada').length
    }))
      .sort((a, b) => b.reservas - a.reservas)
      .slice(0, 5)

    return {
      labels: clasesConReservas.map(c => c.nombre),
      datasets: [{
        label: 'Reservas',
        data: clasesConReservas.map(c => c.reservas),
        backgroundColor: '#2196F3',
        borderRadius: 8
      }]
    }
  }
  const getUsuariosActivos = () => {
    const socios = usuarios.filter(u => u.rol === 'socio')
    const usuariosConReservas = socios.map(usuario => ({
      nombre: usuario.first_name && usuario.last_name
        ? `${usuario.first_name} ${usuario.last_name}`
        : usuario.username,
      reservas: reservas.filter(r => r.socio?.id === usuario.id).length
    }))
      .sort((a, b) => b.reservas - a.reservas)
      .slice(0, 5)

    return {
      labels: usuariosConReservas.map(u => u.nombre),
      datasets: [{
        label: 'Reservas',
        data: usuariosConReservas.map(u => u.reservas),
        backgroundColor: '#4CAF50',
        borderRadius: 8
      }]
    }
  }

  // Reservas por día de la semana
  const getReservasPorDia = () => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const reservasPorDia = new Array(7).fill(0)

    reservas.forEach(reserva => {
      if (reserva.clase?.fecha) {
        const dia = new Date(reserva.clase.fecha).getDay()
        reservasPorDia[dia]++
      }
    })

    return {
      labels: dias,
      datasets: [{
        label: 'Reservas',
        data: reservasPorDia,
        backgroundColor: '#FF9800',
        borderColor: '#F57C00',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    }
  }

  // Distribución por tipo de clase
  const getDistribucionTipoClase = () => {
    const tipos = {}
    clases.forEach(clase => {
      const tipo = clase.tipo || 'otros'
      tipos[tipo] = (tipos[tipo] || 0) + 1
    })

    return {
      labels: Object.keys(tipos).map(t => t.charAt(0).toUpperCase() + t.slice(1)),
      datasets: [{
        label: 'Clases',
        data: Object.values(tipos),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        borderWidth: 2
      }]
    }
  }

  // Distribución de usuarios por rol
  const getUsuariosPorRol = () => {
    const roles = {
      socio: 0,
      instructor: 0,
      administrador: 0
    }

    usuarios.forEach(usuario => {
      const rol = usuario.rol || 'socio'
      if (Object.prototype.hasOwnProperty.call(roles, rol)) {
        roles[rol]++
      }
    })

    return {
      labels: ['Socios', 'Instructores', 'Administradores'],
      datasets: [{
        label: 'Usuarios',
        data: [roles.socio, roles.instructor, roles.administrador],
        backgroundColor: ['#4CAF50', '#2196F3', '#FF9800'],
        borderWidth: 2
      }]
    }
  }

  // Distribución de reservas por estado
  const getReservasPorEstado = () => {
    const estados = {
      confirmada: 0,
      cancelada: 0,
      noshow: 0,
      completada: 0
    }

    reservas.forEach(reserva => {
      const estado = reserva.estado || 'confirmada'
      if (Object.prototype.hasOwnProperty.call(estados, estado)) {
        estados[estado]++
      }
    })

    return {
      labels: ['Confirmadas', 'Canceladas', 'No Show', 'Completadas'],
      datasets: [{
        label: 'Reservas',
        data: [estados.confirmada, estados.cancelada, estados.noshow, estados.completada],
        backgroundColor: ['#4CAF50', '#f44336', '#FF9800', '#2196F3'],
        borderWidth: 2
      }]
    }
  }

  // Exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF()

    // Título
    doc.setFontSize(18)
    doc.text('Reporte de Gimnasio - Energía Total', 14, 20)
    doc.setFontSize(11)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 28)

    // Estadísticas generales
    doc.setFontSize(14)
    doc.text('Resumen General', 14, 40)
    doc.setFontSize(10)

    const stats = [
      ['Total Usuarios', usuarios.length],
      ['Total Clases', clases.length],
      ['Total Reservas', reservas.length],
      ['Reservas Confirmadas', reservas.filter(r => r.estado === 'confirmada').length],
      ['Reservas Canceladas', reservas.filter(r => r.estado === 'cancelada').length],
      ['Socios Activos', usuarios.filter(u => u.rol === 'socio' && u.is_active).length]
    ]

    doc.autoTable({
      startY: 45,
      head: [['Métrica', 'Valor']],
      body: stats,
      theme: 'grid',
      headStyles: { fillColor: [33, 150, 243] }
    })

    // Top 5 Clases
    const clasesTop = getClasesPopulares()
    doc.setFontSize(14)
    doc.text('Top 5 Clases Más Populares', 14, doc.lastAutoTable.finalY + 15)

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Clase', 'Reservas']],
      body: clasesTop.labels.map((label, idx) => [label, clasesTop.datasets[0].data[idx]]),
      theme: 'striped',
      headStyles: { fillColor: [76, 175, 80] }
    })

    // Top 5 Usuarios
    const usuariosTop = getUsuariosActivos()
    doc.setFontSize(14)
    doc.text('Top 5 Usuarios Más Activos', 14, doc.lastAutoTable.finalY + 15)

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Usuario', 'Reservas']],
      body: usuariosTop.labels.map((label, idx) => [label, usuariosTop.datasets[0].data[idx]]),
      theme: 'striped',
      headStyles: { fillColor: [255, 152, 0] }
    })

    doc.save(`reporte-gimnasio-${new Date().toISOString().split('T')[0]}.pdf`)
    alert('Reporte exportado exitosamente')
  }

  if (loading) {
    return (
      <AdminLayout title="📊 Reportes y Estadísticas" subtitle="Análisis detallado del gimnasio">
        <div className="loading">Cargando reportes...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="📊 Reportes y Estadísticas" subtitle="Análisis detallado del gimnasio">
      <div className="header-actions" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <button className="btn-primary" onClick={exportarPDF}>📥 Exportar PDF</button>
      </div>

      {/* Resumen ejecutivo */}
      <div className="executive-summary" >
        <h2>Resumen Ejecutivo</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <h3>{usuarios.length}</h3>
            <p>Total Usuarios</p>
            <small>{usuarios.filter(u => u.is_active).length} activos</small>
          </div>
          <div className="summary-card">
            <h3>{clases.length}</h3>
            <p>Total Clases</p>
            <small>{clases.filter(c => new Date(c.fecha) >= new Date()).length} futuras</small>
          </div>
          <div className="summary-card">
            <h3>{reservas.length}</h3>
            <p>Total Reservas</p>
            <small>{reservas.filter(r => r.estado === 'confirmada').length} confirmadas</small>
          </div>
          <div className="summary-card">
            <h3>{usuarios.filter(u => u.rol === 'instructor').length}</h3>
            <p>Instructores</p>
            <small>Personal activo</small>
          </div>
        </div>
      </div >

      {/* Gráficos */}
      < div className="reports-charts" >
        {/* Fila 1: Gráficos circulares */}
        < div className="chart-card" >
          <h3>🏋️ Distribución por Tipo de Clase</h3>
          <div className="chart-container">
            <Pie
              data={getDistribucionTipoClase()}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 10,
                      font: {
                        size: 11
                      },
                      color: '#E5E7EB'
                    }
                  }
                }
              }}
            />
          </div>
        </div >

        <div className="chart-card">
          <h3>� Usuarios por Rol</h3>
          <div className="chart-container">
            <Pie
              data={getUsuariosPorRol()}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 10,
                      font: {
                        size: 11
                      },
                      color: '#E5E7EB'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>� Reservas por Estado</h3>
          <div className="chart-container">
            <Pie
              data={getReservasPorEstado()}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 10,
                      font: {
                        size: 11
                      },
                      color: '#E5E7EB'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Fila 2: Gráficos de barras */}
        <div className="chart-card">
          <h3>📊 Top 5 Clases Más Populares</h3>
          <div className="chart-container">
            <Bar
              data={getClasesPopulares()}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    ticks: {
                      color: '#E5E7EB'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      color: '#E5E7EB'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>� Top 5 Usuarios Más Activos</h3>
          <div className="chart-container">
            <Bar
              data={getUsuariosActivos()}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    ticks: {
                      color: '#E5E7EB'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      color: '#E5E7EB'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Fila 3: Gráfico de línea - ancho completo */}
        <div className="chart-card chart-wide">
          <h3>� Reservas por Día de la Semana</h3>
          <div className="chart-container">
            <Line
              data={getReservasPorDia()}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    ticks: {
                      color: '#E5E7EB'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      color: '#E5E7EB'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div >

      {/* Tabla de rendimiento */}
      < div className="performance-table" >
        <h2>Rendimiento por Clase</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Clase</th>
              <th>Instructor</th>
              <th>Total Reservas</th>
              <th>Confirmadas</th>
              <th>Canceladas</th>
              <th>No Show</th>
              <th>Tasa de Ocupación</th>
            </tr>
          </thead>
          <tbody>
            {clases.map(clase => {
              const reservasClase = reservas.filter(r => r.clase?.id === clase.id)
              const confirmadas = reservasClase.filter(r => r.estado === 'confirmada').length
              const ocupacion = clase.cupos_totales > 0
                ? ((confirmadas / clase.cupos_totales) * 100).toFixed(1)
                : 0

              return (
                <tr key={clase.id}>
                  <td><strong>{clase.nombre}</strong></td>
                  <td>{clase.instructor_nombre || 'N/A'}</td>
                  <td>{reservasClase.length}</td>
                  <td>{confirmadas}</td>
                  <td>{reservasClase.filter(r => r.estado === 'cancelada').length}</td>
                  <td>{reservasClase.filter(r => r.estado === 'noshow').length}</td>
                  <td>
                    <span className={`badge-ocupacion ${ocupacion >= 80 ? 'alto' : ocupacion >= 50 ? 'medio' : 'bajo'}`}>
                      {ocupacion}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div >
    </AdminLayout>
  )
}

export default AdminReportes
