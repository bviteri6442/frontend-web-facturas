import { auditoriaService } from '../services/auditoriaService.js'
import { PaginationAdvanced } from '../components/PaginationAdvanced.js'
import Swal from 'sweetalert2'

const ITEMS_PER_PAGE = 15

export class Auditoria {
  constructor() {
    this.acciones = []
    this.filteredAcciones = []
    this.currentPage = 1
    this.itemsPerPage = ITEMS_PER_PAGE
    this.pagination = null
    this.loading = false
    this.totalAcciones = 0
    this.filtros = {
      usuarioId: '',
      modulo: '',
      tipoAccion: '',
      fechaInicio: '',
      fechaFin: ''
    }
  }

  render() {
    return `
<div class="auditoria-page" style="padding: 20px;">
  <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
    <h1 class="page-title" style="font-size: 28px; color: #1E293B; margin: 0;"><i class="fas fa-history"></i> Auditoría - Acciones de Usuarios</h1>
  </div>

  <div class="card" style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; margin-bottom: 20px;">
    <div class="card-header" style="padding: 20px; border-bottom: 1px solid #E2E8F0;">
      <h3 style="margin-top: 0; color: #1E293B;">Filtros</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
        <div>
          <label style="display: block; margin-bottom: 5px; color: #475569; font-weight: 500; font-size: 13px;">Usuario</label>
          <input type="text" class="filter-usuario" placeholder="ID o nombre del usuario"
            style="width: 100%; padding: 8px 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; box-sizing: border-box;" />
        </div>
        <div>
          <label style="display: block; margin-bottom: 5px; color: #475569; font-weight: 500; font-size: 13px;">Módulo</label>
          <select class="filter-modulo"
            style="width: 100%; padding: 8px 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; box-sizing: border-box;">
            <option value="">-- Todos --</option>
            <option value="Usuarios">Usuarios</option>
            <option value="Clientes">Clientes</option>
            <option value="Productos">Productos</option>
            <option value="Ventas">Ventas</option>
            <option value="Reportes">Reportes</option>
            <option value="Auditoría">Auditoría</option>
          </select>
        </div>
        <div>
          <label style="display: block; margin-bottom: 5px; color: #475569; font-weight: 500; font-size: 13px;">Tipo Acción</label>
          <select class="filter-tipo"
            style="width: 100%; padding: 8px 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; box-sizing: border-box;">
            <option value="">-- Todos --</option>
            <option value="Crear">Crear</option>
            <option value="Editar">Editar</option>
            <option value="Eliminar">Eliminar</option>
            <option value="Ver">Ver</option>
            <option value="Descargar">Descargar</option>
            <option value="Reinsertar">Reinsertar</option>
          </select>
        </div>
        <div>
          <label style="display: block; margin-bottom: 5px; color: #475569; font-weight: 500; font-size: 13px;">Desde</label>
          <input type="date" class="filter-fecha-inicio"
            style="width: 100%; padding: 8px 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; box-sizing: border-box;" />
        </div>
        <div>
          <label style="display: block; margin-bottom: 5px; color: #475569; font-weight: 500; font-size: 13px;">Hasta</label>
          <input type="date" class="filter-fecha-fin"
            style="width: 100%; padding: 8px 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; box-sizing: border-box;" />
        </div>
        <div style="display: flex; gap: 10px; align-items: flex-end;">
          <button class="btn-filtrar" style="flex: 1; padding: 8px 12px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            <i class="fas fa-filter"></i> Filtrar
          </button>
          <button class="btn-limpiar" style="flex: 1; padding: 8px 12px; background: #E2E8F0; color: #1E293B; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            <i class="fas fa-redo"></i> Limpiar
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
    <div class="card-header" style="padding: 15px 20px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
      <p style="margin: 0; color: #475569; font-size: 13px; font-weight: 500;">
        Total de acciones registradas: <strong id="total-acciones">0</strong>
      </p>
    </div>

    ${this.loading ? `
      <div style="padding: 40px; text-align: center; color: #64748B;">
        <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
        <p>Cargando acciones de auditoría...</p>
      </div>
    ` : `
      <div class="table-container" style="overflow-x: auto;">
        <table class="table" style="width: 100%; border-collapse: collapse;">
          <thead style="background: #F8FAFC; border-bottom: 2px solid #E2E8F0; position: sticky; top: 0;">
            <tr>
              <th style="padding: 12px 15px; text-align: left; font-weight: 600; color: #475569; font-size: 12px; white-space: nowrap;">Fecha</th>
              <th style="padding: 12px 15px; text-align: left; font-weight: 600; color: #475569; font-size: 12px; white-space: nowrap;">Usuario</th>
              <th style="padding: 12px 15px; text-align: left; font-weight: 600; color: #475569; font-size: 12px; white-space: nowrap;">Acción</th>
              <th style="padding: 12px 15px; text-align: left; font-weight: 600; color: #475569; font-size: 12px; white-space: nowrap;">Módulo</th>
              <th style="padding: 12px 15px; text-align: left; font-weight: 600; color: #475569; font-size: 12px;">Descripción</th>
              <th style="padding: 12px 15px; text-align: center; font-weight: 600; color: #475569; font-size: 12px; white-space: nowrap;">Acciones</th>
            </tr>
          </thead>
          <tbody id="acciones-tbody">
            <tr><td colspan="6" style="padding: 40px; text-align: center; color: #64748B;">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
      <div id="pagination-container"></div>
    `}
  </div>

  <!-- Modal de Detalles -->
  <div id="detalles-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
    <div style="background: white; border-radius: 12px; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 25px rgba(0,0,0,0.15);">
      <div style="padding: 24px; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center;">
        <h2 id="modal-title" style="margin: 0; color: #1E293B; font-size: 20px;">Detalles de Acción</h2>
        <button id="close-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #64748B;">×</button>
      </div>
      <div id="modal-content" style="padding: 24px;"></div>
      <div style="padding: 16px 24px; border-top: 1px solid #E2E8F0; display: flex; gap: 10px; justify-content: flex-end;">
        <button id="modal-close-btn" style="padding: 8px 16px; background: #E2E8F0; color: #1E293B; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Cerrar</button>
      </div>
    </div>
  </div>
</div>
    `
  }

  init() {
    console.log('[AUDITORIA] Inicializando...')
    this.loadAcciones()
    
    setTimeout(() => {
      // Botones de filtro
      const btnFiltrar = document.querySelector('.btn-filtrar')
      const btnLimpiar = document.querySelector('.btn-limpiar')

      if (btnFiltrar) {
        btnFiltrar.addEventListener('click', () => this.aplicarFiltros())
      }

      if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => this.limpiarFiltros())
      }

      // Event listeners para Modal
      const closeBtn = document.getElementById('close-modal')
      const closeBtnFooter = document.getElementById('modal-close-btn')
      const modal = document.getElementById('detalles-modal')
      
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeDetailsModal())
      }
      if (closeBtnFooter) {
        closeBtnFooter.addEventListener('click', () => this.closeDetailsModal())
      }
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) this.closeDetailsModal()
        })
      }

      // Botones de acciones
      this.attachButtonListeners()
    }, 100)
  }

  async loadAcciones() {
    this.loading = true
    try {
      console.log('[AUDITORIA] Cargando acciones...')
      const acciones = await auditoriaService.getAcciones({
        usuarioId: this.filtros.usuarioId || undefined,
        modulo: this.filtros.modulo || undefined,
        tipoAccion: this.filtros.tipoAccion || undefined,
        fechaInicio: this.filtros.fechaInicio || undefined,
        fechaFin: this.filtros.fechaFin || undefined,
        skip: (this.currentPage - 1) * this.itemsPerPage,
        take: this.itemsPerPage * 2  // Cargar más para tener disponibles
      })

      if (Array.isArray(acciones)) {
        this.acciones = acciones.sort((a, b) => new Date(b.fechaAccion) - new Date(a.fechaAccion))
        this.totalAcciones = this.acciones.length
      } else {
        this.acciones = []
      }

      console.log('[AUDITORIA] Cargadas:', this.acciones.length)
      this.setupPagination()
      this.updateTable()
    } catch (error) {
      console.error('[AUDITORIA] Error cargando:', error)
      this.acciones = []
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar acciones de auditoría' })
    } finally {
      this.loading = false
    }
  }

  setupPagination() {
    this.pagination = new PaginationAdvanced(
      this.acciones.length,
      this.itemsPerPage,
      (page) => {
        this.currentPage = page
        this.updateTable()
      }
    )
  }

  updateTable() {
    const tbody = document.getElementById('acciones-tbody')
    const totalEl = document.getElementById('total-acciones')
    
    if (!tbody) return

    if (this.acciones.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="padding: 40px; text-align: center; color: #64748B;">No hay acciones registradas</td></tr>'
      return
    }

    const start = (this.currentPage - 1) * this.itemsPerPage
    const end = start + this.itemsPerPage
    const paginatedData = this.acciones.slice(start, end)

    tbody.innerHTML = paginatedData.map(accion => `
      <tr style="border-bottom: 1px solid #E2E8F0; hover: background: #F8FAFC;">
        <td style="padding: 12px 15px; font-size: 12px; color: #1E293B; white-space: nowrap;">
          ${new Date(accion.fechaAccion).toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </td>
        <td style="padding: 12px 15px; font-size: 12px; color: #1E293B;">
          <span style="background: #E0E7FF; color: #3730A3; padding: 4px 8px; border-radius: 4px; font-weight: 500;">
            ${accion.nombreUsuario}
          </span>
        </td>
        <td style="padding: 12px 15px; font-size: 12px; color: #1E293B;">
          <span style="background: ${this.getAccionBadgeColor(accion.tipoAccion)}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: 500;">
            ${accion.tipoAccion}
          </span>
        </td>
        <td style="padding: 12px 15px; font-size: 12px; color: #1E293B;">
          <span style="background: #F3E8FF; color: #6B21A8; padding: 4px 8px; border-radius: 4px;">
            ${accion.modulo}
          </span>
        </td>
        <td style="padding: 12px 15px; font-size: 12px; color: #475569; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${accion.descripcion}
        </td>
        <td style="padding: 12px 15px; text-align: center;">
          <button class="btn-view-accion" data-id="${accion.id}" style="padding: 4px 8px; background: #3B82F6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;">
            <i class="fas fa-eye"></i> Ver
          </button>
        </td>
      </tr>
    `).join('')

    if (totalEl) {
      totalEl.textContent = this.acciones.length
    }

    // Renderizar paginación
    if (this.pagination) {
      const paginationContainer = document.getElementById('pagination-container')
      if (paginationContainer) {
        paginationContainer.innerHTML = this.pagination.render()
      }
    }

    this.attachButtonListeners()
  }

  getAccionBadgeColor(tipoAccion) {
    const colors = {
      'Crear': '#10B981',
      'Editar': '#F59E0B',
      'Eliminar': '#EF4444',
      'Ver': '#3B82F6',
      'Descargar': '#8B5CF6',
      'Reinsertar': '#06B6D4'
    }
    return colors[tipoAccion] || '#6B7280'
  }

  attachButtonListeners() {
    document.querySelectorAll('.btn-view-accion').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault()
        const id = btn.getAttribute('data-id')
        const accion = this.acciones.find(a => a.id == id)
        if (accion) {
          this.showDetailsModal(accion)
        }
      })
    })
  }

  showDetailsModal(accion) {
    const modal = document.getElementById('detalles-modal')
    const title = document.getElementById('modal-title')
    const content = document.getElementById('modal-content')

    title.textContent = `${accion.tipoAccion} - ${accion.modulo}`

    const fechaFormato = new Date(accion.fechaAccion).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    content.innerHTML = `
      <div style="background: #F8FAFC; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
          <div>
            <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569; font-size: 12px;">USUARIO</p>
            <p style="margin: 0; color: #1E293B; font-size: 14px;">${accion.nombreUsuario}</p>
          </div>
          <div>
            <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569; font-size: 12px;">MÓDULO</p>
            <p style="margin: 0; color: #1E293B; font-size: 14px;">${accion.modulo}</p>
          </div>
          <div>
            <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569; font-size: 12px;">ACCIÓN</p>
            <p style="margin: 0; color: #1E293B; font-size: 14px;">${accion.tipoAccion}</p>
          </div>
          <div>
            <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569; font-size: 12px;">FECHA</p>
            <p style="margin: 0; color: #1E293B; font-size: 14px;">${fechaFormato}</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #475569; font-size: 12px;">DESCRIPCIÓN</p>
        <p style="margin: 0; color: #1E293B; padding: 12px; background: #F8FAFC; border-radius: 6px; border-left: 3px solid #3B82F6;">
          ${accion.descripcion}
        </p>
      </div>

      ${accion.registroAfectadoDescripcion ? `
        <div style="margin-bottom: 16px;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #475569; font-size: 12px;">REGISTRO AFECTADO</p>
          <p style="margin: 0; color: #1E293B; padding: 12px; background: #F8FAFC; border-radius: 6px;">
            ${accion.registroAfectadoDescripcion}
          </p>
        </div>
      ` : ''}

      ${accion.direccionIP ? `
        <div style="margin-bottom: 16px;">
          <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569; font-size: 12px;">DIRECCIÓN IP</p>
          <p style="margin: 0; color: #1E293B; font-family: monospace; font-size: 13px;">
            ${accion.direccionIP}
          </p>
        </div>
      ` : ''}

      ${accion.datosAnteriores ? `
        <div style="margin-bottom: 16px;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #475569; font-size: 12px;">DATOS ANTERIORES</p>
          <pre style="margin: 0; padding: 12px; background: #F8FAFC; border-radius: 6px; overflow-x: auto; font-size: 11px; line-height: 1.4; color: #1E293B; border-left: 3px solid #F59E0B;">
${JSON.stringify(JSON.parse(accion.datosAnteriores), null, 2)}
          </pre>
        </div>
      ` : ''}

      ${accion.datosNuevos ? `
        <div style="margin-bottom: 16px;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #475569; font-size: 12px;">DATOS NUEVOS</p>
          <pre style="margin: 0; padding: 12px; background: #F8FAFC; border-radius: 6px; overflow-x: auto; font-size: 11px; line-height: 1.4; color: #1E293B; border-left: 3px solid #10B981;">
${JSON.stringify(JSON.parse(accion.datosNuevos), null, 2)}
          </pre>
        </div>
      ` : ''}
    `

    modal.style.display = 'flex'
  }

  closeDetailsModal() {
    const modal = document.getElementById('detalles-modal')
    if (modal) {
      modal.style.display = 'none'
    }
  }

  aplicarFiltros() {
    const usuarioInput = document.querySelector('.filter-usuario')
    const moduloSelect = document.querySelector('.filter-modulo')
    const tipoSelect = document.querySelector('.filter-tipo')
    const fechaInicio = document.querySelector('.filter-fecha-inicio')
    const fechaFin = document.querySelector('.filter-fecha-fin')

    this.filtros = {
      usuarioId: usuarioInput?.value || '',
      modulo: moduloSelect?.value || '',
      tipoAccion: tipoSelect?.value || '',
      fechaInicio: fechaInicio?.value || '',
      fechaFin: fechaFin?.value || ''
    }

    this.currentPage = 1
    this.loadAcciones()
  }

  limpiarFiltros() {
    this.filtros = {
      usuarioId: '',
      modulo: '',
      tipoAccion: '',
      fechaInicio: '',
      fechaFin: ''
    }

    const usuarioInput = document.querySelector('.filter-usuario')
    const moduloSelect = document.querySelector('.filter-modulo')
    const tipoSelect = document.querySelector('.filter-tipo')
    const fechaInicio = document.querySelector('.filter-fecha-inicio')
    const fechaFin = document.querySelector('.filter-fecha-fin')

    if (usuarioInput) usuarioInput.value = ''
    if (moduloSelect) moduloSelect.value = ''
    if (tipoSelect) tipoSelect.value = ''
    if (fechaInicio) fechaInicio.value = ''
    if (fechaFin) fechaFin.value = ''

    this.currentPage = 1
    this.loadAcciones()
  }
}
