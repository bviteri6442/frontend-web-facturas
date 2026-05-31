import { store } from './store.js'

// Import all pages
import { Dashboard } from './pages/dashboard.js'
import { Clientes } from './pages/clientes.js'
import { Productos } from './pages/productos.js'
import { Ventas } from './pages/ventas.js'
import { NuevaVenta } from './pages/nuevaventa.js'
import { Usuarios } from './pages/usuarios.js'
import { Logs } from './pages/logs.js'
import { ErrorLogs } from './pages/error-logs.js'
import { EliminacionesUsuarios } from './pages/eliminaciones-usuarios.js'
import { EliminacionesProductos } from './pages/eliminaciones-productos.js'
import { EliminacionesClientes } from './pages/eliminaciones-clientes.js'
import { EliminacionesVentas } from './pages/eliminaciones-ventas.js'
import { Auditoria } from './pages/auditoria.js'

export class Router {
  constructor() {
    this.currentPage = 'dashboard'
    this.pages = {
      'dashboard': Dashboard,
      'clientes': Clientes,
      'productos': Productos,
      'ventas': Ventas,
      'nuevaventa': NuevaVenta,
      'usuarios': Usuarios,
      'logs': Logs,
      'error-logs': ErrorLogs,
      'eliminaciones-usuarios': EliminacionesUsuarios,
      'eliminaciones-productos': EliminacionesProductos,
      'eliminaciones-clientes': EliminacionesClientes,
      'eliminaciones-ventas': EliminacionesVentas,
      'auditoria': Auditoria
    }
  }

  async navigateTo(pageName) {
    const mainContent = document.getElementById('mainContent')
    if (!mainContent) {
      console.error('mainContent element not found')
      return
    }

    try {
      // Check if user has permission
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const isAdmin = user.rol && user.rol.toLowerCase() === 'admin'
      
      const adminPages = ['usuarios', 'logs', 'error-logs', 'eliminaciones-usuarios', 'eliminaciones-productos', 'eliminaciones-ventas', 'auditoria']
      if (adminPages.includes(pageName) && !isAdmin) {
        console.warn(`❌ Acceso denegado: ${pageName} requiere permisos de admin`)
        if (pageName !== 'dashboard') {
          this.navigateTo('dashboard')
        }
        return
      }

      this.currentPage = pageName
      const PageClass = this.pages[pageName]
      
      if (!PageClass) {
        console.error(`❌ Página no encontrada: ${pageName}`)
        this.navigateTo('dashboard')
        return
      }

      console.log(`✨ Cargando página: ${pageName}`)

      // Create page instance
      const page = new PageClass()
      mainContent.innerHTML = page.render()
      
      // Update active nav item
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active')
      })
      
      const activeLink = document.querySelector(`[data-page="${pageName}"]`)
      if (activeLink) {
        activeLink.closest('.nav-item').classList.add('active')
      }

      // Initialize page
      if (page.init && typeof page.init === 'function') {
        setTimeout(() => {
          try {
            page.init()
          } catch (error) {
            console.error(`Error initializing page ${pageName}:`, error)
          }
        }, 0)
      }

      console.log(`✅ Página ${pageName} cargada OK`)
      store.notify()
    } catch (error) {
      console.error(`❌ Error navegando a ${pageName}:`, error)
      mainContent.innerHTML = `<div style="padding: 2rem; color: #EF4444;">
        <i class="fas fa-exclamation-circle" style="font-size: 3rem;"></i>
        <h2>Error al cargar la página</h2>
        <p>${error.message}</p>
      </div>`
    }
  }
}

export const router = new Router()

