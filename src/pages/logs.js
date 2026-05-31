import { logService } from '../services/logsService.js'
import Swal from 'sweetalert2'

export class Logs {
  constructor() {
    this.allLogs = []
    this.filteredLogs = []
    this.searchTerm = ''
    this.filterType = ''
    this.loading = false
  }

  render() {
    return `
      <div style="padding: 2rem;">
        <div class="page-header">
          <h1 class="page-title">
            <i class="fas fa-clipboard-list"></i>
            Logs del Sistema
          </h1>
        </div>

        <div class="card">
          <div class="card-body">
            <div style="margin-bottom: 1.5rem; display: flex; gap: 1rem;">
              <input type="text" id="searchLogs" placeholder="Buscar en logs..." 
                     style="flex: 1; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;">
              <select id="filterLogs" style="padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;">
                <option value="">Todos los estados</option>
                <option value="EXITOSO">Exitosos</option>
                <option value="FALLIDO">Fallidos</option>
              </select>
              <button id="exportLogsBtn" class="btn btn-secondary">
                <i class="fas fa-download"></i> Exportar
              </button>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0;">
                  <th style="padding: 0.75rem; text-align: left;">Fecha/Hora</th>
                  <th style="padding: 0.75rem; text-align: left;">Tipo</th>
                  <th style="padding: 0.75rem; text-align: left;">Usuario</th>
                  <th style="padding: 0.75rem; text-align: left;">Acción</th>
                  <th style="padding: 0.75rem; text-align: left;">Descripción</th>
                </tr>
              </thead>
              <tbody id="logsTable">
                <tr>
                  <td colspan="5" style="padding: 2rem; text-align: center; color: #64748B;">
                    <i class="fas fa-info-circle"></i> Cargando logs...
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
    console.log('[LOGS] Inicializando...')
    this.loadLogs()
    
    const searchBox = document.getElementById('searchLogs')
    const filterSelect = document.getElementById('filterLogs')
    const exportBtn = document.getElementById('exportLogsBtn')

    if (searchBox) {
      searchBox.addEventListener('input', (e) => {
        this.searchTerm = e.target.value
        this.filterAndRender()
      })
    }

    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.filterType = e.target.value
        this.filterAndRender()
      })
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportLogs()
      })
    }
  }

  exportLogs() {
    if (this.filteredLogs.length === 0) {
      Swal.fire('Advertencia', 'No hay logs para exportar', 'warning')
      return
    }

    try {
      const csv = this.logsToCSV(this.filteredLogs)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `logs_${new Date().getTime()}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      Swal.fire('Éxito', 'Logs exportados correctamente', 'success')
    } catch (error) {
      console.error('[LOGS] Error exportando:', error)
      Swal.fire('Error', 'No se pudieron exportar los logs', 'error')
    }
  }

  logsToCSV(logs) {
    const headers = ['Fecha/Hora', 'Estado', 'Usuario', 'Acción', 'Descripción']
    const rows = logs.map(log => [
      log.fechaIntento ? new Date(log.fechaIntento).toLocaleString() : '',
      log.exitoso ? 'EXITOSO' : 'FALLIDO',
      log.nombreUsuario || '',
      'LOGIN',
      log.mensajeError || (log.exitoso ? 'Acceso concedido' : 'Acceso denegado')
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csv
  }

  async loadLogs() {
    const table = document.getElementById('logsTable')
    if (!table) return

    try {
      console.log('[LOGS] Cargando logs desde backend...')
      const logs = await logService.getAll()
      
      this.allLogs = Array.isArray(logs) ? logs : []
      console.log('[LOGS] Logs cargados:', this.allLogs.length)
      
      this.filterAndRender()
    } catch (error) {
      console.error('[LOGS] Error cargando logs:', error)
      table.innerHTML = '<tr><td colspan="5" style="padding: 2rem; text-align: center; color: #EF4444;">Error al cargar logs</td></tr>'
    }
  }

  filterAndRender() {
    this.filteredLogs = this.allLogs.filter(log => {
      const matchSearch = !this.searchTerm.trim() || 
        JSON.stringify(log).toLowerCase().includes(this.searchTerm.toLowerCase())
      
      // Mapear el filtro a los datos del backend
      let matchType = true
      if (this.filterType) {
        if (this.filterType === 'EXITOSO') {
          matchType = log.exitoso === true
        } else if (this.filterType === 'FALLIDO') {
          matchType = log.exitoso === false
        }
      }
      
      return matchSearch && matchType
    })

    this.renderLogs()
  }

  renderLogs() {
    const table = document.getElementById('logsTable')
    if (!table) return

    if (this.filteredLogs.length === 0) {
      table.innerHTML = '<tr><td colspan="5" style="padding: 2rem; text-align: center; color: #64748B;">No hay logs registrados</td></tr>'
      return
    }

    table.innerHTML = this.filteredLogs.map(log => {
      // Mapear exitoso a tipo visual
      const tipo = log.exitoso ? 'EXITOSO' : 'FALLIDO'
      const tipoColor = log.exitoso ? '#DBEAFE' : '#FEE2E2'
      const tipoTextColor = log.exitoso ? '#0369A1' : '#DC2626'

      return `
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 0.75rem;">${log.fechaIntento ? new Date(log.fechaIntento).toLocaleString() : 'N/A'}</td>
          <td style="padding: 0.75rem;">
            <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;
                         background-color: ${tipoColor};
                         color: ${tipoTextColor};">
              ${tipo}
            </span>
          </td>
          <td style="padding: 0.75rem;">${log.nombreUsuario || 'N/A'}</td>
          <td style="padding: 0.75rem;">LOGIN</td>
          <td style="padding: 0.75rem;">${log.mensajeError || (log.exitoso ? 'Acceso concedido' : 'Acceso denegado')}</td>
        </tr>
      `
    }).join('')
  }
}

