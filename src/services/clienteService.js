// Servicio de Clientes
import { httpClient } from './http-client.js'
import { unwrapPaged, fetchAllPaged } from '../utils/apiResponse.js'

const ENDPOINT_CLIENTES = '/clientes'

export const clienteService = {
  async getPage({ page = 1, limit = 30, search = '', activo = undefined } = {}) {
    try {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search?.trim()) query.append('search', search.trim())
      if (activo !== undefined && activo !== null) query.append('activo', String(activo))
      const response = await httpClient.get(`${ENDPOINT_CLIENTES}?${query}`)
      return unwrapPaged(response, 'clientes')
    } catch (error) {
      console.error('[clienteService] Error en getPage:', error)
      throw error
    }
  },

  /** Primera página (compatibilidad). Para listas grandes usar getPage. */
  async getAll(params = {}) {
    if (params.fetchAll) {
      const { data } = await fetchAllPaged(
        (p) => this.getPage({ ...p, search: params.search, activo: params.activo }),
        { limit: params.limit ?? 200, maxPages: params.maxPages ?? 500 }
      )
      return data
    }
    const { data } = await this.getPage({
      page: params.page ?? 1,
      limit: params.limit ?? 200,
      search: params.search,
      activo: params.activo
    })
    return data
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
      const { data } = await this.getPage({ search: term, limit, page: 1 })
      return data
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
