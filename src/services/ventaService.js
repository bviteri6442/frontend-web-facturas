// Servicio de Ventas
import { httpClient } from './http-client.js'
import { API_ENDPOINTS } from '../config/api.js'
import { unwrapPaged, fetchAllPaged } from '../utils/apiResponse.js'

const ENDPOINT_VENTAS = API_ENDPOINTS.VENTAS

export const ventaService = {
  async getPage(filters = {}) {
    try {
      const query = new URLSearchParams()
      if (filters.page) query.append('page', String(filters.page))
      if (filters.limit) query.append('limit', String(filters.limit))
      if (filters.fechaInicio) query.append('fechaInicio', filters.fechaInicio)
      if (filters.fechaFin) query.append('fechaFin', filters.fechaFin)
      if (filters.usuarioId) query.append('usuarioId', String(filters.usuarioId))
      if (filters.clienteId) query.append('clienteId', String(filters.clienteId))
      if (filters.estado) query.append('estado', filters.estado)
      if (filters.search) query.append('search', filters.search)
      const qs = query.toString()
      const endpoint = `${ENDPOINT_VENTAS}${qs ? '?' + qs : ''}`
      const response = await httpClient.get(endpoint)
      return unwrapPaged(response, 'ventas')
    } catch (error) {
      console.error('[ventaService] Error en getPage:', error)
      throw error
    }
  },

  async getAll(filters = {}) {
    try {
      if (filters.fetchAll) {
        const { data } = await fetchAllPaged(
          (p) => this.getPage({ ...filters, ...p, limit: filters.limit ?? 200 }),
          { limit: filters.limit ?? 200, maxPages: filters.maxPages ?? 100 }
        )
        return data
      }
      const { data } = await this.getPage({ ...filters, page: filters.page ?? 1, limit: filters.limit ?? 200 })
      return data
    } catch (error) {
      console.error('[ventaService] Error en getAll:', error)
      throw error
    }
  },

  async sumVentasEnRango(fechaInicio, fechaFin) {
    let sum = 0
    let page = 1
    const limit = 200
    const maxPages = 50

    while (page <= maxPages) {
      const { data, total } = await this.getPage({
        page,
        limit,
        fechaInicio,
        fechaFin,
        estado: undefined
      })
      sum += data.reduce((acc, v) => acc + (v.totalVenta || v.montoTotal || v.monto || 0), 0)
      if (page * limit >= total || data.length === 0) break
      page++
    }
    return sum
  },

  async getById(id) {
    try {
      const response = await httpClient.get(`${ENDPOINT_VENTAS}/${id}`)
      return response?.data || response || null
    } catch (error) {
      console.error('[ventaService] Error en getById(id):', error)
      return null
    }
  },

  async getByNumeroFactura(numeroFactura) {
    try {
      const response = await httpClient.get(`${ENDPOINT_VENTAS}/numero/${numeroFactura}`)
      return response?.data || response || null
    } catch (error) {
      console.error('[ventaService] Error en getByNumeroFactura:', error)
      return null
    }
  },

  async getVentasMesActual() {
    try {
      const response = await httpClient.get(`${ENDPOINT_VENTAS}/mes-actual`)
      return response?.data || response || []
    } catch (error) {
      console.error('[ventaService] Error en getVentasMesActual:', error)
      return []
    }
  },

  async create(ventaData) {
    try {
      const response = await httpClient.post(ENDPOINT_VENTAS, ventaData)
      return response?.data !== undefined ? response.data : response
    } catch (error) {
      console.error('[ventaService] Error en create:', error)
      throw error
    }
  },

  async update(id, ventaData) {
    try {
      const response = await httpClient.put(`${ENDPOINT_VENTAS}/${id}`, ventaData)
      return response?.data || response || null
    } catch (error) {
      console.error('[ventaService] Error en update:', error)
      return null
    }
  },

  async updateCantidad(id, detalles) {
    try {
      const response = await httpClient.put(`${ENDPOINT_VENTAS}/${id}/cantidad`, { detalles })
      return response?.data || response || null
    } catch (error) {
      console.error('[ventaService] Error en updateCantidad:', error)
      throw error
    }
  },

  async deleteSoft(id) {
    try {
      const response = await httpClient.put(`${ENDPOINT_VENTAS}/${id}/eliminar`)
      return response?.data || response || null
    } catch (error) {
      console.error('[ventaService] Error en deleteSoft:', error)
      throw error
    }
  },

  async getEliminadas(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString()
      const endpoint = `${ENDPOINT_VENTAS}/eliminadas/lista${params ? '?' + params : ''}`
      const response = await httpClient.get(endpoint)
      const paged = unwrapPaged(response, 'ventas eliminadas')
      return paged.data
    } catch (error) {
      console.error('[ventaService] Error en getEliminadas:', error)
      return []
    }
  },

  async reinsertar(id) {
    try {
      const response = await httpClient.put(`${ENDPOINT_VENTAS}/${id}/reinsertar`)
      return response?.data || response || null
    } catch (error) {
      console.error('[ventaService] Error en reinsertar:', error)
      throw error
    }
  },

  async delete(id) {
    try {
      const response = await httpClient.delete(`${ENDPOINT_VENTAS}/${id}`)
      return response?.data || response || null
    } catch (error) {
      console.error('[ventaService] Error en delete:', error)
      return null
    }
  },

  async generatePDF(numeroFactura) {
    try {
      const response = await httpClient.get(`${ENDPOINT_VENTAS}/numero/${numeroFactura}/pdf`)
      return response || null
    } catch (error) {
      console.error('[ventaService] Error en generatePDF:', error)
      return null
    }
  },

  async downloadPDFById(ventaId, nombreArchivo = 'Factura') {
    try {
      const blob = await httpClient.getBlob(API_ENDPOINTS.VENTAS_PDF(ventaId))
      if (!blob || blob.size === 0) {
        throw new Error('PDF vacío')
      }
      const urlBlob = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = urlBlob
      link.download = `${nombreArchivo}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(urlBlob)
      return true
    } catch (error) {
      console.error('[ventaService] Error en downloadPDFById:', error)
      return false
    }
  },

  async downloadPDF(numeroFactura, nombreArchivo) {
    try {
      const pdf = await this.generatePDF(numeroFactura)
      if (!pdf) {
        throw new Error('No se pudo generar el PDF')
      }
      const blob = new Blob([pdf], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Factura_${nombreArchivo}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      return true
    } catch (error) {
      console.error('[ventaService] Error en downloadPDF:', error)
      return false
    }
  }
}
