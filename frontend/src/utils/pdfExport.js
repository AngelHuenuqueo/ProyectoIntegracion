import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Colores del tema
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  warning: '#ff9800',
  danger: '#f44336',
  text: '#333333',
  lightGray: '#f5f5f5',
  gray: '#999999'
}

// Configurar fuente y estilo base
const setupPDF = (doc, title) => {
  // Header con gradiente simulado
  doc.setFillColor(102, 126, 234)
  doc.rect(0, 0, 210, 40, 'F')
  
  // Logo/Icono
  doc.setFontSize(32)
  doc.setTextColor(255, 255, 255)
  doc.text('🏋️', 15, 25)
  
  // Título
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Energía Total', 35, 20)
  
  // Subtítulo
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(title, 35, 28)
  
  // Fecha de generación
  doc.setFontSize(9)
  const fecha = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  doc.text(`Generado: ${fecha}`, 15, 35)
  
  return doc
}

// Exportar una reserva individual como comprobante
export const exportarComprobanteReserva = (reserva, usuario) => {
  const doc = new jsPDF()
  
  setupPDF(doc, 'Comprobante de Reserva')
  
  let yPos = 50
  
  // Información del usuario
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(102, 126, 234)
  doc.text('Datos del Cliente', 15, yPos)
  
  yPos += 8
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 51, 51)
  doc.text(`Nombre: ${usuario.first_name} ${usuario.last_name}`, 15, yPos)
  
  yPos += 6
  doc.text(`Usuario: ${usuario.username}`, 15, yPos)
  
  yPos += 6
  doc.text(`Email: ${usuario.email || 'No registrado'}`, 15, yPos)
  
  yPos += 15
  
  // Información de la reserva
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(102, 126, 234)
  doc.text('Detalles de la Clase', 15, yPos)
  
  yPos += 8
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 51, 51)
  
  // Tabla con detalles
  const detalles = [
    ['Clase', reserva.clase.nombre],
    ['Tipo', reserva.clase.tipo?.toUpperCase() || 'N/A'],
    ['Fecha', reserva.clase.fecha],
    ['Hora Inicio', reserva.clase.hora_inicio?.substring(0, 5)],
    ['Hora Fin', reserva.clase.hora_fin?.substring(0, 5)],
    ['Instructor', reserva.clase.instructor_nombre],
    ['Estado', reserva.estado]
  ]
  
  doc.autoTable({
    startY: yPos,
    head: [],
    body: detalles,
    theme: 'grid',
    styles: {
      fontSize: 11,
      cellPadding: 5
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [245, 245, 245], textColor: [102, 126, 234] },
      1: { textColor: [51, 51, 51] }
    },
    margin: { left: 15, right: 15 }
  })
  
  yPos = doc.lastAutoTable.finalY + 15
  
  // Estado de la reserva con color
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  
  let statusColor
  switch (reserva.estado) {
    case 'CONFIRMADA':
      statusColor = [75, 192, 192]
      break
    case 'COMPLETADA':
      statusColor = [76, 175, 80]
      break
    case 'CANCELADA':
      statusColor = [244, 67, 54]
      break
    default:
      statusColor = [255, 152, 0]
  }
  
  doc.setFillColor(...statusColor)
  doc.roundedRect(15, yPos, 180, 15, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text(`Estado: ${reserva.estado}`, 105, yPos + 10, { align: 'center' })
  
  yPos += 25
  
  // Instrucciones
  doc.setFontSize(10)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(153, 153, 153)
  doc.text('Por favor, presenta este comprobante al instructor al ingresar a la clase.', 15, yPos)
  yPos += 5
  doc.text('Llega 10 minutos antes del inicio de la clase.', 15, yPos)
  
  // Footer
  doc.setFillColor(102, 126, 234)
  doc.rect(0, 280, 210, 17, 'F')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text('Energía Total - Sistema de Reservas', 105, 289, { align: 'center' })
  
  // Descargar
  const filename = `Comprobante_${reserva.clase.nombre.replace(/\s+/g, '_')}_${reserva.clase.fecha}.pdf`
  doc.save(filename)
}

// Exportar lista completa de reservas
export const exportarListaReservas = (reservas, usuario, filtro = 'todas') => {
  const doc = new jsPDF()
  
  let titulo = 'Mis Reservas'
  if (filtro === 'activas') titulo = 'Mis Reservas Activas'
  if (filtro === 'pasadas') titulo = 'Historial de Reservas'
  
  setupPDF(doc, titulo)
  
  let yPos = 50
  
  // Información del usuario
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(102, 126, 234)
  doc.text(`Cliente: ${usuario.first_name} ${usuario.last_name}`, 15, yPos)
  
  yPos += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 51, 51)
  doc.text(`Total de reservas: ${reservas.length}`, 15, yPos)
  
  yPos += 12
  
  // Preparar datos para la tabla
  const tableData = reservas.map(r => [
    r.clase.nombre,
    r.clase.tipo?.toUpperCase() || 'N/A',
    r.clase.fecha,
    r.clase.hora_inicio?.substring(0, 5),
    r.clase.instructor_nombre,
    r.estado
  ])
  
  // Tabla de reservas
  doc.autoTable({
    startY: yPos,
    head: [['Clase', 'Tipo', 'Fecha', 'Hora', 'Instructor', 'Estado']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [102, 126, 234],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20 },
      4: { cellWidth: 35 },
      5: { cellWidth: 25, fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      // Colorear la columna de estado
      if (data.column.index === 5 && data.section === 'body') {
        const estado = data.cell.raw
        switch (estado) {
          case 'CONFIRMADA':
            data.cell.styles.textColor = [75, 192, 192]
            break
          case 'COMPLETADA':
            data.cell.styles.textColor = [76, 175, 80]
            break
          case 'CANCELADA':
            data.cell.styles.textColor = [244, 67, 54]
            break
          case 'NOSHOW':
            data.cell.styles.textColor = [255, 152, 0]
            break
        }
      }
    },
    margin: { left: 15, right: 15 }
  })
  
  // Resumen estadístico
  const finalY = doc.lastAutoTable.finalY + 15
  
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(15, finalY, 180, 35, 3, 3, 'F')
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(102, 126, 234)
  doc.text('Resumen:', 20, finalY + 8)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 51, 51)
  
  const confirmadas = reservas.filter(r => r.estado === 'CONFIRMADA').length
  const completadas = reservas.filter(r => r.estado === 'COMPLETADA').length
  const canceladas = reservas.filter(r => r.estado === 'CANCELADA').length
  const noshow = reservas.filter(r => r.estado === 'NOSHOW').length
  
  doc.text(`✓ Confirmadas: ${confirmadas}`, 20, finalY + 16)
  doc.text(`✓ Completadas: ${completadas}`, 70, finalY + 16)
  doc.text(`✗ Canceladas: ${canceladas}`, 120, finalY + 16)
  doc.text(`⚠ No Show: ${noshow}`, 20, finalY + 24)
  
  // Footer
  doc.setFillColor(102, 126, 234)
  doc.rect(0, 280, 210, 17, 'F')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text('Energía Total - Sistema de Reservas', 105, 289, { align: 'center' })
  
  // Descargar
  const fecha = new Date().toISOString().split('T')[0]
  const filename = `Reservas_${usuario.username}_${fecha}.pdf`
  doc.save(filename)
}

// Exportar estadísticas
export const exportarEstadisticas = (reservas, usuario) => {
  const doc = new jsPDF()
  
  setupPDF(doc, 'Reporte de Estadísticas')
  
  let yPos = 50
  
  // Información del usuario
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(102, 126, 234)
  doc.text(`Reporte de: ${usuario.first_name} ${usuario.last_name}`, 15, yPos)
  
  yPos += 15
  
  // Métricas principales
  const total = reservas.length
  const completadas = reservas.filter(r => r.estado === 'COMPLETADA').length
  const canceladas = reservas.filter(r => r.estado === 'CANCELADA').length
  const tasaAsistencia = total > 0 ? ((completadas / total) * 100).toFixed(1) : 0
  const tasaCancelacion = total > 0 ? ((canceladas / total) * 100).toFixed(1) : 0
  
  // Grid de métricas
  const metricas = [
    ['Total Reservas', total.toString()],
    ['Clases Completadas', completadas.toString()],
    ['Tasa de Asistencia', `${tasaAsistencia}%`],
    ['Tasa de Cancelación', `${tasaCancelacion}%`]
  ]
  
  doc.autoTable({
    startY: yPos,
    head: [['Métrica', 'Valor']],
    body: metricas,
    theme: 'grid',
    headStyles: {
      fillColor: [102, 126, 234],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [245, 245, 245] },
      1: { halign: 'center', fontSize: 14, fontStyle: 'bold', textColor: [102, 126, 234] }
    },
    margin: { left: 15, right: 15 }
  })
  
  yPos = doc.lastAutoTable.finalY + 15
  
  // Distribución por tipo
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(102, 126, 234)
  doc.text('Distribución por Tipo de Clase', 15, yPos)
  
  yPos += 8
  
  const tipoStats = {}
  reservas.forEach(r => {
    const tipo = r.clase?.tipo || 'Otro'
    tipoStats[tipo] = (tipoStats[tipo] || 0) + 1
  })
  
  const tipoData = Object.entries(tipoStats).map(([tipo, count]) => [
    tipo.toUpperCase(),
    count.toString(),
    `${((count / total) * 100).toFixed(1)}%`
  ])
  
  doc.autoTable({
    startY: yPos,
    head: [['Tipo', 'Cantidad', 'Porcentaje']],
    body: tipoData,
    theme: 'striped',
    headStyles: {
      fillColor: [102, 126, 234]
    },
    margin: { left: 15, right: 15 }
  })
  
  // Footer
  doc.setFillColor(102, 126, 234)
  doc.rect(0, 280, 210, 17, 'F')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text('Energía Total - Sistema de Reservas', 105, 289, { align: 'center' })
  
  const fecha = new Date().toISOString().split('T')[0]
  const filename = `Estadisticas_${usuario.username}_${fecha}.pdf`
  doc.save(filename)
}
