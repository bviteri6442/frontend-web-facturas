import { httpClient } from './http-client.js'

const BASE_URL = '/auditorias'

export const auditoriaService = {
  /**
   * Obtiene todas las acciones de auditoría con filtros opcionales
   */
  async getAcciones(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.usuarioId) params.append('usuarioId', filters.usuarioId)
      if (filters.modulo) params.append('modulo', filters.modulo)
      if (filters.tipoAccion) params.append('tipoAccion', filters.tipoAccion)
      if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio)
      if (filters.fechaFin) params.append('fechaFin', filters.fechaFin)
      if (filters.skip) params.append('skip', filters.skip)
      if (filters.take) params.append('take', filters.take || 50)

      const url = params.toString() ? `${BASE_URL}/acciones?${params}` : `${BASE_URL}/acciones`
      const response = await httpClient.get(url)
      return response
    } catch (error) {
      console.error('[AUDITORIA-SERVICE] Error getting acciones:', error)
      throw error
    }
  },

  /**
   * Obtiene acciones de un usuario específico
   */
  async getAccionesPorUsuario(usuarioId) {
    try {
      const response = await httpClient.get(`${BASE_URL}/usuario/${usuarioId}`)
      return response
    } catch (error) {
      console.error('[AUDITORIA-SERVICE] Error getting acciones por usuario:', error)
      throw error
    }
  },

  /**
   * Obtiene acciones de un módulo específico
   */
  async getAccionesPorModulo(modulo) {
    try {
      const response = await httpClient.get(`${BASE_URL}/modulo/${modulo}`)
      return response
    } catch (error) {
      console.error('[AUDITORIA-SERVICE] Error getting acciones por módulo:', error)
      throw error
    }
  },

  /**
   * Registra una nueva acción de auditoría
   */
  async registrarAccion(data) {
    try {
      const response = await httpClient.post(`${BASE_URL}/registrar`, data)
      return response
    } catch (error) {
      console.error('[AUDITORIA-SERVICE] Error registrando acción:', error)
      throw error
    }
  }
}
