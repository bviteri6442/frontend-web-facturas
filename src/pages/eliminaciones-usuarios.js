import { httpClient } from '../services/http-client.js'
import { PaginationAdvanced } from '../components/PaginationAdvanced.js'

export class EliminacionesUsuarios {
  constructor() {
    this.eliminaciones = []
    this.filtradas = []
    this.currentPage = 1
    this.itemsPerPage = 10
    this.pagination = null
    this.searchTerm = ''
    this.searchType = 'todos' // 'todos', 'nombreusuario', 'nombre', 'email'
    this.searchDebounce = null
  }

  // Filtrar usuarios según el tipo de búsqueda seleccionado
  filtrarUsuariosLocal() {
    if (!this.searchTerm.trim()) {
      this.filtradas = [...this.eliminaciones]
      return
    }

    const term = this.searchTerm.toLowerCase()

    this.filtradas = this.eliminaciones.filter(item => {
      switch (this.searchType) {
        case 'nombreusuario':
          return (item.nombreUsuario || '').toLowerCase().includes(term)
        
        case 'nombre':
          const nombreCompleto = `${item.nombre || ''} ${item.apellido || ''}`.toLowerCase()
          return nombreCompleto.includes(term)
        
        case 'email':
          return (item.email || '').toLowerCase().includes(term)
        
        case 'todos':
        default:
          const nombreUser = (item.nombreUsuario || '').toLowerCase()
          const nombreComp = `${item.nombre || ''} ${item.apellido || ''}`.toLowerCase()
          const email = (item.email || '').toLowerCase()
          return nombreUser.includes(term) || nombreComp.includes(term) || email.includes(term)
      }
    })
  }

  render() {
    return `
      <div style="padding: 2rem;">
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h1 class="page-title" style="font-size: 1.5rem; font-weight: 700; color: #0F172A;">
            <i class="fas fa-user-slash" style="margin-right: 10px; color: #EF4444;"></i>
            Historial de Eliminaciones de Usuarios
          </h1>
        </div>

        <div id="statsUsuarios" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;"></div>

        <div class="card" style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
          <div style="padding: 1rem 1.5rem; border-bottom: 1px solid #E2E8F0;">
            <div style="display: grid; grid-template-columns: 150px 1fr; gap: 1rem; align-items: flex-end;">
              <div>
                <label style="display: block; margin-bottom: 0.35rem; font-weight: 600; font-size: 0.8rem; color: #475569;">Buscar por:</label>
                <select id="searchDeletedUsersType" style="width: 100%; padding: 0.5rem 0.7rem; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 0.85rem; background: #fff; cursor: pointer; box-sizing: border-box;">
                  <option value="todos">Todos</option>
                  <option value="nombreusuario">Nombre Usuario</option>
                  <option value="nombre">Nombre Completo</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div>
                <label style="display: block; margin-bottom: 0.35rem; font-weight: 600; font-size: 0.8rem; color: #475569;">Búsqueda:</label>
                <input type="text" id="searchDeletedUsers" placeholder="Ingresa tu búsqueda..."
                       style="width: 100%; padding: 0.5rem 0.7rem; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 0.85rem; outline: none; box-sizing: border-box;">
              </div>
            </div>
          </div>
          <div class="card-body" style="padding: 0;">
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0;">
                    <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; font-weight: 600; color: #64748B; text-transform: uppercase;">Fecha</th>
                    <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; font-weight: 600; color: #64748B; text-transform: uppercase;">Usuario</th>
                    <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; font-weight: 600; color: #64748B; text-transform: uppercase;">Email</th>
                    <th style="padding: 0.75rem 1rem; text-align: center; font-size: 0.8rem; font-weight: 600; color: #64748B; text-transform: uppercase;">Rol</th>
                    <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; font-weight: 600; color: #64748B; text-transform: uppercase;">Eliminado por</th>
                    <th style="padding: 0.75rem 1rem; text-align: center; font-size: 0.8rem; font-weight: 600; color: #64748B; text-transform: uppercase;">Tipo</th>
                  </tr>
                </thead>
                <tbody id="deletedUsersTable">
                  <tr><td colspan="6" style="padding: 2rem; text-align: center; color: #64748B;">Cargando...</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div id="pagination-elim-usuarios" style="padding: 0 1rem;"></div>
        </div>
      </div>
    `
  }

  async init() {
    await this.loadDeletedUsers()
    
    // Listener para cambio de tipo de búsqueda
    const searchTypeSelect = document.getElementById('searchDeletedUsersType')
    if (searchTypeSelect) {
      searchTypeSelect.addEventListener('change', (e) => {
        this.searchType = e.target.value
        this.filtrarUsuariosLocal()
        this.renderTable()
      })
    }
    
    // Listener para búsqueda
    document.getElementById('searchDeletedUsers')?.addEventListener('input', (e) => {
      this.searchTerm = e.target.value
      clearTimeout(this.searchDebounce)
      this.searchDebounce = setTimeout(() => {
        this.filtrarUsuariosLocal()
        this.renderTable()
      }, 400)
    })
  }

  async loadDeletedUsers() {
    const table = document.getElementById('deletedUsersTable')
    if (!table) return
    try {
      const response = await httpClient.get('/eliminacionesusuarios')
      this.eliminaciones = Array.isArray(response) ? response : (response?.data || [])
      this.filtrarUsuariosLocal()
      this.renderStats()
      this.setupPagination()
      this.renderTable(this.filtradas)
    } catch (error) {
      console.error('[ELIM-USUARIOS] Error:', error)
      table.innerHTML = `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: #EF4444;">Error al cargar datos: ${error.message}</td></tr>`
    }
  }

  setupPagination() {
    this.pagination = new PaginationAdvanced({
      currentPage: 1,
      totalPages: Math.ceil(this.filtradas.length / this.itemsPerPage) || 1,
      totalItems: this.filtradas.length,
      itemsPerPage: this.itemsPerPage,
      onChange: (page) => {
        this.currentPage = page
        this.renderTable(this.filtradas)
      }
    })
    window.pagination = this.pagination
  }

  renderPagination() {
    const container = document.getElementById('pagination-elim-usuarios')
    if (container && this.pagination) {
      this.pagination.update(this.filtradas.length)
      container.innerHTML = this.pagination.render()
    }
  }

  getPaginated(data) {
    const start = (this.currentPage - 1) * this.itemsPerPage
    return data.slice(start, start + this.itemsPerPage)
  }

  renderStats() {
    const container = document.getElementById('statsUsuarios')
    if (!container) return
    const total = this.eliminaciones.length
    const hoy = new Date().toDateString()
    const hoyCount = this.eliminaciones.filter(e => new Date(e.fechaEliminacion).toDateString() === hoy).length
    const semana = new Date(); semana.setDate(semana.getDate() - 7)
    const semanaCount = this.eliminaciones.filter(e => new Date(e.fechaEliminacion) >= semana).length
    container.innerHTML = `
      <div style="background: white; border-radius: 10px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 1rem;">
        <div style="width: 44px; height: 44px; border-radius: 10px; background: #FEE2E2; display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-user-slash" style="color: #EF4444; font-size: 1.1rem;"></i>
        </div>
        <div><div style="font-size: 1.5rem; font-weight: 700; color: #0F172A;">${total}</div><div style="font-size: 0.8rem; color: #64748B;">Total Eliminaciones</div></div>
      </div>
      <div style="background: white; border-radius: 10px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 1rem;">
        <div style="width: 44px; height: 44px; border-radius: 10px; background: #FEF3C7; display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-calendar-day" style="color: #F59E0B; font-size: 1.1rem;"></i>
        </div>
        <div><div style="font-size: 1.5rem; font-weight: 700; color: #0F172A;">${hoyCount}</div><div style="font-size: 0.8rem; color: #64748B;">Hoy</div></div>
      </div>
      <div style="background: white; border-radius: 10px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 1rem;">
        <div style="width: 44px; height: 44px; border-radius: 10px; background: #DCFCE7; display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-calendar-week" style="color: #10B981; font-size: 1.1rem;"></i>
        </div>
        <div><div style="font-size: 1.5rem; font-weight: 700; color: #0F172A;">${semanaCount}</div><div style="font-size: 0.8rem; color: #64748B;">Esta Semana</div></div>
      </div>
    `
  }

  renderTable(data) {
    const table = document.getElementById('deletedUsersTable')
    if (!table) return
    if (!data.length) {
      table.innerHTML = '<tr><td colspan="6" style="padding: 2rem; text-align: center; color: #64748B;">No hay usuarios eliminados</td></tr>'
      this.renderPagination()
      return
    }
    const page = this.getPaginated(data)
    table.innerHTML = page.map(e => {
      const fecha = e.fechaEliminacion ? new Date(e.fechaEliminacion).toLocaleString('es-EC') : '-'
      const rolBg = (e.rolUsuarioEliminado || '').toLowerCase().includes('admin') ? '#DBEAFE' : '#DCFCE7'
      const rolColor = (e.rolUsuarioEliminado || '').toLowerCase().includes('admin') ? '#2563EB' : '#16A34A'
      const tipoBg = e.tipoEliminacion === 'Eliminación permanente' ? '#FEE2E2' : '#FEF3C7'
      const tipoColor = e.tipoEliminacion === 'Eliminación permanente' ? '#DC2626' : '#D97706'
      return `<tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 0.75rem 1rem; font-size: 0.875rem; color: #64748B;">${fecha}</td>
        <td style="padding: 0.75rem 1rem;">
          <div style="font-weight: 600; color: #0F172A;">${e.nombreUsuarioEliminado || '-'}</div>
          <div style="font-size: 0.8rem; color: #64748B;">${e.cedulaUsuarioEliminado || ''}</div>
        </td>
        <td style="padding: 0.75rem 1rem; color: #64748B; font-size: 0.875rem;">${e.emailUsuarioEliminado || '-'}</td>
        <td style="padding: 0.75rem 1rem; text-align: center;">
          <span style="padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; background: ${rolBg}; color: ${rolColor};">
            ${e.rolUsuarioEliminado || '-'}
          </span>
        </td>
        <td style="padding: 0.75rem 1rem; color: #64748B;">${e.nombreAdministrador || '-'}</td>
        <td style="padding: 0.75rem 1rem; text-align: center;">
          <span style="padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; background: ${tipoBg}; color: ${tipoColor};">
            ${e.tipoEliminacion || 'Desactivación'}
          </span>
        </td>
      </tr>`
    }).join('')
    this.renderPagination()
  }

  filterUsers(term) {
    if (!term) {
      this.filtradas = [...this.eliminaciones]
    } else {
      const t = term.toLowerCase()
      this.filtradas = this.eliminaciones.filter(e =>
        (e.nombreUsuarioEliminado || '').toLowerCase().includes(t) ||
        (e.cedulaUsuarioEliminado || '').toLowerCase().includes(t) ||
        (e.emailUsuarioEliminado || '').toLowerCase().includes(t) ||
        (e.rolUsuarioEliminado || '').toLowerCase().includes(t) ||
        (e.nombreAdministrador || '').toLowerCase().includes(t)
      )
    }
    this.currentPage = 1
    if (this.pagination) this.pagination.currentPage = 1
    this.renderTable(this.filtradas)
  }
}
