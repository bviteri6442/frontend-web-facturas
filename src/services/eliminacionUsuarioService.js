import apiClient from '@/utils/axios'

const BASE_URL = '/eliminacionesusuarios'

export const eliminacionUsuarioService = {
  async getAll() {
    const response = await apiClient.get(BASE_URL)
    return response.data
  },

  async getById(id) {
    const response = await apiClient.get(`${BASE_URL}/${id}`)
    return response.data
  },

  async buscar(termino) {
    const response = await apiClient.get(`${BASE_URL}/buscar/${termino}`)
    return response.data
  },

  async getPorFecha(desde, hasta) {
    const response = await apiClient.get(`${BASE_URL}/por-fecha`, {
      params: { desde, hasta }
    })
    return response.data
  },

  async getEstadisticas() {
    const response = await apiClient.get(`${BASE_URL}/estadisticas`)
    return response.data
  },

  async generarPDF(termino = null) {
    const params = termino ? { termino } : {}
    const response = await apiClient.get(`${BASE_URL}/pdf`, { params })
    return response.data
  }
}
