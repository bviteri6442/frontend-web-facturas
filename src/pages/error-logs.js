import { logService } from '../services/logsService.js'

export class ErrorLogs {
  constructor() {
    this.allErrors = []
    this.filteredErrors = []
  }

  render() {
    return `
      <div style="padding: 2rem;">
        <div class="page-header">
          <h1 class="page-title">
            <i class="fas fa-triangle-exclamation"></i>
            Registro de Errores
          </h1>
        </div>

        <div class="card">
          <div class="card-body">
            <div style="margin-bottom: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
              <input type="text" id="searchErrors" placeholder="Buscar errores..." 
                     style="flex: 1; min-width: 200px; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;">
              <select id="severityFilter" style="padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;">
                <option value="">Todas las severidades</option>
                <option value="Information">Information</option>
                <option value="Warning">Warning</option>
                <option value="Error">Error</option>
                <option value="Critical">Critical</option>
              </select>
              <select id="revisadoFilter" style="padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;">
                <option value="">Todos</option>
                <option value="false">Pendientes</option>
                <option value="true">Revisados</option>
              </select>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0;">
                  <th style="padding: 0.75rem; text-align: left;">Fecha</th>
                  <th style="padding: 0.75rem; text-align: left;">Tipo</th>
                  <th style="padding: 0.75rem; text-align: left;">Severidad</th>
                  <th style="padding: 0.75rem; text-align: left;">Mensaje</th>
                  <th style="padding: 0.75rem; text-align: left;">Origen</th>
                  <th style="padding: 0.75rem; text-align: center;">Estado</th>
                  <th style="padding: 0.75rem; text-align: center;">Acción</th>
                </tr>
              </thead>
              <tbody id="errorsTable">
                <tr>
                  <td colspan="7" style="padding: 2rem; text-align: center; color: #64748B;">
                    <i class="fas fa-spinner fa-spin"></i> Cargando...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `
  }

  async init() {
    await this.loadErrors()

    document.getElementById('searchErrors')?.addEventListener('input', () => this.filterAndRender())
    document.getElementById('severityFilter')?.addEventListener('change', () => this.filterAndRender())
    document.getElementById('revisadoFilter')?.addEventListener('change', () => this.filterAndRender())
  }

  async loadErrors() {
    const table = document.getElementById('errorsTable')
    if (!table) return

    try {
      const data = await logService.getErrores()
      this.allErrors = Array.isArray(data) ? data : []
      this.filterAndRender()
    } catch (error) {
      console.error('Error cargando errores:', error)
      table.innerHTML = '<tr><td colspan="7" style="padding: 2rem; text-align: center; color: #EF4444;">Error al cargar los registros</td></tr>'
    }
  }

  filterAndRender() {
    const search = (document.getElementById('searchErrors')?.value || '').toLowerCase()
    const nivel = document.getElementById('severityFilter')?.value || ''
    const revisado = document.getElementById('revisadoFilter')?.value

    this.filteredErrors = this.allErrors.filter(e => {
      const matchSearch = !search ||
        (e.mensaje || '').toLowerCase().includes(search) ||
        (e.tipoError || '').toLowerCase().includes(search) ||
        (e.origen || '').toLowerCase().includes(search)
      const matchNivel = !nivel || e.nivel === nivel
      const matchRevisado = revisado === '' || String(e.revisado) === revisado
      return matchSearch && matchNivel && matchRevisado
    })

    this.renderTable()
  }

  renderTable() {
    const table = document.getElementById('errorsTable')
    if (!table) return

    if (this.filteredErrors.length === 0) {
      table.innerHTML = '<tr><td colspan="7" style="padding: 2rem; text-align: center; color: #64748B;"><i class="fas fa-check-circle"></i> Sin errores registrados</td></tr>'
      return
    }

    const colorNivel = { Information: '#3B82F6', Warning: '#F59E0B', Error: '#EF4444', Critical: '#7C3AED' }

    table.innerHTML = this.filteredErrors.map(error => {
      const color = colorNivel[error.nivel] || '#64748B'
      const fecha = error.fecha ? new Date(error.fecha).toLocaleString('es-EC') : '-'
      const estadoBadge = error.revisado
        ? '<span style="color:#22C55E;font-weight:600;">Revisado</span>'
        : '<span style="color:#F59E0B;font-weight:600;">Pendiente</span>'
      return `
        <tr style="border-bottom: 1px solid #E2E8F0;" data-id="${error.id}">
          <td style="padding: 0.75rem; font-size: 0.875rem;">${fecha}</td>
          <td style="padding: 0.75rem; font-size: 0.875rem;">${error.tipoError || '-'}</td>
          <td style="padding: 0.75rem;">
            <span style="padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 600; font-size: 0.8rem; background:${color}20; color:${color};">
              ${error.nivel || '-'}
            </span>
          </td>
          <td style="padding: 0.75rem; max-width: 300px; word-break: break-word;">${error.mensaje || '-'}</td>
          <td style="padding: 0.75rem; font-size: 0.875rem; color: #64748B;">${error.origen || '-'}</td>
          <td style="padding: 0.75rem; text-align: center;">${estadoBadge}</td>
          <td style="padding: 0.75rem; text-align: center;">
            ${!error.revisado ? `<button class="btn-revisar" data-id="${error.id}" 
              style="padding:0.3rem 0.75rem; background:#3B82F6; color:white; border:none; border-radius:4px; cursor:pointer; font-size:0.8rem;">
              Marcar revisado
            </button>` : ''}
          </td>
        </tr>
      `
    }).join('')

    // Listeners para botones de revisar
    table.querySelectorAll('.btn-revisar').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id
        await this.marcarRevisado(id)
      })
    })
  }

  async marcarRevisado(id) {
    try {
      await logService.marcarErrorResuelto(id)
      const item = this.allErrors.find(e => String(e.id) === String(id))
      if (item) item.revisado = true
      this.filterAndRender()
    } catch (err) {
      console.error('Error al marcar como revisado:', err)
    }
  }
}

