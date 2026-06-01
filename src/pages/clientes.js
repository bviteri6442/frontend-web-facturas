import { clienteService } from '../services/clienteService.js'
import { PaginationAdvanced } from '../components/PaginationAdvanced.js'
import { GlobalModal } from '../components/GlobalModal.js'
import { showErrorAlert, showSuccessAlert } from '../utils/errorHandler.js'
import { validarCedula, obtenerErrorCedula } from '../utils/cedulaValidator.js'
import { padTableBodyHtml } from '../utils/tableUi.js'
import Swal from 'sweetalert2'

const ITEMS_PER_PAGE = 10

export class Clientes {
  constructor() {
    this.clientes = []
    this.filteredClientes = []
    this.searchTerm = ''
    this.currentPage = 1
    this.itemsPerPage = ITEMS_PER_PAGE
    this.serverTotal = 0
    this.searchDebounce = null
    this.pagination = null
    this.loading = false
    this.editingId = null
    this.editMode = false
  }

  // Función para formatear cédula: XX-XXX-XXX-X
  formatearCedula(cedula) {
    if (!cedula) return ''
    const numeros = cedula.replace(/[^0-9]/g, '').substring(0, 10)
    if (numeros.length === 0) return ''
    if (numeros.length <= 2) return numeros
    if (numeros.length <= 5) return numeros.substring(0, 2) + '-' + numeros.substring(2)
    if (numeros.length <= 8) return numeros.substring(0, 2) + '-' + numeros.substring(2, 5) + '-' + numeros.substring(5)
    return numeros.substring(0, 2) + '-' + numeros.substring(2, 5) + '-' + numeros.substring(5, 8) + '-' + numeros.substring(8)
  }

  // Función para formatear teléfono: 09-XXXX-XXXX
  formatearTelefono(telefono) {
    if (!telefono) return ''
    const numeros = telefono.replace(/[^0-9]/g, '').substring(0, 10)
    if (numeros.length === 0) return ''
    if (numeros.length <= 2) return numeros
    if (numeros.length <= 6) return numeros.substring(0, 2) + '-' + numeros.substring(2)
    return numeros.substring(0, 2) + '-' + numeros.substring(2, 6) + '-' + numeros.substring(6)
  }

  isAdmin() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}')
    return user.rol === 'Admin' || user.roleId === 1
  }

  render() {
    const isAdmin = this.isAdmin()
    return `
<div class="clientes-page">
  <div class="page-header">
    <h1 class="page-title"><i class="fas fa-users"></i> Clientes</h1>
    ${isAdmin ? `
      <button type="button" class="btn-add-cliente btn btn-accent" title="Crear nuevo cliente">
        <i class="fas fa-plus"></i> Nuevo cliente
      </button>
    ` : ''}
  </div>

  <div class="card-panel">
    <div class="card-header">
      <input 
        type="text" 
        class="search-box" 
        placeholder="Buscar por nombre, documento, teléfono o correo..."
      />
    </div>

    <!-- Loading -->
    ${this.loading ? `
      <div style="padding: 40px; text-align: center; color: #64748B;">
        <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
        <p>Cargando clientes...</p>
      </div>
    ` : `
      <!-- Table -->
      <div class="table-container table-panel-fixed" style="overflow-x: auto;">
        <table class="table" style="width: 100%; border-collapse: collapse;">
          <thead style="background: #F8FAFC; border-bottom: 2px solid #E2E8F0;">
            <tr>
              <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569; font-size: 14px;">Nombre</th>
              <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569; font-size: 14px;">Documento</th>
              <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569; font-size: 14px;">Email</th>
              <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569; font-size: 14px;">Teléfono</th>
              <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569; font-size: 14px;">Estado</th>
              <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569; font-size: 14px;">Creación</th>
              ${isAdmin ? '<th style="padding: 15px; text-align: center; font-weight: 600; color: #475569; font-size: 14px;">Acciones</th>' : ''}
            </tr>
          </thead>
          <tbody id="clientes-tbody">
            <tr><td colspan="${isAdmin ? 7 : 6}" style="padding: 40px; text-align: center; color: #64748B;">Cargando...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div id="pagination-container"></div>
    `}
  </div>
</div>
    `
  }

  init() {
    console.log('[CLIENTES] Inicializando...')
    this.loadClientes()
    this.setupEventListeners()
  }

  setupEventListeners() {
    console.log('[CLIENTES] Configurando event listeners...')
    
    const searchBox = document.querySelector('.search-box')
    const btnAdd = document.querySelector('.btn-add-cliente')
    
    // Search
    if (searchBox) {
      searchBox.addEventListener('input', (e) => {
        this.searchTerm = e.target.value
        this.currentPage = 1
        clearTimeout(this.searchDebounce)
        this.searchDebounce = setTimeout(() => this.loadClientes(), 400)
      })
    }

    // Add button
    if (btnAdd) {
      console.log('[CLIENTES] btnAdd encontrado, agregando listener')
      btnAdd.addEventListener('click', (e) => {
        e.preventDefault()
        console.log('[CLIENTES] Click en Nuevo Cliente')
        this.openClienteModal()
      })
    }

    // Delegación de eventos en tbody para botones dinámicos (editar/eliminar)
    const tbody = document.getElementById('clientes-tbody')
    if (tbody) {
      tbody.addEventListener('click', (e) => {
        const btnEdit = e.target.closest('.btn-edit-cliente')
        const btnDelete = e.target.closest('.btn-delete-cliente')
        if (btnEdit) {
          const id = btnEdit.getAttribute('data-id')
          console.log('[CLIENTES] Editando cliente:', id)
          this.editCliente(id)
        } else if (btnDelete) {
          const id = btnDelete.getAttribute('data-id')
          console.log('[CLIENTES] Eliminando cliente:', id)
          this.deleteCliente(id)
        }
      })
    }
  }

  async loadClientes() {
    this.loading = true
    try {
      console.log('[CLIENTES] Cargando página', this.currentPage, 'desde backend...')
      const { data, total } = await clienteService.getPage({
        page: this.currentPage,
        limit: this.itemsPerPage,
        search: this.searchTerm,
        activo: true
      })
      this.clientes = data
      this.filteredClientes = data
      this.serverTotal = total
      console.log('[CLIENTES] Página cargada:', data.length, 'de', total)
      if (!this.pagination) this.setupPagination()
      this.updateTableAndPagination()
    } catch (error) {
      console.error('[CLIENTES] Error cargando:', error)
      this.clientes = []
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar clientes',
          text: error.message || 'Revisa .env.local y que el backend/ngrok esten activos.',
          confirmButtonColor: '#f05454'
        })
      }
    } finally {
      this.loading = false
    }
  }

  getPaginatedClientes() {
    return this.filteredClientes
  }

  setupPagination() {
    this.pagination = new PaginationAdvanced({
      currentPage: this.currentPage,
      totalPages: Math.ceil(this.serverTotal / this.itemsPerPage) || 1,
      totalItems: this.serverTotal,
      itemsPerPage: this.itemsPerPage,
      onChange: (page) => {
        this.currentPage = page
        this.loadClientes()
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
    const tbody = document.getElementById('clientes-tbody')
    if (!tbody) return

    const paginatedClientes = this.getPaginatedClientes()
    
    const colSpan = isAdmin ? 7 : 6
    if (paginatedClientes.length === 0) {
      tbody.innerHTML = padTableBodyHtml(
        `<tr><td colspan="${colSpan}" style="padding: 40px; text-align: center; color: #64748B;">${this.serverTotal === 0 ? 'No hay clientes registrados' : 'No se encontraron resultados'}</td></tr>`,
        this.itemsPerPage,
        colSpan
      )
      return
    }

    const rowsHtml = paginatedClientes.map(cliente => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 15px; color: #1E293B;">${cliente.nombre || 'N/A'}</td>
        <td style="padding: 15px; color: #1E293B;">${this.formatearCedula(cliente.cedula || cliente.documento || '')}</td>
        <td style="padding: 15px; color: #1E293B;">${cliente.email || cliente.correo || 'N/A'}</td>
        <td style="padding: 15px; color: #1E293B;">${this.formatearTelefono(cliente.telefono || 'N/A')}</td>
        <td style="padding: 15px;">
          <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ${cliente.activo ? '#D1FAE5' : '#FEE2E2'}; color: ${cliente.activo ? '#065F46' : '#991B1B'};">
            ${cliente.activo ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td style="padding: 15px; color: #64748B; font-size: 14px;">${cliente.fechaCreacion ? new Date(cliente.fechaCreacion).toLocaleDateString('es-EC') : 'N/A'}</td>
        ${isAdmin ? `
          <td style="padding: 15px; text-align: center;">
            <button class="btn-edit-cliente" data-id="${cliente.id}" title="Editar cliente" style="padding: 6px 12px; background: #F59E0B; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 5px; font-size: 12px; min-width: 90px; display: inline-flex; align-items: center; justify-content: center;">
              <i class="fas fa-edit" style="margin-right: 5px;"></i> Editar
            </button>
            <button class="btn-delete-cliente" data-id="${cliente.id}" title="Eliminar cliente" style="padding: 6px 12px; background: #EF4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; min-width: 90px; display: inline-flex; align-items: center; justify-content: center;">
              <i class="fas fa-trash" style="margin-right: 5px;"></i> Eliminar
            </button>
          </td>
        ` : ''}
      </tr>
    `).join('')

    tbody.innerHTML = padTableBodyHtml(rowsHtml, this.itemsPerPage, colSpan)
  }

  openClienteModal() {
    const modal = GlobalModal.getInstance()
    
    const formHTML = `
      <form id="clienteForm" novalidate style="width: 100%;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Nombre: <span style="color:red">*</span></label>
          <input type="text" id="clienteNombre" placeholder="Nombre (máx 20 letras)" maxlength="20" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Apellido: <span style="color:red">*</span></label>
          <input type="text" id="clienteApellido" placeholder="Apellido (máx 20 letras)" maxlength="20" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Cédula/Documento: <span style="color:red">*</span></label>
          <input type="text" id="clienteDocumento" placeholder="17-056-789-01 (formato: XX-XXX-XXX-X)" maxlength="13" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
          <small style="color: #64748B; font-size: 12px; display: block; margin-top: 5px;">10 dígitos, máscara automática XX-XXX-XXX-X</small>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Email:</label>
          <input type="email" id="clienteEmail" placeholder="correo@ejemplo.com" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Teléfono:</label>
          <input type="tel" id="clienteTelefono" placeholder="09-8765-4321 (formato: 09-XXXX-XXXX)" maxlength="12" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
          <small style="color: #64748B; font-size: 12px; display: block; margin-top: 5px;">7-10 dígitos, máscara automática 09-XXXX-XXXX</small>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Dirección:</label>
          <input type="text" id="clienteDireccion" placeholder="Ej: Calle Principal 123 (máximo 100 caracteres)" maxlength="100" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
          <small style="color: #64748B; font-size: 12px; display: block; margin-top: 5px;">Máximo 100 caracteres</small>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
          <button type="button" class="btn-cancel-modal" style="padding: 10px 20px; background: #E2E8F0; color: #1E293B; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Cancelar</button>
          <button type="submit" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Guardar</button>
        </div>
      </form>
    `
    
    modal.open('Nuevo Cliente', formHTML, () => {
      this.editingId = null
    })
    
    // Adjuntar event listeners del formulario despues que se abra
    setTimeout(() => {
      const form = document.getElementById('clienteForm')
      const btnCancel = document.querySelector('.btn-cancel-modal')
      const docInput = document.getElementById('clienteDocumento')
      
      // Validar que documento sea solo números
      if (docInput && !this.editingId) {
        docInput.addEventListener('input', (e) => {
          // Solo números
          let valor = e.target.value.replace(/[^0-9]/g, '')
          // Máscara: XX-XXX-XXX-X (formato ecuatoriano)
          if (valor.length > 0) {
            valor = valor.substring(0, 10)
            if (valor.length <= 2) {
              e.target.value = valor
            } else if (valor.length <= 5) {
              e.target.value = valor.substring(0, 2) + '-' + valor.substring(2)
            } else if (valor.length <= 8) {
              e.target.value = valor.substring(0, 2) + '-' + valor.substring(2, 5) + '-' + valor.substring(5)
            } else {
              e.target.value = valor.substring(0, 2) + '-' + valor.substring(2, 5) + '-' + valor.substring(5, 8) + '-' + valor.substring(8)
            }
          } else {
            e.target.value = valor
          }
        })
      }
      
      // Validar que teléfono sea solo números + máscara
      const telefonoInput = document.getElementById('clienteTelefono')
      if (telefonoInput) {
        telefonoInput.addEventListener('input', (e) => {
          // Solo números, máximo 10 caracteres
          let valor = e.target.value.replace(/[^0-9]/g, '')
          valor = valor.substring(0, 10)
          
          // Máscara: 09-XXXX-XXXX (formato ecuatoriano)
          if (valor.length > 0) {
            if (valor.length <= 2) {
              e.target.value = valor
            } else if (valor.length <= 6) {
              e.target.value = valor.substring(0, 2) + '-' + valor.substring(2)
            } else {
              e.target.value = valor.substring(0, 2) + '-' + valor.substring(2, 6) + '-' + valor.substring(6)
            }
          } else {
            e.target.value = valor
          }
        })
      }
      // Solo permitir letras en nombre y apellido, sin espacios
      const nombreInput = document.getElementById('clienteNombre')
      const apellidoInput = document.getElementById('clienteApellido')
      const onlyLetters = (el) => {
        if (!el) return
        el.addEventListener('keydown', (ev) => {
          if (ev.key === ' ' || ev.code === 'Space') ev.preventDefault()
        })
        el.addEventListener('input', (ev) => {
          const cleaned = ev.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '')
          if (cleaned !== ev.target.value) ev.target.value = cleaned
        })
      }
      onlyLetters(nombreInput)
      onlyLetters(apellidoInput)
      
      if (form) {
        form.addEventListener('submit', (e) => {
          console.log('[CLIENTES] Submit del formulario')
          this.saveCliente(e)
        })
      }
      
      if (btnCancel) {
        btnCancel.addEventListener('click', () => {
          console.log('[CLIENTES] Click en Cancelar')
          modal.close()
        })
      }
    }, 0)
    
    this.editingId = null
    console.log('[CLIENTES] Modal abierto para crear nuevo cliente')
  }

  closeClienteModal() {
    const modal = GlobalModal.getInstance()
    modal.close()
  }

  async saveCliente(e) {
    e.preventDefault()
    const nombre = document.getElementById('clienteNombre').value.trim()
    const apellido = document.getElementById('clienteApellido').value.trim()
    const documentoRaw = document.getElementById('clienteDocumento')?.value.trim() || ''
    const documento = documentoRaw.replace(/[^0-9]/g, '') // Remover guiones para validación
    const email = document.getElementById('clienteEmail').value.trim()
    const telefonoRaw = document.getElementById('clienteTelefono').value.trim()
    const telefono = telefonoRaw.replace(/[^0-9]/g, '') // Remover guiones para validación
    const direccion = document.getElementById('clienteDireccion').value.trim()

    // Validación de campos requeridos
    if (!nombre || !apellido) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Por favor completa Nombre y Apellido.', confirmButtonColor: '#F59E0B' })
      return
    }

    // Validación de documento en creación
    if (!this.editingId && !documento) {
      Swal.fire({ icon: 'warning', title: 'Documento requerido', text: 'Por favor ingresa la Cédula/Documento.', confirmButtonColor: '#F59E0B' })
      return
    }

    // Validación de cédula ecuatoriana (Módulo 10)
    if (!this.editingId && documento && !validarCedula(documento)) {
      const errorMsg = obtenerErrorCedula(documento)
      Swal.fire({ icon: 'error', title: 'Cédula Inválida', text: errorMsg || 'La cédula ecuatoriana no es válida.', confirmButtonColor: '#f05454' })
      return
    }

    // Validación de email si se proporciona
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Swal.fire({ icon: 'warning', title: 'Email inválido', text: 'Por favor ingresa un email válido (ej: usuario@ejemplo.com).', confirmButtonColor: '#F59E0B' })
      return
    }

    // Validación de teléfono si se proporciona
    if (telefono && !/^\d{7,10}$/.test(telefono)) {
      Swal.fire({ icon: 'warning', title: 'Teléfono inválido', text: 'El teléfono debe contener entre 7 y 10 dígitos numéricos.', confirmButtonColor: '#F59E0B' })
      return
    }

    // Validación de dirección: máximo 100 caracteres
    if (direccion && direccion.length > 100) {
      Swal.fire({ icon: 'warning', title: 'Dirección muy larga', text: 'La dirección no puede exceder 100 caracteres.', confirmButtonColor: '#F59E0B' })
      return
    }

    try {
      if (this.editingId) {
        const clienteData = {
          nombre: nombre || undefined,
          apellido: apellido || undefined,
          email: email || undefined,
          telefono: telefono || undefined,
          direccion: direccion || undefined
        }
        await clienteService.update(this.editingId, clienteData)
        Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Cliente actualizado exitosamente.', confirmButtonColor: '#10B981' })
      } else {
        const clienteData = { nombre, apellido, documento, email: email || undefined, telefono: telefono || undefined, direccion: direccion || undefined }
        await clienteService.create(clienteData)
        Swal.fire({ icon: 'success', title: '¡Creado!', text: 'Cliente creado exitosamente.', confirmButtonColor: '#10B981' })
      }
      this.closeClienteModal()
      this.loadClientes()
    } catch (error) {
      showErrorAlert(error, 'Error al guardar', 'No se pudo guardar el cliente.')
      console.error('[saveCliente]', error)
    }
  }

  async editCliente(id) {
    const cliente = this.clientes.find(c => c.id == id)
    if (!cliente) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Cliente no encontrado.', confirmButtonColor: '#f05454' })
      return
    }

    const modal = GlobalModal.getInstance()
    
    const formHTML = `
      <form id="clienteForm" novalidate style="width: 100%;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Nombre: <span style="color:red">*</span></label>
          <input type="text" id="clienteNombre" placeholder="Nombre (máx 20 letras)" maxlength="20" value="${cliente.nombre || ''}" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Apellido: <span style="color:red">*</span></label>
          <input type="text" id="clienteApellido" placeholder="Apellido (máx 20 letras)" maxlength="20" value="${cliente.apellido || ''}" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Cédula/Documento:</label>
          <input type="text" id="clienteDocumento" placeholder="17-056-789-01 (formato: XX-XXX-XXX-X)" value="${cliente.documento ? this.formatearCedula(cliente.documento) : cliente.cedula ? this.formatearCedula(cliente.cedula) : ''}" disabled style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box; background-color: #F1F5F9;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Email:</label>
          <input type="email" id="clienteEmail" placeholder="correo@ejemplo.com" value="${cliente.email || cliente.correo || ''}" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Teléfono:</label>
          <input type="tel" id="clienteTelefono" placeholder="09-8765-4321 (formato: 09-XXXX-XXXX)" value="${cliente.telefono ? this.formatearTelefono(cliente.telefono) : ''}" maxlength="12" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
          <small style="color: #64748B; font-size: 12px; display: block; margin-top: 3px;">Máscara automática 09-XXXX-XXXX</small>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Dirección:</label>
          <input type="text" id="clienteDireccion" placeholder="Ej: Calle Principal 123 (máximo 100 caracteres)" maxlength="100" value="${cliente.direccion || ''}" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
          <small style="color: #64748B; font-size: 12px; display: block; margin-top: 3px;">Máximo 100 caracteres</small>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
          <button type="button" class="btn-cancel-modal" style="padding: 10px 20px; background: #E2E8F0; color: #1E293B; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Cancelar</button>
          <button type="submit" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Actualizar</button>
        </div>
      </form>
    `
    
    modal.open('Editar Cliente', formHTML)
    
    // Adjuntar event listeners del formulario despues que se abra
    setTimeout(() => {
      const form = document.getElementById('clienteForm')
      const btnCancel = document.querySelector('.btn-cancel-modal')
      
      // Máscara de teléfono en edición
      const telefonoInput = document.getElementById('clienteTelefono')
      if (telefonoInput) {
        telefonoInput.addEventListener('input', (e) => {
          let valor = e.target.value.replace(/[^0-9]/g, '')
          valor = valor.substring(0, 10)
          
          if (valor.length > 0) {
            if (valor.length <= 2) {
              e.target.value = valor
            } else if (valor.length <= 6) {
              e.target.value = valor.substring(0, 2) + '-' + valor.substring(2)
            } else {
              e.target.value = valor.substring(0, 2) + '-' + valor.substring(2, 6) + '-' + valor.substring(6)
            }
          } else {
            e.target.value = valor
          }
        })
      }
      // Solo permitir letras en nombre y apellido, sin espacios
      const nombreInput = document.getElementById('clienteNombre')
      const apellidoInput = document.getElementById('clienteApellido')
      const onlyLetters = (el) => {
        if (!el) return
        el.addEventListener('keydown', (ev) => {
          if (ev.key === ' ' || ev.code === 'Space') ev.preventDefault()
        })
        el.addEventListener('input', (ev) => {
          const cleaned = ev.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '')
          if (cleaned !== ev.target.value) ev.target.value = cleaned
        })
      }
      onlyLetters(nombreInput)
      onlyLetters(apellidoInput)

      if (form) {
        form.addEventListener('submit', (e) => {
          console.log('[CLIENTES] Submit del formulario de edición')
          this.saveCliente(e)
        })
      }
      
      if (btnCancel) {
        btnCancel.addEventListener('click', () => {
          console.log('[CLIENTES] Click en Cancelar')
          modal.close()
        })
      }
    }, 0)
    
    this.editingId = id
    console.log('[CLIENTES] Modal abierto para editar cliente:', id)
  }

  async deleteCliente(id) {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar cliente?',
      text: 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f05454',
      cancelButtonColor: '#94A3B8'
    })

    if (!result.isConfirmed) return

    try {
      await clienteService.delete(id)
      Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Cliente eliminado exitosamente.', confirmButtonColor: '#10B981' })
      this.loadClientes()
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#f05454' })
      console.error(error)
    }
  }
}
