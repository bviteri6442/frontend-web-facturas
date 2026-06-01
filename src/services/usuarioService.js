// Servicio de Usuarios
import { httpClient } from './http-client.js'
import { unwrapPaged } from '../utils/apiResponse.js'

const ENDPOINT_USUARIOS = '/usuarios'

// Función auxiliar para normalizar datos del backend
const normalizeUsuario = (u) => ({
  id: u.id,
  cedula: u.cedula || u.nombreUsuario || u.mail,
  nombre: u.nombre || '',
  apellido: u.apellido || '',
  correo: u.correo || u.email || '',
  activo: u.activo !== false,
  fechaBloqueo: u.fechaBloqueo,
  fechaCreacion: u.fechaCreacion,
  fechaUltimoLogin: u.fechaUltimoLogin,
  rolId: u.rolId,
  rol: u.rol || u.rolNombre || 'Usuario',
  imagenUrl: u.imagenUrl || u.ImagenUrl || null
})

export const usuarioService = {
  async getPage(params = {}) {
    try {
      const query = new URLSearchParams({
        page: String(params.page ?? 1),
        limit: String(params.limit ?? 30)
      })
      if (params.search) query.append('search', params.search)
      const response = await httpClient.get(`${ENDPOINT_USUARIOS}?${query}`)
      const paged = unwrapPaged(response, 'usuarios')
      return {
        ...paged,
        data: paged.data.map(normalizeUsuario)
      }
    } catch (error) {
      console.error('[usuarioService] Error en getPage:', error)
      throw error
    }
  },

  async getAll(params = {}) {
    try {
      const { data } = await this.getPage({ page: 1, limit: params.limit ?? 200, search: params.search })
      return data
    } catch (error) {
      console.error('[usuarioService] Error en getAll:', error)
      return []
    }
  },

  async getById(id) {
    try {
      const response = await httpClient.get(`${ENDPOINT_USUARIOS}/${id}`)
      const raw = response?.data || response
      return raw ? normalizeUsuario(raw) : null
    } catch (error) {
      console.error('[usuarioService] Error en getById:', error)
      return null
    }
  },

  async create(usuarioData) {
    const payload = {
      nombreUsuario: usuarioData.nombreUsuario || usuarioData.cedula,
      nombre: usuarioData.nombre,
      apellido: usuarioData.apellido,
      email: usuarioData.email || usuarioData.correo,
      contrasena: usuarioData.contrasena || usuarioData.password,
      rolId: parseInt(usuarioData.rolId)
    }
    const response = await httpClient.post(ENDPOINT_USUARIOS, payload)
    return response?.data || response || null
  },

  async update(id, usuarioData) {
    const payload = {
      nombre: usuarioData.nombre,
      apellido: usuarioData.apellido,
      email: usuarioData.email || usuarioData.correo,
      rolId: usuarioData.rolId ? parseInt(usuarioData.rolId) : undefined,
      activo: usuarioData.activo
    }
    const response = await httpClient.put(`${ENDPOINT_USUARIOS}/${id}`, payload)
    return response?.data || response || null
  },

  async delete(id) {
    const response = await httpClient.delete(`${ENDPOINT_USUARIOS}/${id}`)
    return response?.data || response || true
  },

  async desbloquear(id) {
    try {
      const response = await httpClient.put(`${ENDPOINT_USUARIOS}/${id}/desbloquear`, {})
      return response?.data || response || null
    } catch (error) {
      console.error('[usuarioService] Error en desbloquear:', error)
      return null
    }
  },

  async actualizarImagen(id, imagenUrl) {
    try {
      const response = await httpClient.patch(`${ENDPOINT_USUARIOS}/${id}/imagen`, { imagenUrl })
      return response?.data || response || null
    } catch (error) {
      console.error('[usuarioService] Error en actualizarImagen:', error)
      throw error
    }
  }
}
