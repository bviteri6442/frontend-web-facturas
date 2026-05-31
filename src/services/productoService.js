// Servicio de Productos
import { httpClient } from './http-client.js'

const ENDPOINT_PRODUCTOS = '/productos'

// Función auxiliar para normalizar datos del backend
const normalizeProducto = (p) => ({
  id: p.id || p.Id,
  nombre: p.nombre || p.Nombre,
  codigoBarra: p.codigo || p.codigoBarra || p.CodigoBarra || p.Codigo,
  descripcion: p.descripcion || p.Descripcion || '',
  precioCosto: p.precioCompra || p.PrecioCompra || 0,
  precio: p.precio || p.precioVenta || p.Precio || 0,  // ← AGREGUÉ TAMBIÉN COMO "precio"
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
  // Soporta paginación: { page, limit, search }
  async getAll(params = {}) {
    try {
      const query = new URLSearchParams()
      if (params.page) query.append('page', params.page)
      if (params.limit) query.append('limit', params.limit)
      if (params.search) query.append('search', params.search)
      const url = query.toString() ? `${ENDPOINT_PRODUCTOS}?${query}` : ENDPOINT_PRODUCTOS
      const response = await httpClient.get(url)
      const body = response?.data || response
      // El backend devuelve { total, page, limit, productos: [...] }
      if (body && Array.isArray(body.productos)) {
        return {
          total: body.total,
          page: body.page,
          limit: body.limit,
          productos: body.productos.map(normalizeProducto)
        }
      }
      // Fallback: respuesta plana (compatibilidad)
      const productos = Array.isArray(body) ? body : []
      return { total: productos.length, page: 1, limit: productos.length, productos: productos.map(normalizeProducto) }
    } catch (error) {
      console.error('[productoService] Error en getAll:', error)
      return { total: 0, page: 1, limit: 30, productos: [] }
    }
  },

  async getById(id) {
    try {
      const response = await httpClient.get(`${ENDPOINT_PRODUCTOS}/${id}`)
      return response?.data ? normalizeProducto(response.data) : response?.data || null
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
    // Backend returns { message: "Producto creado con ID: 123" } — extract the ID
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
      // El backend filtra por nombre desde el endpoint principal con el param ?search=
      const result = await productoService.getAll({ search: term, limit })
      return result.productos || []
    } catch (error) {
      console.error('[productoService] Error en search:', error)
      return []
    }
  }
}
