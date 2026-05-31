// HTTP Client con Fetch API
// Maneja token JWT, errores globales y reintentos
// Compatible con Vanilla JS

const API_BASE_URL = 'https://localhost:56397/api'

class HttpClient {
  constructor() {
    this.baseURL = API_BASE_URL
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
    this.timeout = 10000 // 10 segundos
  }

  getHeaders() {
    const headers = { ...this.defaultHeaders }
    const token = localStorage.getItem('authToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  async request(method, endpoint, data = null, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`
      const config = {
        method,
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.timeout),
        ...(data && { body: JSON.stringify(data) }),
        ...options
      }

      console.log(`[HTTP] ${method.toUpperCase()} ${endpoint}`)
      const response = await fetch(url, config)
      console.log(`[HTTP] Response received. Status: ${response.status}`)

      // Manejar respuesta según status
      if (response.status === 401) {
        console.warn('[HTTP] Sesión expirada (401)')
        localStorage.removeItem('authToken')
        localStorage.removeItem('currentUser')
        // Redirigir a login
        if (typeof window !== 'undefined') {
          window.location.href = '/login.html'
        }
        return null
      }

      if (response.status === 403) {
        throw new Error('No tienes permisos para realizar esta acción.')
      }

      if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo nuevamente.')
      }

      if (!response.ok) {
        let errorMessage = `Error ${response.status}`
        try {
          const errorData = await response.json()
          console.error('[HTTP] Error response data:', errorData)
          // Priorizar errores de validación específicos de campo sobre el título genérico
          const fieldErrors = errorData.errors
            ? Object.entries(errorData.errors).map(([, msgs]) => msgs.join(', ')).join('. ')
            : null
          errorMessage = errorData.message || fieldErrors || errorData.title || errorMessage
        } catch (parseError) {
          console.error('[HTTP] Error parsing error response:', parseError)
          errorMessage = (await response.text()) || errorMessage
        }
        console.error(`[HTTP] Request failed with message: ${errorMessage}`)
        throw new Error(errorMessage)
      }

      // Intentar parsear JSON
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json()
        console.log(`[HTTP] Response JSON:`, jsonData)
        return jsonData
      }

      // Si es 201/204 sin body, considerar éxito
      if (response.status === 201 || response.status === 204) {
        console.log(`[HTTP] Success with status ${response.status}, returning empty success`)
        return { success: true }
      }

      console.log(`[HTTP] Response with status ${response.status}, no JSON body`)
      return null
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('La solicitud tardó demasiado tiempo. Verifica tu conexión.')
      }
      throw error
    }
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
