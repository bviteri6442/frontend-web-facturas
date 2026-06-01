import axios from 'axios'
import { API_BASE_URL } from '../config/api.js'
import Swal from 'sweetalert2'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Add JWT token + headers ngrok
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const fullUrl = config.baseURL && config.url
      ? `${config.baseURL.replace(/\/$/, '')}/${config.url.replace(/^\//, '')}`
      : config.url || ''
    if (fullUrl.includes('ngrok')) {
      config.headers['ngrok-skip-browser-warning'] = 'true'
    }
    console.log(`[AXIOS] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[AXIOS] Error en request:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[AXIOS] Response ${response.status}: ${response.config.url}`)
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data, config } = error.response
      const errorMessage = data?.mensaje || data?.message || data?.title || `Error ${status}`
      
      console.error(`[AXIOS] Error ${status}: ${errorMessage}`)
      
      // Crear un error con el mensaje personalizado
      error.message = errorMessage
      error.friendlyMessage = errorMessage
      
      // Unauthorized - Token expired or invalid
      if (status === 401) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('currentUser')
        window.location.href = '/login.html'
        Swal.fire({
          icon: 'warning',
          title: 'Sesión Expirada',
          text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          confirmButtonColor: '#4a90e2'
        })
      }
      
      // Forbidden - No permissions
      if (status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'No tienes permisos para realizar esta acción.',
          confirmButtonColor: '#e74c3c'
        })
      }
      
      // Server errors
      if (status >= 500) {
        Swal.fire({
          icon: 'error',
          title: 'Error del Servidor',
          text: 'Ha ocurrido un error en el servidor. Por favor, intenta más tarde.',
          confirmButtonColor: '#e74c3c'
        })
      }
    } else if (error.request) {
      // Network error
      console.error('[AXIOS] Error de conexión:', error.request)
      Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        confirmButtonColor: '#e74c3c'
      })
    } else {
      console.error('[AXIOS] Error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
