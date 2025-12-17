import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js'
import { Pie, Bar, Line } from 'react-chartjs-2'
import api from '../services/api'
import { exportarEstadisticas } from '../utils/pdfExport'
import { useNotifications } from '../hooks/useNotifications'
import UserLayout from '../components/UserLayout'
import './Estadisticas.css'

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
)

export default function Estadisticas() {
  const [reservas, setReservas] = useState([])
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotifications()

  useEffect(() => {
    Promise.all([
      api.get('usuarios/mis_reservas/'),
      api.get('usuarios/me/')
    ])
      .then(([reservasRes, usuarioRes]) => {
        // La API puede devolver array directo o paginado
        setReservas(reservasRes.data.results || reservasRes.data || [])
        setUsuario(usuarioRes.data)
      })
      .catch(err => {
        console.error('Error cargando datos:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleExportarPDF = () => {
    if (!usuario) return

    exportarEstadisticas(reservas, usuario)

    addNotification({
      type: 'success',
      title: '📄 PDF generado',
      message: 'Reporte de estadísticas descargado exitosamente'
    })
  }

  if (loading) {
    return (
      <UserLayout title="Estadísticas">
        <div className="text-center py-20">
          <div className="inline-block w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white/90 font-medium">Cargando estadísticas...</p>
        </div>
      </UserLayout>
    )
  }

  // Estadísticas por estado (usando toLowerCase para consistencia)
  const estadoStats = {
    confirmadas: reservas.filter(r => r.estado?.toLowerCase() === 'confirmada').length,
    completadas: reservas.filter(r => r.estado?.toLowerCase() === 'completada').length,
    canceladas: reservas.filter(r => r.estado?.toLowerCase() === 'cancelada').length,
    noshow: reservas.filter(r => r.estado?.toLowerCase() === 'noshow').length
  }

  // Datos para gráfico de pastel - Estados
  const pieData = {
    labels: ['Confirmadas', 'Completadas', 'Canceladas', 'No Show'],
    datasets: [{
      label: 'Reservas por Estado',
      data: [
        estadoStats.confirmadas,
        estadoStats.completadas,
        estadoStats.canceladas,
        estadoStats.noshow
      ],
      backgroundColor: [
        'rgba(75, 192, 192, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 159, 64, 0.8)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 2
    }]
  }

  // Estadísticas por tipo de clase
  const tipoStats = {}
  reservas.forEach(r => {
    const tipo = r.clase?.tipo || 'Otro'
    tipoStats[tipo] = (tipoStats[tipo] || 0) + 1
  })

  const barData = {
    labels: Object.keys(tipoStats),
    datasets: [{
      label: 'Clases por Tipo',
      data: Object.values(tipoStats),
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false
    }]
  }

  // Estadísticas mensuales (últimos 6 meses)
  const mesesLabels = []
  const mesesData = []
  const ahora = new Date()

  for (let i = 5; i >= 0; i--) {
    const mes = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
    const nombreMes = mes.toLocaleDateString('es-ES', { month: 'short' })
    mesesLabels.push(nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1))

    const count = reservas.filter(r => {
      const fecha = new Date(r.clase.fecha)
      return fecha.getMonth() === mes.getMonth() &&
        fecha.getFullYear() === mes.getFullYear() &&
        (r.estado === 'COMPLETADA' || r.estado === 'CONFIRMADA')
    }).length

    mesesData.push(count)
  }

  const lineData = {
    labels: mesesLabels,
    datasets: [{
      label: 'Actividad Mensual',
      data: mesesData,
      fill: true,
      backgroundColor: 'rgba(102, 126, 234, 0.2)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 3,
      tension: 0.4,
      pointBackgroundColor: 'rgba(102, 126, 234, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  }

  // Opciones de gráficos
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff',
          font: { size: 12, weight: '600' },
          padding: 15
        }
      },
      title: {
        display: true,
        text: 'Distribución por Estado',
        color: '#ffffff',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    }
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Clases por Tipo',
        color: '#ffffff',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#9ca3af'
        },
        grid: {
          color: '#374151'
        }
      },
      x: {
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          display: false
        }
      }
    }
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Tendencia de Actividad (Últimos 6 Meses)',
        color: '#ffffff',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#9ca3af'
        },
        grid: {
          color: '#374151'
        }
      },
      x: {
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          display: false
        }
      }
    }
  }

  // Calcular métricas
  const totalReservas = reservas.length
  const tasaAsistencia = totalReservas > 0
    ? ((estadoStats.completadas / totalReservas) * 100).toFixed(1)
    : 0
  const tasaCancelacion = totalReservas > 0
    ? ((estadoStats.canceladas / totalReservas) * 100).toFixed(1)
    : 0
  const promedioPorMes = (mesesData.reduce((a, b) => a + b, 0) / 6).toFixed(1)

  return (
    <UserLayout title="Mis Estadísticas">
      {/* Hero Header con glassmorphism */}
      <div className="relative overflow-hidden mb-10">
        {/* Background con gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-pink-900/40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>

        {/* Elementos decorativos flotantes */}
        <div className="absolute top-4 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-4 left-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 py-12 px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Icono con efecto glow */}
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-purple-500 to-indigo-700 p-4 rounded-2xl shadow-2xl shadow-purple-500/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">Mis</span>{' '}
                  <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">Estadísticas</span>
                </h2>
                <p className="text-white/90 mt-2 font-medium">Tu rendimiento y progreso de entrenamiento</p>
              </div>
            </div>

            {/* Botón exportar PDF */}
            {totalReservas > 0 && (
              <button
                onClick={handleExportarPDF}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
              >
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar PDF
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8">
        {totalReservas === 0 ? (
          /* Empty state premium con glassmorphism */
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent"></div>

            <div className="relative z-10 p-16 text-center">
              {/* Icono grande con animación */}
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-full border border-red-400/50">
                  <svg className="w-16 h-16 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">No hay estadísticas disponibles</h3>
              <p className="text-white/90 mb-8 max-w-md mx-auto">
                Reserva algunas clases para comenzar a ver tu progreso y estadísticas de entrenamiento
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Métricas Clave con glassmorphism */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {/* Total Reservas */}
              <div className="group relative bg-gradient-to-br from-purple-600 to-purple-800 backdrop-blur-xl border border-purple-400/50 rounded-3xl p-6 transition-all duration-500 hover:border-purple-300/50 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-indigo-500/0 group-hover:from-purple-500/10 group-hover:to-indigo-500/10 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl border border-purple-500/20">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1 text-purple-400 text-xs font-semibold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      Total
                    </div>
                  </div>
                  <div className="text-4xl font-black text-white mb-1">{totalReservas}</div>
                  <div className="text-white/90 font-medium text-sm">Total Reservas</div>
                </div>
              </div>

              {/* Tasa Asistencia */}
              <div className="group relative bg-gradient-to-br from-green-600 to-green-800 backdrop-blur-xl border border-green-400/50 rounded-3xl p-6 transition-all duration-500 hover:border-green-300/50 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/20">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      Asistencia
                    </div>
                  </div>
                  <div className="text-4xl font-black text-white mb-1">{tasaAsistencia}%</div>
                  <div className="text-white/90 font-medium text-sm">Tasa de Asistencia</div>
                </div>
              </div>

              {/* Tasa Cancelación */}
              <div className="group relative bg-gradient-to-br from-red-600 to-red-800 backdrop-blur-xl border border-red-400/50 rounded-3xl p-6 transition-all duration-500 hover:border-red-300/50 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-1 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-orange-500/0 group-hover:from-red-500/10 group-hover:to-orange-500/10 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/20">
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1 text-red-400 text-xs font-semibold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                      </svg>
                      Cancelación
                    </div>
                  </div>
                  <div className="text-4xl font-black text-white mb-1">{tasaCancelacion}%</div>
                  <div className="text-white/90 font-medium text-sm">Tasa de Cancelación</div>
                </div>
              </div>

              {/* Promedio Mensual */}
              <div className="group relative bg-gradient-to-br from-blue-600 to-blue-800 backdrop-blur-xl border border-blue-400/50 rounded-3xl p-6 transition-all duration-500 hover:border-blue-300/50 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/20">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1 text-blue-400 text-xs font-semibold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      Promedio
                    </div>
                  </div>
                  <div className="text-4xl font-black text-white mb-1">{promedioPorMes}</div>
                  <div className="text-white/90 font-medium text-sm">Clases por Mes</div>
                </div>
              </div>
            </div>

            {/* Gráficos con glassmorphism */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Gráfico Pie */}
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 transition-all duration-300 hover:border-purple-500/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/20">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">Distribución por Estado</h3>
                </div>
                <div style={{ height: '280px' }}>
                  <Pie data={pieData} options={pieOptions} />
                </div>
              </div>

              {/* Gráfico Bar */}
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 transition-all duration-300 hover:border-blue-500/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl border border-blue-500/20">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">Clases por Tipo</h3>
                </div>
                <div style={{ height: '280px' }}>
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>
            </div>

            {/* Gráfico de tendencia */}
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 mb-8 transition-all duration-300 hover:border-indigo-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/20">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Tendencia de Actividad</h3>
                <span className="text-gray-500 text-sm font-medium">(Últimos 6 meses)</span>
              </div>
              <div style={{ height: '280px' }}>
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>

            {/* Tabla de resumen con glassmorphism */}
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-xl border border-pink-500/20">
                  <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Resumen Detallado</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-4 px-4 text-white/90 font-semibold text-xs tracking-wider uppercase">Estado</th>
                      <th className="text-left py-4 px-4 text-white/90 font-semibold text-xs tracking-wider uppercase">Cantidad</th>
                      <th className="text-left py-4 px-4 text-white/90 font-semibold text-xs tracking-wider uppercase">Porcentaje</th>
                      <th className="text-left py-4 px-4 text-white/90 font-semibold text-xs tracking-wider uppercase">Progreso</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700/50 hover:bg-white/10 transition-colors">
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-teal-500/20">
                          <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                          Confirmadas
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white font-bold text-lg">{estadoStats.confirmadas}</td>
                      <td className="py-4 px-4 text-gray-300 font-medium">{((estadoStats.confirmadas / totalReservas) * 100).toFixed(1)}%</td>
                      <td className="py-4 px-4">
                        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${(estadoStats.confirmadas / totalReservas) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/50 hover:bg-white/10 transition-colors">
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-500/20">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          Completadas
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white font-bold text-lg">{estadoStats.completadas}</td>
                      <td className="py-4 px-4 text-gray-300 font-medium">{((estadoStats.completadas / totalReservas) * 100).toFixed(1)}%</td>
                      <td className="py-4 px-4">
                        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${(estadoStats.completadas / totalReservas) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/50 hover:bg-white/10 transition-colors">
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/20">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          Canceladas
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white font-bold text-lg">{estadoStats.canceladas}</td>
                      <td className="py-4 px-4 text-gray-300 font-medium">{((estadoStats.canceladas / totalReservas) * 100).toFixed(1)}%</td>
                      <td className="py-4 px-4">
                        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-red-500 to-pink-400 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${(estadoStats.canceladas / totalReservas) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/10 transition-colors">
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-orange-500/20">
                          <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                          No Show
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white font-bold text-lg">{estadoStats.noshow}</td>
                      <td className="py-4 px-4 text-gray-300 font-medium">{((estadoStats.noshow / totalReservas) * 100).toFixed(1)}%</td>
                      <td className="py-4 px-4">
                        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${(estadoStats.noshow / totalReservas) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </UserLayout>
  )
}

