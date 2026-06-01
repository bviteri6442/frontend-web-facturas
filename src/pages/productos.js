// Página de Productos con Paginación Avanzada
import { productoService } from '../services/productoService.js'
import { PaginationAdvanced } from '../components/PaginationAdvanced.js'
import { GlobalModal } from '../components/GlobalModal.js'
import Swal from 'sweetalert2'
import { uploadToCloudinary } from '../services/cloudinaryService.js'

const ITEMS_PER_PAGE = 10

export class Productos {
  constructor() {
    this.productos = []
    this.filteredProductos = []
    this.searchTerm = ''
    this.currentPage = 1
    this.itemsPerPage = ITEMS_PER_PAGE
    this.serverTotal = 0
    this.searchDebounce = null
    this.pagination = null
    this.loading = false
  }

  isAdmin() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}')
    return user.rol === 'Admin' || user.roleId === 1
  }

  render() {
    const isAdmin = this.isAdmin()
    return `
<div class="productos-page">
  <div class="page-header">
    <h1 class="page-title"><i class="fas fa-box"></i> Productos</h1>
    ${isAdmin ? `
      <button type="button" class="btn-add-producto btn btn-accent" title="Crear nuevo producto">
        <i class="fas fa-plus"></i> Nuevo producto
      </button>
    ` : ''}
  </div>

  <div class="card-panel">
    <div class="card-header">
      <input 
        type="text" 
        class="search-box" 
        placeholder="Buscar por nombre o descripción..."
      />
    </div>

    ${this.loading ? `
      <div style="padding: 40px; text-align: center; color: #64748B;">
        <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
        <p>Cargando productos...</p>
      </div>
    ` : `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th style="padding: 15px; text-align: center; font-weight: 600; color: #475569; font-size: 14px; width: 70px;">Imagen</th>
              <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569; font-size: 14px;">Nombre</th>
              <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569; font-size: 14px;">Descripción</th>
              <th style="padding: 15px; text-align: right; font-weight: 600; color: #475569; font-size: 14px;">Precio</th>
              <th style="padding: 15px; text-align: right; font-weight: 600; color: #475569; font-size: 14px;">IVA (%)</th>
              <th style="padding: 15px; text-align: right; font-weight: 600; color: #475569; font-size: 14px;">Stock</th>
              <th style="padding: 15px; text-align: center; font-weight: 600; color: #475569; font-size: 14px;">Estado</th>
              <th style="padding: 15px; text-align: center; font-weight: 600; color: #475569; font-size: 14px;">Creado</th>
              <th style="padding: 15px; text-align: center; font-weight: 600; color: #475569; font-size: 14px;">Modificado</th>
              ${isAdmin ? '<th style="padding: 15px; text-align: center; font-weight: 600; color: #475569; font-size: 14px;">Acciones</th>' : ''}
            </tr>
          </thead>
          <tbody id="productos-tbody">
            <tr><td colspan="${isAdmin ? 10 : 9}" style="padding: 40px; text-align: center; color: #64748B;">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
      <div id="pagination-container"></div>
    `}
  </div>
</div>
    `
  }

  init() {
    console.log('[PRODUCTOS] Inicializando...')
    this.loadProductos()
    this.setupEventListeners()
  }

  setupEventListeners() {
    console.log('[PRODUCTOS] Configurando event listeners...')
    
    const searchBox = document.querySelector('.search-box')
    const btnAdd = document.querySelector('.btn-add-producto')

    // Search
    if (searchBox) {
      searchBox.addEventListener('input', (e) => {
        this.searchTerm = e.target.value
        this.currentPage = 1
        clearTimeout(this.searchDebounce)
        this.searchDebounce = setTimeout(() => this.loadProductos(), 400)
      })
    }

    // Add button
    if (btnAdd) {
      console.log('[PRODUCTOS] btnAdd encontrado')
      btnAdd.addEventListener('click', (e) => {
        e.preventDefault()
        console.log('[PRODUCTOS] Click en Nuevo')
        this.openProductoModal()
      })
    }

    // Delegación de eventos en tbody para botones dinámicos (editar/eliminar)
    const tbody = document.getElementById('productos-tbody')
    if (tbody) {
      tbody.addEventListener('click', (e) => {
        const btnEdit = e.target.closest('.btn-edit-producto')
        const btnDelete = e.target.closest('.btn-delete-producto')
        if (btnEdit) {
          const id = btnEdit.getAttribute('data-id')
          console.log('[PRODUCTOS] Editando producto:', id)
          this.editProducto(id)
        } else if (btnDelete) {
          const id = btnDelete.getAttribute('data-id')
          console.log('[PRODUCTOS] Eliminando producto:', id)
          this.deleteProducto(id)
        }
      })
    }
  }

  async loadProductos() {
    this.loading = true
    try {
      console.log('[PRODUCTOS] Cargando página', this.currentPage, 'desde backend...')
      const result = await productoService.getPage({
        page: this.currentPage,
        limit: this.itemsPerPage,
        search: this.searchTerm
      })
      this.productos = result.productos
      this.filteredProductos = result.productos
      this.serverTotal = result.total
      console.log('[PRODUCTOS] Página:', this.productos.length, 'de', this.serverTotal)
      if (!this.pagination) this.setupPagination()
      this.updateTableAndPagination()
    } catch (error) {
      console.error('[PRODUCTOS] Error cargando:', error)
      this.productos = []
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar productos',
          text: error.message || 'Revisa .env.local y que el backend/ngrok esten activos.',
          confirmButtonColor: '#f05454'
        })
      }
    } finally {
      this.loading = false
    }
  }

  getPaginatedProductos() {
    return this.filteredProductos
  }

  setupPagination() {
    this.pagination = new PaginationAdvanced({
      currentPage: this.currentPage,
      totalPages: Math.ceil(this.serverTotal / this.itemsPerPage) || 1,
      totalItems: this.serverTotal,
      itemsPerPage: this.itemsPerPage,
      onChange: (page) => {
        this.currentPage = page
        this.loadProductos()
      }
    })
    
    window.pagination = this.pagination
  }

  renderPagination() {
    const container = document.getElementById('pagination-container')
    if (container && this.pagination) {
      this.pagination.update(this.serverTotal)
      container.innerHTML = this.pagination.render()
    }
  }

  updateTableAndPagination() {
    this.renderTable()
    this.renderPagination()
  }

  renderTable() {
    const isAdmin = this.isAdmin()
    const tbody = document.getElementById('productos-tbody')
    if (!tbody) return

    const paginatedProductos = this.getPaginatedProductos()
    
    if (paginatedProductos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${isAdmin ? 10 : 9}" style="padding: 40px; text-align: center; color: #64748B;">${this.productos.length === 0 ? 'No hay productos registrados' : 'No se encontraron resultados'}</td></tr>`
      return
    }

    // Función para formatear fechas
    const formatearFecha = (fecha) => {
      if (!fecha) return 'N/A'
      try {
        const date = new Date(fecha)
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' + 
               date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      } catch (e) {
        return 'N/A'
      }
    }

    let html = ''
    paginatedProductos.forEach(producto => {
      const stock = producto.stockActual || 0
      const stockBg = stock > 10 ? '#D1FAE5' : '#FEE2E2'
      const stockColor = stock > 10 ? '#065F46' : '#991B1B'
      const activoBg = producto.activo ? '#D1FAE5' : '#FEE2E2'
      const activoColor = producto.activo ? '#065F46' : '#991B1B'
      
      html += `<tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 10px 15px; text-align: center;">
          ${producto.imagenUrl
            ? `<img src="${producto.imagenUrl}" alt="${producto.nombre}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #E2E8F0;" onerror="this.style.display='none'">`
            : `<div style="width:48px;height:48px;border-radius:6px;background:#F1F5F9;border:1px solid #E2E8F0;display:inline-flex;align-items:center;justify-content:center;color:#94A3B8;"><i class="fas fa-image"></i></div>`}
        </td>
        <td style="padding: 15px; color: #1E293B; font-weight: 500;">${producto.nombre || 'N/A'}</td>
        <td style="padding: 15px; color: #64748B; font-size: 14px;">${producto.descripcion || 'N/A'}</td>
        <td style="padding: 15px; text-align: right; color: #1E293B;">$${(producto.precioVenta || 0).toFixed(2)}</td>
        <td style="padding: 15px; text-align: right; color: #1E293B;">${(producto.porcentajeIVA || 0).toFixed(2)}%</td>
        <td style="padding: 15px; text-align: right; color: #1E293B;">
          <span style="padding: 4px 8px; border-radius: 6px; background: ${stockBg}; color: ${stockColor}; font-weight: 600;">${stock}</span>
        </td>
        <td style="padding: 15px; text-align: center;">
          <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ${activoBg}; color: ${activoColor};">${producto.activo ? 'Activo' : 'Inactivo'}</span>
        </td>
        <td style="padding: 15px; text-align: center; color: #64748B; font-size: 13px;">${formatearFecha(producto.fechaCreacion)}</td>
        <td style="padding: 15px; text-align: center; color: #64748B; font-size: 13px;">${formatearFecha(producto.fechaActualizacion)}</td>`
      
      if (isAdmin) {
        html += `<td style="padding: 15px; text-align: center;">
          <button class="btn-edit-producto" data-id="${producto.id}" title="Editar producto" style="padding: 6px 12px; background: #F59E0B; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 5px; font-size: 12px; min-width: 90px; display: inline-flex; align-items: center; justify-content: center;">
            <i class="fas fa-edit" style="margin-right: 5px;"></i> Editar
          </button>
          <button class="btn-delete-producto" data-id="${producto.id}" title="Eliminar producto" style="padding: 6px 12px; background: #EF4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; min-width: 90px; display: inline-flex; align-items: center; justify-content: center;">
            <i class="fas fa-trash" style="margin-right: 5px;"></i> Eliminar
          </button>
        </td>`
      }
      
      html += `</tr>`
    })
    tbody.innerHTML = html
  }

  openProductoModal() {
    const modal = GlobalModal.getInstance()
    
    const formHTML = `
      <form id="productoForm" style="width: 100%;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Nombre: <span style="color:red">*</span></label>
          <input type="text" id="productoNombre" placeholder="Nombre del producto" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Código: <span style="color:red">*</span></label>
          <input type="text" id="productoCodigo" placeholder="Código único" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Descripción:</label>
          <textarea id="productoDescripcion" placeholder="Descripción del producto" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box; min-height: 60px;"></textarea>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Precio Compra: <span style="color:red">*</span></label>
            <input type="number" id="productoPrecioCosto" placeholder="Ej: 10.99 (máx 2 decimales)" step="0.01" min="0.01" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
            <small style="color: #64748B; font-size: 12px; display: block; margin-top: 3px;">Decimal positivo, máximo 2 decimales</small>
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Precio Venta: <span style="color:red">*</span></label>
            <input type="number" id="productoPrecio" placeholder="Ej: 19.99 (máx 2 decimales)" step="0.01" min="0.01" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
            <small style="color: #64748B; font-size: 12px; display: block; margin-top: 3px;">Decimal positivo, máximo 2 decimales</small>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Stock Inicial: <span style="color:red">*</span></label>
            <input type="number" id="productoStock" placeholder="Ej: 50 (solo números enteros)" min="0" step="1" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
            <small style="color: #64748B; font-size: 12px; display: block; margin-top: 3px;">Número entero positivo</small>
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Stock Mínimo:</label>
            <input type="number" id="productoStockMinimo" placeholder="0" min="0" value="0" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
            <small style="color: #64748B; display: block; margin-top: 3px;">Debe ser <= al Stock Inicial</small>
          </div>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">IVA (%):</label>
          <input type="number" id="productoIVA" placeholder="0" step="0.01" min="0" max="100" value="0" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #0F172A;">Imagen del producto (opcional):</label>
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div id="imgPreview" style="width: 72px; height: 72px; border-radius: 8px; border: 2px dashed #E2E8F0; display: flex; align-items: center; justify-content: center; background: #F8FAFC; overflow: hidden; flex-shrink: 0;">
              <i class="fas fa-image" style="font-size: 22px; color: #94A3B8;"></i>
            </div>
            <div style="flex: 1;">
              <input type="text" id="imagenUrl" placeholder="URL de imagen (https://...)" value="" style="width: 100%; padding: 8px 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box; margin-bottom: 6px; font-size: 13px;">
              <label for="imagenFile" style="display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; color: #475569;">
                <i class="fas fa-upload"></i> Subir archivo
              </label>
              <input type="file" id="imagenFile" accept="image/*" style="display: none;">
            </div>
          </div>
        </div>
        
        <!-- RESUMEN DE CÁLCULOS -->
        <div style="background: #F0F9FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
          <h4 style="margin: 0 0 10px 0; color: #1E40AF; font-size: 14px;">📊 Resumen de Cálculos</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
            <div>
              <label style="color: #475569; font-weight: 600;">Precio Compra:</label>
              <div id="resumenPrecioCosto" style="color: #1E293B; font-weight: 600;">$0.00</div>
            </div>
            <div>
              <label style="color: #475569; font-weight: 600;">Margen de Ganancia:</label>
              <div id="resumenMargen" style="color: #10B981; font-weight: 600;">$0.00 (0%)</div>
            </div>
            <div>
              <label style="color: #475569; font-weight: 600;">Precio Venta (sin IVA):</label>
              <div id="resumenPrecioVenta" style="color: #1E293B; font-weight: 600;">$0.00</div>
            </div>
            <div>
              <label style="color: #475569; font-weight: 600;">Monto IVA:</label>
              <div id="resumenIVA" style="color: #F59E0B; font-weight: 600;">$0.00</div>
            </div>
            <div style="grid-column: 1 / -1; border-top: 1px solid #BFDBFE; padding-top: 10px; margin-top: 5px;">
              <label style="color: #1E40AF; font-weight: 700;">PRECIO FINAL (con IVA):</label>
              <div id="resumenPrecioFinal" style="color: #1E40AF; font-weight: 700; font-size: 16px;">$0.00</div>
            </div>
          </div>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
          <button type="button" class="btn-cancel-producto-modal" style="padding: 10px 20px; background: #E2E8F0; color: #1E293B; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Cancelar</button>
          <button type="submit" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Guardar</button>
        </div>
      </form>
    `
    
    modal.open('Nuevo Producto', formHTML)
    
    setTimeout(() => {
      const form = document.getElementById('productoForm')
      const btnCancel = document.querySelector('.btn-cancel-producto-modal')
      
      // Campos para actualización de cálculos
      const productoPrecioCosto = document.getElementById('productoPrecioCosto')
      const productoPrecio = document.getElementById('productoPrecio')
      const productoIVA = document.getElementById('productoIVA')
      const productoStock = document.getElementById('productoStock')
      const productoStockMinimo = document.getElementById('productoStockMinimo')
      
      // Filtro en tiempo real para Stock (solo números enteros)
      if (productoStock) {
        productoStock.addEventListener('input', (e) => {
          // Remover cualquier cosa que no sea dígito
          let valor = e.target.value.replace(/[^0-9]/g, '')
          // Si contiene punto o coma, remover
          e.target.value = valor
        })
      }

      // Filtro en tiempo real para Stock Mínimo (solo números enteros)
      if (productoStockMinimo) {
        productoStockMinimo.addEventListener('input', (e) => {
          let valor = e.target.value.replace(/[^0-9]/g, '')
          e.target.value = valor
        })
      }

      // Filtro en tiempo real para Precio Costo (máximo 2 decimales)
      if (productoPrecioCosto) {
        productoPrecioCosto.addEventListener('input', (e) => {
          let valor = e.target.value
          // Permitir un punto y hasta 2 dígitos después del punto
          if (valor && !/^[0-9]*\.?[0-9]{0,2}$/.test(valor)) {
            // Si no cumple el patrón, restaurar último valor válido
            e.target.value = valor.substring(0, valor.length - 1)
          }
        })
      }

      // Filtro en tiempo real para Precio Venta (máximo 2 decimales)
      if (productoPrecio) {
        productoPrecio.addEventListener('input', (e) => {
          let valor = e.target.value
          // Permitir un punto y hasta 2 dígitos después del punto
          if (valor && !/^[0-9]*\.?[0-9]{0,2}$/.test(valor)) {
            e.target.value = valor.substring(0, valor.length - 1)
          }
        })
      }
      
      if (form) {
        form.addEventListener('submit', (e) => {
          console.log('[PRODUCTOS] Submit del formulario')
          this.saveProducto(e)
        })
      }
      
      if (btnCancel) {
        btnCancel.addEventListener('click', () => {
          console.log('[PRODUCTOS] Click en Cancelar')
          modal.close()
        })
      }
      
      // Actualizar cálculos cuando cambien los precios o IVA
      const actualizarCalculos = () => {
        const precioCosto = parseFloat(productoPrecioCosto?.value || 0)
        const precioVenta = parseFloat(productoPrecio?.value || 0)
        const iva = parseFloat(productoIVA?.value || 0)
        
        const margen = precioVenta - precioCosto
        const porcentajeMargen = precioCosto > 0 ? (margen / precioCosto) * 100 : 0
        const montoIVA = (precioVenta * iva) / 100
        const precioFinal = precioVenta + montoIVA
        
        document.getElementById('resumenPrecioCosto').textContent = `$${precioCosto.toFixed(2)}`
        document.getElementById('resumenMargen').textContent = `$${margen.toFixed(2)} (${porcentajeMargen.toFixed(1)}%)`
        document.getElementById('resumenPrecioVenta').textContent = `$${precioVenta.toFixed(2)}`
        document.getElementById('resumenIVA').textContent = `$${montoIVA.toFixed(2)}`
        document.getElementById('resumenPrecioFinal').textContent = `$${precioFinal.toFixed(2)}`
      }
      
      productoPrecioCosto?.addEventListener('change', actualizarCalculos)
      productoPrecio?.addEventListener('change', actualizarCalculos)
      productoIVA?.addEventListener('change', actualizarCalculos)
      
      // Actualizar también en tiempo real
      productoPrecioCosto?.addEventListener('input', actualizarCalculos)
      productoPrecio?.addEventListener('input', actualizarCalculos)
      productoIVA?.addEventListener('input', actualizarCalculos)

      // Manejo de imagen
      const imgUrlInput = document.getElementById('imagenUrl')
      const imgFileInput = document.getElementById('imagenFile')
      const imgPreview = document.getElementById('imgPreview')
      const refreshPreview = (src) => {
        if (!imgPreview) return
        if (src) {
          const img = document.createElement('img')
          img.src = src
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;'
          img.onerror = () => { imgPreview.innerHTML = '<i class="fas fa-image" style="font-size:22px;color:#94A3B8;"></i>' }
          imgPreview.innerHTML = ''
          imgPreview.appendChild(img)
        } else {
          imgPreview.innerHTML = '<i class="fas fa-image" style="font-size:22px;color:#94A3B8;"></i>'
        }
      }
      if (imgUrlInput?.value) refreshPreview(imgUrlInput.value)
      imgUrlInput?.addEventListener('input', (e) => refreshPreview(e.target.value.trim()))
      imgFileInput?.addEventListener('change', async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (imgFileInput) imgFileInput.disabled = true
        const label = imgFileInput?.closest('div')?.querySelector('label[for="imagenFile"]')
        if (label) label.textContent = 'Subiendo...'
        try {
          const url = await uploadToCloudinary(file)
          if (imgUrlInput) imgUrlInput.value = url
          refreshPreview(url)
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Error al subir imagen', text: err.message, confirmButtonColor: '#f05454' })
        } finally {
          if (imgFileInput) imgFileInput.disabled = false
          if (label) { label.innerHTML = '<i class="fas fa-upload"></i> Subir archivo' }
        }
      })
    }, 0)
    
    this.editingId = null
  }

  closeProductoModal() {
    const modal = GlobalModal.getInstance()
    modal.close()
  }

  async saveProducto(e) {
    e.preventDefault()
    const nombre = document.getElementById('productoNombre').value.trim()
    const codigoBarra = document.getElementById('productoCodigo')?.value.trim() || ''
    const descripcion = document.getElementById('productoDescripcion').value.trim()
    const precioVenta = parseFloat(document.getElementById('productoPrecio').value)
    const precioCosto = parseFloat(document.getElementById('productoPrecioCosto').value)
    const stockActual = parseInt(document.getElementById('productoStock').value) || 0
    const stockMinimo = parseInt(document.getElementById('productoStockMinimo').value) || 0
    const porcentajeIVA = parseFloat(document.getElementById('productoIVA')?.value || '0')
    const imagenUrl = document.getElementById('imagenUrl')?.value?.trim() || null

    // Validaciones
    if (!nombre || isNaN(precioVenta) || isNaN(precioCosto)) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Por favor completa Nombre, Precio de Venta y Precio de Costo.', confirmButtonColor: '#4ea93b' })
      return
    }

    // Validación: Precio de compra debe tener máximo 2 decimales
    if (!/^\d+(\.\d{1,2})?$/.test(precioCosto.toFixed(2))) {
      Swal.fire({ icon: 'warning', title: 'Precio Costo inválido', text: `El precio de compra debe tener máximo 2 decimales. Actual: ${precioCosto}`, confirmButtonColor: '#F59E0B' })
      return
    }

    // Validación: Precio de venta debe tener máximo 2 decimales
    if (!/^\d+(\.\d{1,2})?$/.test(precioVenta.toFixed(2))) {
      Swal.fire({ icon: 'warning', title: 'Precio Venta inválido', text: `El precio de venta debe tener máximo 2 decimales. Actual: ${precioVenta}`, confirmButtonColor: '#F59E0B' })
      return
    }

    // Validación: Stock debe ser número entero positivo
    if (!Number.isInteger(stockActual) || stockActual < 0) {
      Swal.fire({ icon: 'warning', title: 'Stock inválido', text: 'El stock debe ser un número entero positivo (sin decimales).', confirmButtonColor: '#F59E0B' })
      return
    }

    // Validación: Stock mínimo debe ser número entero positivo
    if (!Number.isInteger(stockMinimo) || stockMinimo < 0) {
      Swal.fire({ icon: 'warning', title: 'Stock Mínimo inválido', text: 'El stock mínimo debe ser un número entero positivo (sin decimales).', confirmButtonColor: '#F59E0B' })
      return
    }

    // Validación: Precio de compra no debe ser mayor que precio de venta
    if (precioCosto > precioVenta) {
      const result = await Swal.fire({
        icon: 'warning',
        title: '⚠️ Advertencia de Precio',
        html: `<p>El precio de compra ($${precioCosto.toFixed(2)}) es mayor que el precio de venta ($${precioVenta.toFixed(2)})</p><p>¿Estás seguro de continuar?</p>`,
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#F59E0B',
        cancelButtonColor: '#94A3B8'
      })
      if (!result.isConfirmed) return
    }

    // Validación: Stock mínimo debe estar entre 0 y stock inicial
    if (stockMinimo > stockActual) {
      Swal.fire({ icon: 'warning', title: 'Stock Inválido', text: `Stock mínimo (${stockMinimo}) no puede ser mayor que stock actual (${stockActual}).`, confirmButtonColor: '#4ea93b' })
      return
    }

    // Validación: Precio de venta negativo
    if (precioVenta < 0) {
      const result = await Swal.fire({
        icon: 'warning',
        title: '🎁 Oferta Especial',
        html: `<p>El precio de venta es <strong>$${precioVenta.toFixed(2)}</strong> (negativo)</p><p>¿Deseas dejar este precio? (Para rebajas o productos gratis)</p>`,
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar con este precio',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#94A3B8'
      })
      if (!result.isConfirmed) return
    }

    try {
      if (this.editingId) {
        const productoData = { nombre, descripcion, precioVenta, precioCosto, stockActual, stockMinimo, porcentajeIVA }
        await productoService.update(this.editingId, productoData)
        if (imagenUrl !== null) {
          try { await productoService.actualizarImagen(this.editingId, imagenUrl) } catch(e) { console.warn('[PRODUCTOS] Error actualizando imagen:', e) }
        }
        Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Producto actualizado exitosamente.', confirmButtonColor: '#10B981' })
      } else {
        if (!codigoBarra) {
          Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'El código de barra es requerido.', confirmButtonColor: '#4ea93b' })
          return
        }
        const productoData = { nombre, codigoBarra, descripcion, precioVenta, precioCosto, stockActual, stockMinimo, porcentajeIVA }
        const newId = await productoService.create(productoData)
        if (imagenUrl && newId) {
          try { await productoService.actualizarImagen(newId, imagenUrl) } catch(e) { console.warn('[PRODUCTOS] Error actualizando imagen:', e) }
        }
        Swal.fire({ icon: 'success', title: '¡Creado!', text: 'Producto creado exitosamente.', confirmButtonColor: '#10B981' })
      }
      this.closeProductoModal()
      this.loadProductos()
    } catch (error) {
      let errorMessage = 'Ocurrió un error al guardar el producto.'
      if (error.message) errorMessage = error.message
      else if (error.response?.data?.message) errorMessage = error.response.data.message
      else if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0]
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError
      }
      Swal.fire({ icon: 'error', title: 'Error al guardar', text: errorMessage, confirmButtonColor: '#f05454' })
      console.error('[saveProducto]', error)
    }
  }

  async editProducto(id) {
    const producto = this.productos.find(p => p.id == id)
    if (!producto) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Producto no encontrado.', confirmButtonColor: '#f05454' })
      return
    }

    const modal = GlobalModal.getInstance()
    
    const formHTML = `
      <form id="productoForm" style="width: 100%;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Nombre: <span style="color:red">*</span></label>
          <input type="text" id="productoNombre" placeholder="Nombre del producto" value="${producto.nombre || ''}" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Código:</label>
          <input type="text" id="productoCodigo" placeholder="Código único" value="${producto.codigoBarra || ''}" disabled style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box; background-color: #F1F5F9;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Descripción:</label>
          <textarea id="productoDescripcion" placeholder="Descripción del producto" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box; min-height: 60px;">${producto.descripcion || ''}</textarea>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Precio Compra: <span style="color:red">*</span></label>
            <input type="number" id="productoPrecioCosto" placeholder="0.00" step="0.01" min="0.01" value="${producto.precioCosto ?? ''}" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Precio Venta: <span style="color:red">*</span></label>
            <input type="number" id="productoPrecio" placeholder="0.00" step="0.01" min="0.01" value="${producto.precioVenta ?? ''}" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Stock:</label>
            <input type="number" id="productoStock" placeholder="0" min="0" value="${producto.stockActual || 0}" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Stock Mínimo:</label>
            <input type="number" id="productoStockMinimo" placeholder="0" min="0" value="${producto.stockMinimo || 0}" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
            <small style="color: #64748B; display: block; margin-top: 3px;">Debe ser <= al Stock</small>
          </div>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">IVA (%):</label>
          <input type="number" id="productoIVA" placeholder="0" step="0.01" min="0" max="100" value="${producto.porcentajeIVA || 0}" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #0F172A;">Imagen del producto (opcional):</label>
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div id="imgPreview" style="width: 72px; height: 72px; border-radius: 8px; border: 2px dashed #E2E8F0; display: flex; align-items: center; justify-content: center; background: #F8FAFC; overflow: hidden; flex-shrink: 0;">
              <i class="fas fa-image" style="font-size: 22px; color: #94A3B8;"></i>
            </div>
            <div style="flex: 1;">
              <input type="text" id="imagenUrl" placeholder="URL de imagen (https://...)" value="${producto.imagenUrl || ''}" style="width: 100%; padding: 8px 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box; margin-bottom: 6px; font-size: 13px;">
              <label for="imagenFile" style="display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; color: #475569;">
                <i class="fas fa-upload"></i> Subir archivo
              </label>
              <input type="file" id="imagenFile" accept="image/*" style="display: none;">
            </div>
          </div>
        </div>
        
        <!-- RESUMEN DE CÁLCULOS -->
        <div style="background: #F0F9FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
          <h4 style="margin: 0 0 10px 0; color: #1E40AF; font-size: 14px;">📊 Resumen de Cálculos</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
            <div>
              <label style="color: #475569; font-weight: 600;">Precio Compra:</label>
              <div id="resumenPrecioCosto" style="color: #1E293B; font-weight: 600;">$0.00</div>
            </div>
            <div>
              <label style="color: #475569; font-weight: 600;">Margen de Ganancia:</label>
              <div id="resumenMargen" style="color: #10B981; font-weight: 600;">$0.00 (0%)</div>
            </div>
            <div>
              <label style="color: #475569; font-weight: 600;">Precio Venta (sin IVA):</label>
              <div id="resumenPrecioVenta" style="color: #1E293B; font-weight: 600;">$0.00</div>
            </div>
            <div>
              <label style="color: #475569; font-weight: 600;">Monto IVA:</label>
              <div id="resumenIVA" style="color: #F59E0B; font-weight: 600;">$0.00</div>
            </div>
            <div style="grid-column: 1 / -1; border-top: 1px solid #BFDBFE; padding-top: 10px; margin-top: 5px;">
              <label style="color: #1E40AF; font-weight: 700;">PRECIO FINAL (con IVA):</label>
              <div id="resumenPrecioFinal" style="color: #1E40AF; font-weight: 700; font-size: 16px;">$0.00</div>
            </div>
          </div>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
          <button type="button" class="btn-cancel-producto-modal" style="padding: 10px 20px; background: #E2E8F0; color: #1E293B; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Cancelar</button>
          <button type="submit" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Actualizar</button>
        </div>
      </form>
    `
    
    modal.open('Editar Producto', formHTML)
    
    setTimeout(() => {
      const form = document.getElementById('productoForm')
      const btnCancel = document.querySelector('.btn-cancel-producto-modal')
      
      // Campos para actualización de cálculos
      const productoPrecioCosto = document.getElementById('productoPrecioCosto')
      const productoPrecio = document.getElementById('productoPrecio')
      const productoIVA = document.getElementById('productoIVA')
      
      if (form) {
        form.addEventListener('submit', (e) => {
          console.log('[PRODUCTOS] Submit del formulario de edición')
          this.saveProducto(e)
        })
      }
      
      if (btnCancel) {
        btnCancel.addEventListener('click', () => {
          console.log('[PRODUCTOS] Click en Cancelar')
          modal.close()
        })
      }
      
      // Actualizar cálculos cuando cambien los precios o IVA
      const actualizarCalculos = () => {
        const precioCosto = parseFloat(productoPrecioCosto?.value || 0)
        const precioVenta = parseFloat(productoPrecio?.value || 0)
        const iva = parseFloat(productoIVA?.value || 0)
        
        const margen = precioVenta - precioCosto
        const porcentajeMargen = precioCosto > 0 ? (margen / precioCosto) * 100 : 0
        const montoIVA = (precioVenta * iva) / 100
        const precioFinal = precioVenta + montoIVA
        
        document.getElementById('resumenPrecioCosto').textContent = `$${precioCosto.toFixed(2)}`
        document.getElementById('resumenMargen').textContent = `$${margen.toFixed(2)} (${porcentajeMargen.toFixed(1)}%)`
        document.getElementById('resumenPrecioVenta').textContent = `$${precioVenta.toFixed(2)}`
        document.getElementById('resumenIVA').textContent = `$${montoIVA.toFixed(2)}`
        document.getElementById('resumenPrecioFinal').textContent = `$${precioFinal.toFixed(2)}`
      }
      
      productoPrecioCosto?.addEventListener('change', actualizarCalculos)
      productoPrecio?.addEventListener('change', actualizarCalculos)
      productoIVA?.addEventListener('change', actualizarCalculos)
      
      // Actualizar también en tiempo real
      productoPrecioCosto?.addEventListener('input', actualizarCalculos)
      productoPrecio?.addEventListener('input', actualizarCalculos)
      productoIVA?.addEventListener('input', actualizarCalculos)
      
      // Calcular valores iniciales
      actualizarCalculos()

      // Manejo de imagen
      const imgUrlInput = document.getElementById('imagenUrl')
      const imgFileInput = document.getElementById('imagenFile')
      const imgPreview = document.getElementById('imgPreview')
      const refreshPreview = (src) => {
        if (!imgPreview) return
        if (src) {
          const img = document.createElement('img')
          img.src = src
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;'
          img.onerror = () => { imgPreview.innerHTML = '<i class="fas fa-image" style="font-size:22px;color:#94A3B8;"></i>' }
          imgPreview.innerHTML = ''
          imgPreview.appendChild(img)
        } else {
          imgPreview.innerHTML = '<i class="fas fa-image" style="font-size:22px;color:#94A3B8;"></i>'
        }
      }
      if (imgUrlInput?.value) refreshPreview(imgUrlInput.value)
      imgUrlInput?.addEventListener('input', (e) => refreshPreview(e.target.value.trim()))
      imgFileInput?.addEventListener('change', async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (imgFileInput) imgFileInput.disabled = true
        const label = imgFileInput?.closest('div')?.querySelector('label[for="imagenFile"]')
        if (label) label.textContent = 'Subiendo...'
        try {
          const url = await uploadToCloudinary(file)
          if (imgUrlInput) imgUrlInput.value = url
          refreshPreview(url)
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Error al subir imagen', text: err.message, confirmButtonColor: '#f05454' })
        } finally {
          if (imgFileInput) imgFileInput.disabled = false
          if (label) { label.innerHTML = '<i class="fas fa-upload"></i> Subir archivo' }
        }
      })
    }, 0)
    
    this.editingId = id
  }

  async deleteProducto(id) {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f05454',
      cancelButtonColor: '#94A3B8'
    })

    if (!result.isConfirmed) return

    try {
      await productoService.delete(id)
      Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Producto eliminado exitosamente.', confirmButtonColor: '#10B981' })
      this.loadProductos()
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#f05454' })
      console.error(error)
    }
  }
}
