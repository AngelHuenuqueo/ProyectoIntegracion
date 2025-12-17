/**
 * Utilidades de formateo de fechas y datos
 * Este archivo centraliza funciones de formateo para evitar duplicación
 */

/**
 * Formatea una fecha a formato largo en español
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha formateada (ej: "lunes, 9 de diciembre")
 */
export function formatFecha(fecha) {
    const options = { weekday: 'long', day: 'numeric', month: 'long' }
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', options)
}

/**
 * Formatea una fecha a formato corto
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha formateada (ej: "lun, 9 dic")
 */
export function formatFechaCorta(fecha) {
    const options = { weekday: 'short', day: 'numeric', month: 'short' }
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', options)
}

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD
 * @returns {string} Fecha de hoy
 */
export function getHoy() {
    return new Date().toISOString().split('T')[0]
}

/**
 * Verifica si una fecha es hoy
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {boolean}
 */
export function esHoy(fecha) {
    return fecha === getHoy()
}

/**
 * Verifica si una fecha ya pasó
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {boolean}
 */
export function esPasada(fecha) {
    return new Date(fecha) < new Date(getHoy())
}

/**
 * Obtiene el usuario actual desde localStorage
 * @returns {Object} Usuario o objeto vacío
 */
export function getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : {}
}
