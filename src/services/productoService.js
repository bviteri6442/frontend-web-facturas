// Servicio de Productos
import { httpClient } from './http-client.js'
import { unwrapPaged } from '../utils/apiResponse.js'

const ENDPOINT_PRODUCTOS = '/productos'

const normalizeProducto = (p) => ({
  id: p.id || p.Id,
  nombre: p.nombre || p.Nombre,
  codigoBarra: p.codigo || p.codigoBarra || p.CodigoBarra || p.Codigo,
  descripcion: p.descripcion || p.Descripcion || '',
  precioCosto: p.precioCompra || p.PrecioCompra || 0,
  precio: p.precio || p.precioVenta || p.Precio || 0,
  precioVenta: p.precio || p.precioVenta || p.Precio || 0,
  stockActual: p.stock || p.Stock || 0,
  stockMinimo: p.stockMinimo || p.StockMinimo || 0,
  porcentajeIVA: p.porcentajeIVA || p.PorcentajeIVA || 0,
  activo: p.activo !== false && p.Activo !== false,
  imagenUrl: p.imagenUrl || p.ImagenUrl || null,
  fechaCreacion: p.fechaCreacion || p.FechaCreacion,
  fechaActualizacion: p.fechaActualizacion || p.FechaActualizacion
})

export const productoService = {
  async getPage({ page = 1, limit = 30, search = '' } = {}) {
    try {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search?.trim()) query.append('search', search.trim())
      const response = await httpClient.get(`${ENDPOINT_PRODUCTOS}?${query}`)
      const paged = unwrapPaged(response, 'productos')
      return {
        total: paged.total,
        page: paged.page,
        limit: paged.limit,
        productos: paged.data.map(normalizeProducto)
      }
    } catch (error) {
      console.error('[productoService] Error en getPage:', error)
      throw error
    }
  },

  async getAll(params = {}) {
    return this.getPage({
      page: params.page ?? 1,
      limit: params.limit ?? 30,
      search: params.search
    })
  },

  async getById(id) {
    try {
      const response = await httpClient.get(`${ENDPOINT_PRODUCTOS}/${id}`)
      const raw = response?.data || response
      return raw ? normalizeProducto(raw) : null
    } catch (error) {
      console.error('[productoService] Error en getById:', error)
      return null
    }
  },

  async create(productoData) {
    const payload = {
      nombre: productoData.nombre,
      codigo: productoData.codigoBarra,
      descripcion: productoData.descripcion || '',
      precio: productoData.precioVenta,
      precioCompra: productoData.precioCosto || 0,
      stock: productoData.stockActual || 0,
      stockMinimo: productoData.stockMinimo || 10,
      porcentajeIVA: productoData.porcentajeIVA || 0
    }
    const response = await httpClient.post(ENDPOINT_PRODUCTOS, payload)
    const data = response?.data || response || null
    if (!data) return null
    const msg = data.message || data.Message || ''
    const match = msg.match(/\d+/)
    if (match) return parseInt(match[0])
    return data.id || data.Id || null
  },

  async update(id, productoData) {
    const payload = {
      id: id,
      nombre: productoData.nombre,
      descripcion: productoData.descripcion,
      precioVenta: productoData.precioVenta,
      precioCompra: productoData.precioCosto,
      stock: productoData.stockActual,
      stockMinimo: productoData.stockMinimo,
      porcentajeIVA: productoData.porcentajeIVA || 0
    }
    const response = await httpClient.put(`${ENDPOINT_PRODUCTOS}/${id}`, payload)
    return response?.data || response || null
  },

  async delete(id) {
    const response = await httpClient.delete(`${ENDPOINT_PRODUCTOS}/${id}`)
    return response?.data || response || true
  },

  async actualizarImagen(id, imagenUrl) {
    try {
      const response = await httpClient.patch(`${ENDPOINT_PRODUCTOS}/${id}/imagen`, { imagenUrl })
      return response?.data || response || null
    } catch (error) {
      console.error('[productoService] Error en actualizarImagen:', error)
      throw error
    }
  },

  async getDisponibles() {
    try {
      const response = await httpClient.get(`${ENDPOINT_PRODUCTOS}/disponibles`)
      const productos = response?.data || response || []
      return Array.isArray(productos) ? productos.map(normalizeProducto) : []
    } catch (error) {
      console.error('[productoService] Error en getDisponibles:', error)
      return []
    }
  },

  async search(term, limit = 20) {
    try {
      const result = await this.getPage({ search: term, limit, page: 1 })
      return result.productos || []
    } catch (error) {
      console.error('[productoService] Error en search:', error)
      return []
    }
  },

  /** Cuenta productos con stock bajo (varias páginas, máx. 20 páginas × 200). */
  async countStockBajo() {
    let count = 0
    let page = 1
    const limit = 200
    const maxPages = 20

    while (page <= maxPages) {
      const { productos, total } = await this.getPage({ page, limit })
      count += productos.filter(
        (p) => (p.stockActual || 0) <= (p.stockMinimo || 10)
      ).length
      if (page * limit >= total || productos.length === 0) break
      page++
    }
    return count
  }
}
