// Cliente HTTP (fetch) — usa siempre API_BASE_URL desde src/config/api.js
import { API_BASE_URL, apiUrl } from '../config/api.js'

function applyNgrokHeaders(headers, url) {
  if (url && url.includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = 'true'
  }
  return headers
}

class HttpClient {
  constructor() {
    this.baseURL = API_BASE_URL
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
    this.timeout = 30000
  }

  getHeaders(url, extra = {}) {
    const headers = { ...this.defaultHeaders, ...extra }
    const token = localStorage.getItem('authToken')
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return applyNgrokHeaders(headers, url || this.baseURL)
  }

  resolveUrl(endpoint) {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint
    }
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${this.baseURL}${path}`
  }

  async request(method, endpoint, data = null, options = {}) {
    try {
      const url = this.resolveUrl(endpoint)
      const { headers: extraHeaders, ...restOptions } = options
      const config = {
        method,
        headers: this.getHeaders(url, extraHeaders),
        signal: AbortSignal.timeout(this.timeout),
        ...restOptions
      }
      if (data) {
        config.body = JSON.stringify(data)
      }

      console.log(`[HTTP] ${method.toUpperCase()} ${url}`)
      const response = await fetch(url, config)
      console.log(`[HTTP] Response received. Status: ${response.status}`)

      if (response.status === 401) {
        console.warn('[HTTP] Sesion expirada (401)')
        localStorage.removeItem('authToken')
        localStorage.removeItem('currentUser')
        if (typeof window !== 'undefined') {
          window.location.href = '/login.html'
        }
        return null
      }

      if (response.status === 403) {
        throw new Error('No tienes permisos para realizar esta accion.')
      }

      if (response.status >= 500) {
        throw new Error('Error del servidor. Intentalo nuevamente.')
      }

      if (!response.ok) {
        let errorMessage = `Error ${response.status}`
        try {
          const errorData = await response.json()
          console.error('[HTTP] Error response data:', errorData)
          const fieldErrors = errorData.errors
            ? Object.entries(errorData.errors).map(([, msgs]) => msgs.join(', ')).join('. ')
            : null
          errorMessage = errorData.message || fieldErrors || errorData.title || errorMessage
        } catch (parseError) {
          console.error('[HTTP] Error parsing error response:', parseError)
          errorMessage = (await response.text()) || errorMessage
        }
        throw new Error(errorMessage)
      }

      const contentType = response.headers.get('content-type') || ''
      const rawText = await response.text()

      if (contentType.includes('application/json')) {
        if (!rawText.trim()) {
          console.warn('[HTTP] Respuesta JSON vacia en', url)
          return null
        }
        const jsonData = JSON.parse(rawText)
        console.log('[HTTP] Response JSON:', jsonData)
        return jsonData
      }

      if (rawText.trim().startsWith('<')) {
        throw new Error(
          'El servidor devolvio HTML en lugar de JSON (aviso de ngrok o URL incorrecta). ' +
          'En desarrollo usa VITE_API_BASE_URL=/api y en .env.local la URL de ngrok sin /api para el proxy, ' +
          'o la URL completa https://xxx.ngrok-free.app/api. Reinicia npm run dev.'
        )
      }

      if (response.status === 201 || response.status === 204) {
        return { success: true }
      }

      if (!rawText.trim()) {
        console.warn('[HTTP] Respuesta vacia (sin JSON) en', url, 'status', response.status)
        return null
      }

      try {
        return JSON.parse(rawText)
      } catch {
        throw new Error(`Respuesta no valida del servidor (${response.status})`)
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('La solicitud tardo demasiado tiempo. Verifica tu conexion.')
      }
      throw error
    }
  }

  /** GET que devuelve Blob (PDF, archivos binarios) */
  async getBlob(endpoint) {
    const url = this.resolveUrl(endpoint)
    const headers = this.getHeaders(url, {})
    delete headers['Content-Type']

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(this.timeout)
    })

    if (response.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('currentUser')
      window.location.href = '/login.html'
      return null
    }

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`)
    }

    return response.blob()
  }

  get(endpoint, options = {}) {
    return this.request('GET', endpoint, null, options)
  }

  post(endpoint, data, options = {}) {
    return this.request('POST', endpoint, data, options)
  }

  put(endpoint, data, options = {}) {
    return this.request('PUT', endpoint, data, options)
  }

  patch(endpoint, data, options = {}) {
    return this.request('PATCH', endpoint, data, options)
  }

  delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, null, options)
  }
}

export const httpClient = new HttpClient()
export { apiUrl }
