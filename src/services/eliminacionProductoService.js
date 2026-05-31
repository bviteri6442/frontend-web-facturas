import api from '@/utils/axios'
import { API_ENDPOINTS } from '@/config/api'

export const eliminacionProductoService = {
  async getAll() {
    const response = await api.get('/eliminacionesproductos')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/eliminacionesproductos/${id}`)
    return response.data
  },

  async buscar(termino) {
    const response = await api.get(`/eliminacionesproductos/buscar/${termino}`)
    return response.data
  },

  async getEstadisticas() {
    const response = await api.get('/eliminacionesproductos/estadisticas')
    return response.data
  },

  async generarPDF(termino = null) {
    const params = termino ? `?termino=${termino}` : ''
    const response = await api.get(`/eliminacionesproductos/pdf${params}`)
    return response.data
  }
}
