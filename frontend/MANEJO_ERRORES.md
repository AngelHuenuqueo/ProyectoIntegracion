# 🛡️ Sistema de Manejo de Errores - Frontend

## ✅ Implementación Completada

### **PASO 1: ErrorBoundary** ✓
Captura errores de React en componentes hijos.

**Ubicación:** `src/components/ErrorBoundary.jsx`

**Uso:** Ya está implementado globalmente en `App.jsx` envolviendo toda la aplicación.

---

### **PASO 2: Interceptor de Axios** ✓
Maneja automáticamente todos los errores HTTP de la API.

**Ubicación:** `src/services/api.js`

**Características:**
- ✅ Muestra Toast automático para todos los errores HTTP
- ✅ Redirige al login automáticamente cuando expira el token (401)
- ✅ Mensajes específicos por código de error:
  - **400**: "Datos inválidos. Verifica tu información."
  - **401**: "Tu sesión ha expirado. Inicia sesión nuevamente." (+ redirect)
  - **403**: "No tienes permisos para realizar esta acción."
  - **404**: "El recurso solicitado no fue encontrado."
  - **409**: "Ya existe un registro similar."
  - **500-503**: "Error del servidor. Por favor, intenta de nuevo más tarde."
  - **Network Error**: "Sin conexión a internet. Verifica tu conexión."

---

## 📖 Cómo Usar

### **Opción 1: Manejo automático (por defecto)**
El interceptor manejará automáticamente todos los errores:

```javascript
import api from '../services/api'

// Simplemente haz la llamada, los errores se manejan automáticamente
const fetchData = async () => {
  try {
    const response = await api.get('/clases/')
    setClases(response.data)
  } catch (error) {
    // El Toast ya se mostró automáticamente
    // Solo necesitas manejar lógica específica si quieres
  }
}
```

### **Opción 2: Deshabilitar manejo automático (para casos específicos)**
Si quieres manejar el error tú mismo sin que salga el Toast automático:

```javascript
import api from '../services/api'

const handleSpecialCase = async () => {
  try {
    const response = await api.post('/reservas/', data, {
      skipGlobalErrorHandler: true  // ← Esto desactiva el Toast automático
    })
    setReserva(response.data)
    showToast('Reserva exitosa', 'success')
  } catch (error) {
    // Aquí manejas el error a tu manera
    if (error.response?.status === 409) {
      showConfirmModal({
        title: '¿Unirse a lista de espera?',
        message: 'La clase está llena. ¿Quieres unirte a la lista de espera?',
        onConfirm: () => joinWaitingList()
      })
    }
  }
}
```

---

## 🎨 Componentes Disponibles

### **Toast** (Notificaciones)
```javascript
showToast('Mensaje', 'tipo')  // tipos: success, error, warning, info
```

### **ConfirmModal** (Confirmaciones)
```javascript
setConfirmModal({
  show: true,
  title: 'Título',
  message: 'Mensaje',
  type: 'warning',  // warning, danger, info
  onConfirm: () => { /* acción */ },
  onCancel: () => setConfirmModal({ show: false })
})
```

### **ErrorBoundary** (Errores de React)
Se activa automáticamente cuando hay un error en el render de React.
Muestra pantalla amigable con opciones de recargar o volver al inicio.

---

## 🔧 Próximos Pasos

- **PASO 3**: Validación de formularios con react-hook-form
- **PASO 4**: Excepciones personalizadas en el backend Django
- **PASO 5**: Sistema de logging estructurado

---

## 📝 Notas Técnicas

**Estados HTTP manejados:**
- 400: Bad Request (datos inválidos)
- 401: Unauthorized (sesión expirada) → AUTO-REDIRECT a /login
- 403: Forbidden (sin permisos)
- 404: Not Found (recurso no existe)
- 409: Conflict (registro duplicado)
- 500-503: Server Error (problema del servidor)
- Network Error: Sin conexión

**Limpieza automática en 401:**
```javascript
localStorage.removeItem('access_token')
localStorage.removeItem('refresh_token')
localStorage.removeItem('user_role')
// Luego redirige a /login después de 1.5s
```

**Toast Global:**
El interceptor usa una función Toast global configurada en `App.jsx`:
```javascript
setShowToast(displayToast)  // Conecta el interceptor con el Toast
```
