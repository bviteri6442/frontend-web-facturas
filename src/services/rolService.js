import { API_ENDPOINTS } from '../config/api.js'
import { httpClient } from './http-client.js'

export const rolService = {
  async getAll() {
    try {
      const response = await httpClient.get(API_ENDPOINTS.ROLES)
      return response?.data || response || []
    } catch (error) {
      console.error('[ROL SERVICE] Error fetching roles:', error)
      throw error
    }
  },

  async getById(id) {
    try {
      const response = await httpClient.get(`${API_ENDPOINTS.ROLES}/${id}`)
      return response?.data || response
    } catch (error) {
      console.error('[ROL SERVICE] Error fetching role by id:', error)
      throw error
    }
  }
}
