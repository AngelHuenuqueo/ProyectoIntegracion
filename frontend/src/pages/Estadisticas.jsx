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
import { useNotifications } from '../components/NotificationCenter'
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-medium">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  // Estadísticas por estado
  const estadoStats = {
    confirmadas: reservas.filter(r => r.estado === 'CONFIRMADA').length,
    completadas: reservas.filter(r => r.estado === 'COMPLETADA').length,
    canceladas: reservas.filter(r => r.estado === 'CANCELADA').length,
    noshow: reservas.filter(r => r.estado === 'NOSHOW').length
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
          color: 'var(--text-primary)',
          font: { size: 12, weight: '600' },
          padding: 15
        }
      },
      title: {
        display: true,
        text: 'Distribución por Estado',
        color: 'var(--text-primary)',
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
        color: 'var(--text-primary)',
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
          color: 'var(--text-secondary)'
        },
        grid: {
          color: 'var(--border-color)'
        }
      },
      x: {
        ticks: {
          color: 'var(--text-secondary)'
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
        color: 'var(--text-primary)',
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
          color: 'var(--text-secondary)'
        },
        grid: {
          color: 'var(--border-color)'
        }
      },
      x: {
        ticks: {
          color: 'var(--text-secondary)'
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-black border-b-4 border-red-600 py-8 px-6 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 blur-lg opacity-50"></div>
              <svg className="w-12 h-12 text-red-600 relative" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-wider">
                MIS <span className="text-red-600">ESTADÍSTICAS</span>
              </h2>
              <div className="inline-block bg-red-600 text-white px-4 py-1 font-black text-xs tracking-widest transform -skew-x-12 mt-2">
                <span className="inline-block transform skew-x-12">RENDIMIENTO Y PROGRESO</span>
              </div>
            </div>
          </div>
          {totalReservas > 0 && (
            <button 
              onClick={handleExportarPDF}
              className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-3 font-black text-sm tracking-wider uppercase hover:from-purple-700 hover:to-purple-900 transition-all transform hover:scale-105"
            >
              📄 Exportar PDF
            </button>
          )}
        </div>
      </div>

      <div className="px-6">
        {totalReservas === 0 ? (
          <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-gray-800 p-20 text-center">
            <div className="text-8xl mb-6 opacity-30">📊</div>
            <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-wide">No hay estadísticas disponibles</h3>
            <p className="text-gray-400 text-lg">
              Reserva algunas clases para ver tus estadísticas
            </p>
          </div>
        ) : (
          <>
            {/* Métricas Clave */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-900 to-black border-2 border-purple-800 p-6 hover:border-purple-600 transition-all relative overflow-hidden group">
                <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/5 transition-all"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-2">📈</div>
                  <div className="text-4xl font-black text-white mb-2">{totalReservas}</div>
                  <div className="text-purple-400 font-black text-xs tracking-widest uppercase">Total Reservas</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-900 to-black border-2 border-green-800 p-6 hover:border-green-600 transition-all relative overflow-hidden group">
                <div className="absolute inset-0 bg-green-600/0 group-hover:bg-green-600/5 transition-all"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-2">✅</div>
                  <div className="text-4xl font-black text-white mb-2">{tasaAsistencia}%</div>
                  <div className="text-green-400 font-black text-xs tracking-widest uppercase">Tasa Asistencia</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-900 to-black border-2 border-red-800 p-6 hover:border-red-600 transition-all relative overflow-hidden group">
                <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/5 transition-all"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-2">❌</div>
                  <div className="text-4xl font-black text-white mb-2">{tasaCancelacion}%</div>
                  <div className="text-red-400 font-black text-xs tracking-widest uppercase">Tasa Cancelación</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-900 to-black border-2 border-blue-800 p-6 hover:border-blue-600 transition-all relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-all"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-2">📅</div>
                  <div className="text-4xl font-black text-white mb-2">{promedioPorMes}</div>
                  <div className="text-blue-400 font-black text-xs tracking-widest uppercase">Clases/Mes</div>
                </div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-gray-800 p-6">
                <div style={{ height: '300px' }}>
                  <Pie data={pieData} options={pieOptions} />
                </div>
              </div>

              <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-gray-800 p-6">
                <div style={{ height: '300px' }}>
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-gray-800 p-6 mb-8">
              <div style={{ height: '300px' }}>
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>

            {/* Tabla de resumen */}
            <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-gray-800 p-6">
              <h3 className="text-2xl font-black text-red-600 mb-6 tracking-wide uppercase">📋 Resumen Detallado</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-700">
                      <th className="text-left py-4 px-4 text-gray-400 font-black text-xs tracking-widest uppercase">Estado</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-black text-xs tracking-widest uppercase">Cantidad</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-black text-xs tracking-widest uppercase">Porcentaje</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-black text-xs tracking-widest uppercase">Barra</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-all">
                      <td className="py-4 px-4">
                        <span className="inline-block bg-green-600 text-white px-3 py-1 font-black text-xs tracking-wider uppercase">Confirmadas</span>
                      </td>
                      <td className="py-4 px-4 text-white font-black text-lg">{estadoStats.confirmadas}</td>
                      <td className="py-4 px-4 text-gray-300 font-medium">{((estadoStats.confirmadas / totalReservas) * 100).toFixed(1)}%</td>
                      <td className="py-4 px-4">
                        <div className="w-full bg-gray-800 h-6 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-green-600 to-green-400 h-full transition-all"
                            style={{ width: `${(estadoStats.confirmadas / totalReservas) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-all">
                      <td className="py-4 px-4">
                        <span className="inline-block bg-blue-600 text-white px-3 py-1 font-black text-xs tracking-wider uppercase">Completadas</span>
                      </td>
                      <td className="py-4 px-4 text-white font-black text-lg">{estadoStats.completadas}</td>
                      <td className="py-4 px-4 text-gray-300 font-medium">{((estadoStats.completadas / totalReservas) * 100).toFixed(1)}%</td>
                      <td className="py-4 px-4">
                        <div className="w-full bg-gray-800 h-6 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-blue-400 h-full transition-all"
                            style={{ width: `${(estadoStats.completadas / totalReservas) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-all">
                      <td className="py-4 px-4">
                        <span className="inline-block bg-red-600 text-white px-3 py-1 font-black text-xs tracking-wider uppercase">Canceladas</span>
                      </td>
                      <td className="py-4 px-4 text-white font-black text-lg">{estadoStats.canceladas}</td>
                      <td className="py-4 px-4 text-gray-300 font-medium">{((estadoStats.canceladas / totalReservas) * 100).toFixed(1)}%</td>
                      <td className="py-4 px-4">
                        <div className="w-full bg-gray-800 h-6 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all"
                            style={{ width: `${(estadoStats.canceladas / totalReservas) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-900/50 transition-all">
                      <td className="py-4 px-4">
                        <span className="inline-block bg-orange-600 text-white px-3 py-1 font-black text-xs tracking-wider uppercase">No Show</span>
                      </td>
                      <td className="py-4 px-4 text-white font-black text-lg">{estadoStats.noshow}</td>
                      <td className="py-4 px-4 text-gray-300 font-medium">{((estadoStats.noshow / totalReservas) * 100).toFixed(1)}%</td>
                      <td className="py-4 px-4">
                        <div className="w-full bg-gray-800 h-6 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-orange-600 to-orange-400 h-full transition-all"
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
    </div>
  )
}
