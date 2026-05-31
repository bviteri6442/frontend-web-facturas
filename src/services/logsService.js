// Servicio de Logs y Auditoría
import { httpClient } from './http-client.js'

const ENDPOINT_INTENTOS = '/logs/intentos-login'
const ENDPOINT_ERRORES  = '/logs/errores'

export const logService = {
  // ── Intentos de Login ─────────────────────────────────────────────────────

  async getAll(filtros = {}) {
    try {
      const params = new URLSearchParams()
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio)
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin)
      if (filtros.exitoso !== undefined) params.append('exitoso', filtros.exitoso)
      if (filtros.usuario) params.append('usuario', filtros.usuario)

      const query = params.toString()
      const endpoint = `${ENDPOINT_INTENTOS}${query ? '?' + query : ''}`
      const response = await httpClient.get(endpoint)
      return response?.data || response || []
    } catch (error) {
      console.error('[logService] Error en getAll:', error)
      return []
    }
  },

  async getEstadisticasIntentosLogin() {
    try {
      const response = await httpClient.get(`${ENDPOINT_INTENTOS}/estadisticas`)
      return response?.data || response || null
    } catch (error) {
      console.error('[logService] Error en getEstadisticasIntentosLogin:', error)
      return null
    }
  },

  async getPDFIntentosLogin(filtros = {}) {
    try {
      const params = new URLSearchParams()
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio)
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin)
      const query = params.toString()
      const response = await httpClient.get(`${ENDPOINT_INTENTOS}/pdf${query ? '?' + query : ''}`)
      return response?.data || response || null
    } catch (error) {
      console.error('[logService] Error en getPDFIntentosLogin:', error)
      return null
    }
  },

  async search(term, filtros = {}) {
    try {
      const params = new URLSearchParams({ usuario: term, ...filtros })
      const response = await httpClient.get(`${ENDPOINT_INTENTOS}?${params}`)
      return response?.data || response || []
    } catch (error) {
      console.error('[logService] Error en search:', error)
      return []
    }
  },

  async getByType(tipo) {
    try {
      const exitoso = tipo === 'EXITOSO' ? true : tipo === 'FALLIDO' ? false : undefined
      const response = await logService.getAll(exitoso !== undefined ? { exitoso } : {})
      return response
    } catch (error) {
      console.error('[logService] Error en getByType:', error)
      return []
    }
  },

  // ── Logs de Errores ───────────────────────────────────────────────────────

  async getErrores(filtros = {}) {
    try {
      const params = new URLSearchParams()
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio)
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin)
      if (filtros.nivel) params.append('nivel', filtros.nivel)
      if (filtros.revisado !== undefined) params.append('revisado', filtros.revisado)

      const query = params.toString()
      const endpoint = `${ENDPOINT_ERRORES}${query ? '?' + query : ''}`
      const response = await httpClient.get(endpoint)
      return response?.data || response || []
    } catch (error) {
      console.error('[logService] Error en getErrores:', error)
      return []
    }
  },

  async getErrorById(id) {
    try {
      const response = await httpClient.get(`${ENDPOINT_ERRORES}/${id}`)
      return response?.data || response || null
    } catch (error) {
      console.error('[logService] Error en getErrorById:', error)
      return null
    }
  },

  async getEstadisticasErrores() {
    try {
      const response = await httpClient.get(`${ENDPOINT_ERRORES}/estadisticas`)
      return response?.data || response || null
    } catch (error) {
      console.error('[logService] Error en getEstadisticasErrores:', error)
      return null
    }
  },

  async getPDFErrores(filtros = {}) {
    try {
      const params = new URLSearchParams()
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio)
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin)
      const query = params.toString()
      const response = await httpClient.get(`${ENDPOINT_ERRORES}/pdf${query ? '?' + query : ''}`)
      return response?.data || response || null
    } catch (error) {
      console.error('[logService] Error en getPDFErrores:', error)
      return null
    }
  },

  async marcarErrorResuelto(id, notas = null) {
    try {
      const response = await httpClient.put(`${ENDPOINT_ERRORES}/${id}/revisar`, notas)
      return response?.data || response || null
    } catch (error) {
      console.error('[logService] Error en marcarErrorResuelto:', error)
      return null
    }
  },

  async deleteLog(id) {
    try {
      const response = await httpClient.delete(`${ENDPOINT_INTENTOS}/${id}`)
      return response?.data || response || null
    } catch (error) {
      console.error('[logService] Error en deleteLog:', error)
      return null
    }
  }
}
