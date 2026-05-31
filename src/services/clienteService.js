// Servicio de Clientes
import { httpClient } from './http-client.js'

const ENDPOINT_CLIENTES = '/clientes'

export const clienteService = {
  async getAll() {
    try {
      const response = await httpClient.get(ENDPOINT_CLIENTES)
      return response?.data || response || []
    } catch (error) {
      console.error('[clienteService] Error en getAll:', error)
      return []
    }
  },

  async getById(id) {
    try {
      const response = await httpClient.get(`${ENDPOINT_CLIENTES}/${id}`)
      return response?.data || response || null
    } catch (error) {
      console.error('[clienteService] Error en getById:', error)
      return null
    }
  },

  async create(clienteData) {
    try {
      const response = await httpClient.post(ENDPOINT_CLIENTES, clienteData)
      return response?.data || response || null
    } catch (error) {
      console.error('[clienteService] Error en create:', error)
      throw error
    }
  },

  async update(id, clienteData) {
    try {
      const response = await httpClient.put(`${ENDPOINT_CLIENTES}/${id}`, clienteData)
      return response?.data || response || null
    } catch (error) {
      console.error('[clienteService] Error en update:', error)
      throw error
    }
  },

  async delete(id) {
    const response = await httpClient.delete(`${ENDPOINT_CLIENTES}/${id}`)
    return response?.data || response || true
  },

  async search(term, limit = 20) {
    try {
      const response = await httpClient.get(`${ENDPOINT_CLIENTES}/search?term=${encodeURIComponent(term)}&limit=${limit}`)
      return response?.data || response || []
    } catch (error) {
      console.error('[clienteService] Error en search:', error)
      return []
    }
  },

  async getByUser(userId) {
    try {
      const response = await httpClient.get(`${ENDPOINT_CLIENTES}/by-user/${userId}`)
      return response?.data || response || null
    } catch (error) {
      console.error('[clienteService] Error en getByUser:', error)
      return null
    }
  },

  async agregarSaldo(id, monto) {
    try {
      const response = await httpClient.post(`${ENDPOINT_CLIENTES}/${id}/agregar-saldo`, { monto })
      return response?.data || response || null
    } catch (error) {
      console.error('[clienteService] Error en agregarSaldo:', error)
      throw error
    }
  },

  async updateMiPerfil(id, data) {
    try {
      const response = await httpClient.put(`${ENDPOINT_CLIENTES}/${id}/mi-perfil`, data)
      return response?.data || response || null
    } catch (error) {
      console.error('[clienteService] Error en updateMiPerfil:', error)
      throw error
    }
  }
}
