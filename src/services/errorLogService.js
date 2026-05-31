import apiClient from '@/utils/axios'
import { API_ENDPOINTS } from '@/config/api'

export const errorLogService = {
  async getAll(filters = {}) {
    const params = {}
    if (filters.fechaInicio) params.fechaInicio = filters.fechaInicio
    if (filters.fechaFin) params.fechaFin = filters.fechaFin
    if (filters.nivelSeveridad) params.nivelSeveridad = filters.nivelSeveridad
    if (filters.revisado !== undefined) params.revisado = filters.revisado
    const response = await apiClient.get(API_ENDPOINTS.ERROR_LOGS, { params })
    return response.data
  },

  async getById(id) {
    const response = await apiClient.get(API_ENDPOINTS.ERROR_LOGS_BY_ID(id))
    return response.data
  },

  async create(errorData) {
    const response = await apiClient.post(API_ENDPOINTS.ERROR_LOGS, errorData)
    return response.data
  },

  async marcarRevisado(id) {
    const response = await apiClient.put(API_ENDPOINTS.ERROR_LOGS_REVISAR(id))
    return response.data
  },

  async getResumenPorTipo() {
    const response = await apiClient.get(API_ENDPOINTS.ERROR_LOGS_RESUMEN_TIPO)
    return response.data
  },

  async getResumenPorSeveridad() {
    const response = await apiClient.get(API_ENDPOINTS.ERROR_LOGS_RESUMEN_SEVERIDAD)
    return response.data
  }
}
