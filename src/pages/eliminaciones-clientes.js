import { httpClient } from '../services/http-client.js'
import { PaginationAdvanced } from '../components/PaginationAdvanced.js'

export class EliminacionesClientes {
  constructor() {
    this.clientes = []
    this.filtrados = []
    this.currentPage = 1
    this.itemsPerPage = 10
    this.pagination = null
  }

  render() {
    return `
      <div style="padding: 2rem;">
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h1 class="page-title" style="font-size: 1.5rem; font-weight: 700; color: #0F172A;">
            <i class="fas fa-user-times" style="margin-right: 10px; color: #EF4444;"></i>
            Clientes Desactivados
          </h1>
        </div>

        <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="fas fa-info-circle" style="color: #D97706;"></i>
          <span style="font-size: 0.875rem; color: #92400E;">Estos son clientes desactivados del sistema. Puede reactivarlos o eliminarlos permanentemente.</span>
        </div>

        <div id="statsClientes" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;"></div>

        <div class="card" style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
          <div style="padding: 1rem 1.5rem; border-bottom: 1px solid #E2E8F0;">
            <input type="text" id="searchDeletedClientes" placeholder="Buscar por nombre, documento, email..."
                   style="width: 100%; padding: 0.6rem 1rem; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 0.875rem; outline: none;">
          </div>
          <div class="card-body" style="padding: 0;">
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0;">
                    <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; font-weight: 600; color: #64748B; text-transform: uppercase;">ID</th>
                    <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; font-weight: 600; color: #64748B; text-transform: uppercase;">Nombre Completo</th>
                    <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; font-weight: 600; color: #64748B; text-transform: uppercase;">Documento</th>
                    <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; font-weight: 600; color: #64748B; text-transform: uppercase;">Email</th>
                    <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; font-weight: 600; color: #64748B; text-transform: uppercase;">Telefono</th>
                    <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; font-weight: 600; color: #64748B; text-transform: uppercase;">Fecha Creacion</th>
                    <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; font-weight: 600; color: #64748B; text-transform: uppercase;">Fecha Desact.</th>
                    <th style="padding: 0.75rem 1rem; text-align: center; font-size: 0.8rem; font-weight: 600; color: #64748B; text-transform: uppercase;">Acciones</th>
                  </tr>
                </thead>
                <tbody id="deletedClientsTable">
                  <tr><td colspan="8" style="padding: 2rem; text-align: center; color: #64748B;">Cargando...</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div id="pagination-elim-clientes" style="padding: 0 1rem;"></div>
        </div>
      </div>
    `
  }

  async init() {
    await this.loadDeactivatedClients()
    document.getElementById('searchDeletedClientes')?.addEventListener('input', (e) => {
      this.filterClientes(e.target.value)
    })
    document.getElementById('deletedClientsTable')?.addEventListener('click', async (e) => {
      const btn = e.target.closest('button')
      if (!btn) return
      const id = btn.dataset.id
      if (btn.classList.contains('btn-activar-cliente')) {
        await this.activarCliente(id, btn)
      } else if (btn.classList.contains('btn-eliminar-cliente-perm')) {
        await this.eliminarPermanente(id, btn)
      }
    })
  }

  async loadDeactivatedClients() {
    try {
      const data = await httpClient.get('/clientes')
      this.clientes = data
        .filter(c => c.activo === false)
        .sort((a, b) => {
          const dateA = a.fechaEliminacion ? new Date(a.fechaEliminacion) : new Date(0)
          const dateB = b.fechaEliminacion ? new Date(b.fechaEliminacion) : new Date(0)
          return dateB - dateA
        })
      this.filtrados = [...this.clientes]
      this.setupPagination()
      this.renderStats()
      this.renderTable(this.filtrados)
    } catch (err) {
      document.getElementById('deletedClientsTable').innerHTML =
        `<tr><td colspan="9" style="padding:2rem;text-align:center;color:#EF4444;">Error al cargar clientes: ${err.message}</td></tr>`
    }
  }

  async activarCliente(id, btn) {
    if (!confirm('¿Reactivar este cliente? Volvera a estar disponible en el sistema.')) return
    btn.disabled = true
    btn.textContent = '...'
    try {
      await httpClient.put(`/clientes/${id}`, { id: parseInt(id), activo: true })
      this.clientes = this.clientes.filter(c => String(c.id) !== String(id))
      this.filtrados = this.filtrados.filter(c => String(c.id) !== String(id))
      if (this.pagination) this.pagination.update(this.filtrados.length)
      this.renderStats()
      this.renderTable(this.filtrados)
    } catch (err) {
      btn.disabled = false
      btn.textContent = 'Activar'
      alert('Error al activar cliente: ' + err.message)
    }
  }

  async eliminarPermanente(id, btn) {
    if (!confirm('ADVERTENCIA: Esto eliminara permanentemente al cliente y no se podra recuperar. ¿Confirmar?')) return
    btn.disabled = true
    btn.textContent = '...'
    try {
      await httpClient.delete(`/clientes/${id}`)
      this.clientes = this.clientes.filter(c => String(c.id) !== String(id))
      this.filtrados = this.filtrados.filter(c => String(c.id) !== String(id))
      if (this.pagination) this.pagination.update(this.filtrados.length)
      this.renderStats()
      this.renderTable(this.filtrados)
    } catch (err) {
      btn.disabled = false
      btn.textContent = 'Eliminar'
      alert('Error al eliminar cliente: ' + err.message)
    }
  }

  setupPagination() {
    this.pagination = new PaginationAdvanced({
      currentPage: this.currentPage,
      totalPages: Math.ceil(this.filtrados.length / this.itemsPerPage),
      totalItems: this.filtrados.length,
      itemsPerPage: this.itemsPerPage,
      onChange: (page) => {
        this.currentPage = page
        this.renderTable(this.filtrados)
      }
    })
    window.pagination = this.pagination
  }

  renderPagination() {
    const container = document.getElementById('pagination-elim-clientes')
    if (container && this.pagination) {
      container.innerHTML = this.pagination.render()
    }
  }

  getPaginated(data) {
    const start = (this.currentPage - 1) * this.itemsPerPage
    return data.slice(start, start + this.itemsPerPage)
  }

  renderStats() {
    const total = this.clientes.length
    const container = document.getElementById('statsClientes')
    if (!container) return
    container.innerHTML = `
      <div style="background: white; border-radius: 12px; padding: 1.25rem 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 1rem;">
        <div style="background: #FEE2E2; border-radius: 10px; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-user-times" style="color: #EF4444; font-size: 1.25rem;"></i>
        </div>
        <div>
          <div style="font-size: 1.75rem; font-weight: 700; color: #0F172A;">${total}</div>
          <div style="font-size: 0.8rem; color: #64748B;">Clientes Desactivados</div>
        </div>
      </div>
      <div style="background: white; border-radius: 12px; padding: 1.25rem 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 1rem;">
        <div style="background: #DCFCE7; border-radius: 10px; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-user-check" style="color: #22C55E; font-size: 1.25rem;"></i>
        </div>
        <div>
          <div style="font-size: 1.75rem; font-weight: 700; color: #0F172A;">${this.filtrados.length}</div>
          <div style="font-size: 0.8rem; color: #64748B;">Mostrando (con filtro)</div>
        </div>
      </div>
    `
  }

  renderTable(data) {
    if (this.pagination) {
      this.pagination.update(data.length)
    }
    const page = this.getPaginated(data)
    const tbody = document.getElementById('deletedClientsTable')
    if (!tbody) return
    if (page.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="padding:2rem;text-align:center;color:#64748B;">No hay clientes desactivados</td></tr>`
      this.renderPagination()
      return
    }
    tbody.innerHTML = page.map(c => `
      <tr style="border-bottom: 1px solid #F1F5F9;">
        <td style="padding: 0.75rem 1rem; font-size: 0.875rem; color: #64748B;">${c.id}</td>
        <td style="padding: 0.75rem 1rem; font-size: 0.875rem; color: #0F172A; font-weight: 500;">${[c.nombre, c.apellido].filter(Boolean).join(' ') || '-'}</td>
        <td style="padding: 0.75rem 1rem; font-size: 0.875rem; color: #475569;">${c.cedula || c.documento || '-'}</td>
        <td style="padding: 0.75rem 1rem; font-size: 0.875rem; color: #475569;">${c.email || '-'}</td>
        <td style="padding: 0.75rem 1rem; font-size: 0.875rem; color: #475569;">${c.telefono || '-'}</td>
        <td style="padding: 0.75rem 1rem; font-size: 0.875rem; color: #475569;">${c.fechaCreacion ? new Date(c.fechaCreacion).toLocaleDateString('es-EC') : '-'}</td>
        <td style="padding: 0.75rem 1rem; font-size: 0.875rem; color: #475569;">${c.fechaEliminacion ? new Date(c.fechaEliminacion).toLocaleString('es-EC') : '-'}</td>
        <td style="padding: 0.75rem 1rem; text-align: center; white-space: nowrap;">
          <button class="btn-activar-cliente" data-id="${c.id}"
            style="background: #22C55E; color: white; border: none; padding: 0.3rem 0.7rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; margin-right: 0.4rem;">
            Activar
          </button>
          <button class="btn-eliminar-cliente-perm" data-id="${c.id}"
            style="background: #EF4444; color: white; border: none; padding: 0.3rem 0.7rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer;">
            Eliminar
          </button>
        </td>
      </tr>
    `).join('')
    this.renderPagination()
  }

  filterClientes(term) {
    const t = term.toLowerCase()
    if (!t) {
      this.filtrados = [...this.clientes]
    } else {
      this.filtrados = this.clientes.filter(c =>
        (c.nombre || '').toLowerCase().includes(t) ||
        (c.apellido || '').toLowerCase().includes(t) ||
        ([c.nombre, c.apellido].filter(Boolean).join(' ')).toLowerCase().includes(t) ||
        (c.cedula || '').toLowerCase().includes(t) ||
        (c.documento || '').toLowerCase().includes(t) ||
        (c.email || '').toLowerCase().includes(t)
      )
    }
    this.currentPage = 1
    if (this.pagination) this.pagination.currentPage = 1
    this.renderTable(this.filtrados)
  }
}
