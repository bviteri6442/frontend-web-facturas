import apiClient from '../utils/axios.js'
import { API_ENDPOINTS } from '../config/api.js'

export const authService = {
  async login(email, contrasena) {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, { email, contrasena })
    return response.data
  },
  
  async registro(userData) {
    const response = await apiClient.post(API_ENDPOINTS.REGISTRO, userData)
    return response.data
  },
  
  logout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
  },
  
  getToken() {
    return localStorage.getItem('authToken')
  },
  
  getUser() {
    const user = localStorage.getItem('currentUser')
    return user ? JSON.parse(user) : null
  },
  
  setToken(token) {
    localStorage.setItem('authToken', token)
  },
  
  setUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user))
  },
  
  isAuthenticated() {
    return !!this.getToken()
  }
}
