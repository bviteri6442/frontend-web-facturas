// Página de Usuarios con Paginación Avanzada (Admin Only)
import { usuarioService } from '../services/usuarioService.js'
import { rolService } from '../services/rolService.js'
import { PaginationAdvanced } from '../components/PaginationAdvanced.js'
import { GlobalModal } from '../components/GlobalModal.js'
import Swal from 'sweetalert2'
import { uploadToCloudinary } from '../services/cloudinaryService.js'
import { padTableBodyHtml } from '../utils/tableUi.js'

const ITEMS_PER_PAGE = 10

export class Usuarios {
  constructor() {
    this.usuarios = []
    this.filteredUsuarios = []
    this.searchTerm = ''
    this.searchType = 'todos' // 'todos', 'nombreusuario', 'nombre', 'email'
    this.currentPage = 1
    this.itemsPerPage = ITEMS_PER_PAGE
    this.serverTotal = 0
    this.searchDebounce = null
    this.pagination = null
    this.loading = false
    this.roles = []
    
    // Verificar permisos admin
    this.isAdminUser = this.verifyAdmin()
  }

  verifyAdmin() {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const isAdmin = user.rol === 'Admin' || user.roleId === 1
      if (!isAdmin) {
        console.error('[USUARIOS] Acceso denegado: No eres admin')
        throw new Error('No tienes permisos para acceder a esta página')
      }
      return true
    } catch (error) {
      console.error('[USUARIOS]', error.message)
      return false
    }
  }

  // Filtrar usuarios según el tipo de búsqueda seleccionado
  filtrarUsuariosLocal() {
    if (!this.searchTerm.trim()) {
      this.filteredUsuarios = [...this.usuarios]
      return
    }

    const term = this.searchTerm.toLowerCase()

    this.filteredUsuarios = this.usuarios.filter(usuario => {
      switch (this.searchType) {
        case 'nombreusuario':
          return (usuario.nombreUsuario || '').toLowerCase().includes(term)
        
        case 'nombre':
          const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.toLowerCase()
          return nombreCompleto.includes(term)
        
        case 'email':
          return (usuario.email || '').toLowerCase().includes(term)
        
        case 'todos':
        default:
          const nombreUser = (usuario.nombreUsuario || '').toLowerCase()
          const nombreComp = `${usuario.nombre || ''} ${usuario.apellido || ''}`.toLowerCase()
          const email = (usuario.email || '').toLowerCase()
          return nombreUser.includes(term) || nombreComp.includes(term) || email.includes(term)
      }
    })
  }

  render() {
    if (!this.isAdminUser) {
      return `
        <div style="padding: 40px; text-align: center;">
          <div style="color: #EF4444; font-size: 24px; margin-bottom: 10px;">
            <i class="fas fa-lock"></i>
          </div>
          <h2 style="color: #1E293B;">Acceso Denegado</h2>
          <p style="color: #64748B;">No tienes permisos para acceder a esta página. Solo administradores pueden gestionar usuarios.</p>
        </div>
      `
    }

    return `
<div class="usuarios-page">
  <div class="page-header">
    <h1 class="page-title"><i class="fas fa-user-shield"></i> Usuarios</h1>
    <button type="button" class="btn-add-usuario btn btn-accent" title="Crear nuevo usuario">
      <i class="fas fa-plus"></i> Nuevo usuario
    </button>
  </div>

  <div class="card" style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
    <div style="padding: 1rem 1.5rem; border-bottom: 1px solid #E2E8F0;">
      <div style="display: grid; grid-template-columns: 150px 1fr; gap: 1rem; align-items: flex-end;">
        <div>
          <label style="display: block; margin-bottom: 0.35rem; font-weight: 600; font-size: 0.8rem; color: #475569;">Buscar por:</label>
          <select class="search-type-filter" style="width: 100%; padding: 0.5rem 0.7rem; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 0.85rem; background: #fff; cursor: pointer; box-sizing: border-box;">
            <option value="todos">Todos los campos</option>
            <option value="nombreusuario">Nombre Usuario</option>
            <option value="nombre">Nombre Completo</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div>
          <label style="display: block; margin-bottom: 0.35rem; font-weight: 600; font-size: 0.8rem; color: #475569;">Búsqueda:</label>
          <input type="text" class="search-box" placeholder="Ingresa tu búsqueda..." style="width: 100%; padding: 0.5rem 0.7rem; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 0.85rem; outline: none; box-sizing: border-box;"/>
        </div>
      </div>
    </div>

    ${this.loading ? `
      <div style="padding: 40px; text-align: center; color: #64748B;">
        <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
        <p>Cargando usuarios...</p>
      </div>
    ` : `
      <div class="table-container table-panel-fixed" style="overflow-x: auto;">
        <table class="table" style="width: 100%; border-collapse: collapse;">
          <thead style="background: #F8FAFC; border-bottom: 2px solid #E2E8F0;">
            <tr>
              <th style="padding: 15px; text-align: center; font-weight: 600; color: #475569; font-size: 14px; width: 60px;">Foto</th>
              <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569; font-size: 14px;">Nombre Usuario</th>
              <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569; font-size: 14px;">Nombre Completo</th>
              <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569; font-size: 14px;">Email</th>
              <th style="padding: 15px; text-align: center; font-weight: 600; color: #475569; font-size: 14px;">Rol</th>
              <th style="padding: 15px; text-align: center; font-weight: 600; color: #475569; font-size: 14px;">Estado</th>
              <th style="padding: 15px; text-align: center; font-weight: 600; color: #475569; font-size: 14px;">Fecha Creación</th>
              <th style="padding: 15px; text-align: center; font-weight: 600; color: #475569; font-size: 14px;">Acciones</th>
            </tr>
          </thead>
          <tbody id="usuarios-tbody">
            <tr><td colspan="8" style="padding: 40px; text-align: center; color: #64748B;">Cargando...</td></tr>
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
    console.log('[USUARIOS] Inicializando...')
    
    if (!this.isAdminUser) {
      console.warn('[USUARIOS] Usuario no tiene permisos admin')
      return
    }

    this.loadRoles()
    this.loadUsuarios()
    this.setupEventListeners()
  }

  setupEventListeners() {
    console.log('[USUARIOS] Configurando event listeners...')
    
    const searchBox = document.querySelector('.search-box')
    const searchTypeSelect = document.querySelector('.search-type-filter')
    const btnAdd = document.querySelector('.btn-add-usuario')

    // Listener para cambio de tipo de búsqueda
    if (searchTypeSelect) {
      searchTypeSelect.addEventListener('change', (e) => {
        this.searchType = e.target.value
        this.currentPage = 1
        this.filtrarUsuariosLocal()
        this.loadUsuarios()
      })
    }

    // Search
    if (searchBox) {
      searchBox.addEventListener('input', (e) => {
        this.searchTerm = e.target.value
        this.currentPage = 1
        clearTimeout(this.searchDebounce)
        this.searchDebounce = setTimeout(() => {
          this.filtrarUsuariosLocal()
          this.loadUsuarios()
        }, 400)
      })
    }

    // Add button
    if (btnAdd) {
      console.log('[USUARIOS] btnAdd encontrado')
      btnAdd.addEventListener('click', (e) => {
        e.preventDefault()
        console.log('[USUARIOS] Click en Nuevo')
        this.openUsuarioModal()
      })
    }

    // Delegación de eventos en tbody para botones dinámicos (editar/eliminar)
    const tbody = document.getElementById('usuarios-tbody')
    if (tbody) {
      tbody.addEventListener('click', (e) => {
        const btnEdit = e.target.closest('.btn-edit-usuario')
        const btnDelete = e.target.closest('.btn-delete-usuario')
        if (btnEdit) {
          const id = btnEdit.getAttribute('data-id')
          console.log('[USUARIOS] Editando usuario:', id)
          this.editUsuario(id)
        } else if (btnDelete) {
          const id = btnDelete.getAttribute('data-id')
          console.log('[USUARIOS] Eliminando usuario:', id)
          this.deleteUsuario(id)
        }
      })
    }
  }

  async loadRoles() {
    try {
      console.log('[USUARIOS] Cargando roles...')
      this.roles = await rolService.getAll()
      console.log('[USUARIOS] Roles cargados:', this.roles.length, this.roles)
    } catch (error) {
      console.error('[USUARIOS] Error cargando roles:', error)
      this.roles = []
    }
  }

  async loadUsuarios() {
    this.loading = true
    try {
      console.log('[USUARIOS] Cargando página', this.currentPage)
      const { data, total } = await usuarioService.getPage({
        page: this.currentPage,
        limit: this.itemsPerPage,
        search: this.searchTerm
      })
      this.usuarios = data
      this.filteredUsuarios = data
      this.serverTotal = total
      console.log('[USUARIOS] Página:', data.length, 'de', total)
      if (!this.pagination) this.setupPagination()
      this.updateTableAndPagination()
    } catch (error) {
      console.error('[USUARIOS] Error cargando:', error)
      this.usuarios = []
    } finally {
      this.loading = false
    }
  }

  getPaginatedUsuarios() {
    return this.filteredUsuarios
  }

  setupPagination() {
    this.pagination = new PaginationAdvanced({
      currentPage: this.currentPage,
      totalPages: Math.ceil(this.serverTotal / this.itemsPerPage) || 1,
      totalItems: this.serverTotal,
      itemsPerPage: this.itemsPerPage,
      onChange: (page) => {
        this.currentPage = page
        this.loadUsuarios()
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
    const tbody = document.getElementById('usuarios-tbody')
    if (!tbody) return

    const paginatedUsuarios = this.getPaginatedUsuarios()
    
    if (paginatedUsuarios.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="padding: 40px; text-align: center; color: #64748B;">${this.usuarios.length === 0 ? 'No hay usuarios registrados' : 'No se encontraron resultados'}</td></tr>`
      return
    }

    tbody.innerHTML = paginatedUsuarios.map(usuario => {
      const fechaCreacion = usuario.fechaCreacion ? new Date(usuario.fechaCreacion).toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'
      return `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 10px 15px; text-align: center;">
          ${usuario.imagenUrl
            ? `<img src="${usuario.imagenUrl}" alt="" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid #E2E8F0;" onerror="this.style.display='none'">`
            : `<div style="width:36px;height:36px;border-radius:50%;background:#E0E7FF;display:inline-flex;align-items:center;justify-content:center;color:#3730A3;font-size:14px;"><i class="fas fa-user"></i></div>`}
        </td>
        <td style="padding: 15px; color: #1E293B; font-weight: 600;">${usuario.cedula || usuario.nombreUsuario || 'N/A'}</td>
        <td style="padding: 15px; color: #1E293B;">${usuario.nombre || usuario.nombreCompleto || 'N/A'}</td>
        <td style="padding: 15px; color: #64748B; font-size: 14px;">${usuario.correo || usuario.email || 'N/A'}</td>
        <td style="padding: 15px; text-align: center;">
          <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #E0E7FF; color: #3730A3;">
            ${usuario.rol || usuario.rolNombre || 'Usuario'}
          </span>
        </td>
        <td style="padding: 15px; text-align: center;">
          <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ${usuario.activo ? '#D1FAE5' : '#FEE2E2'}; color: ${usuario.activo ? '#065F46' : '#991B1B'};">
            ${usuario.activo ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td style="padding: 15px; text-align: center; color: #64748B; font-size: 14px;">${fechaCreacion}</td>
        <td style="padding: 15px; text-align: center;">
          <button class="btn-edit-usuario" data-id="${usuario.id}" title="Editar usuario" style="padding: 6px 12px; background: #F59E0B; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 5px; font-size: 12px; min-width: 90px; display: inline-flex; align-items: center; justify-content: center;">
            <i class="fas fa-edit" style="margin-right: 5px;"></i> Editar
          </button>
          <button class="btn-delete-usuario" data-id="${usuario.id}" title="Eliminar usuario" style="padding: 6px 12px; background: #EF4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; min-width: 90px; display: inline-flex; align-items: center; justify-content: center;">
            <i class="fas fa-trash" style="margin-right: 5px;"></i> Eliminar
          </button>
        </td>
      </tr>
    `
    }).join('')
  }

  openUsuarioModal() {
    const modal = GlobalModal.getInstance()
    
    const formHTML = `
      <form id="usuarioForm" style="width: 100%;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Nombre Usuario: <span style="color:red">*</span></label>
          <input type="text" id="usuarioNombreUsuario" placeholder="Ejemplo: Juan (3-20 letras, sin números)" maxlength="20" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
          <small style="color: #64748B; font-size: 12px;">Solo se permiten letras (máximo 20 caracteres)</small>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Nombre: <span style="color:red">*</span></label>
            <input type="text" id="usuarioNombre" placeholder="Ejemplo: Juan Carlos (2-20 letras)" maxlength="20" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
            <small style="color: #64748B; font-size: 12px;">Solo se permiten letras (máximo 20 caracteres)</small>
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Apellido: <span style="color:red">*</span></label>
            <input type="text" id="usuarioApellido" placeholder="Ejemplo: Pérez (máximo 20 letras)" maxlength="20" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
            <small style="color: #64748B; font-size: 12px;">Solo se permiten letras (máximo 20 caracteres)</small>
          </div>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Email: <span style="color:red">*</span></label>
          <input type="email" id="usuarioEmail" placeholder="Ejemplo: usuario@ejemplo.com" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
          <small style="color: #64748B; font-size: 12px;">Debe ser un email válido con punto después del @ (ej: usuario@dominio.com)</small>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Contraseña: <span style="color:red">*</span></label>
          <input type="password" id="usuarioPassword" placeholder="Ejemplo: Pass123@ (mayús, minús, número, símbolo)" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
          <small style="color: #64748B; font-size: 12px;">Debe contener: mayúscula, minúscula, número y carácter especial (@$!%*?&)</small>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Confirmar Contraseña: <span style="color:red">*</span></label>
          <input type="password" id="usuarioConfirmPassword" placeholder="Ejemplo: Pass123@ (debe ser igual)" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Rol: <span style="color:red">*</span></label>
          <select id="usuarioRolId" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;">
            <option value="">Selecciona un rol...</option>
            ${this.roles.map(rol => `<option value="${rol.id}">${rol.nombre}</option>`).join('')}
          </select>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #0F172A;">Imagen de perfil (opcional):</label>
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div id="imgPreview" style="width: 64px; height: 64px; border-radius: 50%; border: 2px dashed #E2E8F0; display: flex; align-items: center; justify-content: center; background: #F8FAFC; overflow: hidden; flex-shrink: 0;">
              <i class="fas fa-user" style="font-size: 20px; color: #94A3B8;"></i>
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
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
          <button type="button" class="btn-cancel-usuario-modal" style="padding: 10px 20px; background: #E2E8F0; color: #1E293B; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Cancelar</button>
          <button type="submit" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Guardar</button>
        </div>
      </form>
    `
    
    modal.open('Nuevo Usuario', formHTML)
    
    setTimeout(() => {
      const form = document.getElementById('usuarioForm')
      const btnCancel = document.querySelector('.btn-cancel-usuario-modal')
      
      // ============ VALIDACIÓN EN TIEMPO REAL ============
      const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
      
      const filtroSoloLetras = (elementId) => {
        const input = document.getElementById(elementId)
        if (input) {
          input.addEventListener('input', (e) => {
            let valor = e.target.value
            // Solo letras (incluyendo acentos) y sin espacios
            valor = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '')
            // Limitar a 20 caracteres
            valor = valor.substring(0, 20)
            e.target.value = valor
          })
        }
      }
      
      // Aplicar filtro a campos de solo letras
      filtroSoloLetras('usuarioNombreUsuario')
      filtroSoloLetras('usuarioNombre')
      filtroSoloLetras('usuarioApellido')
      
      // Validar que contraseña no tenga espacios
      const passwordInput = document.getElementById('usuarioPassword')
      if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
          // Remover espacios de la contraseña
          e.target.value = e.target.value.replace(/\s+/g, '')
        })
      }
      
      // Validar que confirmar contraseña no tenga espacios
      const confirmPasswordInput = document.getElementById('usuarioConfirmPassword')
      if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', (e) => {
          // Remover espacios de la confirmación de contraseña
          e.target.value = e.target.value.replace(/\s+/g, '')
        })
      }
      
      // Validar que URL de imagen no tenga espacios
      const imagenUrlInput = document.getElementById('imagenUrl')
      if (imagenUrlInput) {
        imagenUrlInput.addEventListener('input', (e) => {
          // Remover espacios de la URL
          e.target.value = e.target.value.replace(/\s+/g, '')
        })
      }
      
      if (form) {
        form.addEventListener('submit', (e) => {
          console.log('[USUARIOS] Submit del formulario')
          this.saveUsuario(e)
        })
      }
      
      if (btnCancel) {
        btnCancel.addEventListener('click', () => {
          console.log('[USUARIOS] Click en Cancelar')
          modal.close()
        })
      }

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
          img.onerror = () => { imgPreview.innerHTML = '<i class="fas fa-user" style="font-size:20px;color:#94A3B8;"></i>' }
          imgPreview.innerHTML = ''
          imgPreview.appendChild(img)
        } else {
          imgPreview.innerHTML = '<i class="fas fa-user" style="font-size:20px;color:#94A3B8;"></i>'
        }
      }
      if (imgUrlInput?.value) refreshPreview(imgUrlInput.value)
      imgUrlInput?.addEventListener('input', (e) => refreshPreview(e.target.value.trim()))
      imgFileInput?.addEventListener('change', async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (imgFileInput) { imgFileInput.disabled = true }
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

  closeUsuarioModal() {
    const modal = GlobalModal.getInstance()
    modal.close()
  }

  async saveUsuario(e) {
    e.preventDefault()
    const nombreUsuario = document.getElementById('usuarioNombreUsuario')?.value?.trim() || ''
    const nombre = document.getElementById('usuarioNombre')?.value?.trim() || ''
    const apellido = document.getElementById('usuarioApellido')?.value?.trim() || ''
    const email = document.getElementById('usuarioEmail')?.value?.trim() || ''
    const password = document.getElementById('usuarioPassword')?.value || ''
    const confirmPassword = document.getElementById('usuarioConfirmPassword')?.value || ''
    const rolId = document.getElementById('usuarioRolId')?.value
    const imagenUrl = document.getElementById('imagenUrl')?.value?.trim() || null
    const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
    const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const contraseniaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/

    try {
      // ========== MODO EDICIÓN ==========
      if (this.editingId) {
        // En edición, algunos campos son opcionales
        if (nombre && !soloLetrasRegex.test(nombre)) {
          Swal.fire({
            icon: 'warning',
            title: 'Nombre inválido',
            text: 'El nombre solo puede contener letras (sin números ni caracteres especiales).',
            confirmButtonColor: '#F59E0B'
          })
          return
        }

        if (nombre && nombre.length > 20) {
          Swal.fire({
            icon: 'warning',
            title: 'Nombre muy largo',
            text: 'El nombre no puede exceder 20 caracteres.',
            confirmButtonColor: '#F59E0B'
          })
          return
        }

        if (apellido && !soloLetrasRegex.test(apellido)) {
          Swal.fire({
            icon: 'warning',
            title: 'Apellido inválido',
            text: 'El apellido solo puede contener letras (sin números ni caracteres especiales).',
            confirmButtonColor: '#F59E0B'
          })
          return
        }

        if (apellido && apellido.length > 20) {
          Swal.fire({
            icon: 'warning',
            title: 'Apellido muy largo',
            text: 'El apellido no puede exceder 20 caracteres.',
            confirmButtonColor: '#F59E0B'
          })
          return
        }

        if (email && !emailRegex.test(email)) {
          Swal.fire({
            icon: 'warning',
            title: 'Email inválido',
            text: 'Por favor ingresa un email válido con punto después del @ (ej: usuario@dominio.com).',
            confirmButtonColor: '#F59E0B'
          })
          return
        }

        // Validar cambio de contraseña (si se intenta cambiar)
        if (password) {
          if (!confirmPassword) {
            Swal.fire({
              icon: 'warning',
              title: 'Confirmación requerida',
              text: 'Si cambias la contraseña, debes confirmarla.',
              confirmButtonColor: '#F59E0B'
            })
            return
          }

          if (password !== confirmPassword) {
            Swal.fire({
              icon: 'warning',
              title: 'Contraseñas no coinciden',
              text: 'La contraseña y su confirmación deben ser iguales.',
              confirmButtonColor: '#F59E0B'
            })
            return
          }

          if (password.length < 8) {
            Swal.fire({
              icon: 'warning',
              title: 'Contraseña muy corta',
              text: 'La contraseña debe tener al menos 8 caracteres.',
              confirmButtonColor: '#F59E0B'
            })
            return
          }

          if (!contraseniaRegex.test(password)) {
            Swal.fire({
              icon: 'warning',
              title: 'Contraseña insegura',
              text: 'La contraseña debe contener: mayúscula, minúscula, número y carácter especial (@$!%*?&). Ejemplo: Pass123@',
              confirmButtonColor: '#F59E0B'
            })
            return
          }
        }

        // Preparar datos para actualización
        const usuarioData = {
          nombre: nombre || undefined,
          apellido: apellido || undefined,
          email: email || undefined,
          rolId: rolId || undefined,
          ...(password && { password, contrasena: password })
        }

        await usuarioService.update(this.editingId, usuarioData)
        if (imagenUrl !== null) {
          try { await usuarioService.actualizarImagen(this.editingId, imagenUrl) } catch(e) { console.warn('[USUARIOS] Error actualizando imagen:', e) }
        }
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'Usuario actualizado exitosamente.',
          confirmButtonColor: '#10B981'
        })
      } else {
        // ========== MODO CREACIÓN (Requiere validación completa) ==========
        
        // 1. Validar Nombre de Usuario (solo letras)
        if (!nombreUsuario) {
          Swal.fire({
            icon: 'warning',
            title: 'Campo requerido',
            text: 'El nombre de usuario es requerido. Debe contener solo letras.',
            confirmButtonColor: '#F59E0B'
          })
          return
        }
        if (!soloLetrasRegex.test(nombreUsuario)) {
          Swal.fire({
            icon: 'warning',
            title: 'Nombre de usuario inválido',
            text: 'El nombre de usuario solo puede contener letras (sin números ni caracteres especiales).',
            confirmButtonColor: '#F59E0B'
          })
          return
        }
        if (nombreUsuario.length < 3) {
          Swal.fire({
            icon: 'warning',
            title: 'Nombre de usuario muy corto',
            text: 'El nombre de usuario debe tener al menos 3 caracteres.',
            confirmButtonColor: '#F59E0B'
          })
          return
        }
        if (nombreUsuario.length > 20) {
          Swal.fire({
            icon: 'warning',
            title: 'Nombre de usuario muy largo',
            text: 'El nombre de usuario no puede exceder 20 caracteres.',
            confirmButtonColor: '#F59E0B'
          })
          return
        }

        // 2. Validar Nombre (solo letras)
        if (!nombre) {
          Swal.fire({
            icon: 'warning',
            title: 'Campo requerido',
            text: 'El nombre es requerido.',
            confirmButtonColor: '#F59E0B'
          })
          return
        }
        if (!soloLetrasRegex.test(nombre)) {
          Swal.fire({
            icon: 'warning',
            title: 'Nombre inválido',
            text: 'El nombre solo puede contener letras (sin números ni caracteres especiales).',
            confirmButtonColor: '#F59E0B'
          })
          return
        }
        if (nombre.length < 2) {
          Swal.fire({
            icon: 'warning',
            title: 'Nombre muy corto',
            text: 'El nombre debe tener al menos 2 caracteres.',
            confirmButtonColor: '#F59E0B'
          })
          return
        }
        if (nombre.length > 20) {
          Swal.fire({
            icon: 'warning',
            title: 'Nombre muy largo',
            text: 'El nombre no puede exceder 20 caracteres.',
            confirmButtonColor: '#F59E0B'
          })
          return
        }

        // 3. Validar Apellido (solo letras, OPCIONAL)
        if (apellido) {
          // Solo valida si tiene contenido (es opcional)
          if (!soloLetrasRegex.test(apellido)) {
            Swal.fire({
              icon: 'warning',
              title: 'Apellido inválido',
              text: 'El apellido solo puede contener letras (sin números ni caracteres especiales).',
              confirmButtonColor: '#F59E0B'
            })
            return
          }
          if (apellido.length > 20) {
            Swal.fire({
              icon: 'warning',
              title: 'Apellido muy largo',
              text: 'El apellido no puede exceder 20 caracteres.',
              confirmButtonColor: '#F59E0B'
            })
            return
          }
        }

        // 4. Validar Email
        if (!email) {
          Swal.fire({
            icon: 'warning',
            title: 'Campo requerido',
            text: 'El email es requerido.',
            confirmButtonColor: '#F59E0B'
          })
          return
        }
        if (!emailRegex.test(email)) {
          Swal.fire({
            icon: 'warning',
            title: 'Email inválido',
            text: 'Por favor ingresa un email válido con punto después del @ (ej: usuario@dominio.com).',
            confirmButtonColor: '#F59E0B'
          })
          return
        }

        // 5. Validar Contraseña y Confirmación
        if (!password) {
          Swal.fire({
            icon: 'warning',
            title: 'Campo requerido',
            text: 'La contraseña es requerida para crear un nuevo usuario.',
            confirmButtonColor: '#F59E0B'
          })
          return
        }

        if (!confirmPassword) {
          Swal.fire({
            icon: 'warning',
            title: 'Campo requerido',
            text: 'Debes confirmar la contraseña.',
            confirmButtonColor: '#F59E0B'
          })
          return
        }

        if (password !== confirmPassword) {
          Swal.fire({
            icon: 'warning',
            title: 'Contraseñas no coinciden',
            text: 'La contraseña y su confirmación deben ser iguales.',
            confirmButtonColor: '#F59E0B'
          })
          return
        }

        if (password.length < 8) {
          Swal.fire({
            icon: 'warning',
            title: 'Contraseña muy corta',
            text: 'La contraseña debe tener al menos 8 caracteres.',
            confirmButtonColor: '#F59E0B'
          })
          return
        }

        if (!contraseniaRegex.test(password)) {
          Swal.fire({
            icon: 'warning',
            title: 'Contraseña insegura',
            text: 'La contraseña debe contener: mayúscula, minúscula, número y carácter especial (@$!%*?&). Ejemplo: Pass123@',
            confirmButtonColor: '#F59E0B'
          })
          return
        }

        // 6. Validar Rol
        if (!rolId) {
          Swal.fire({
            icon: 'warning',
            title: 'Campo requerido',
            text: 'Debes seleccionar un rol para el usuario.',
            confirmButtonColor: '#F59E0B'
          })
          return
        }

        const usuarioData = { nombreUsuario, nombre, apellido, email, password, contrasena: password, rolId }
        const newUser = await usuarioService.create(usuarioData)
        const newUserId = newUser?.id || newUser
        if (imagenUrl && newUserId) {
          try { await usuarioService.actualizarImagen(newUserId, imagenUrl) } catch(e) { console.warn('[USUARIOS] Error actualizando imagen:', e) }
        }
        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'Usuario creado exitosamente.',
          confirmButtonColor: '#10B981'
        })
      }

      this.closeUsuarioModal()
      this.loadUsuarios()
    } catch (error) {
      console.error('[saveUsuario]', error)

      // Extraer mensaje amigable del error
      let errorMessage = 'Ocurrió un error al guardar el usuario.'
      
      if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0]
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError
      }

      Swal.fire({
        icon: 'error',
        title: 'Error al guardar usuario',
        text: errorMessage,
        confirmButtonColor: '#f05454'
      })
    }
  }

  async editUsuario(id) {
    const usuario = this.usuarios.find(u => u.id == id)
    if (!usuario) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Usuario no encontrado.', confirmButtonColor: '#f05454' })
      return
    }

    const modal = GlobalModal.getInstance()
    
    const formHTML = `
      <form id="usuarioForm" style="width: 100%;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Nombre Usuario:</label>
          <input type="text" id="usuarioNombreUsuario" placeholder="nombre_usuario" value="${usuario.nombreUsuario || usuario.cedula || ''}" disabled style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box; background-color: #F1F5F9;"/>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Nombre: <span style="color:red">*</span></label>
            <input type="text" id="usuarioNombre" placeholder="Ejemplo: Juan Carlos" value="${usuario.nombre || ''}" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Apellido: <span style="color:red">*</span></label>
            <input type="text" id="usuarioApellido" placeholder="Ejemplo: Pérez" value="${usuario.apellido || ''}" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
          </div>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Email: <span style="color:red">*</span></label>
          <input type="email" id="usuarioEmail" placeholder="Ejemplo: usuario@ejemplo.com" value="${usuario.correo || usuario.email || ''}" required style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Contraseña (dejar vacío para mantener):</label>
          <input type="password" id="usuarioPassword" placeholder="Ejemplo: Pass123@ (mayús, minús, número, símbolo)" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
          <small style="display: block; margin-top: 3px; color: #64748B;">Si deseas cambiar la contraseña, debe contener: mayúscula, minúscula, número y carácter especial (@$!%*?&)</small>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Confirmar Contraseña:</label>
          <input type="password" id="usuarioConfirmPassword" placeholder="Ejemplo: Pass123@ (debe ser igual)" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;"/>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #0F172A;">Rol:</label>
          <select id="usuarioRolId" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box;">
            <option value="">Sin cambios</option>
            ${this.roles.map(rol => `<option value="${rol.id}" ${usuario.rolId == rol.id ? 'selected' : ''}>${rol.nombre}</option>`).join('')}
          </select>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #0F172A;">Imagen de perfil (opcional):</label>
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div id="imgPreview" style="width: 64px; height: 64px; border-radius: 50%; border: 2px dashed #E2E8F0; display: flex; align-items: center; justify-content: center; background: #F8FAFC; overflow: hidden; flex-shrink: 0;">
              <i class="fas fa-user" style="font-size: 20px; color: #94A3B8;"></i>
            </div>
            <div style="flex: 1;">
              <input type="text" id="imagenUrl" placeholder="URL de imagen (https://...)" value="${usuario.imagenUrl || ''}" style="width: 100%; padding: 8px 10px; border: 1px solid #E2E8F0; border-radius: 6px; box-sizing: border-box; margin-bottom: 6px; font-size: 13px;">
              <label for="imagenFile" style="display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; color: #475569;">
                <i class="fas fa-upload"></i> Subir archivo
              </label>
              <input type="file" id="imagenFile" accept="image/*" style="display: none;">
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
          <button type="button" class="btn-cancel-usuario-modal" style="padding: 10px 20px; background: #E2E8F0; color: #1E293B; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Cancelar</button>
          <button type="submit" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Actualizar</button>
        </div>
      </form>
    `
    
    modal.open('Editar Usuario', formHTML)
    
    setTimeout(() => {
      const form = document.getElementById('usuarioForm')
      const btnCancel = document.querySelector('.btn-cancel-usuario-modal')
      
      if (form) {
        // ============ VALIDACIÓN EN TIEMPO REAL ============
        const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
        
        const filtroSoloLetras = (elementId) => {
          const input = document.getElementById(elementId)
          if (input) {
            input.addEventListener('input', (e) => {
              let valor = e.target.value
              // Solo letras (incluyendo acentos) y sin espacios
              valor = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '')
              e.target.value = valor
            })
          }
        }
        
        // Aplicar filtro a campos de solo letras
        filtroSoloLetras('usuarioNombre')
        filtroSoloLetras('usuarioApellido')
        
        // Validar que URL de imagen no tenga espacios
        const imagenUrlInput = document.getElementById('imagenUrl')
        if (imagenUrlInput) {
          imagenUrlInput.addEventListener('input', (e) => {
            // Remover espacios de la URL
            e.target.value = e.target.value.replace(/\s+/g, '')
          })
        }
        
        form.addEventListener('submit', (e) => {
          console.log('[USUARIOS] Submit del formulario de edición')
          this.saveUsuario(e)
        })
      }
      
      if (btnCancel) {
        btnCancel.addEventListener('click', () => {
          console.log('[USUARIOS] Click en Cancelar')
          modal.close()
        })
      }

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
          img.onerror = () => { imgPreview.innerHTML = '<i class="fas fa-user" style="font-size:20px;color:#94A3B8;"></i>' }
          imgPreview.innerHTML = ''
          imgPreview.appendChild(img)
        } else {
          imgPreview.innerHTML = '<i class="fas fa-user" style="font-size:20px;color:#94A3B8;"></i>'
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

  async deleteUsuario(id) {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f05454',
      cancelButtonColor: '#94A3B8'
    })

    if (!result.isConfirmed) return

    try {
      await usuarioService.delete(id)
      Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Usuario eliminado exitosamente.', confirmButtonColor: '#10B981' })
      this.loadUsuarios()
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#f05454' })
      console.error(error)
    }
  }
}
