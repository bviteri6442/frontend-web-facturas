// Servicio de Ventas
import { httpClient } from './http-client.js'
import { API_ENDPOINTS } from '../config/api.js'
import { unwrapList } from '../utils/apiResponse.js'

const ENDPOINT_VENTAS = API_ENDPOINTS.VENTAS

export const ventaService = {
  async getAll(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString()
      const endpoint = `${ENDPOINT_VENTAS}${params ? '?' + params : ''}`
      const response = await httpClient.get(endpoint)
      return unwrapList(response)
    } catch (error) {
      console.error('[ventaService] Error en getAll:', error)
      throw error
    }
  },

  async getById(id) {
    try {
      // Intentar primero con ID numérico
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
      // Manejar respuestas incluidas valores falsy válidos como 0
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
      return response?.data || response || []
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
      console.log('[ventaService] Descargando PDF por ID:', ventaId)
      
      const blob = await httpClient.getBlob(API_ENDPOINTS.VENTAS_PDF(ventaId))
      if (!blob || blob.size === 0) {
        throw new Error('PDF vacío')
      }

      // Descargar
      const urlBlob = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = urlBlob
      link.download = `${nombreArchivo}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(urlBlob)
      
      console.log('[ventaService] PDF descargado exitosamente')
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

      // Crear blob y descargar
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
