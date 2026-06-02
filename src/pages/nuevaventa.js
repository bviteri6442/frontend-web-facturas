import { ventaService } from '../services/ventaService.js'
import { clienteService } from '../services/clienteService.js'
import { productoService } from '../services/productoService.js'
import { showErrorAlert, showSuccessAlert } from '../utils/errorHandler.js'
import Swal from 'sweetalert2'

const IVA_PERCENTAGE = 0.19

export class NuevaVenta {
  constructor() {
    this.clientes = []
    this.productos = []
    this.filteredProductos = []  // ← IGUAL QUE CLIENTES
    this.detalles = []
    this.clienteSeleccionado = null
    this.filteredClientes = []
    this.precioProductoSeleccionado = null
    
    // Paginación
    this.clientesPaginaActual = 1
    this.clientesTotalServidor = 0
    this.clientesSearchTerm = ''
    this.clientesSearchType = 'todos' // 'todos', 'nombre', 'documento', 'telefono', 'correo'
    
    this.productosPaginaActual = 1
    this.itemsPorPagina = 10
    this.searchingProductos = false
    this.terminoBusquedaProductos = ''
    this.productosSearchType = 'todos' // 'todos', 'nombre', 'codigo', 'categoria'
    this.productosSearchDebounce = null
  }



  render() {
    return `
      <div style="padding: 2rem;">
        <div class="page-header">
          <h1 class="page-title" style="font-size: 28px; color: #1E293B; margin: 0;">
            <i class="fas fa-file-invoice"></i> Nueva Venta/Factura
          </h1>
        </div>

        <div class="card" style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
          <div style="padding: 20px; border-bottom: 1px solid #E2E8F0;">
            <h2 style="margin: 0; color: #1E293B; font-size: 20px;">Crear Nueva Venta</h2>
          </div>
          
          <form id="ventaForm" style="display: grid; gap: 1.5rem; padding: 2rem;">
            
            <!-- Datos del Cliente -->
            <div style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 1.5rem;">
              <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; color: #1E293B;">Datos del Cliente <span style="color: red;">*</span></h3>
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; align-items: flex-end;">
                <div>
                  <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #0F172A;">Cliente</label>
                  <button type="button" id="btnAbrirClientesModal" style="width: 100%; padding: 0.75rem; border: 1px solid #4ea93b; background: white; color: #4ea93b; border-radius: 6px; font-size: 14px; box-sizing: border-box; font-weight: 600; cursor: pointer;">
                    <i class="fas fa-user"></i> Seleccionar Cliente
                  </button>
                </div>
                <div>
                  <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #0F172A;">Fecha</label>
                  <input type="date" id="fechaVenta" 
                         style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;">
                </div>
              </div>
              <div id="clienteSeleccionado" style="margin-top: 1rem; padding: 1rem; background: #eef8ec; border-radius: 6px; border-left: 4px solid #4ea93b; display: none;">
                <p style="margin: 0; color: #1E293B; font-weight: 600;"><strong>Seleccionado:</strong> <span id="clienteNombre"></span></p>
              </div>
            </div>

            <!-- Agregar Productos -->
            <div style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 1.5rem;">
              <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; color: #1E293B;">Agregar Productos <span style="color: red;">*</span></h3>
              <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 0.75rem; margin-bottom: 1rem;">
                <div>
                  <button type="button" id="btnAbrirProductosModal" style="width: 100%; padding: 0.75rem; border: 1px solid #4ea93b; background: white; color: #4ea93b; border-radius: 6px; font-size: 14px; box-sizing: border-box; font-weight: 600; cursor: pointer;">
                    <i class="fas fa-list"></i> Seleccionar Producto
                  </button>
                </div>
                <div>
                  <input type="number" id="cantidadInput" placeholder="Cantidad" min="1" value="1"
                         style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
                </div>
                <div>
                  <input type="number" id="precioInput" placeholder="Precio" min="0" step="0.01" value="0" readonly
                         style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 14px; box-sizing: border-box; background: #F8FAFC; color: #64748B; cursor: default;">
                </div>
                <button type="button" id="addProductBtn" style="padding: 0.75rem 1.5rem; background: #4ea93b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <div id="productoSeleccionadoInfo" style="padding: 1rem; background: #eef8ec; border-radius: 6px; border-left: 4px solid #4ea93b; display: none;">
                <p style="margin: 0; color: #1E293B; font-weight: 600;"><i class="fas fa-check-circle" style="color: #4ea93b; margin-right: 8px;"></i>Producto: <span id="productoSeleccionadoNombre"></span></p>
              </div>
            </div>

            <!-- Detalle de Productos -->
            <div style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 1.5rem; overflow-x: auto;">
              <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; color: #1E293B;">Detalle de Productos</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0;">
                    <th style="padding: 0.75rem; text-align: left; font-weight: 600; color: #475569;">Producto</th>
                    <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #475569;">Cantidad</th>
                    <th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #475569;">Precio Unit.</th>
                    <th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #475569;">Subtotal</th>
                    <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #475569;">Acción</th>
                  </tr>
                </thead>
                <tbody id="productosTable">
                  <tr>
                    <td colspan="5" style="padding: 1rem; text-align: center; color: #64748B;">
                      Sin productos agregados
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Totales -->
            <div style="background-color: #F8FAFC; border-radius: 8px; padding: 1.5rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
              <div style="text-align: right;">
                <p style="color: #64748B; margin: 0 0 0.25rem 0; font-size: 14px;">Subtotal:</p>
                <p style="font-size: 1.5rem; font-weight: 700; margin: 0; color: #1E293B;">$<span id="subtotal">0.00</span></p>
              </div>
              <div style="text-align: right;">
                <p style="color: #64748B; margin: 0 0 0.25rem 0; font-size: 14px;">IVA (19%):</p>
                <p style="font-size: 1.5rem; font-weight: 700; margin: 0; color: #1E293B;">$<span id="iva">0.00</span></p>
              </div>
              <div style="text-align: right;">
                <p style="color: #64748B; margin: 0 0 0.25rem 0; font-size: 14px;">Total:</p>
                <p style="font-size: 1.5rem; font-weight: 700; margin: 0; color: #10B981;">$<span id="total">0.00</span></p>
              </div>
            </div>

            <!-- Observaciones -->
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #0F172A;">Observaciones</label>
              <textarea id="observaciones" placeholder="Notas adicionales..." rows="3"
                        style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box; font-family: inherit; resize: vertical;"></textarea>
            </div>

            <!-- Botones -->
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
              <button type="button" id="cancelBtn" style="padding: 0.75rem 1.5rem; background: #E2E8F0; color: #1E293B; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Cancelar
              </button>
              <button type="submit" style="padding: 0.75rem 1.5rem; background: #10B981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-save"></i> Guardar Venta
              </button>
            </div>
          </form>
        </div>
      </div>
    `
  }

  async loadClientes(search) {
    const term = search !== undefined ? search : this.clientesSearchTerm
    try {
      const { data, total } = await clienteService.getPage({
        page: this.clientesPaginaActual,
        limit: this.itemsPorPagina,
        search: term,
        activo: true
      })
      this.clientes = data
      this.filtrarClientesModal() // Aplicar filtrado local
      this.clientesTotalServidor = total
      console.log('[NuevaVenta] Clientes cargados:', this.clientes.length, 'de', total)
    } catch (error) {
      console.error('[NuevaVenta] Error cargando clientes:', error)
      this.clientes = []
      this.filteredClientes = []
    }
  }

  async loadProductos(search = '') {
    try {
      const result = await productoService.getPage({
        page: 1,
        limit: 200,
        search
      })
      const todos = result.productos || []
      this.productos = todos.filter(p => (p.stockActual || 0) > 0)
      this.filtrarProductosModal()
      console.log('[NuevaVenta] Productos cargados (con stock):', this.productos.length)
    } catch (error) {
      console.error('[NuevaVenta] Error cargando productos:', error)
      this.productos = []
    }
  }

  renderClientesSimpleList() {
    const container = document.getElementById('clientesListContainer')
    if (!container) return

    const clientesAMostrar = this.filteredClientes
    const totalPaginas = Math.ceil(this.clientesTotalServidor / this.itemsPorPagina) || 1
    
    if (clientesAMostrar.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: #64748B; padding: 20px;">No hay clientes</div>'
      return
    }

    let html = '<div class="pick-list" id="clientesGrid">'
    html += clientesAMostrar.map(c => `
      <div class="pick-list-item" data-cliente-id="${c.id}" role="button" tabindex="0">
        <strong>${c.nombre} ${c.apellido || ''}</strong>
        <span>${c.documento || c.cedula || 'Sin documento'}</span>
      </div>
    `).join('')
    html += '</div>'

    html += `<div class="pagination-controls" style="justify-content:center;margin-top:0.5rem">`
    html += `<button type="button" class="pag-btn pag-btn--primary" id="btnPrevClientes" ${this.clientesPaginaActual === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i> Anterior</button>`
    html += `<span class="pagination-info" style="margin:0">Página ${this.clientesPaginaActual} de ${totalPaginas}</span>`
    html += `<button type="button" class="pag-btn pag-btn--primary" id="btnNextClientes" ${this.clientesPaginaActual === totalPaginas ? 'disabled' : ''}>Siguiente <i class="fas fa-chevron-right"></i></button>`
    html += `</div>`

    container.innerHTML = html
    
    // Event listeners para paginación
    const btnPrev = document.getElementById('btnPrevClientes')
    const btnNext = document.getElementById('btnNextClientes')

    if (btnPrev && !btnPrev.disabled) {
      btnPrev.addEventListener('click', async () => {
        this.clientesPaginaActual--
        await this.loadClientes(this.clientesSearchTerm)
        this.renderClientesSimpleList()
      })
    }

    if (btnNext && !btnNext.disabled) {
      btnNext.addEventListener('click', async () => {
        this.clientesPaginaActual++
        await this.loadClientes(this.clientesSearchTerm)
        this.renderClientesSimpleList()
      })
    }
    
    // Event listeners para seleccionar cliente
    container.querySelectorAll('div[data-cliente-id]').forEach(item => {
      item.addEventListener('click', () => {
        const clienteId = item.getAttribute('data-cliente-id')
        const cliente = this.filteredClientes.find(c => c.id == clienteId)
        if (cliente) {
          this.clienteSeleccionado = cliente
          document.getElementById('clienteNombre').textContent = cliente.nombre + ' ' + (cliente.apellido || '') + ' - ' + (cliente.documento || cliente.cedula || '')
          document.getElementById('clienteSeleccionado').style.display = 'block'
          Swal.close()
        }
      })
    })
  }

  async filterClientes(busqueda) {
    this.clientesSearchTerm = busqueda.trim()
    this.clientesPaginaActual = 1
    await this.loadClientes(this.clientesSearchTerm)
  }

  // Filtrar clientes según el tipo de búsqueda seleccionado (sin recargar desde backend)
  filtrarClientesModal() {
    if (!this.clientesSearchTerm.trim()) {
      this.filteredClientes = [...this.clientes]
      return
    }

    const term = this.clientesSearchTerm.toLowerCase()

    this.filteredClientes = this.clientes.filter(cliente => {
      switch (this.clientesSearchType) {
        case 'nombre':
          const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.toLowerCase()
          return nombreCompleto.includes(term)
        
        case 'documento':
          const documento = (cliente.documento || cliente.cedula || '').toString().toLowerCase()
          return documento.includes(term)
        
        case 'telefono':
          const telefono = (cliente.telefono || '').toString().toLowerCase()
          return telefono.includes(term)
        
        case 'correo':
          const correo = (cliente.email || cliente.correo || '').toLowerCase()
          return correo.includes(term)
        
        case 'todos':
        default:
          const nombreComp = `${cliente.nombre || ''} ${cliente.apellido || ''}`.toLowerCase()
          const doc = (cliente.documento || cliente.cedula || '').toString().toLowerCase()
          const tel = (cliente.telefono || '').toString().toLowerCase()
          const mail = (cliente.email || cliente.correo || '').toLowerCase()
          return nombreComp.includes(term) || doc.includes(term) || tel.includes(term) || mail.includes(term)
      }
    })
  }

  filtrarProductosModal() {
    if (!this.terminoBusquedaProductos.trim()) {
      this.filteredProductos = [...this.productos]
      return
    }

    const term = this.terminoBusquedaProductos.toLowerCase()

    this.filteredProductos = this.productos.filter(producto => {
      switch (this.productosSearchType) {
        case 'nombre':
          return (producto.nombre || '').toLowerCase().includes(term)
        
        case 'codigo':
          return (producto.codigo || '').toLowerCase().includes(term)
        
        case 'categoria':
          return (producto.categoria || '').toLowerCase().includes(term)
        
        case 'todos':
        default:
          const nombre = (producto.nombre || '').toLowerCase()
          const codigo = (producto.codigo || '').toLowerCase()
          const categoria = (producto.categoria || '').toLowerCase()
          return nombre.includes(term) || codigo.includes(term) || categoria.includes(term)
      }
    })
  }

  async openClientesModal() {
    const modalHTML = `
      <div style="width: 100%; max-height: 500px; overflow-y: auto;">
        <div style="display: grid; grid-template-columns: 130px 1fr; gap: 0.75rem; margin-bottom: 15px;">
          <div>
            <label style="display: block; margin-bottom: 0.35rem; font-weight: 600; font-size: 0.8rem; color: #475569;">Buscar por:</label>
            <select id="searchClientesModalType" style="width: 100%; padding: 0.5rem 0.7rem; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 0.85rem; background: #fff; cursor: pointer; box-sizing: border-box;">
              <option value="todos">Todos</option>
              <option value="nombre">Nombre</option>
              <option value="documento">Documento</option>
              <option value="telefono">Teléfono</option>
              <option value="correo">Correo</option>
            </select>
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.35rem; font-weight: 600; font-size: 0.8rem; color: #475569;">Búsqueda:</label>
            <input type="text" id="searchClientesModal" placeholder="Ingresa tu búsqueda..." 
                   style="width: 100%; padding: 0.5rem 0.7rem; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 0.85rem; box-sizing: border-box;"/>
          </div>
        </div>
        <div id="clientesListContainer"></div>
      </div>
    `

    this.clientesPaginaActual = 1
    this.clientesSearchTerm = ''
    this.clientesSearchType = 'todos'

    await Swal.fire({
      title: 'Seleccionar Cliente',
      html: modalHTML,
      width: '500px',
      didOpen: async (modal) => {
        await this.loadClientes()
        this.renderClientesSimpleList()
        
        const searchTypeSelect = document.getElementById('searchClientesModalType')
        const searchInput = document.getElementById('searchClientesModal')
        
        // Listener para cambio de tipo de búsqueda
        if (searchTypeSelect) {
          searchTypeSelect.addEventListener('change', (e) => {
            this.clientesSearchType = e.target.value
            this.clientesPaginaActual = 1
            this.filtrarClientesModal()
            this.renderClientesSimpleList()
          })
        }
        
        // Listener para búsqueda
        if (searchInput) {
          let debounce
          searchInput.addEventListener('input', (e) => {
            clearTimeout(debounce)
            debounce = setTimeout(() => {
              this.clientesSearchTerm = e.target.value
              this.clientesPaginaActual = 1
              this.filtrarClientesModal()
              this.renderClientesSimpleList()
            }, 400)
          })

          // Evento de Enter para crear cliente si no existe
          searchInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
              const busqueda = searchInput.value.trim()
              if (busqueda === '') return

              // Verificar si existe un cliente con ese búsqueda
              const clienteExistente = this.clientes.find(c =>
                (c.nombre && c.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
                (c.documento && c.documento === busqueda) ||
                (c.cedula && c.cedula === busqueda)
              )

              if (!clienteExistente && this.filteredClientes.length === 0) {
                // Cliente no existe, preguntar si quiere crear uno
                const result = await Swal.fire({
                  icon: 'question',
                  title: 'Cliente no encontrado',
                  html: `<p>No se encontró un cliente con el criterio: <strong>${busqueda}</strong></p><p>¿Deseas registrar un nuevo cliente?</p>`,
                  showCancelButton: true,
                  confirmButtonText: 'Sí, registrar cliente',
                  cancelButtonText: 'No, cancelar',
                  confirmButtonColor: '#4ea93b',
                  cancelButtonColor: '#94A3B8'
                })

                if (result.isConfirmed) {
                  Swal.close()
                  await this.openClienteModal()
                }
              }
            }
          })
        }
      },
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: true
    })
  }


  async addDetalle() {
    const rawVal = parseFloat(document.getElementById('cantidadInput').value)
    const cantidad = (isFinite(rawVal) && rawVal >= 1) ? Math.floor(rawVal) : 1
    const productoInfo = document.getElementById('productoSeleccionadoInfo')

    // Validaciones
    if (!this.precioProductoSeleccionado) {
      showErrorAlert(new Error('Producto no seleccionado'), 'Error', 'Por favor seleccione un producto')
      return
    }

    if (cantidad <= 0) {
      showErrorAlert(new Error('Cantidad inválida'), 'Error', 'La cantidad debe ser mayor a 0')
      return
    }

    const producto = this.precioProductoSeleccionado
    const precio = producto.precio || 0

    if (precio <= 0) {
      showErrorAlert(new Error('Precio inválido'), 'Error', 'El precio debe ser mayor a 0')
      return
    }

    // Validar stock disponible antes de agregar
    const stockDisponible = producto.stockActual || 0
    const cantidadYaEnCarrito = this.detalles.find(d => d.productoId === producto.id)?.cantidad || 0
    const cantidadTotal = cantidadYaEnCarrito + cantidad

    if (stockDisponible <= 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Sin stock disponible',
        html: `El producto <b>${producto.nombre}</b> no tiene stock disponible.`,
        confirmButtonColor: '#f05454',
        confirmButtonText: 'Entendido'
      })
      return
    }

    if (cantidadTotal > stockDisponible) {
      await Swal.fire({
        icon: 'warning',
        title: 'Stock insuficiente',
        html: `Stock disponible para <b>${producto.nombre}</b>: <b>${stockDisponible}</b> unidades.<br>${cantidadYaEnCarrito > 0 ? `Ya tienes <b>${cantidadYaEnCarrito}</b> en el carrito. ` : ''}No puedes agregar <b>${cantidad}</b> más.`,
        confirmButtonColor: '#F59E0B',
        confirmButtonText: 'Entendido'
      })
      return
    }

    // Verificar si el producto ya existe en los detalles
    const detalleExistente = this.detalles.find(d => d.productoId === producto.id)
    
    if (detalleExistente) {
      // Si existe, incrementar la cantidad
      detalleExistente.cantidad += cantidad
      detalleExistente.subtotal = detalleExistente.cantidad * detalleExistente.precioUnitario
    } else {
      // Si no existe, agregarlo como nuevo detalle
      const detalle = {
        productoId: producto.id,
        productoNombre: producto.nombre,
        cantidad: cantidad,
        precioUnitario: precio,
        subtotal: cantidad * precio,
        porcentajeIVA: producto.porcentajeIVA || 0
      }
      this.detalles.push(detalle)
    }

    this.updateDetallesTable()
    this.calcularTotales()

    // Limpiar inputs
    const cantInputClean = document.getElementById('cantidadInput')
    cantInputClean.value = '1'
    cantInputClean.removeAttribute('max')
    document.getElementById('precioInput').value = '0'
    document.getElementById('productoSeleccionadoNombre').textContent = ''
    productoInfo.style.display = 'none'
    this.precioProductoSeleccionado = null
  }

  async removeDetalle(index) {
    const detalle = this.detalles[index]
    if (!detalle) return

    // Mostrar confirmación con SweetAlert
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      html: `¿Deseas eliminar <b>${detalle.productoNombre}</b> (Cantidad: <b>${detalle.cantidad}</b>)<br>Subtotal: <b>$${detalle.subtotal.toFixed(2)}</b>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f05454',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    })
    if (result.isConfirmed) {
      this.detalles.splice(index, 1)
      this.updateDetallesTable()
      this.calcularTotales()
    }
  }

  async editDetalle(index) {
    const detalle = this.detalles[index]
    if (!detalle) return

    const { value: nuevaCantidad } = await Swal.fire({
      title: `Editar Cantidad - ${detalle.productoNombre}`,
      input: 'number',
      inputValue: detalle.cantidad,
      inputAttributes: {
        min: 1,
        step: 1,
        placeholder: 'Ingrese la nueva cantidad'
      },
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4ea93b',
      cancelButtonColor: '#94A3B8',
      inputValidator: (value) => {
        if (!value || parseInt(value) < 1) {
          return 'La cantidad debe ser mayor a 0'
        }
      }
    })

    if (nuevaCantidad) {
      detalle.cantidad = parseInt(nuevaCantidad)
      detalle.subtotal = detalle.cantidad * detalle.precioUnitario
      this.updateDetallesTable()
      this.calcularTotales()
    }
  }

  updateDetallesTable() {
    const tbody = document.getElementById('productosTable')
    if (this.detalles.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="padding: 1rem; text-align: center; color: #64748B;">Sin productos agregados</td></tr>'
      return
    }

    tbody.innerHTML = this.detalles.map((detalle, index) => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 0.75rem; color: #1E293B;">${detalle.productoNombre}</td>
        <td style="padding: 0.75rem; text-align: center; color: #1E293B;">${detalle.cantidad}</td>
        <td style="padding: 0.75rem; text-align: right; color: #1E293B;">$${detalle.precioUnitario.toFixed(2)}</td>
        <td style="padding: 0.75rem; text-align: right; color: #1E293B; font-weight: 600;">$${detalle.subtotal.toFixed(2)}</td>
        <td style="padding: 0.75rem; text-align: center;">
          <button type="button" class="btn-edit" data-index="${index}" style="background: #4ea93b; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 0.5rem;">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button type="button" class="btn-remove" data-index="${index}" style="background: #EF4444; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 12px;">
            <i class="fas fa-trash"></i> Quitar
          </button>
        </td>
      </tr>
    `).join('')

    // Agregar event listeners a botones de quitar
    tbody.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault()
        const index = parseInt(btn.getAttribute('data-index'))
        await this.removeDetalle(index)
      })
    })

    // Agregar event listeners a botones de editar
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        const index = parseInt(btn.getAttribute('data-index'))
        this.editDetalle(index)
      })
    })
  }

  calcularTotales() {
    const subtotal = this.detalles.reduce((sum, d) => sum + d.subtotal, 0)
    const iva = subtotal * IVA_PERCENTAGE
    const total = subtotal + iva

    document.getElementById('subtotal').textContent = subtotal.toFixed(2)
    document.getElementById('iva').textContent = iva.toFixed(2)
    document.getElementById('total').textContent = total.toFixed(2)
  }

  async saveVenta() {
    try {
      // Validaciones
      if (!this.clienteSeleccionado) {
        const result = await Swal.fire({
          icon: 'warning',
          title: 'Cliente no seleccionado',
          html: '<p>No has seleccionado un cliente. ¿Deseas registrar un nuevo cliente?</p>',
          showCancelButton: true,
          confirmButtonText: 'Registrar nuevo cliente',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#4ea93b',
          cancelButtonColor: '#94A3B8'
        })
        
        if (result.isConfirmed) {
          // Abrir modal de creación de cliente
          await this.openClienteModal()
        }
        return
      }

      if (this.detalles.length === 0) {
        showErrorAlert(new Error('Sin productos'), 'Error', 'Debe agregar al least un producto a la venta')
        return
      }

      // Crear DTO de venta
      const ventaData = {
        clienteId: this.clienteSeleccionado.id,
        detalles: this.detalles.map(d => ({
          productoId: d.productoId,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          descuento: 0
        })),
        observaciones: document.getElementById('observaciones').value.trim() || null
      }

      console.log('[NuevaVenta] Guardando venta:', ventaData)

      const result = await ventaService.create(ventaData)
      console.log('[NuevaVenta] Resultado de crear venta:', result)
      
      // Verificar si la venta se creó (result puede ser 0, un objeto, o truthy)
      if (result !== null && result !== undefined) {
        // Calcular totales
        const subtotal = this.detalles.reduce((sum, d) => sum + d.subtotal, 0)
        const iva = subtotal * IVA_PERCENTAGE
        const total = subtotal + iva

        // Generar tabla de productos
        const productosHtml = this.detalles.map(d =>
          `<tr>
            <td style='padding:4px 8px;'>${d.productoNombre}</td>
            <td style='padding:4px 8px; text-align:center;'>${d.cantidad}</td>
            <td style='padding:4px 8px; text-align:right;'>$${d.precioUnitario.toFixed(2)}</td>
            <td style='padding:4px 8px; text-align:right;'>$${d.subtotal.toFixed(2)}</td>
          </tr>`
        ).join('')

        // Resumen HTML
        const resumenHtml = `
          <div style='text-align:left;'>
            <p style='margin-bottom:8px;'><b>Cliente:</b> ${this.clienteSeleccionado?.nombre || ''}</p>
            <p style='margin-bottom:8px;'><b>Número Factura:</b> ${result.numeroFactura || '(pendiente)'}</p>
            <table style='width:100%; border-collapse:collapse; margin-bottom:10px;'>
              <thead>
                <tr style='background:#F8FAFC;'>
                  <th style='padding:4px 8px; text-align:left;'>Producto</th>
                  <th style='padding:4px 8px; text-align:center;'>Cantidad</th>
                  <th style='padding:4px 8px; text-align:right;'>Precio Unit.</th>
                  <th style='padding:4px 8px; text-align:right;'>Subtotal</th>
                </tr>
              </thead>
              <tbody>${productosHtml}</tbody>
            </table>
            <p style='margin-bottom:4px;'><b>Subtotal:</b> $${subtotal.toFixed(2)}</p>
            <p style='margin-bottom:4px;'><b>IVA (19%):</b> $${iva.toFixed(2)}</p>
            <p style='margin-bottom:8px;'><b>Total:</b> $${total.toFixed(2)}</p>
            ${ventaData.observaciones ? `<p style='margin-bottom:0;'><b>Observaciones:</b> ${ventaData.observaciones}</p>` : ''}
          </div>
        `

        const confirmResult = await Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          html: `<div style='margin-bottom:10px;'>Venta creada${result.numeroFactura ? ': <b>' + result.numeroFactura + '</b>' : ''}</div>${resumenHtml}`,
          confirmButtonText: 'Ir a Ventas',
          confirmButtonColor: '#10B981',
          showDenyButton: true,
          denyButtonText: '<i class="fas fa-plus"></i> Nueva Venta',
          denyButtonColor: '#4ea93b',
          allowOutsideClick: false,
          allowEscapeKey: false,
          width: 600
        })

        // Redirigir después de que el usuario haga clic
        if (confirmResult.isConfirmed) {
          console.log('[NuevaVenta] Redirigiendo a ventas...')
          if (window.router) {
            window.router.navigateTo('ventas')
          } else {
            window.location.href = '#/ventas'
          }
        } else if (confirmResult.isDenied) {
          // Limpiar el formulario para una nueva venta
          this.detalles = []
          this.clienteSeleccionado = null
          this.precioProductoSeleccionado = null
          this.updateDetallesTable()
          this.calcularTotales()
          document.getElementById('clienteNombre').textContent = ''
          document.getElementById('clienteSeleccionado').style.display = 'none'
          document.getElementById('productoSeleccionadoNombre').textContent = ''
          document.getElementById('productoSeleccionadoInfo').style.display = 'none'
          document.getElementById('cantidadInput').value = 1
          document.getElementById('precioInput').value = '0'
          document.getElementById('observaciones').value = ''
          const today = new Date().toISOString().split('T')[0]
          document.getElementById('fechaVenta').value = today
        }
      } else {
        showErrorAlert(new Error('Error desconocido'), 'Error', 'No se pudo crear la venta')
      }
    } catch (error) {
      console.error('[NuevaVenta] Error completo guardando venta:', error)
      console.error('[NuevaVenta] error.message:', error?.message)
      console.error('[NuevaVenta] error.response:', error?.response)
      console.error('[NuevaVenta] error.response.data:', error?.response?.data)

      const msg = error?.message || ''
      const stockMatch = msg.match(/Stock insuficiente para (.+?)\. Disponible:\s*(\d+),\s*Solicitado:\s*(\d+)/i)

      if (stockMatch) {
        const nombreProducto = stockMatch[1]
        const disponible = parseInt(stockMatch[2])
        const solicitado = parseInt(stockMatch[3])

        const result = await Swal.fire({
          icon: 'warning',
          title: 'Stock insuficiente',
          html: `El stock de <b>${nombreProducto}</b> cambió mientras preparabas la venta.<br><br>
                 Disponible: <b style="color:#10B981;">${disponible}</b> &nbsp;|&nbsp; Solicitado: <b style="color:#EF4444;">${solicitado}</b><br><br>
                 ¿Deseas quitar este producto del carrito para continuar?`,
          showCancelButton: true,
          confirmButtonText: '<i class="fas fa-trash"></i> Quitar del carrito',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#f05454',
          cancelButtonColor: '#64748B'
        })

        if (result.isConfirmed) {
          const idx = this.detalles.findIndex(d =>
            d.productoNombre?.toLowerCase() === nombreProducto.toLowerCase()
          )
          if (idx !== -1) {
            this.detalles.splice(idx, 1)
            this.updateDetallesTable()
            this.calcularTotales()
            Swal.fire({
              icon: 'info',
              title: 'Producto quitado',
              text: `"${nombreProducto}" fue removido del carrito. Puedes continuar con los demás productos.`,
              confirmButtonColor: '#4ea93b',
              timer: 3000,
              timerProgressBar: true
            })
          }
        }
      } else {
        showErrorAlert(error, 'Error al guardar venta', 'No se pudo crear la venta')
      }
    }
  }

  async openClienteModal() {
    const formHTML = `
      <form id="clienteFormModal" style="width: 100%;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Nombre: <span style="color:red">*</span></label>
          <input type="text" id="nuevoClienteNombre" placeholder="Nombre del cliente" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Apellido: <span style="color:red">*</span></label>
          <input type="text" id="nuevoClienteApellido" placeholder="Apellido del cliente" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Cédula: <span style="color:red">*</span></label>
          <input type="text" id="nuevoClienteCedula" placeholder="Cédula de identidad" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
          <div id="cedulaError" style="color: #EF4444; font-size: 13px; margin-top: 5px; display: none;"></div>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Email:</label>
          <input type="email" id="nuevoClienteEmail" placeholder="email@ejemplo.com" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
          <div id="emailError" style="color: #EF4444; font-size: 13px; margin-top: 5px; display: none;"></div>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Teléfono:</label>
          <input type="text" id="nuevoClienteTelefono" placeholder="Número de teléfono" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
          <button type="button" id="btnCancelarCliente" style="padding: 10px 20px; background: #E2E8F0; color: #1E293B; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Cancelar</button>
          <button type="submit" style="padding: 10px 20px; background: #4ea93b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Guardar Cliente</button>
        </div>
      </form>
    `

    const { value: confirmed } = await Swal.fire({
      title: 'Registrar Nuevo Cliente',
      html: formHTML,
      icon: 'info',
      didOpen: (modal) => {
        const form = document.getElementById('clienteFormModal')
        const btnCancel = document.getElementById('btnCancelarCliente')
        const cedulaErrorDiv = document.getElementById('cedulaError')
        const emailErrorDiv = document.getElementById('emailError')
        const emailInput = document.getElementById('nuevoClienteEmail')
        
        if (btnCancel) {
          btnCancel.addEventListener('click', () => {
            Swal.close()
          })
        }

        // Validación de email en tiempo real
        if (emailInput) {
          emailInput.addEventListener('blur', () => {
            const email = emailInput.value.trim()
            if (email && !this.isValidEmail(email)) {
              emailErrorDiv.textContent = 'Formato de email inválido'
              emailErrorDiv.style.display = 'block'
            } else {
              emailErrorDiv.style.display = 'none'
              emailErrorDiv.textContent = ''
            }
          })
        }

        if (form) {
          form.addEventListener('submit', async (e) => {
            e.preventDefault()
            
            const nombre = document.getElementById('nuevoClienteNombre').value.trim()
            const apellido = document.getElementById('nuevoClienteApellido').value.trim()
            const cedula = document.getElementById('nuevoClienteCedula').value.trim()
            const email = document.getElementById('nuevoClienteEmail').value.trim()
            const telefono = document.getElementById('nuevoClienteTelefono').value.trim()

            // Limpiar errores anteriores
            cedulaErrorDiv.style.display = 'none'
            cedulaErrorDiv.textContent = ''
            emailErrorDiv.style.display = 'none'
            emailErrorDiv.textContent = ''

            if (!nombre || !apellido || !cedula) {
              Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Por favor completa Nombre, Apellido y Cédula.', confirmButtonColor: '#4ea93b' })
              return
            }

            // Validar email si está presente
            if (email && !this.isValidEmail(email)) {
              emailErrorDiv.textContent = 'Formato de email inválido'
              emailErrorDiv.style.display = 'block'
              return
            }

            try {
              const nuevoCliente = await clienteService.create({
                nombre,
                apellido,
                documento: cedula,
                email: email || null,
                telefono: telefono || null
              })

              if (nuevoCliente) {
                // Agregar el nuevo cliente a la lista
                this.clientes.push(nuevoCliente)
                this.clienteSeleccionado = nuevoCliente
                document.getElementById('clienteInput').value = nuevoCliente.nombre + ' ' + (nuevoCliente.apellido || '')
                document.getElementById('clienteNombre').textContent = nuevoCliente.nombre + ' ' + (nuevoCliente.apellido || '') + ' - ' + (nuevoCliente.documento || '')
                document.getElementById('clienteSeleccionado').style.display = 'block'
                
                Swal.close()
                Swal.fire({
                  icon: 'success',
                  title: '¡Éxito!',
                  text: 'Cliente registrado correctamente',
                  confirmButtonColor: '#10B981'
                })
              }
            } catch (error) {
              console.error('[NuevaVenta] Error al crear cliente:', error)
              // Mostrar error debajo del campo correspondiente
              if (error.message.includes('email')) {
                emailErrorDiv.textContent = error.message || 'Error con el email'
                emailErrorDiv.style.display = 'block'
              } else if (error.message.includes('cedula') || error.message.includes('documento')) {
                cedulaErrorDiv.textContent = error.message || 'Error con la cédula'
                cedulaErrorDiv.style.display = 'block'
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: error.message || 'No se pudo crear el cliente',
                  confirmButtonColor: '#f05454'
                })
              }
            }
          })
        }
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false
    })
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  renderProductosSimpleList() {
    const container = document.getElementById('productosListContainer')
    if (!container) return

    // Usar filtered o todos los productos
    const productosAFiltrar = this.searchingProductos ? this.filteredProductos : this.productos
    const totalProductos = productosAFiltrar.length
    const totalPaginas = Math.ceil(totalProductos / this.itemsPorPagina) || 1
    const inicio = (this.productosPaginaActual - 1) * this.itemsPorPagina
    const fin = inicio + this.itemsPorPagina
    const productosAMostrar = productosAFiltrar.slice(inicio, fin)
    
    if (totalProductos === 0) {
      const termino = this.terminoBusquedaProductos
      container.innerHTML = `
        <div style="text-align: center; color: #64748B; padding: 20px;">
          <p style="margin-bottom: 12px;">No se encontró ningún producto con "<strong>${termino}</strong>"</p>
          <button type="button" id="btnCrearProductoDesdeModal" style="padding: 8px 18px; background: #4ea93b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            <i class="fas fa-plus"></i> Registrar "${termino}" como nuevo producto
          </button>
        </div>`
      const btnCrear = document.getElementById('btnCrearProductoDesdeModal')
      if (btnCrear) {
        btnCrear.addEventListener('click', async () => {
          Swal.close()
          await this.openProductoModal(termino)
        })
      }
      return
    }

    let html = '<div id="productosGrid" style="margin-bottom: 15px;">'
    html += productosAMostrar.map(p => {
      const imgHtml = p.imagenUrl
        ? `<img src="${p.imagenUrl}" alt="${p.nombre}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 6px; flex-shrink: 0; border: 1px solid #E2E8F0;">`
        : `<div style="width: 56px; height: 56px; border-radius: 6px; background: #F1F5F9; border: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i class="fas fa-box" style="color: #94A3B8; font-size: 22px;"></i></div>`
      const stockColor = (p.stockActual || 0) > 0 ? '#10B981' : '#EF4444'
      return `
      <div data-producto-id="${p.id}" style="padding: 0.6rem 0.75rem; margin-bottom: 0.5rem; border: 1px solid #E2E8F0; border-radius: 8px; background: white; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; min-height: 4rem;"
           onmouseover="this.style.background='#eef8ec'; this.style.borderColor='#4ea93b';" 
           onmouseout="this.style.background='white'; this.style.borderColor='#E2E8F0';">
        ${imgHtml}
        <div style="flex: 1; min-width: 0; text-align: left;">
          <strong style="display: block; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.nombre}</strong>
          <small style="color: #64748B; display: block; margin: 2px 0 0 0; line-height: 1.3;">
            $${(p.precio || 0).toFixed(2)} &nbsp;|&nbsp; IVA: ${(p.porcentajeIVA || 0).toFixed(2)}% &nbsp;|&nbsp; Stock: <span style="color: ${stockColor}; font-weight: 600;">${p.stockActual || 0}</span>
          </small>
        </div>
      </div>`
    }).join('')
    html += '</div>'

    // Controles de paginación
    html += `<div style="display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-top: 15px;">`
    html += `<button type="button" id="btnPrevProductos" style="padding: 0.5rem 1rem; background: ${this.productosPaginaActual === 1 ? '#E2E8F0' : '#4ea93b'}; color: ${this.productosPaginaActual === 1 ? '#94A3B8' : 'white'}; border: none; border-radius: 4px; cursor: ${this.productosPaginaActual === 1 ? 'not-allowed' : 'pointer'}; font-weight: 600;" ${this.productosPaginaActual === 1 ? 'disabled' : ''}>← Anterior</button>`
    html += `<span style="color: #64748B; font-weight: 600; min-width: 120px; text-align: center;">Página ${this.productosPaginaActual} de ${totalPaginas}</span>`
    html += `<button type="button" id="btnNextProductos" style="padding: 0.5rem 1rem; background: ${this.productosPaginaActual === totalPaginas ? '#E2E8F0' : '#4ea93b'}; color: ${this.productosPaginaActual === totalPaginas ? '#94A3B8' : 'white'}; border: none; border-radius: 4px; cursor: ${this.productosPaginaActual === totalPaginas ? 'not-allowed' : 'pointer'}; font-weight: 600;" ${this.productosPaginaActual === totalPaginas ? 'disabled' : ''}>Siguiente →</button>`
    html += `</div>`

    container.innerHTML = html

    // Event listeners para paginación
    const btnPrev = document.getElementById('btnPrevProductos')
    const btnNext = document.getElementById('btnNextProductos')

    if (btnPrev && !btnPrev.disabled) {
      btnPrev.addEventListener('click', () => {
        this.productosPaginaActual--
        this.renderProductosSimpleList()
      })
    }

    if (btnNext && !btnNext.disabled) {
      btnNext.addEventListener('click', () => {
        this.productosPaginaActual++
        this.renderProductosSimpleList()
      })
    }
    
    // Event listeners para seleccionar producto
    container.querySelectorAll('div[data-producto-id]').forEach(item => {
      item.addEventListener('click', () => {
        const productoId = item.getAttribute('data-producto-id')
        const producto = this.productos.find(p => p.id == productoId)
        if (producto) {
          this.precioProductoSeleccionado = producto
          document.getElementById('precioInput').value = (producto.precio || 0).toFixed(2)
          const cantInput = document.getElementById('cantidadInput')
          cantInput.value = 1
          cantInput.max = producto.stockActual || 0
          document.getElementById('productoSeleccionadoNombre').textContent = producto.nombre + ` ($${(producto.precio || 0).toFixed(2)}) — Stock: ${producto.stockActual || 0}`
          document.getElementById('productoSeleccionadoInfo').style.display = 'block'
          Swal.close()
        }
      })
    })
  }

  filterProductos(busqueda) {
    const termino = busqueda.toLowerCase().trim()
    this.terminoBusquedaProductos = busqueda.trim()
    if (termino === '') {
      this.filteredProductos = []
      this.searchingProductos = false
      this.productosPaginaActual = 1
      return
    }
    this.searchingProductos = true
    this.filteredProductos = this.productos.filter(p =>
      (p.nombre && p.nombre.toLowerCase().includes(termino)) ||
      (p.codigoBarra && p.codigoBarra.toLowerCase().includes(termino))
    )
    this.productosPaginaActual = 1
  }

  async openProductosModal() {
    const modalHTML = `
      <div style="width: 100%; max-height: 500px; overflow-y: auto;">
        <div style="display: grid; grid-template-columns: 150px 1fr; gap: 1rem; margin-bottom: 1rem; align-items: flex-end;">
          <div>
            <label style="display: block; margin-bottom: 0.35rem; font-weight: 600; font-size: 0.8rem; color: #475569;">Buscar por:</label>
            <select id="searchProductosModalType" style="width: 100%; padding: 0.5rem 0.7rem; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 0.85rem; background: #fff; cursor: pointer; box-sizing: border-box;">
              <option value="todos">Todos</option>
              <option value="nombre">Nombre</option>
              <option value="codigo">Código</option>
              <option value="categoria">Categoría</option>
            </select>
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.35rem; font-weight: 600; font-size: 0.8rem; color: #475569;">Búsqueda:</label>
            <input type="text" id="searchProductosModal" placeholder="Ingresa tu búsqueda..."
                   style="width: 100%; padding: 0.5rem 0.7rem; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 0.85rem; outline: none; box-sizing: border-box;"/>
          </div>
        </div>
        <div id="productosListContainer"></div>
      </div>
    `

    this.productosPaginaActual = 1
    this.filteredProductos = []
    this.searchingProductos = false
    this.terminoBusquedaProductos = ''
    this.productosSearchType = 'todos'

    // Recargar stock real antes de abrir
    await this.loadProductos()

    await Swal.fire({
      title: 'Seleccionar Producto',
      html: modalHTML,
      width: '500px',
      didOpen: () => {
        this.renderProductosSimpleList()
        
        // Listener para cambio de tipo de búsqueda
        const searchTypeSelect = document.getElementById('searchProductosModalType')
        if (searchTypeSelect) {
          searchTypeSelect.addEventListener('change', (e) => {
            this.productosSearchType = e.target.value
            this.filtrarProductosModal()
            this.renderProductosSimpleList()
          })
        }
        
        // Listener para búsqueda
        const searchInput = document.getElementById('searchProductosModal')
        if (searchInput) {
          searchInput.addEventListener('input', (e) => {
            this.terminoBusquedaProductos = e.target.value
            clearTimeout(this.productosSearchDebounce)
            this.productosSearchDebounce = setTimeout(() => {
              this.filtrarProductosModal()
              this.renderProductosSimpleList()
            }, 400)
          })
        }
      },
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: true
    })
  }

  async openProductoModal(nombrePredefinido = '') {
    const formHTML = `
      <form id="productoFormModal" style="width: 100%;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Nombre: <span style="color:red">*</span></label>
          <input type="text" id="nuevoProductoNombre" placeholder="Nombre del producto" value="${nombrePredefinido}" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Precio: <span style="color:red">*</span></label>
          <input type="number" id="nuevoProductoPrecio" placeholder="Precio de venta" min="0" step="0.01" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">IVA (%):</label>
          <input type="number" id="nuevoProductoIVA" placeholder="Porcentaje IVA" min="0" max="100" step="0.01" value="19" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Código (opcional):</label>
          <input type="text" id="nuevoProductoCodigo" placeholder="Código o SKU" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Descripción (opcional):</label>
          <textarea id="nuevoProductoDescripcion" placeholder="Descripción del producto" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box; resize: vertical; min-height: 60px;"></textarea>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
          <button type="button" id="btnCancelarProducto" style="padding: 10px 20px; background: #E2E8F0; color: #1E293B; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Cancelar</button>
          <button type="submit" style="padding: 10px 20px; background: #4ea93b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Guardar Producto</button>
        </div>
      </form>
    `

    const { value: confirmed } = await Swal.fire({
      title: 'Registrar Nuevo Producto',
      html: formHTML,
      icon: 'info',
      didOpen: (modal) => {
        const form = document.getElementById('productoFormModal')
        const btnCancel = document.getElementById('btnCancelarProducto')
        
        if (btnCancel) {
          btnCancel.addEventListener('click', () => {
            Swal.close()
          })
        }

        if (form) {
          form.addEventListener('submit', async (e) => {
            e.preventDefault()
            
            const nombre = document.getElementById('nuevoProductoNombre').value.trim()
            const precio = parseFloat(document.getElementById('nuevoProductoPrecio').value)
            const iva = parseFloat(document.getElementById('nuevoProductoIVA').value) || 19
            const codigo = document.getElementById('nuevoProductoCodigo').value.trim()
            const descripcion = document.getElementById('nuevoProductoDescripcion').value.trim()

            if (!nombre) {
              Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Por favor ingresa el nombre del producto.', confirmButtonColor: '#4ea93b' })
              return
            }

            if (!precio || precio <= 0) {
              Swal.fire({ icon: 'warning', title: 'Precio inválido', text: 'Por favor ingresa un precio válido mayor a 0.', confirmButtonColor: '#4ea93b' })
              return
            }

            try {
              const nuevoProducto = await productoService.create({
                nombre,
                precioVenta: precio,
                precioCosto: 0,
                stockActual: 0,
                stockMinimo: 10,
                porcentajeIVA: iva,
                codigoBarra: codigo || null,
                descripcion: descripcion || null
              })

              if (nuevoProducto) {
                // Normalizar la respuesta en caso de que venga con campos diferentes
                const productoNormalizado = {
                  id: nuevoProducto.id || nuevoProducto.Id,
                  nombre: nuevoProducto.nombre || nuevoProducto.Nombre,
                  precio: nuevoProducto.precio || nuevoProducto.precioVenta || nuevoProducto.Precio || 0,
                  porcentajeIVA: nuevoProducto.porcentajeIVA || nuevoProducto.PorcentajeIVA || iva
                }
                
                // Agregar el nuevo producto a la lista
                this.productos.push(productoNormalizado)
                this.precioProductoSeleccionado = productoNormalizado
                document.getElementById('precioInput').value = (productoNormalizado.precio || 0).toFixed(2)
                const cantInputNew = document.getElementById('cantidadInput')
                cantInputNew.value = 1
                cantInputNew.max = productoNormalizado.stockActual || 0
                document.getElementById('productoSeleccionadoNombre').textContent = productoNormalizado.nombre + ` ($${(productoNormalizado.precio || 0).toFixed(2)}) — Stock: ${productoNormalizado.stockActual || 0}`
                document.getElementById('productoSeleccionadoInfo').style.display = 'block'
                
                Swal.close()
                Swal.fire({
                  icon: 'success',
                  title: '¡Éxito!',
                  text: 'Producto registrado correctamente',
                  confirmButtonColor: '#10B981'
                })
              }
            } catch (error) {
              console.error('[NuevaVenta] Error al crear producto:', error)
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo crear el producto',
                confirmButtonColor: '#f05454'
              })
            }
          })
        }
      },
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: true
    })
  }

  async init() {
    console.log('[NuevaVenta] Inicializando...')
    
    await this.loadClientes()
    await this.loadProductos()
    
    // Establecer fecha actual y bloquear fechas futuras
    const today = new Date().toISOString().split('T')[0]
    const fechaInput = document.getElementById('fechaVenta')
    if (fechaInput) {
      fechaInput.value = today
      fechaInput.max = today
    }

    // Event listeners para el formulario
    const form = document.getElementById('ventaForm')
    const cancelBtn = document.getElementById('cancelBtn')
    const addProductBtn = document.getElementById('addProductBtn')
    const btnAbrirProductosModal = document.getElementById('btnAbrirProductosModal')
    const btnAbrirClientesModal = document.getElementById('btnAbrirClientesModal')

    // Guardar referencia global para uso en el modal
    window.ventaPage = this

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault()
        this.saveVenta()
      })
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        window.location.href = '#/ventas'
      })
    }

    if (btnAbrirClientesModal) {
      btnAbrirClientesModal.addEventListener('click', (e) => {
        e.preventDefault()
        this.openClientesModal()
      })
    }

    if (btnAbrirProductosModal) {
      btnAbrirProductosModal.addEventListener('click', (e) => {
        e.preventDefault()
        this.openProductosModal()
      })
    }

    if (addProductBtn) {
      addProductBtn.addEventListener('click', (e) => {
        e.preventDefault()
        this.addDetalle()
      })
    }

    // Forzar que cantidadInput nunca supere el stock ni sea menor a 1
    const cantidadInput = document.getElementById('cantidadInput')
    if (cantidadInput) {
      cantidadInput.addEventListener('input', () => {
        let val = parseInt(cantidadInput.value) || 1
        const maxVal = parseInt(cantidadInput.max)
        if (val < 1) val = 1
        if (!isNaN(maxVal) && val > maxVal) val = maxVal
        cantidadInput.value = val
      })
    }
  }
}
