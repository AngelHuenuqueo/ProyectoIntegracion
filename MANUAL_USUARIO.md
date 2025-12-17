# Manual de Usuario
## Sistema de Gestión de Gimnasio "Energía Total"

**Área Informática y Telecomunicaciones**  
**Carrera de Ingeniería en Informática**  
**Asignatura: Proyecto de Integración**

---

**Nombre del académico:** [Nombre y apellido]  
**Nombre de los integrantes del grupo:** [Nombres completos de cada integrante]  
**Sección:** [Número de sección]

**Fecha de entrega:** 9 de diciembre de 2025

---

## Contenido

1. [Introducción](#i-introducción)
2. [Detalles fuera del manual](#ii-detalles-fuera-del-manual)
3. [Roles y Funcionalidades](#iii-roles-y-funcionalidades)
4. [Manual por Rol](#iv-manual-por-rol)
   - 4.1 [Manual Socio](#41-manual-socio)
   - 4.2 [Manual Instructor](#42-manual-instructor)
   - 4.3 [Manual Administrador](#43-manual-administrador)
5. [Características Técnicas](#v-características-técnicas)
6. [Solución de Problemas](#vi-solución-de-problemas)
7. [Glosario](#vii-glosario)
8. [Anexos](#viii-anexos)

---

## I. Introducción

### Presentación de la temática desarrollada en el Manual

Este manual describe sobre información de manera resumida respecto de los temas que se abordaron en las siguientes páginas.

El sistema de gestión de gimnasio "Energía Total" es una aplicación web completa que permite la administración eficiente de un gimnasio moderno. La plataforma ofrece funcionalidades diferenciadas para tres tipos de usuarios: **Socios** (clientes del gimnasio), **Instructores** (profesionales que imparten clases), y **Administradores** (gestión completa del sistema).

### Características principales del sistema:
- Gestión de clases y reservas en tiempo real
- Sistema de notificaciones push con alertas del navegador
- Dashboard interactivo con estadísticas personalizadas
- Lista de espera automática cuando clases están llenas
- Control de asistencia digital
- Generación de reportes en PDF
- Gestión de equipamiento e inventario
- Sistema de calificaciones y comentarios

### Objetivos del manual:
1. Proporcionar instrucciones claras para cada tipo de usuario
2. Documentar todas las funcionalidades del sistema
3. Facilitar la adopción y uso correcto de la plataforma
4. Servir como referencia técnica para resolución de problemas

---

## II. Detalles fuera del manual

**Nota importante:** Este manual describe el uso funcional del sistema. Actualizarlo en instancia y dejarlo con una mejor independencia de la introducción. Finalmente elimine este texto.

### Tecnologías utilizadas:
- **Frontend:** React 18, Vite 5, React Router v6, Tailwind CSS
- **Backend:** Django 5.2, Django REST Framework, Python 3.13
- **Base de datos:** SQLite (desarrollo) / PostgreSQL (producción)
- **Autenticación:** JSON Web Tokens (JWT)
- **Notificaciones:** Web Push API del navegador
- **Documentos:** jsPDF para generación de reportes

### Requisitos del sistema:
- Navegador web moderno (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- Conexión a internet estable
- Resolución mínima de pantalla: 1024x768
- Permisos para notificaciones del navegador (opcional, recomendado)
- JavaScript habilitado

### Arquitectura técnica:
El sistema utiliza una arquitectura cliente-servidor con API REST. El frontend React se comunica con el backend Django mediante peticiones HTTP autenticadas con tokens JWT. Las notificaciones se implementan usando la Web Push API estándar del navegador.

---

## III. Roles y Funcionalidades

El sistema cuenta con tres roles principales, cada uno con permisos y funcionalidades específicas:

### 1. **Socio** (Usuario Regular)
**Descripción:** Cliente del gimnasio con membresía activa que utiliza el sistema para reservar clases y gestionar su actividad física.

**Funcionalidades principales:**
- Ver catálogo completo de clases disponibles
- Reservar y cancelar clases con confirmación
- Unirse a lista de espera automática
- Consultar historial de reservas y asistencias
- Dashboard personalizado con estadísticas de actividad
- Calificar clases e instructores
- Descargar comprobantes en PDF
- Recibir notificaciones push en tiempo real
- Gestionar perfil personal

### 2. **Instructor**
**Descripción:** Profesional certificado a cargo de impartir clases específicas en el gimnasio.

**Funcionalidades principales:**
- Ver todas las clases asignadas
- Editar información de sus propias clases futuras
- Registrar asistencia de alumnos
- Ver lista detallada de inscritos por clase
- Gestionar perfil profesional (especialidades, biografía)
- Recibir notificaciones de nuevas reservas y cancelaciones
- Dashboard con estadísticas de sus clases
- Historial de clases impartidas

### 3. **Administrador**
**Descripción:** Personal administrativo con privilegios completos para la gestión integral del sistema.

**Funcionalidades principales:**
- CRUD completo de clases (Crear, Leer, Actualizar, Eliminar)
- Gestión total de usuarios (socios, instructores, administradores)
- Asignación de instructores a clases
- Gestión de equipamiento e inventario
- Visualización de todas las reservas del sistema
- Panel de estadísticas generales del gimnasio
- Cancelar cualquier reserva del sistema
- Generar reportes en PDF
- Configuración global del sistema

---

## IV. Manual por Rol

## 4.1 Manual Socio

### 4.1.1 Acceso al Sistema

**Paso 1: Iniciar Sesión**

1. Acceda a la URL del sistema: `http://localhost:5173` (desarrollo) o la URL proporcionada por el gimnasio
2. En la pantalla de inicio, ingrese su **nombre de usuario**
3. Ingrese su **contraseña**
4. Haga clic en el botón **"Iniciar Sesión"**

**Credenciales de prueba para socio:**
- Username: `juan.perez`
- Password: `Socio123.`

Tras un inicio de sesión exitoso, aparecerá un modal de bienvenida personalizado por 3 segundos y será redirigido automáticamente al dashboard principal.

**Nota de seguridad:** El sistema utiliza tokens JWT que expiran después de 60 minutos. Si su sesión expira, deberá iniciar sesión nuevamente.

---

### 4.1.2 Dashboard Principal

El dashboard es la pantalla principal que visualizará cada vez que inicie sesión. Aquí se centraliza la información más relevante.

**Componentes del dashboard:**

**1. Sección Superior - Bienvenida:**
- Saludo personalizado con su nombre completo
- Fecha y hora actuales

**2. Tarjetas de Estadísticas Diarias:**
- 🔥 **Calorías quemadas:** Total estimado del día actual
- 💧 **Vasos de agua:** Contador de hidratación (puede incrementarlo con el botón "Registrar vaso")
- ⏱️ **Minutos de actividad:** Tiempo total de clases del día
- 🎯 **Racha de días:** Días consecutivos con actividad registrada

**3. Widget de Hidratación:**
- Visualización de vasos de agua consumidos (meta: 8 vasos diarios)
- Botón interactivo "Registrar vaso" para incrementar el contador
- Barra de progreso visual hacia la meta diaria

**4. Próximas Clases:**
- Listado de sus próximas 3 reservas confirmadas
- Información mostrada: Nombre de clase, fecha, hora, instructor
- Indicador de tiempo restante ("En 2 horas", "Mañana", etc.)

**5. Accesos Rápidos:**
- Botón "Reservar Clase" → Redirige a catálogo de clases
- Botón "Ver Historial" → Redirige a historial completo de reservas
- Botón "Mi Perfil" → Redirige a gestión de perfil personal

---

### 4.1.3 Reservar una Clase

**Ubicación:** Menú lateral → "Clases" (icono 📚)

**Paso 1: Acceder al Catálogo de Clases Disponibles**
1. En el menú lateral izquierdo, haga clic en **"Clases"**
2. Se desplegará la vista de "Clases Disponibles"
3. El sistema muestra solo clases futuras y activas

**Paso 2: Filtrar y Buscar (Opcional)**

**Buscador de texto:**
- Ubicado en la parte superior de la lista
- Permite buscar por nombre de clase o instructor
- Actualización en tiempo real mientras escribe

**Filtros por tipo:**
- Botones de filtro disponibles: Todas, Spinning, Yoga, Pilates, Cardio, Musculación, Funcional
- Haga clic en el tipo deseado para filtrar
- El filtro "Todas" muestra el catálogo completo

**Paso 3: Revisar Información de la Clase**

Cada tarjeta de clase muestra:
- 📚 **Nombre de la clase:** Título descriptivo
- 📝 **Descripción:** Detalles de la actividad
- 👤 **Instructor:** Nombre del profesional a cargo
- 📅 **Fecha:** Día programado
- ⏰ **Horario:** Hora de inicio y fin
- 👥 **Cupos:** Disponibles/Totales (ej: 8/15)
- 🏷️ **Tipo:** Categoría de la clase

**Paso 4: Realizar la Reserva**
1. Localice la clase deseada
2. Verifique que haya cupos disponibles
3. Haga clic en el botón verde **"Reservar"**
4. Aparecerá un modal de confirmación con el resumen:
   - 📚 Nombre de la clase
   - 📅 Fecha completa
   - ⏰ Horario exacto
   - 👤 Instructor asignado
5. Revise la información
6. Haga clic en **"Aceptar"** para confirmar la reserva
7. Si desea cancelar, haga clic en **"Cancelar"**

**Resultado exitoso:**
- Recibirá una notificación de confirmación (toast verde)
- La reserva aparecerá en "Mis Reservas"
- El cupo de la clase se reducirá en 1
- Recibirá una notificación push (si están activadas)
- El instructor recibirá notificación de su inscripción

**Nota importante:** Solo puede tener una reserva por horario. Si intenta reservar dos clases en el mismo horario, el sistema mostrará un error.

---

### 4.1.4 Cancelar una Reserva

**Ubicación:** Menú lateral → "Mis Reservas"

**Requisitos para cancelar:**
- La reserva debe estar en estado "Confirmada"
- Puede cancelar clases futuras y también clases pasadas (se registrará en el historial)
- No requiere tiempo mínimo de anticipación (a diferencia de versiones anteriores)

**Pasos para cancelar:**
1. En el menú lateral, haga clic en **"Mis Reservas"**
2. Se mostrarán dos pestañas:
   - **Reservas Activas:** Clases confirmadas pendientes
   - **Historial:** Todas las reservas (completadas, canceladas)
3. En la sección "Reservas Activas", localice la reserva que desea cancelar
4. Haga clic en el botón rojo **"Cancelar"** en la tarjeta de la reserva
5. Aparecerá un modal de confirmación preguntando: "¿Está seguro de cancelar esta reserva?"
6. Haga clic en **"Sí, cancelar"** para confirmar
7. Si cambió de opinión, haga clic en **"No"**

**Resultado de la cancelación:**
- La reserva cambiará de estado a "Cancelada"
- El cupo de la clase aumentará en 1
- Si hay personas en la lista de espera, la primera será asignada automáticamente
- El instructor recibirá una notificación de la cancelación
- Usted recibirá una confirmación de la cancelación
- La reserva se moverá al historial

**Importante:** Las cancelaciones recurrentes sin anticipación pueden afectar su estadística de asistencia y podría aplicarse una política de penalización (según configuración del gimnasio).

---

### 4.1.5 Lista de Espera

La lista de espera es un sistema automático que se activa cuando una clase no tiene cupos disponibles.

**¿Cuándo aparece la lista de espera?**
- Cuando los cupos totales de una clase están ocupados
- Ejemplo: Clase con 15/15 inscritos

**Pasos para unirse a la lista de espera:**
1. En "Clases Disponibles", identifique una clase llena
2. El botón mostrará **"Unirse a lista de espera"** (color amarillo/naranja)
3. Haga clic en el botón
4. Aparecerá un modal de confirmación
5. Confirme su inscripción en la lista
6. Recibirá confirmación de su posición (ej: "Posición #3 en la lista")

**¿Cómo funciona el sistema?**
- Funciona por orden de llegada (FIFO - First In, First Out)
- Si alguien cancela su reserva, el primer usuario de la lista recibe el cupo automáticamente
- Recibirá una notificación push instantánea cuando se le asigne el cupo
- La asignación es automática y no requiere acción adicional
- Su reserva cambia de "En espera" a "Confirmada"

**Salir de la lista de espera:**
1. Vaya a "Mis Reservas"
2. Localice la reserva con estado "En espera"
3. Haga clic en **"Salir de lista de espera"**
4. Confirme la acción

**Visualización de la lista:**
- Puede ver su posición actual en "Mis Reservas"
- El estado mostrará: "En lista de espera - Posición #X"

---

### 4.1.6 Historial de Reservas

**Ubicación:** Menú lateral → "Mis Reservas" → Pestaña "Historial"

El historial mantiene un registro completo de todas sus reservas en el sistema.

**Secciones del módulo:**

**1. Reservas Activas**
- Muestra clases confirmadas con fecha futura
- Información por tarjeta:
  - Nombre de la clase y descripción
  - Instructor asignado
  - Fecha y horario completo
  - Estado de la reserva
  - Acciones disponibles
- **Acciones posibles:**
  - 🗑️ **Cancelar:** Cancela la reserva
  - 📄 **Descargar PDF:** Genera comprobante individual

**2. Historial Completo**
- Registro de todas las reservas históricas
- **Estados posibles:**
  - ✅ **Confirmada:** Reserva activa pendiente
  - 🏁 **Completada:** Asistió a la clase
  - ❌ **Cancelada:** Reserva cancelada por el usuario o admin
  - ⚠️ **No Show:** No asistió sin cancelar previamente
  
**Filtros disponibles:**
- **Por fecha:** Seleccione rango de fechas específico
- **Por estado:** Filtre por Todas, Confirmadas, Canceladas, Completadas, No Show
- **Por tipo de clase:** Filtre por disciplina

**Información mostrada por reserva:**
- Clase y descripción breve
- Instructor que impartió/impartirá
- Fecha y horario
- Estado con código de color
- Número de reserva (ID único)

**Acciones en el historial:**
- 📄 **Descargar PDF individual:** Comprobante de una reserva específica
- 📊 **Exportar todo a PDF:** Genera reporte completo del historial
- 👁️ **Ver detalles:** Muestra información ampliada
- 🗑️ **Eliminar del historial:** Solo para registros muy antiguos (requiere confirmación)

**Generación de PDF:**
1. Haga clic en el botón "Descargar PDF" de la reserva deseada
2. Se generará automáticamente un documento con:
   - Logo del gimnasio "Energía Total"
   - Sus datos personales
   - Detalles completos de la reserva
   - Código QR de verificación (si está configurado)
   - Fecha de emisión del documento
3. El archivo se descargará automáticamente con nombre: `reserva_[ID]_[fecha].pdf`

---

### 4.1.7 Perfil de Usuario

**Acceso:** Haga clic en su avatar o nombre (esquina superior derecha del encabezado) → "Ver perfil"

El perfil es su espacio personal donde puede gestionar su información y configuraciones.

**Secciones del perfil:**

**1. Información Personal**
- **Foto de perfil:** Avatar o foto personalizada
- **Nombre completo:** Nombre y apellido
- **Email:** Correo electrónico registrado
- **Teléfono:** Número de contacto
- **Fecha de nacimiento:** Día, mes y año
- **Dirección:** Domicilio (opcional)
- **Fecha de registro:** Cuándo se creó la cuenta

**2. Estadísticas Personales**
Panel con métricas de su actividad:
- 📊 **Clases completadas:** Total histórico de clases asistidas
- ⭐ **Calificación promedio dada:** Promedio de sus evaluaciones a clases
- 🎯 **Racha actual:** Días consecutivos con actividad
- 📌 **Inasistencias:** Cantidad de "No Show" registrados
- 🏆 **Clase favorita:** Tipo de clase más frecuentada
- 📅 **Última actividad:** Fecha de su última clase

**3. Editar Perfil**
Para actualizar su información:
1. Haga clic en el botón **"✏️ Editar Perfil"**
2. Se habilitarán los campos editables:
   - Nombre y apellido
   - Email (puede requerir verificación)
   - Teléfono
   - Dirección
3. Realice los cambios necesarios
4. Haga clic en **"💾 Guardar Cambios"**
5. Recibirá confirmación de actualización exitosa

**4. Cambiar Foto de Perfil**
1. Haga clic en la foto actual o en el botón **"Cambiar Foto"**
2. Se abrirá el explorador de archivos
3. Seleccione una imagen (formatos permitidos: JPG, PNG, GIF)
4. Tamaño máximo: 2MB
5. La foto se subirá y actualizará automáticamente

**5. Cambiar Contraseña**
Sección de seguridad para actualizar su contraseña:
1. Haga clic en el botón **"🔒 Cambiar Contraseña"**
2. Aparecerá un formulario con tres campos:
   - **Contraseña actual:** Ingrese su contraseña vigente
   - **Nueva contraseña:** Ingrese la nueva (mínimo 8 caracteres)
   - **Confirmar nueva contraseña:** Repita la nueva contraseña
3. Haga clic en **"Actualizar"**
4. Si las validaciones son correctas, la contraseña se actualizará
5. Será redirigido al login para iniciar sesión con la nueva contraseña

**Requisitos de contraseña:**
- Mínimo 8 caracteres
- Al menos una letra mayúscula
- Al menos un número
- Al menos un carácter especial (!@#$%^&*)

---

### 4.1.8 Notificaciones

El sistema de notificaciones mantiene informado al usuario sobre eventos importantes en tiempo real.

**Centro de Notificaciones:**
- **Ubicación:** Icono de campana 🔔 en la esquina superior derecha del encabezado
- **Indicador:** Contador rojo muestra la cantidad de notificaciones no leídas

**Tipos de notificaciones que recibirá:**
- ✅ **Reserva confirmada:** Cuando reserva exitosamente una clase
- 🔔 **Recordatorio de clase:** 1 hora antes del inicio de su clase
- 📋 **Asignación desde lista de espera:** Cuando recibe cupo automático
- ❌ **Clase cancelada:** Si el gimnasio cancela una clase reservada
- ⚠️ **Cambios en la clase:** Modificaciones de horario o instructor
- 🎉 **Logros:** Al completar hitos (ej: 10 clases completadas)

**Activar Notificaciones Push:**

Las notificaciones push permiten recibir alertas incluso cuando el navegador está en segundo plano o minimizado.

**Primera vez (activación manual):**
1. Haga clic en el icono 🔔 en el encabezado
2. Si aparece un banner morado con el mensaje "Activa las notificaciones push para recibir alertas en tiempo real"
3. Haga clic en el botón **"Activar"**
4. Su navegador mostrará un cuadro de diálogo solicitando permiso
5. Haga clic en **"Permitir"** o **"Allow"**
6. Las notificaciones push quedarán activadas

**Nota de seguridad:** Por políticas de seguridad de los navegadores modernos, el permiso de notificaciones solo puede solicitarse mediante una acción del usuario (clic), no automáticamente.

**Gestionar notificaciones:**
1. **Ver notificaciones:** Haga clic en el icono 🔔
2. Se desplegará un panel con la lista de notificaciones recientes
3. **Marcar como leída:** Haga clic en cualquier notificación individual
4. **Marcar todas como leídas:** Botón en la parte superior del panel
5. **Limpiar todas:** Botón "Limpiar" elimina notificaciones leídas

**Actualización automática:**
- El sistema verifica nuevas notificaciones cada **10 segundos**
- No es necesario recargar la página
- Las notificaciones se sincronizan con el servidor

**Desactivar notificaciones push:**
1. Haga clic en el icono de información o candado en la barra de direcciones del navegador
2. Busque "Notificaciones"
3. Cambie el permiso a "Bloquear"

---

### 4.1.9 Compartir Clases (Opcional)

Función social que permite invitar amigos compartiendo información de clases.

**Pasos para compartir:**
1. En "Clases Disponibles", localice la clase que desea compartir
2. Haga clic en el botón **"Compartir"** (icono 📤 o ícono de compartir)
3. Aparecerá un modal con opciones de compartir:
   - **WhatsApp:** Comparte directamente en WhatsApp
   - **Facebook:** Publica en su muro
   - **Twitter/X:** Crea un tweet
   - **Copiar enlace:** Copia URL para compartir manualmente

**Información que se comparte:**
- Nombre de la clase
- Instructor
- Fecha y horario
- Enlace directo para reservar (si el destinatario tiene cuenta)

---

## 4.2 Manual Instructor

### 4.2.1 Acceso al Sistema

**Credenciales de prueba para instructor:**
- Username: `instructor.spinning`
- Password: `Instructor123.`

Al iniciar sesión como instructor, será redirigido automáticamente al **Dashboard de Instructor**.

**Diferencias con la vista de socio:**
- Menú lateral adaptado con opciones de instructor
- Dashboard enfocado en gestión de clases propias
- Acceso a registro de asistencia
- Herramientas de edición de clases

---

### 4.2.2 Dashboard de Instructor

El dashboard del instructor muestra información relevante para la gestión de sus clases.

**Componentes principales:**

**1. Bienvenida Personalizada**
- Saludo con nombre del instructor
- Fecha y hora actuales

**2. Estadísticas Rápidas**
- 📚 **Clases del día:** Cantidad de clases que impartirá hoy
- 👥 **Total de alumnos:** Suma de inscritos en todas sus clases
- 📅 **Clases esta semana:** Clases programadas en los próximos 7 días
- ⭐ **Calificación promedio:** Rating promedio recibido de los socios

**3. Próximas Clases**
- Listado de las próximas 3-5 clases a impartir
- Información mostrada:
  - Nombre de la clase
  - Fecha y hora
  - Cantidad de inscritos / Cupos totales
  - Estado (AHORA, EN 1H, HOY, MAÑANA)
- Botones de acceso rápido:
  - Ver detalles
  - Ver lista de inscritos
  - Registrar asistencia (si la clase ya ocurrió)

**4. Alertas y Pendientes**
- Notificaciones de nuevas inscripciones
- Clases que requieren registro de asistencia
- Recordatorios importantes

---

### 4.2.3 Mis Clases

**Ubicación:** Menú lateral → "Clases"

Vista completa de todas las clases asignadas al instructor.

**Información mostrada por cada clase:**
- 📚 **Nombre:** Título de la clase
- 📝 **Descripción:** Detalles breves de la actividad
- 📅 **Fecha y hora:** Programación completa
- 👥 **Inscritos:** Cantidad actual / Cupos totales (ej: 12/15)
- ⏰ **Estado temporal:**
  - 🔴 **HOY:** Clase programada para hoy
  - 🟢 **Futura:** Clase con fecha posterior
  - ⚫ **Pasada:** Clase ya realizada
- 🏷️ **Tipo:** Disciplina (Spinning, Yoga, etc.)

**Acciones disponibles:**

**1. Editar Clase (solo clases futuras):**

**Requisito:** Solo puede editar sus propias clases con fecha futura. Las clases pasadas y de otros instructores no son editables.

**Pasos para editar:**
1. Localice la clase futura que desea modificar
2. Haga clic en el botón **"✏️ Editar"** (color azul)
3. Se abrirá un modal de edición con el formulario pre-llenado
4. **Campos editables:**
   - **Nombre:** Título de la clase (máx. 100 caracteres)
   - **Descripción:** Detalles y objetivos (máx. 500 caracteres)
   - **Tipo:** Seleccione de la lista (Spinning, Yoga, Pilates, Cardio, Musculación, Funcional, Otro)
   - **Fecha:** Selector de calendario (solo fechas futuras)
   - **Hora inicio:** Selector de hora (formato 24h)
   - **Hora fin:** Debe ser posterior a hora de inicio
   - **Cupos totales:** Cantidad máxima de participantes (mínimo: inscritos actuales)
5. Realice los cambios necesarios
6. Haga clic en **"💾 Guardar Cambios"**
7. Confirme la acción en el modal de confirmación
8. Los cambios se aplicarán inmediatamente

**Validaciones del sistema:**
- No puede reducir cupos por debajo de los ya inscritos
- La hora de fin debe ser posterior a la hora de inicio
- No puede cambiar la fecha a una pasada
- Duración mínima de la clase: 30 minutos

**Notificaciones automáticas:**
- Los socios inscritos recibirán notificación de los cambios realizados
- Los cambios significativos (fecha/hora) generan alertas destacadas

**2. Ver Inscritos:**
1. Haga clic en la tarjeta de la clase o en el botón **"Ver inscritos"**
2. Se mostrará un listado detallado con:
   - Foto y nombre completo de cada socio
   - Estado de la reserva (Confirmada, En espera)
   - Fecha y hora de la inscripción
   - Información de contacto (si está disponible)

**3. Ver Detalles Completos:**
- Muestra toda la información de la clase
- Historial de cambios realizados
- Lista de espera (si existe)

---

### 4.2.4 Registro de Asistencia

**Ubicación:** Menú lateral → "Asistencia" o desde el botón en cada clase

El registro de asistencia es fundamental para el seguimiento de los socios y las estadísticas del gimnasio.

**Requisitos:**
- Solo puede registrar asistencia de clases que ya ocurrieron o están ocurriendo
- Solo de sus propias clases

**Pasos para registrar asistencia:**

1. **Acceder al módulo:**
   - Opción A: Menú lateral → "Asistencia"
   - Opción B: En "Mis Clases" → Clase específica → "Registrar Asistencia"

2. **Seleccionar la clase:**
   - Si accedió desde el menú, elija la clase del listado
   - El sistema muestra solo clases del día o recientes sin asistencia registrada

3. **Lista de inscritos:**
   Se mostrará la lista completa de socios que reservaron la clase:
   - Foto y nombre completo
   - Checkbox de asistencia
   - Estado actual

4. **Marcar asistencia:**
   - ✅ **Presente:** Marque el checkbox si el socio asistió
   - ❌ **Ausente:** Deje sin marcar si no asistió
   - Puede marcar/desmarcar varios antes de guardar

5. **Opciones masivas:**
   - **"Marcar todos presentes":** Checkbox superior para seleccionar todos de una vez
   - Útil cuando la mayoría asistió

6. **Guardar registro:**
   - Haga clic en el botón verde **"💾 Guardar Asistencia"**
   - Aparecerá confirmación de la cantidad registrada
   - El sistema registra fecha y hora del registro

**Resultado del registro:**
- Los socios marcados como presentes suman a sus estadísticas
- Los ausentes sin cancelación previa se marcan como "No Show"
- Las estadísticas del dashboard se actualizan automáticamente
- No se puede modificar la asistencia después de 24 horas (política configurable)

**Notas importantes:**
- Es responsabilidad del instructor registrar asistencia puntualmente
- El registro afecta las métricas de ocupación y popularidad de clases
- Los "No Show" repetidos pueden generar alertas administrativas

---

### 4.2.5 Perfil de Instructor

**Acceso:** Avatar → "Ver perfil"

El perfil profesional del instructor es visible para los socios al explorar clases.

**Secciones del perfil:**

**1. Información Profesional**
- **Foto profesional:** Imagen de perfil de calidad
- **Nombre completo:** Nombre y apellido
- **Email:** Correo de contacto profesional
- **Teléfono:** Número de contacto (opcional)
- **Especialidades:** Disciplinas que domina (ej: "Spinning, Yoga, Pilates")
- **Biografía:** Descripción profesional, certificaciones, experiencia
- **Fecha de ingreso:** Cuándo comenzó a trabajar en el gimnasio

**2. Estadísticas Profesionales**
- ⭐ **Calificación promedio:** Rating recibido de los socios
- 📚 **Clases impartidas:** Total histórico
- 👥 **Alumnos totales:** Suma de participantes en todas las clases
- 🏆 **Clase más popular:** Su clase con mayor demanda
- 📊 **Tasa de ocupación:** Porcentaje promedio de cupos ocupados

**3. Editar Perfil Profesional**

Para actualizar información:
1. Haga clic en **"✏️ Editar Perfil"**
2. Campos editables:
   - **Especialidades:** Lista separada por comas (ej: "Spinning, Yoga")
   - **Biografía:** Texto libre (máx. 500 caracteres)
     - Describa su experiencia profesional
     - Certificaciones y formación
     - Filosofía de entrenamiento
     - Logros destacados
   - **Foto:** Cambiar imagen de perfil
3. Haga clic en **"💾 Guardar"**

**Recomendaciones para la biografía:**
- Mencione años de experiencia
- Incluya certificaciones relevantes
- Describa su enfoque de enseñanza
- Sea conciso y profesional
- Actualice cuando obtenga nuevas certificaciones

**4. Cambiar Contraseña**
- Proceso idéntico al descrito en el manual del socio
- Acceso desde el perfil o configuración de cuenta

**Visibilidad del perfil:**
- Los socios pueden ver su perfil al explorar clases
- La calificación promedio es visible públicamente
- La biografía y especialidades ayudan a los socios a elegir clases

---

### 4.2.6 Notificaciones para Instructores

Los instructores reciben notificaciones específicas relacionadas con la gestión de sus clases.

**Tipos de notificaciones:**
- ✅ **Nueva inscripción:** Cuando un socio reserva su clase
  - Incluye: Nombre del socio, clase reservada, hora
- ❌ **Cancelación de reserva:** Cuando un socio cancela
  - Incluye: Nombre del socio, clase, motivo (si lo indicó)
- 📝 **Cambios administrativos:** Modificaciones hechas por administradores
  - Incluye: Qué se modificó, quién lo hizo
- 🔔 **Recordatorio de clase:** 30 minutos antes de cada clase
- ⚠️ **Asistencia pendiente:** Si no ha registrado asistencia después de 24h

**Activar notificaciones push:**

Proceso idéntico al del socio:
1. Haga clic en el icono 🔔
2. Si aparece el banner de activación, haga clic en **"Activar"**
3. Acepte el permiso en el navegador
4. Recibirá alertas en tiempo real, incluso con el navegador minimizado

**Beneficios de las notificaciones para instructores:**
- Seguimiento en tiempo real de inscripciones
- Preparación anticipada (saber cuántos alumnos asistirán)
- Respuesta rápida a cambios administrativos
- No olvidar registrar asistencia

**Gestión:

- Marcar individual o todas como leídas
- Limpiar notificaciones antiguas
- El sistema sincroniza con el servidor cada 10 segundos

---

## 4.3 Manual Administrador

### 4.3.1 Acceso al Sistema

**Credenciales de prueba para administrador:**
- Username: `admin`
- Password: `Admin123.`

Al iniciar sesión como administrador, accederá al **Panel de Administración** con privilegios completos sobre todo el sistema.

**Responsabilidades del rol:**
- Gestión completa de usuarios y clases
- Supervisión de reservas y asistencias
- Generación de reportes y estadísticas
- Configuración global del sistema
- Resolución de incidencias

---

### 4.3.2 Dashboard de Administración

El dashboard administrativo proporciona una vista general completa del estado del gimnasio.

**Componentes principales:**

**1. Métricas Generales (Tarjetas superiores)**
- 👥 **Total de usuarios activos:** Socios + Instructores con cuentas activas
- 📚 **Total de clases programadas:** Clases futuras en el sistema
- 🎟️ **Reservas del día:** Inscripciones para clases de hoy
- 📊 **Ocupación promedio:** Porcentaje de cupos ocupados globalmente

**2. Gráficos y Estadísticas**
- **Gráfico de reservas:** Tendencia semanal/mensual
- **Clases más populares:** Top 5 con mayor demanda
- **Distribución por tipo:** Pie chart de disciplinas
- **Horarios pico:** Franjas horarias con mayor ocupación

**3. Actividad Reciente**
- Últimas 10 reservas realizadas
- Nuevos usuarios registrados
- Cancelaciones recientes
- Alertas y notificaciones del sistema

**4. Accesos Rápidos**
Botones para acciones frecuentes:
- ➕ Nueva Clase
- ➕ Nuevo Usuario
- 📊 Generar Reporte
- ⚙️ Configuración

**5. Alertas Administrativas**
- Clases con baja ocupación
- Instructores sin clases asignadas
- Equipamiento en mantenimiento
- Problemas técnicos o errores

---

### 4.3.3 Gestión de Clases

**Ubicación:** Menú lateral → "Clases"

El módulo de gestión de clases permite administrar todo el catálogo de actividades del gimnasio.

**Vista principal:**
- Tabla completa con todas las clases (pasadas, presentes, futuras)
- Columnas: Nombre, Instructor, Fecha, Hora, Inscritos, Estado, Acciones
- Buscador por texto (nombre, instructor, descripción)
- Filtros: Por tipo, por instructor, por fecha, por estado

**Crear Nueva Clase:**

1. Haga clic en el botón verde **"⚡ Nueva Clase"** (esquina superior derecha)
2. Se abrirá un modal/formulario con los siguientes campos:

**Campos del formulario:**
- **Nombre:** Título descriptivo de la clase (obligatorio)
  - Ejemplo: "Spinning Intenso Matutino"
- **Descripción:** Detalles de la actividad (obligatorio)
  - Ejemplo: "Clase de alta intensidad enfocada en resistencia cardiovascular"
- **Tipo:** Seleccione de la lista desplegable (obligatorio)
  - Opciones: Spinning, Yoga, Pilates, Cardio, Musculación, Funcional, Otro
- **Instructor:** Seleccione de la lista de instructores disponibles (opcional inicialmente)
  - Si no asigna, debe hacerlo antes de la fecha de la clase
- **Fecha:** Selector de calendario (obligatorio)
  - Solo permite fechas futuras
- **Hora inicio:** Selector de hora en formato 24h (obligatorio)
  - Ejemplo: 07:00
- **Hora fin:** Debe ser posterior a hora de inicio (obligatorio)
  - Ejemplo: 08:00
- **Cupos totales:** Cantidad máxima de participantes (obligatorio)
  - Valor mínimo: 1, valor recomendado: 10-20 según espacio
- **Estado:** Seleccione el estado inicial (obligatorio)
  - **Activa:** La clase estará visible y reservable
  - **Cancelada:** No aparecerá en el catálogo
  - **Programada:** Visible pero aún no reservable
- **¿Permite lista de espera?:** Checkbox (opcional)
  - Marque si desea activar lista de espera cuando se llene

3. Complete todos los campos obligatorios
4. Haga clic en **"Crear Clase"**
5. Aparecerá un modal de confirmación con el resumen
6. Confirme para crear

**Resultado:**
- La clase se añade al sistema
- Aparece en el catálogo para socios (si está activa)
- El instructor asignado recibe notificación
- Se genera un ID único para la clase

**Validaciones:**
- No puede crear clases en fechas pasadas
- Duración mínima: 30 minutos, máxima: 4 horas
- Cupos mínimos: 1, máximo: 100
- No puede haber dos clases del mismo instructor en el mismo horario

**Editar Clase Existente:**

1. En la tabla de clases, localice la que desea modificar
2. Haga clic en el icono **✏️ Editar** (color azul)
3. Se abrirá el formulario con los datos actuales pre-llenados
4. **Puede modificar cualquier campo:**
   - Cambiar instructor
   - Modificar fecha y horarios
   - Aumentar o reducir cupos (con validación de inscritos actuales)
   - Cambiar estado (Activa/Cancelada)
   - Actualizar descripción
5. Haga clic en **"💾 Guardar Cambios"**
6. Confirme la operación

**Consideraciones al editar:**
- Si reduce cupos por debajo de los inscritos, mostrará advertencia
- Si cambia fecha/hora, todos los inscritos recibirán notificación
- Si cancela la clase, se notifica automáticamente a los socios y se procesa reembolso (si aplica)
- Cambiar instructor requiere confirmación y notifica a ambos instructores

**Eliminar Clase:**

⚠️ **Acción crítica - Usar con precaución**

1. Localice la clase en la tabla
2. Haga clic en el icono **🗑️ Eliminar** (color rojo)
3. Aparecerá modal de confirmación con advertencia:
   - "¿Está seguro de eliminar esta clase?"
   - "Se perderán todas las reservas asociadas (X reservas)"
   - "Esta acción NO se puede deshacer"
4. Escriba "CONFIRMAR" en el campo de verificación
5. Haga clic en **"Sí, eliminar definitivamente"**

**Consecuencias de eliminar:**
- La clase se elimina permanentemente de la base de datos
- Todas las reservas asociadas se cancelan
- Los socios reciben notificación de cancelación
- Los datos se mantienen en logs para auditoría
- No se puede recuperar la clase eliminada

**Recomendación:** En lugar de eliminar, considere cambiar el estado a "Cancelada" para mantener el historial.

**Ver Detalles de una Clase:**

1. Haga clic en el nombre de la clase o en el botón **👁️ Ver**
2. Se mostrará panel detallado con:
   - Información completa de la clase
   - **Lista de inscritos:** Todos los socios reservados
   - **Lista de espera:** Si hay socios en espera
   - **Historial de cambios:** Registro de modificaciones
   - **Estadísticas:** Ocupación, calificaciones recibidas
3. Desde aquí puede:
   - Editar la clase
   - Ver perfil de cada socio inscrito
   - Cancelar reservas individuales
   - Descargar listado en PDF

---

### 4.3.4 Gestión de Usuarios

**Ubicación:** Menú lateral → "Usuarios"

Administración completa de todas las cuentas del sistema.

**Tabs disponibles:**

**1. Tab "Socios"**
Lista completa de clientes del gimnasio.

**Información mostrada:**
- Foto de perfil y nombre completo
- Email y teléfono
- Estado de membresía (Activo, Suspendido, Inactivo)
- Fecha de registro
- Total de clases completadas
- Última actividad

**Acciones disponibles:**
- ➕ **Crear nuevo socio**
- ✏️ **Editar información**
- 👁️ **Ver perfil completo y estadísticas**
- 🚫 **Suspender/Activar cuenta**
- 🔑 **Restablecer contraseña**
- 🗑️ **Eliminar usuario** (requiere confirmación especial)

**Crear Nuevo Socio:**

1. Haga clic en el botón **"➕ Nuevo Socio"**
2. Complete el formulario de registro:

**Campos obligatorios:**
- **Nombre:** Primer nombre
- **Apellido:** Apellido paterno
- **Email:** Correo electrónico único (no debe existir en el sistema)
- **Username:** Nombre de usuario único para login
- **Contraseña:** Contraseña inicial (debe cumplir requisitos de seguridad)
- **Confirmar contraseña:** Repetir contraseña
- **Teléfono:** Número de contacto
- **Fecha de nacimiento:** Para validación de edad (mínimo 18 años)

**Campos opcionales:**
- Dirección completa
- Foto de perfil
- Observaciones médicas

3. Haga clic en **"Crear Socio"**
4. El sistema valida que no exista email o username duplicado
5. Se crea la cuenta con rol "Socio"
6. Se envía email de bienvenida (si está configurado)

**Editar Socio Existente:**

1. En la lista de socios, haga clic en **✏️ Editar**
2. Modifique los campos necesarios
3. **No puede cambiar:** Email y username (por seguridad)
4. **Puede cambiar:** Nombre, apellido, teléfono, dirección, estado
5. Guardar cambios

**Suspender Cuenta:**
- Útil para suspensiones temporales sin eliminar datos
- Haga clic en **🚫 Suspender**
- El socio no podrá iniciar sesión
- Puede reactivar en cualquier momento

**2. Tab "Instructores"**
Gestión de profesionales que imparten clases.

**Información mostrada:**
- Foto de perfil y nombre completo
- Especialidades (disciplinas que imparte)
- Email y teléfono
- Calificación promedio recibida
- Cantidad de clases asignadas
- Estado (Activo, Inactivo)

**Crear Nuevo Instructor:**

1. Haga clic en **"➕ Nuevo Instructor"**
2. Complete el formulario base (similar a socio)
3. **Campos adicionales para instructor:**
   - **Especialidades:** Lista de disciplinas que domina
     - Ejemplo: "Spinning, Yoga, Pilates"
     - Separadas por comas
   - **Biografía profesional:** Descripción de experiencia
     - Certificaciones
     - Años de experiencia
     - Filosofía de entrenamiento
   - **Fecha de ingreso:** Cuándo comenzó a trabajar
4. Crear instructor

**Asignar Clases a Instructor:**
1. En el perfil del instructor, sección "Clases"
2. Haga clic en **"Asignar Nueva Clase"**
3. Seleccione la clase de la lista de clases sin instructor
4. Confirme la asignación
5. El instructor recibirá notificación

**Gestionar Especialidades:**
1. Edite el perfil del instructor
2. En el campo "Especialidades", agregue o quite disciplinas
3. Esto afecta qué tipo de clases puede impartir

**3. Tab "Administradores"**
Gestión de cuentas administrativas (usar con precaución).

**Crear Nuevo Administrador:**
⚠️ Solo crear cuando sea absolutamente necesario

1. Haga clic en **"➕ Nuevo Administrador"**
2. Complete formulario básico
3. **Importante:** Los administradores tienen acceso total
4. Asigne contraseña segura y compleja
5. Confirme con contraseña maestra

---

### 4.3.5 Gestión de Reservas

**Ubicación:** Menú lateral → "Reservas"

Vista completa de todas las reservas del sistema.

**Filtros y búsqueda:**
- **Por usuario:** Busque por nombre o email del socio
- **Por clase:** Filtre por nombre de clase o tipo
- **Por fecha:** Rango de fechas específico
- **Por estado:** Todas, Confirmadas, Canceladas, Completadas, No Show
- **Por instructor:** Ver reservas de un instructor específico

**Información mostrada en la tabla:**
- ID de reserva (único)
- Socio (nombre y foto)
- Clase (nombre y horario)
- Fecha de la reserva
- Estado actual
- Fecha de creación de la reserva
- Acciones disponibles

**Cancelar Reserva de Usuario:**

Como administrador, puede cancelar cualquier reserva:

1. Localice la reserva en la tabla
2. Haga clic en el botón rojo **"Cancelar reserva"**
3. Aparecerá modal pidiendo:
   - **Motivo de cancelación:** Campo de texto (opcional pero recomendado)
     - Ejemplo: "Clase suspendida por mantenimiento", "Solicitud del socio"
4. Confirme la cancelación
5. El socio recibirá notificación automática con el motivo
6. El cupo de la clase se libera automáticamente
7. Si hay lista de espera, se asigna al siguiente

**Casos de uso:**
- Emergencias o imprevistos del gimnasio
- Solicitudes telefónicas de socios
- Clases suspendidas o canceladas
- Resolución de conflictos o errores

**Ver Detalles de Reserva:**
- Haga clic en el ID o en **👁️ Ver**
- Muestra información completa:
  - Datos del socio
  - Detalles de la clase
  - Historial de cambios
  - Asistencia registrada (si aplica)

**Estados de reserva:**
- 🟢 **Confirmada:** Reserva activa para clase futura
- 🟡 **En espera:** En lista de espera
- ✅ **Completada:** Asistió a la clase
- ❌ **Cancelada:** Cancelada por socio o admin
- ⚠️ **No Show:** No asistió sin cancelar

**Exportar datos:**
- Botón **"📊 Exportar a Excel"**: Descarga tabla en formato .xlsx
- Botón **"📄 Generar Reporte PDF"**: Crea documento PDF profesional

---

### 4.3.6 Gestión de Equipamiento

**Ubicación:** Menú lateral → "Equipamiento"

Módulo para administrar inventario de equipos y mantenimiento.

**Vista principal:**
- Listado de todos los equipos del gimnasio
- Información: Nombre, cantidad, estado, ubicación, última mantención

**Agregar Nuevo Equipo:**

1. Haga clic en **"➕ Nuevo Equipo"**
2. Complete el formulario:
   - **Nombre:** Tipo de equipo (ej: "Bicicleta estática")
   - **Descripción:** Marca, modelo, detalles
   - **Cantidad disponible:** Unidades funcionales
   - **Ubicación:** Sala o área (ej: "Sala Spinning")
   - **Estado:** Disponible, En mantenimiento, Fuera de servicio
   - **Fecha de compra:** Cuando se adquirió
   - **Fecha de última mantención:** Registro de mantenimiento
   - **Próxima mantención:** Programación preventiva
   - **Observaciones:** Notas adicionales
3. Guardar equipo

**Actualizar Estado:**
- Marcar equipos **"En mantenimiento"** cuando requieran servicio
- Registrar reparaciones y fecha de resolución
- Marcar **"Fuera de servicio"** si no son utilizables
- Actualizar cantidades cuando se compren o den de baja

**Historial de Mantenimiento:**
- Cada equipo tiene log de mantenimientos
- Registro de fechas, tipo de servicio, técnico responsable
- Ayuda a planificar mantenimientos preventivos

**Alertas automáticas:**
- El sistema genera alertas cuando:
  - Se acerca fecha de mantenimiento programado
  - Un equipo lleva mucho tiempo en mantenimiento
  - La cantidad disponible es muy baja

---

### 4.3.7 Reportes y Estadísticas

**Ubicación:** Dashboard → Sección de estadísticas o Menú → "Reportes"

Herramientas para generar reportes profesionales en PDF.

**Tipos de reportes disponibles:**

**1. Reporte de Reservas:**
- **Contenido:**
  - Total de reservas por período seleccionado
  - Tasa de ocupación general
  - Clases más populares (top 10)
  - Clases con menor demanda
  - Comparativa con período anterior
- **Filtros:**
  - Rango de fechas
  - Por tipo de clase
  - Por instructor
- **Formato:** PDF profesional con gráficos

**2. Reporte de Usuarios:**
- **Contenido:**
  - Total de usuarios activos
  - Nuevos registros en el período
  - Usuarios más activos (top 10)
  - Tasa de retención
  - Estadísticas de asistencia
- **Segmentación:** Por tipo de usuario (socios/instructores)

**3. Reporte de Instructores:**
- **Contenido:**
  - Clases impartidas por instructor
  - Calificaciones promedio recibidas
  - Ocupación de sus clases
  - Comparativa entre instructores
  - Horas trabajadas
- **Utilidad:** Evaluación de desempeño

**4. Reporte Financiero (si aplica):**
- Ingresos por reservas
- Proyección de ocupación
- Análisis de rentabilidad por tipo de clase

**Generar un reporte:**

1. Seleccione el **tipo de reporte** deseado
2. Configure los **filtros:**
   - Rango de fechas (última semana, mes, trimestre, año, personalizado)
   - Tipo de clase (opcional)
   - Instructor específico (opcional)
3. Elija el **formato:**
   - PDF (recomendado para impresión)
   - Excel (para análisis adicional)
4. Haga clic en **"📊 Generar Reporte"**
5. El sistema procesará los datos (puede tardar unos segundos)
6. Se descargará automáticamente el archivo

**Nombre del archivo generado:**
- Formato: `Reporte_[Tipo]_[Fecha].pdf`
- Ejemplo: `Reporte_Reservas_2025-12-09.pdf`

**Contenido del PDF:**
- **Encabezado:** Logo del gimnasio, título del reporte, fecha de generación
- **Resumen ejecutivo:** Métricas clave destacadas
- **Gráficos:** Visualizaciones de datos (barras, líneas, pie charts)
- **Tablas detalladas:** Datos completos
- **Pie de página:** Número de página, generado por [nombre admin]

---

### 4.3.8 Configuración del Sistema

**Ubicación:** Menú lateral → "Configuración" o ícono ⚙️

Panel de configuraciones globales del sistema.

**Categorías de configuración:**

**1. Políticas de Reservas:**
- ⏰ **Tiempo mínimo de cancelación:** 
  - Actual: 1 hora (configurable)
  - Define con cuánta anticipación se debe cancelar
- **Permite reservas duplicadas:** Sí/No
- **Máximo de reservas simultáneas por socio:** Número (ej: 5)
- **Días de anticipación para reservar:** Cuántos días adelante pueden reservar

**2. Notificaciones:**
- ✅ **Enviar notificaciones por email:** Activar/Desactivar
- 🔔 **Notificaciones push:** Activar/Desactivar
- **Recordatorio de clase:** Tiempo antes (30min, 1h, 2h)
- **Notificar a instructores:** Configurar qué eventos notifican

**3. Apariencia:**
- 🎨 **Logo del gimnasio:** Subir imagen personalizada
- **Colores del tema:** Personalizar paleta (avanzado)
- **Nombre del gimnasio:** Cambiar si es necesario

**4. Seguridad:**
- 🔒 **Requisitos de contraseña:** Complejidad mínima
- **Sesión máxima:** Tiempo antes de expirar token (actual: 60 min)
- **Intentos de login:** Máximo antes de bloqueo temporal
- **Autenticación de dos factores:** Activar/Desactivar (avanzado)

**5. Integraciones (Avanzado):**
- API Keys para servicios externos
- Webhooks para notificaciones
- Sincronización con otros sistemas

**Aplicar cambios:**
1. Modifique las configuraciones deseadas
2. Haga clic en **"💾 Guardar Configuración"**
3. Algunos cambios requieren recargar la página
4. Cambios críticos solicitan contraseña de administrador

⚠️ **Precaución:** Cambios en configuraciones de seguridad pueden afectar a todos los usuarios.

---

## V. Características Técnicas

### 5.1 Arquitectura del Sistema

**Modelo Cliente-Servidor:**

**Frontend (Cliente):**
- **Framework:** React 18.2
- **Routing:** React Router v6
- **Build Tool:** Vite 5.0
- **Estilos:** Tailwind CSS 3.4
- **HTTP Client:** Axios
- **Generación de PDFs:** jsPDF
- **Gestión de estado:** React Hooks (useState, useEffect, useContext)

**Backend (Servidor):**
- **Framework:** Django 5.2
- **API:** Django REST Framework 3.14
- **Lenguaje:** Python 3.13
- **ORM:** Django ORM
- **Autenticación:** djangorestframework-simplejwt
- **CORS:** django-cors-headers

**Base de Datos:**
- **Desarrollo:** SQLite 3
- **Producción:** PostgreSQL 14+ (recomendado)
- **Migraciones:** Django Migrations

**Servicios Adicionales:**
- **Web Push:** Service Workers + Notification API
- **Archivos estáticos:** WhiteNoise (producción)

---

### 5.2 Flujo de Autenticación

**Sistema JWT (JSON Web Tokens):**

1. **Login:**
   - Usuario envía credenciales a `/api/token/`
   - Backend valida y genera dos tokens:
     - **Access Token:** Válido 60 minutos
     - **Refresh Token:** Válido 24 horas
   - Frontend almacena tokens en localStorage

2. **Peticiones autenticadas:**
   - Cada petición incluye header: `Authorization: Bearer <access_token>`
   - Backend valida el token antes de procesar

3. **Renovación automática:**
   - Cuando el access token expira:
     - Frontend envía refresh token a `/api/token/refresh/`
     - Backend genera nuevo access token
     - Proceso transparente para el usuario

4. **Logout:**
   - Frontend elimina tokens de localStorage
   - Redirección a pantalla de login

**Seguridad:**
- Tokens firmados con clave secreta
- HTTPS requerido en producción
- Protección contra CSRF
- Validación de permisos por rol

---

### 5.3 Sistema de Notificaciones

**Implementación de Web Push:**

**Componentes:**

1. **Backend (Django):**
   - Modelo `Notificacion` en base de datos
   - ViewSet con endpoints REST
   - Creación automática en eventos (reserva, cancelación)

2. **Frontend (React):**
   - Hook `useNotificationState` centraliza lógica
   - Integración con Notification API del navegador
   - Polling cada 10 segundos para nuevas notificaciones

**Flujo completo:**

1. **Evento en el sistema** (ej: Socio reserva clase)
2. **Backend crea registro** en tabla `notificaciones`
3. **Frontend detecta** en próximo polling (máx. 10 seg)
4. **Se muestra:**
   - Badge en icono 🔔 con contador
   - Notificación push del navegador (si está activado)
   - Toast temporal en pantalla
5. **Usuario interactúa:**
   - Clic en notificación → Marca como leída
   - Backend actualiza estado en base de datos

**Persistencia:**
- Las notificaciones se sincronizan con el servidor
- Al marcar como leída o limpiar, se actualiza en backend
- No se pierden al recargar la página
- Historial de 30 días (configurable)

---

### 5.4 Rendimiento y Optimización

**Técnicas implementadas:**

1. **Lazy Loading:**
   - Componentes de React se cargan bajo demanda
   - Reduce tamaño del bundle inicial

2. **Paginación:**
   - Listados grandes (clases, reservas) se paginan
   - Por defecto: 20 items por página

3. **Caché:**
   - Notificaciones cacheadas en memoria
   - Reducción de llamadas API redundantes

4. **Optimización de imágenes:**
   - Compresión automática de fotos de perfil
   - Formatos modernos (WebP si disponible)

5. **Debouncing:**
   - Buscadores usan debounce de 300ms
   - Evita llamadas excesivas mientras se escribe

**Tiempos de carga objetivo:**
- Página inicial: < 2 segundos
- Navegación interna: < 500ms
- Llamadas API: < 200ms (promedio)

---

## VI. Solución de Problemas

### 6.1 Problemas Comunes y Soluciones

**Problema: No puedo iniciar sesión**

**Posibles causas y soluciones:**
1. **Credenciales incorrectas:**
   - ✓ Verifica mayúsculas/minúsculas (el sistema es case-sensitive)
   - ✓ Asegúrate de no tener Bloq Mayús activado
   - ✓ Verifica que no haya espacios antes/después del usuario

2. **Cuenta suspendida:**
   - ✓ Contacta al administrador del gimnasio
   - ✓ Verifica tu estado de membresía

3. **Problemas técnicos:**
   - ✓ Limpia la caché del navegador (Ctrl+Shift+Del)
   - ✓ Intenta en modo incógnito
   - ✓ Prueba con otro navegador
   - ✓ Verifica tu conexión a internet

4. **Token expirado:**
   - ✓ Cierra todas las pestañas del sistema
   - ✓ Vuelve a iniciar sesión

**Problema: Las notificaciones no aparecen**

**Diagnóstico paso a paso:**
1. **Verificar permisos:**
   - Haz clic en el icono de información (🔒 o ℹ️) en la barra de direcciones
   - Busca "Notificaciones"
   - Debe estar en "Permitir", no "Bloquear" ni "Preguntar"

2. **Activar desde el sistema:**
   - Haz clic en el icono 🔔
   - Si aparece el banner morado "Activar notificaciones push"
   - Haz clic en "Activar" y acepta el permiso

3. **Limitaciones del navegador:**
   - El modo incógnito suele bloquear notificaciones
   - Algunos navegadores en dispositivos iOS tienen limitaciones
   - Asegúrate de usar versión actualizada del navegador

4. **Verificar en backend:**
   - Las notificaciones se están creando (visible en el centro de notificaciones)
   - El problema es solo con las push del navegador
   - Contacta soporte técnico si persiste

**Problema: No puedo reservar una clase**

**Verificaciones:**
1. **Cupos disponibles:**
   - ✓ Confirma que la clase no esté llena
   - ✓ Si está llena, únete a la lista de espera

2. **Conflicto de horario:**
   - ✓ No puedes tener dos reservas en el mismo horario
   - ✓ Cancela la otra reserva primero o elige otro horario

3. **Estado de membresía:**
   - ✓ Tu cuenta debe estar activa
   - ✓ Verifica que tu membresía no haya expirado

4. **Límite de reservas:**
   - ✓ Puede haber un límite de reservas simultáneas
   - ✓ Completa o cancela reservas antiguas

5. **Problemas técnicos:**
   - ✓ Recarga la página (F5)
   - ✓ Verifica tu conexión a internet
   - ✓ Revisa la consola del navegador (F12) por errores

**Problema: Las estadísticas no se actualizan**

**Soluciones:**
1. **Forzar actualización:**
   - Recarga la página completa (Ctrl+F5 o Cmd+Shift+R)
   - Cierra sesión y vuelve a iniciar

2. **Caché del navegador:**
   - Limpia la caché: Configuración → Privacidad → Borrar datos
   - Selecciona "Imágenes y archivos en caché"
   - No borres contraseñas

3. **Sincronización pendiente:**
   - Las estadísticas se actualizan cada cierto tiempo
   - Espera unos minutos y recarga

4. **Persistencia:**
   - Si el problema continúa, reporta al administrador
   - Puede ser un problema de sincronización con el backend

**Problema: Error al descargar PDF**

**Soluciones:**
1. **Bloqueador de pop-ups:**
   - ✓ Permite pop-ups para este sitio
   - En Chrome: Clic en el icono 🚫 en la barra de direcciones → "Permitir siempre pop-ups"

2. **Espacio en disco:**
   - ✓ Verifica que tengas espacio disponible
   - ✓ Cambia la carpeta de descargas si es necesario

3. **Navegador:**
   - ✓ Actualiza a la última versión
   - ✓ Prueba con otro navegador (Chrome, Firefox, Edge)

4. **Permisos:**
   - ✓ El navegador debe tener permisos para descargar archivos
   - Configuración → Descargas → Verificar ruta válida

**Problema: La página se ve mal o desordenada**

**Soluciones:**
1. **Zoom del navegador:**
   - Restablece el zoom al 100% (Ctrl+0 o Cmd+0)

2. **Resolución de pantalla:**
   - Mínimo recomendado: 1024x768
   - Mejor experiencia: 1920x1080 o superior

3. **JavaScript deshabilitado:**
   - El sistema requiere JavaScript activo
   - Verifica en configuración del navegador

4. **Extensiones que interfieren:**
   - Deshabilita ad-blockers o extensiones de privacidad temporalmente
   - Prueba en modo incógnito sin extensiones

---

### 6.2 Mensajes de Error y Significados

**Errores de Autenticación:**

- **"Token expirado"**
  - Significado: Tu sesión ha caducado (60 min de inactividad)
  - Solución: Cierra sesión y vuelve a iniciar

- **"Credenciales inválidas"**
  - Significado: Usuario o contraseña incorrectos
  - Solución: Verifica tus datos o usa "Olvidé mi contraseña"

- **"No tienes permiso para esta acción"**
  - Significado: Tu rol no tiene acceso a esa funcionalidad
  - Solución: Verifica que estés usando la cuenta correcta

**Errores de Reservas:**

- **"La clase ya está llena"**
  - Significado: No quedan cupos disponibles
  - Solución: Únete a la lista de espera

- **"Ya tienes una reserva en este horario"**
  - Significado: Conflicto de horarios con otra reserva
  - Solución: Cancela la otra reserva o elige otro horario

- **"No puedes cancelar con menos de 1 hora de anticipación"** (configurable)
  - Significado: Política de cancelación no cumplida
  - Solución: Solo administradores pueden cancelar con menos tiempo

- **"Esta clase ya ocurrió"**
  - Significado: Intentando reservar una clase pasada
  - Solución: Selecciona una clase futura

**Errores del Sistema:**

- **"Error de red"** o **"Network Error"**
  - Significado: Problemas de conexión
  - Solución: Verifica tu internet, recarga la página

- **"Error 500: Internal Server Error"**
  - Significado: Problema en el servidor
  - Solución: Espera unos minutos, reporta si persiste

- **"Error 404: Not Found"**
  - Significado: Recurso no encontrado (clase o usuario eliminado)
  - Solución: Verifica que el elemento aún exista, recarga

- **"Error 403: Forbidden"**
  - Significado: Acceso denegado por permisos
  - Solución: Contacta al administrador

---

### 6.3 Contacto de Soporte

Para asistencia técnica o consultas:

**Canales de soporte:**
- 📧 **Email:** soporte@energiatotal.com
- 📞 **Teléfono:** +56 2 1234 5678
- 💬 **WhatsApp:** +56 9 1234 5678
- 🌐 **Chat en vivo:** Disponible en el sistema (icono inferior derecho)

**Horario de atención:**
- **Lunes a Viernes:** 08:00 - 20:00
- **Sábados:** 09:00 - 14:00
- **Domingos y festivos:** Cerrado (solo urgencias)

**Antes de contactar:**
1. Anota el mensaje de error exacto
2. Indica qué acción estabas realizando
3. Especifica navegador y sistema operativo
4. Ten a mano tu nombre de usuario

**Tiempo de respuesta:**
- Chat en vivo: Inmediato (horario de atención)
- Email: 24 horas hábiles
- Teléfono: Inmediato

**Para reportar bugs:**
- Usa el email con asunto: "[BUG] Descripción corta"
- Incluye capturas de pantalla si es posible
- Detalla los pasos para reproducir el problema

---

## VII. Glosario

**Administrador:** Usuario con privilegios completos sobre todo el sistema. Puede gestionar usuarios, clases, reservas y configuraciones globales.

**API (Application Programming Interface):** Interfaz de programación que permite la comunicación entre el frontend y backend del sistema.

**Asistencia:** Registro de la presencia física de un socio en una clase. Es responsabilidad del instructor registrarla.

**Backend:** Parte del sistema que se ejecuta en el servidor. Gestiona la lógica de negocio, base de datos y API.

**Biografía:** Descripción profesional del instructor que incluye experiencia, certificaciones y filosofía de entrenamiento.

**CRUD:** Acrónimo de Create (Crear), Read (Leer), Update (Actualizar), Delete (Eliminar). Operaciones básicas sobre datos.

**Cupos:** Cantidad máxima de socios que pueden inscribirse en una clase específica.

**Dashboard:** Panel principal con resumen de información relevante y accesos rápidos. Varía según el rol del usuario.

**Django:** Framework de Python utilizado para desarrollar el backend del sistema.

**Especialidades:** Disciplinas que un instructor está capacitado para impartir (ej: Spinning, Yoga, Pilates).

**Frontend:** Parte del sistema que se ejecuta en el navegador del usuario. Interface visual e interactiva.

**Historial:** Registro completo de reservas pasadas de un socio, incluyendo completadas y canceladas.

**Instructor:** Profesional certificado que imparte clases en el gimnasio. Puede editar sus clases y registrar asistencia.

**JWT (JSON Web Token):** Sistema de autenticación basado en tokens que identifica y autoriza al usuario en cada petición.

**Lista de Espera:** Cola automática de socios que desean inscribirse en una clase llena. Se asignan cupos por orden de llegada cuando hay cancelaciones.

**Modal:** Ventana emergente (diálogo) que solicita confirmación o muestra formularios sin abandonar la página actual.

**No Show:** Estado de una reserva cuando el socio no asiste a la clase sin haberla cancelado previamente.

**Notificación Push:** Alerta que aparece como notificación del sistema operativo, incluso si el navegador está en segundo plano.

**ORM (Object-Relational Mapping):** Sistema que permite interactuar con la base de datos usando objetos en lugar de SQL directo.

**Polling:** Técnica donde el frontend consulta periódicamente al servidor por nuevos datos. En este sistema: cada 10 segundos para notificaciones.

**React:** Librería de JavaScript utilizada para construir el frontend del sistema.

**Reserva:** Inscripción confirmada de un socio a una clase específica. Ocupa un cupo.

**REST API:** Estilo de arquitectura para APIs web. El backend expone endpoints que el frontend consume.

**Rol:** Categoría de usuario que determina permisos y funcionalidades disponibles (Socio, Instructor, Administrador).

**Socio:** Usuario regular del gimnasio. Cliente con membresía que puede reservar clases.

**Token:** Cadena codificada que identifica y autentica al usuario. Incluye información sobre el usuario y permisos.

**Toast:** Notificación visual temporal que aparece brevemente en pantalla para confirmar acciones o mostrar alertas.

**Vite:** Herramienta de construcción moderna para proyectos frontend. Proporciona desarrollo rápido y builds optimizados.

---

## VIII. Anexos

### Anexo A: Atajos de Teclado

Mejoran la productividad al navegar el sistema:

| Atajo de Teclado | Acción Realizada |
|-----------------|------------------|
| `Ctrl + K` o `Cmd + K` | Abrir búsqueda global |
| `Esc` | Cerrar modal o diálogo activo |
| `Alt + N` | Abrir centro de notificaciones |
| `Ctrl + R` o `F5` | Recargar página actual |
| `Ctrl + Shift + R` o `Cmd + Shift + R` | Recargar sin caché (forzada) |
| `Alt + D` | Ir al dashboard |
| `Alt + P` | Ir al perfil |
| `Alt + C` | Ir a clases |
| `Alt + M` | Ir a mis reservas |
| `Tab` | Navegar entre campos de formulario |
| `Enter` | Confirmar acción en modal |

**Nota:** Los atajos específicos de navegación (Alt + Letra) pueden variar según configuración del sistema.

---

### Anexo B: Códigos de Estado HTTP

Útiles para entender respuestas del sistema:

| Código | Nombre | Significado | Acción Recomendada |
|--------|--------|-------------|-------------------|
| **200** | OK | Solicitud exitosa | Ninguna, operación completada |
| **201** | Created | Recurso creado exitosamente | Confirma creación (ej: nueva reserva) |
| **204** | No Content | Éxito sin contenido de respuesta | Operación completada (ej: eliminación) |
| **400** | Bad Request | Solicitud mal formada o inválida | Revisa los datos enviados |
| **401** | Unauthorized | No autenticado o token expirado | Inicia sesión nuevamente |
| **403** | Forbidden | Acceso prohibido por permisos | Verifica tu rol o contacta admin |
| **404** | Not Found | Recurso no encontrado | El elemento fue eliminado o no existe |
| **405** | Method Not Allowed | Método HTTP no permitido | Error del sistema, reporta |
| **409** | Conflict | Conflicto con estado actual | Ej: reserva duplicada en mismo horario |
| **422** | Unprocessable Entity | Validación de datos falló | Revisa campos del formulario |
| **429** | Too Many Requests | Demasiadas peticiones rápidas | Espera unos segundos y reintenta |
| **500** | Internal Server Error | Error del servidor | Reporta a soporte técnico |
| **502** | Bad Gateway | Servidor no disponible | Espera, problema temporal |
| **503** | Service Unavailable | Servicio en mantenimiento | Espera o consulta horarios de mantención |

---

### Anexo C: Tipos de Clases Disponibles

Disciplinas ofrecidas en el gimnasio:

| Tipo | Descripción | Intensidad | Duración Típica |
|------|-------------|-----------|-----------------|
| **Spinning** | Ciclismo indoor con música | Alta | 45-60 min |
| **Yoga** | Práctica de posturas y respiración | Baja-Media | 60-90 min |
| **Pilates** | Fortalecimiento de core y flexibilidad | Media | 50-60 min |
| **Cardio** | Ejercicios aeróbicos de alta intensidad | Alta | 45-60 min |
| **Musculación** | Entrenamiento con pesas y máquinas | Media-Alta | 60-90 min |
| **Funcional** | Movimientos funcionales del día a día | Media-Alta | 45-60 min |
| **CrossFit** | Entrenamiento variado de alta intensidad | Muy Alta | 60 min |
| **Zumba** | Baile fitness con ritmos latinos | Media | 50-60 min |
| **Boxeo** | Entrenamiento de boxeo y fitness | Alta | 60 min |
| **Stretching** | Estiramientos y flexibilidad | Baja | 30-45 min |

---

### Anexo D: Estructura de la Base de Datos

**Modelos principales:**

```
Usuario
├── id (PK)
├── username (unique)
├── email (unique)
├── nombre
├── apellido
├── rol (Socio/Instructor/Administrador)
├── fecha_nacimiento
├── telefono
├── fecha_registro
└── activo (boolean)

Clase
├── id (PK)
├── nombre
├── descripcion
├── tipo
├── fecha
├── hora_inicio
├── hora_fin
├── cupos_totales
├── instructor_id (FK → Usuario)
├── estado (Activa/Cancelada)
└── permite_lista_espera (boolean)

Reserva
├── id (PK)
├── socio_id (FK → Usuario)
├── clase_id (FK → Clase)
├── fecha_reserva
├── estado (Confirmada/Cancelada/Completada/NoShow)
└── asistencia_registrada (boolean)

ListaEspera
├── id (PK)
├── socio_id (FK → Usuario)
├── clase_id (FK → Clase)
├── posicion (integer)
└── fecha_inscripcion

Notificacion
├── id (PK)
├── usuario_id (FK → Usuario)
├── tipo
├── titulo
├── mensaje
├── leida (boolean)
├── fecha_creacion
└── datos_adicionales (JSON)

Equipamiento
├── id (PK)
├── nombre
├── descripcion
├── cantidad
├── estado (Disponible/Mantenimiento/FueraDeServicio)
├── ubicacion
└── ultima_mantencion
```

---

### Anexo E: Variables de Entorno (Para Administradores Técnicos)

Configuración del backend (archivo `.env`):

```bash
# Django
SECRET_KEY=tu_clave_secreta_aqui
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,tudominio.com

# Base de Datos
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/gimnasio_db

# JWT
SIMPLE_JWT_SIGNING_KEY=otra_clave_secreta
SIMPLE_JWT_ACCESS_TOKEN_LIFETIME=60  # minutos
SIMPLE_JWT_REFRESH_TOKEN_LIFETIME=1440  # minutos (24h)

# Email (opcional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=tu_email@gmail.com
EMAIL_HOST_PASSWORD=tu_contraseña_app

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://tudominio.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

### Anexo F: Comandos Útiles (Para Desarrolladores)

**Backend (Django):**
```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar servidor de desarrollo
python manage.py runserver

# Crear datos de prueba
python manage.py crear_datos_prueba

# Colectar archivos estáticos
python manage.py collectstatic
```

**Frontend (React):**
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview

# Linting
npm run lint
```

---

### Anexo G: Políticas y Reglas de Negocio

**Reservas:**
1. Un socio solo puede tener una reserva por horario
2. Máximo 5 reservas activas simultáneas
3. Se puede reservar con hasta 30 días de anticipación
4. Las cancelaciones deben hacerse con al menos 1 hora de anticipación (configurable)
5. Después de 3 "No Show" consecutivos, el socio recibe advertencia

**Lista de Espera:**
1. Asignación automática por orden de inscripción (FIFO)
2. El socio tiene 15 minutos para confirmar la asignación (configurable)
3. Si no confirma, se asigna al siguiente en la lista
4. Máximo 10 personas en lista de espera por clase

**Clases:**
1. Duración mínima: 30 minutos, máxima: 3 horas
2. Cupo mínimo: 1 persona, máximo: 50 personas
3. Un instructor no puede tener dos clases en el mismo horario
4. Las clases se pueden editar hasta 2 horas antes del inicio
5. Cancelar una clase requiere notificar a todos los inscritos

**Asistencia:**
1. Debe registrarse dentro de las 24 horas posteriores a la clase
2. Una vez registrada, no se puede modificar sin autorización administrativa
3. Si no se registra en 48 horas, se marca automáticamente como "No registrada"

**Notificaciones:**
1. Recordatorios de clase: 1 hora antes
2. Confirmación de reserva: inmediata
3. Cancelaciones: inmediata
4. Cambios en clases: inmediata
5. Historial de notificaciones: 30 días

---

## IX. Notas Finales

### Actualizaciones del Manual

Este manual corresponde a la **versión 1.0** del sistema, generado en **diciembre de 2025**.

**Changelog (Historial de Cambios):**
- **v1.0 (09/12/2025):** Versión inicial completa
  - Documentación de todos los roles
  - Manual de uso detallado
  - Sección de solución de problemas
  - Anexos técnicos

**Próximas actualizaciones planeadas:**
- Integración con sistemas de pago
- App móvil nativa
- Clases virtuales/streaming
- Sistema de niveles y gamificación

### Feedback y Mejoras

Sus comentarios son valiosos para mejorar el sistema y este manual.

**Para sugerir mejoras:**
- Email: feedback@energiatotal.com
- Formulario en el sistema: Configuración → "Enviar Feedback"

**Qué nos interesa saber:**
- Funcionalidades que le gustaría ver
- Partes confusas del manual
- Errores o imprecisiones encontradas
- Experiencia general de uso

### Créditos

**Desarrollo del Sistema:**
- **Equipo de Desarrollo:** [Nombres de los integrantes del grupo]
- **Asignatura:** Proyecto de Integración
- **Institución:** INACAP - Área Informática y Telecomunicaciones
- **Año:** 2025

**Tecnologías Utilizadas:**
- React, Django, Python, JavaScript, Tailwind CSS, PostgreSQL

**Agradecimientos:**
- Profesor guía: [Nombre del académico]
- Gimnasio "Energía Total" por la colaboración
- Comunidad open-source por las herramientas utilizadas

---

## X. Licencia y Términos de Uso

**Confidencialidad:**
Este manual contiene información sobre el funcionamiento interno del sistema y es de uso exclusivo de personal autorizado del gimnasio "Energía Total".

**Restricciones:**
- No reproducir sin autorización
- No compartir credenciales de acceso
- Uso exclusivo para fines del gimnasio

**Soporte:**
Para consultas sobre este manual o el sistema, contacte al equipo de soporte técnico.

---

**Fin del Manual de Usuario**

*Este documento fue generado como parte del Proyecto de Integración de la carrera de Ingeniería en Informática de INACAP.*

*Versión 1.0 - Diciembre 2025*

*© 2025 Gimnasio Energía Total - Todos los derechos reservados*


