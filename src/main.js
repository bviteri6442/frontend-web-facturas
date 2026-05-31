import { store } from './store.js'
import { router } from './router.js'
import { perfilModal } from './pages/perfil.js'

// Global router exposure
window.router = router
window.store = store

// App class
class App {
  constructor() {
    console.log('🚀 Iniciando aplicación...')
    this.init()
  }

  async init() {
    // Check authentication
    if (!this.checkAuth()) {
      return
    }

    this.setupDOM()
    this.setupNavigation()
    this.manageAdminMenu()
    this.setupEventListeners()
    this.navigateToDashboard()
  }

  checkAuth() {
    const token = localStorage.getItem('authToken')
    const user = localStorage.getItem('currentUser')
    
    if (!token || !user) {
      console.log('❌ No autenticado, redirigiendo a login...')
      window.location.href = '/login.html'
      return false
    }

    try {
      const userData = JSON.parse(user)
      console.log('✅ Usuario autenticado:', userData.nombreCompleto)
      
      // Display user name
      const userDisplay = document.getElementById('userNameDisplay')
      if (userDisplay) {
        userDisplay.textContent = userData.nombreCompleto || userData.nombreUsuario || 'Usuario'
      }

      // Fetch fresh user data to get imagenUrl (not stored during login)
      if (userData.id) {
        import('./services/usuarioService.js').then(({ usuarioService }) => {
          usuarioService.getById(userData.id).then(fresh => {
            if (!fresh) return
            // Persist imagenUrl to localStorage
            if (fresh.imagenUrl) {
              userData.imagenUrl = fresh.imagenUrl
              localStorage.setItem('currentUser', JSON.stringify(userData))
            }
            // Update topbar avatar
            const avatarIcon = document.querySelector('.user-avatar-icon')
            if (avatarIcon && fresh.imagenUrl) {
              avatarIcon.innerHTML = `<img src="${fresh.imagenUrl}" alt="avatar" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid #BFDBFE;" onerror="this.outerHTML='<i class=\\'fas fa-user-circle\\'></i>'">`
            }
          }).catch(() => {})
        }).catch(() => {})
      }

      return true
    } catch (error) {
      console.error('Error parsing user data:', error)
      window.location.href = '/login.html'
      return false
    }
  }

  setupDOM() {
    console.log('🎨 Configurando DOM...')
    // Verificar que existan elementos necesarios
    const elements = {
      navMenu: document.getElementById('navMenu'),
      mainContent: document.getElementById('mainContent'),
      logoutBtn: document.getElementById('logoutBtn'),
      userNameDisplay: document.getElementById('userNameDisplay')
    }

    for (const [name, el] of Object.entries(elements)) {
      if (!el) {
        console.warn(`⚠️ Elemento ${name} no encontrado`)
      }
    }
  }

  setupNavigation() {
    console.log('🗂️ Configurando navegación...')
    const navMenu = document.getElementById('navMenu')
    if (!navMenu) return

    navMenu.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-page]')
      if (!link) return

      e.preventDefault()
      const pageName = link.dataset.page
      console.log(`📄 Navegando a: ${pageName}`)
      
      router.navigateTo(pageName)
    })
  }

  manageAdminMenu() {
    console.log('👥 Gestionando menú admin...')
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}')
    const isAdmin = user.rol && user.rol.toLowerCase() === 'admin'

    console.log(`   Rol: ${user.rol}, ¿Es Admin?: ${isAdmin}`)

    // Admin menu items
    const adminMenus = [
      'usuariosMenu',
      'elim-usuariosMenu',
      'elim-clientesMenu',
      'elim-productosMenu',
      'elim-ventasMenu',
      'logsMenu',
      'auditoriaMenu',
      'adminDivider',
      'logsDiv'
    ]

    adminMenus.forEach(menuId => {
      const element = document.getElementById(menuId)
      if (element) {
        element.style.display = isAdmin ? 'block' : 'none'
      }
    })
  }

  setupEventListeners() {
    console.log('🔧 Configurando event listeners...')
    const logoutBtn = document.getElementById('logoutBtn')
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault()
        this.handleLogout()
      })
    }

    // Inicializar modal de perfil
    perfilModal.init()
  }

  handleLogout() {
    console.log('🔓 Cerrando sesión...')
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
    window.location.href = '/login.html'
  }

  navigateToDashboard() {
    console.log('📊 Navegando al dashboard...')
    
    // Set dashboard as active
    const dashboardLink = document.querySelector('[data-page="dashboard"]')
    if (dashboardLink) {
      dashboardLink.closest('.nav-item').classList.add('active')
    }
    
    router.navigateTo('dashboard')
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ DOM cargado')
  const app = new App()
})
