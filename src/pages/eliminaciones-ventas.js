// Página de Facturas Eliminadas
import { ventaService } from '../services/ventaService.js'
import { PaginationAdvanced } from '../components/PaginationAdvanced.js'
import Swal from 'sweetalert2'

const ITEMS_PER_PAGE = 10

export class EliminacionesVentas {
  constructor() {
    this.eliminadas = []
    this.filtradas = []
    this.searchTerm = ''
    this.currentPage = 1
    this.itemsPerPage = ITEMS_PER_PAGE
    this.pagination = null
  }

  render() {
    return `
      <div style="padding: 20px;">
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
          <h1 class="page-title" style="font-size: 28px; color: #1E293B; margin: 0;">
            <i class="fas fa-trash-restore" style="margin-right: 10px; color: #EF4444;"></i>
            Facturas Eliminadas
          </h1>
        </div>

        <div id="statsVentas" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px;"></div>

        <div class="card" style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
          <div class="card-header" style="padding: 20px; border-bottom: 1px solid #E2E8F0;">
            <input 
              type="text" 
              class="search-box" 
              placeholder="Buscar por número de factura o cliente..."
              style="width: 100%; padding: 10px 15px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
            />
          </div>

          <div class="table-container" style="overflow-x: auto;">
            <table class="table" style="width: 100%; border-collapse: collapse;">
              <thead style="background: #F8FAFC; border-bottom: 2px solid #E2E8F0;">
                <tr>
                  <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569; font-size: 14px;">Número Factura</th>
                  <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569; font-size: 14px;">Cliente</th>
                  <th style="padding: 15px; text-align: center; font-weight: 600; color: #475569; font-size: 14px;">Fecha Eliminación</th>
                  <th style="padding: 15px; text-align: right; font-weight: 600; color: #475569; font-size: 14px;">Total</th>
                  <th style="padding: 15px; text-align: center; font-weight: 600; color: #475569; font-size: 14px;">Acciones</th>
                </tr>
              </thead>
              <tbody id="ventas-eliminadas-tbody">
                <tr><td colspan="5" style="padding: 40px; text-align: center; color: #64748B;">Cargando...</td></tr>
              </tbody>
            </table>
          </div>
          <div id="pagination-container"></div>
        </div>
      </div>

      <!-- Modal de Detalles -->
      <div id="detalles-modal-elim" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
        <div style="background: white; border-radius: 12px; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 25px rgba(0,0,0,0.15);">
          <div style="padding: 24px; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center;">
            <h2 id="modal-title-elim" style="margin: 0; color: #1E293B; font-size: 20px;"></h2>
            <button id="close-modal-elim" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #64748B;">×</button>
          </div>
          <div id="modal-content-elim" style="padding: 24px;"></div>
          <div style="padding: 16px 24px; border-top: 1px solid #E2E8F0; display: flex; gap: 10px; justify-content: flex-end;">
            <button id="modal-close-btn-elim" style="padding: 8px 16px; background: #E2E8F0; color: #1E293B; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Cerrar</button>
            <button id="modal-pdf-btn-elim" style="padding: 8px 16px; background: #EC4899; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;"><i class="fas fa-file-pdf" style="margin-right: 5px;"></i>Descargar PDF</button>
            <button id="modal-reinsertar-btn" style="padding: 8px 16px; background: #10B981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;"><i class="fas fa-redo" style="margin-right: 5px;"></i>Reinsertar</button>
          </div>
        </div>
      </div>
    `
  }

  init() {
    console.log('[ELIM-VENTAS] Inicializando...')
    this.loadEliminadas()
    
    setTimeout(() => {
      const searchBox = document.querySelector('.search-box')
      if (searchBox) {
        searchBox.addEventListener('input', (e) => {
          this.searchTerm = e.target.value
          this.currentPage = 1
          this.filterVentas()
          this.updateTableAndPagination()
        })
      }

      // Event listeners para Modal
      const closeBtn = document.getElementById('close-modal-elim')
      const closeBtnFooter = document.getElementById('modal-close-btn-elim')
      const modal = document.getElementById('detalles-modal-elim')
      
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

      this.attachButtonListeners()
    }, 100)
  }

  attachButtonListeners() {
    // Botones Ver
    document.querySelectorAll('.btn-view-elim-venta').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault()
        const ventaId = btn.getAttribute('data-id')
        if (ventaId && ventaId !== 'undefined') {
          await this.showVentaDetails(ventaId)
        }
      })
    })

    // Botones Reinsertar
    document.querySelectorAll('.btn-reinsertar-venta').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault()
        const ventaId = btn.getAttribute('data-id')
        if (ventaId && ventaId !== 'undefined') {
          await this.reinsertar(ventaId)
        }
      })
    })
  }

  async showVentaDetails(ventaId) {
    try {
      console.log('[ELIM-VENTAS] Obteniendo detalles:', ventaId)
      const venta = await ventaService.getById(ventaId)
      
      if (!venta) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar los detalles' })
        return
      }

      this.showDetailsModal(venta)
    } catch (error) {
      console.error('[ELIM-VENTAS] Error:', error)
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar los detalles' })
    }
  }

  showDetailsModal(venta) {
    const modal = document.getElementById('detalles-modal-elim')
    const title = document.getElementById('modal-title-elim')
    const content = document.getElementById('modal-content-elim')
    const pdfBtn = document.getElementById('modal-pdf-btn-elim')
    const reinsertatBtn = document.getElementById('modal-reinsertar-btn')

    title.textContent = `Factura: ${venta.numeroFactura || 'N/A'}`

    // Formatear fechas
    const fecha = venta.fechaVenta
    const fechaFormato = fecha ? new Date(fecha).toLocaleDateString('es-EC', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A'

    // Generar tabla de detalles
    const detallesHTML = venta.detalles && venta.detalles.length > 0 
      ? `<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead style="background: #F8FAFC; border-bottom: 2px solid #E2E8F0;">
            <tr>
              <th style="padding: 10px; text-align: left; font-weight: 600;">Producto</th>
              <th style="padding: 10px; text-align: center; font-weight: 600;">Cantidad</th>
              <th style="padding: 10px; text-align: right; font-weight: 600;">Precio Unit.</th>
              <th style="padding: 10px; text-align: center; font-weight: 600;">Descuento</th>
              <th style="padding: 10px; text-align: right; font-weight: 600;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${venta.detalles.map(d => `
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 10px;">${d.productoNombre || 'N/A'}</td>
                <td style="padding: 10px; text-align: center;">${d.cantidad || 0}</td>
                <td style="padding: 10px; text-align: right;">$${(d.precioUnitario || 0).toFixed(2)}</td>
                <td style="padding: 10px; text-align: center;">${d.descuento || 0}%</td>
                <td style="padding: 10px; text-align: right; font-weight: 600;">$${(d.total || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>`
      : '<p style="color: #64748B;">Sin detalles de productos</p>'

    content.innerHTML = `
      <div style="margin-bottom: 20px; background: #FEE2E2; padding: 12px; border-radius: 6px; border-left: 4px solid #EF4444;">
        <p style="margin: 0; color: #991B1B; font-size: 13px;">
          <i class="fas fa-info-circle" style="margin-right: 6px;"></i>
          Esta factura está marcada como eliminada
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <p style="margin: 8px 0;"><strong>Fecha:</strong> ${fechaFormato}</p>
        <p style="margin: 8px 0;"><strong>Cliente:</strong> ${venta.clienteNombre || 'Consumidor Final'}</p>
        <p style="margin: 8px 0;"><strong>Usuario:</strong> ${venta.usuarioNombre || 'N/A'}</p>
      </div>

      <h3 style="color: #1E293B; margin: 16px 0 8px 0;">Productos:</h3>
      ${detallesHTML}

      <div style="background: #F8FAFC; padding: 16px; border-radius: 8px; margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
          <span>Subtotal:</span>
          <span>$${(venta.subtotal || 0).toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
          <span>IVA (${venta.porcentajeIVA || 0}%):</span>
          <span>$${(venta.totalImpuesto || 0).toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 12px 0; font-size: 18px; font-weight: 700; color: #1E293B; border-top: 2px solid #E2E8F0; padding-top: 12px;">
          <span>TOTAL:</span>
          <span>$${(venta.totalVenta || 0).toFixed(2)}</span>
        </div>
      </div>

      ${venta.observaciones ? `
        <div style="margin-top: 16px; background: #FFF8DC; padding: 12px; border-radius: 8px; border-left: 4px solid #F59E0B;">
          <p style="margin: 0; color: #92400E;"><strong>Observaciones:</strong></p>
          <p style="margin: 8px 0 0 0; color: #92400E;">${venta.observaciones}</p>
        </div>
      ` : ''}
    `

    if (pdfBtn) {
      const ventaId = venta.ventaId || venta.id
      const numeroFactura = venta.numeroFactura
      pdfBtn.onclick = () => this.downloadPDF(ventaId, numeroFactura)
    }

    if (reinsertatBtn) {
      const ventaId = venta.ventaId || venta.id
      reinsertatBtn.onclick = () => this.reinsertar(ventaId)
    }

    modal.style.display = 'flex'
  }

  closeDetailsModal() {
    const modal = document.getElementById('detalles-modal-elim')
    if (modal) {
      modal.style.display = 'none'
    }
  }

  async downloadPDF(ventaId, numeroFactura = 'Factura') {
    try {
      Swal.fire({ title: 'Descargando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
      const success = await ventaService.downloadPDFById(ventaId, numeroFactura)
      Swal.close()
      if (success) {
        Swal.fire({ icon: 'success', title: 'Éxito', text: 'PDF descargado correctamente' })
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo descargar el PDF' })
      }
    } catch (error) {
      Swal.close()
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al descargar el PDF' })
    }
  }

  async reinsertar(ventaId) {
    try {
      const { isConfirmed } = await Swal.fire({
        icon: 'question',
        title: '¿Reinsertar factura?',
        text: 'Se reactivará la factura y se reducirá el stock nuevamente. ¿Deseas continuar?',
        confirmButtonText: 'Sí, reinsertar',
        cancelButtonText: 'Cancelar',
        showCancelButton: true
      })

      if (!isConfirmed) return

      Swal.fire({ title: 'Reinsertando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
      const result = await ventaService.reinsertar(ventaId)
      Swal.close()

      if (result) {
        Swal.fire({ icon: 'success', title: 'Éxito', text: 'Factura reinsertada correctamente' })
        this.closeDetailsModal()
        this.loadEliminadas()
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo reinsertar la factura' })
      }
    } catch (error) {
      Swal.close()
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Error al reinsertar la factura' })
    }
  }

  async loadEliminadas() {
    try {
      console.log('[ELIM-VENTAS] Cargando facturas eliminadas...')
      const ventas = await ventaService.getEliminadas()
      
      if (Array.isArray(ventas)) {
        this.eliminadas = ventas.sort((a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta))
      } else {
        this.eliminadas = []
      }

      console.log('[ELIM-VENTAS] Cargadas:', this.eliminadas.length)
      this.filterVentas()
      this.setupPagination()
      this.renderStats()
      this.updateTableAndPagination()
    } catch (error) {
      console.error('[ELIM-VENTAS] Error cargando:', error)
      this.eliminadas = []
    }
  }

  filterVentas() {
    if (!this.searchTerm.trim()) {
      this.filtradas = [...this.eliminadas]
    } else {
      const term = this.searchTerm.toLowerCase()
      this.filtradas = this.eliminadas.filter(v =>
        v.numeroFactura?.includes(term) ||
        v.clienteNombre?.toLowerCase().includes(term)
      )
    }
  }

  getPaginatedVentas() {
    const start = (this.currentPage - 1) * this.itemsPerPage
    const end = start + this.itemsPerPage
    return this.filtradas.slice(start, end)
  }

  setupPagination() {
    this.pagination = new PaginationAdvanced({
      currentPage: 1,
      totalPages: Math.ceil(this.filtradas.length / this.itemsPerPage) || 1,
      totalItems: this.filtradas.length,
      itemsPerPage: this.itemsPerPage,
      onChange: (page) => {
        this.currentPage = page
        this.updateTableAndPagination()
      }
    })
  }

  renderPagination() {
    const container = document.getElementById('pagination-container')
    if (container && this.pagination) {
      this.pagination.update(this.filtradas.length)
      container.innerHTML = this.pagination.render()
    }
  }

  renderStats() {
    const container = document.getElementById('statsVentas')
    if (!container) return

    const total = this.eliminadas.length
    const hoy = new Date().toDateString()
    const hoyCount = this.eliminadas.filter(e => new Date(e.fechaVenta).toDateString() === hoy).length
    const semana = new Date()
    semana.setDate(semana.getDate() - 7)
    const semanaCount = this.eliminadas.filter(e => new Date(e.fechaVenta) >= semana).length

    container.innerHTML = `
      <div style="background: white; border-radius: 10px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 15px;">
        <div style="width: 44px; height: 44px; border-radius: 10px; background: #FEE2E2; display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-trash" style="color: #EF4444; font-size: 1.1rem;"></i>
        </div>
        <div>
          <div style="font-size: 1.5rem; font-weight: 700; color: #0F172A;">${total}</div>
          <div style="font-size: 0.8rem; color: #64748B;">Total Eliminadas</div>
        </div>
      </div>
      <div style="background: white; border-radius: 10px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 15px;">
        <div style="width: 44px; height: 44px; border-radius: 10px; background: #FEF3C7; display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-calendar-day" style="color: #F59E0B; font-size: 1.1rem;"></i>
        </div>
        <div>
          <div style="font-size: 1.5rem; font-weight: 700; color: #0F172A;">${hoyCount}</div>
          <div style="font-size: 0.8rem; color: #64748B;">Hoy</div>
        </div>
      </div>
      <div style="background: white; border-radius: 10px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 15px;">
        <div style="width: 44px; height: 44px; border-radius: 10px; background: #DCFCE7; display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-calendar-week" style="color: #10B981; font-size: 1.1rem;"></i>
        </div>
        <div>
          <div style="font-size: 1.5rem; font-weight: 700; color: #0F172A;">${semanaCount}</div>
          <div style="font-size: 0.8rem; color: #64748B;">Esta Semana</div>
        </div>
      </div>
    `
  }

  renderTable() {
    const tbody = document.getElementById('ventas-eliminadas-tbody')
    if (!tbody) return

    const paginatedVentas = this.getPaginatedVentas()
    
    if (paginatedVentas.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="padding: 40px; text-align: center; color: #64748B;">${this.eliminadas.length === 0 ? 'No hay facturas eliminadas' : 'No se encontraron resultados'}</td></tr>`
      return
    }

    tbody.innerHTML = paginatedVentas.map(venta => {
      const ventaId = venta.ventaId || venta.id
      const numeroFactura = venta.numeroFactura
      const fecha = venta.fechaVenta
      const total = venta.totalVenta || 0
      const clienteNombre = venta.clienteNombre || 'Consumidor Final'
      
      return `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 15px; color: #1E293B; font-weight: 600;">${numeroFactura}</td>
        <td style="padding: 15px; color: #1E293B;">${clienteNombre}</td>
        <td style="padding: 15px; text-align: center; color: #64748B; font-size: 14px;">${fecha ? new Date(fecha).toLocaleDateString('es-EC') : 'N/A'}</td>
        <td style="padding: 15px; text-align: right; color: #1E293B; font-weight: 600;">$${total.toFixed(2)}</td>
        <td style="padding: 15px; text-align: center;">
          <button class="btn-view-elim-venta" data-id="${ventaId}" title="Ver detalles" style="padding: 6px 12px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 5px; font-size: 12px; min-width: 90px; display: inline-flex; align-items: center; justify-content: center;">
            <i class="fas fa-eye" style="margin-right: 5px;"></i> Ver
          </button>
          <button class="btn-reinsertar-venta" data-id="${ventaId}" title="Reinsertar factura" style="padding: 6px 12px; background: #10B981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; min-width: 90px; display: inline-flex; align-items: center; justify-content: center;">
            <i class="fas fa-redo" style="margin-right: 5px;"></i> Reinsertar
          </button>
        </td>
      </tr>
    `}).join('')
  }

  updateTableAndPagination() {
    this.renderTable()
    this.renderPagination()
    setTimeout(() => this.attachButtonListeners(), 50)
  }
}
