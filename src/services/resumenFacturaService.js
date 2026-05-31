import { httpClient } from './http-client.js'

const BASE_URL = '/resumenfacturas'

export const resumenFacturaService = {
  async getAll() {
    try {
      const response = await httpClient.get(BASE_URL)
      const body = response?.data || response
      return body?.data || body || []
    } catch (error) {
      console.error('[resumenFacturaService] Error en getAll:', error)
      return []
    }
  },

  async getByVentaId(ventaId) {
    try {
      const response = await httpClient.get(`${BASE_URL}/venta/${ventaId}`)
      const body = response?.data || response
      return body?.data || body || null
    } catch (error) {
      console.error('[resumenFacturaService] Error en getByVentaId:', error)
      return null
    }
  },

  async getByRango(fechaInicio, fechaFin) {
    try {
      const params = new URLSearchParams({ fechaInicio, fechaFin })
      const response = await httpClient.get(`${BASE_URL}/rango?${params}`)
      const body = response?.data || response
      return body?.data || body || []
    } catch (error) {
      console.error('[resumenFacturaService] Error en getByRango:', error)
      return []
    }
  },

  async getEstadisticas() {
    try {
      const response = await httpClient.get(`${BASE_URL}/estadisticas`)
      const body = response?.data || response
      return body?.data || body || null
    } catch (error) {
      console.error('[resumenFacturaService] Error en getEstadisticas:', error)
      return null
    }
  }
}
