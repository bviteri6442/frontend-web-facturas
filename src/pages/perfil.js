// Modal de Perfil de Usuario
import Swal from 'sweetalert2'
import { usuarioService } from '../services/usuarioService.js'

export const perfilModal = {
  init() {
    this.attachUserInfoListener()
  },

  attachUserInfoListener() {
    const userInfoBtn = document.getElementById('userInfoBtn')
    if (userInfoBtn) {
      userInfoBtn.addEventListener('click', () => this.showUserProfile())
    }
  },

  getUserData() {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}')
      return {
        id: user.id || user.Id || null,
        nombre: user.nombre || user.name || user.nombreCompleto || 'Usuario',
        email: user.email || user.correo || 'No disponible',
        cedula: user.cedula || user.ci || user.nombreUsuario || 'No disponible',
        rol: user.rol || user.rolNombre || 'Usuario',
        telefono: user.telefono || 'No disponible',
        direccion: user.direccion || 'No disponible',
        imagenUrl: user.imagenUrl || user.ImagenUrl || null
      }
    } catch (error) {
      console.error('[PERFIL] Error obteniendo datos:', error)
      return {
        id: null,
        nombre: 'Usuario',
        email: 'No disponible',
        cedula: 'No disponible',
        rol: 'Usuario',
        telefono: 'No disponible',
        direccion: 'No disponible',
        imagenUrl: null
      }
    }
  },

  async showUserProfile() {
    let user = this.getUserData()

    // Fetch fresh data from API so imagenUrl is always current
    if (user.id) {
      try {
        const fresh = await usuarioService.getById(user.id)
        if (fresh) {
          user.imagenUrl = fresh.imagenUrl || user.imagenUrl
          user.nombre = fresh.nombre
            ? (fresh.nombre + (fresh.apellido ? ' ' + fresh.apellido : ''))
            : user.nombre
          user.rol = fresh.rol || user.rol

          // Persist latest imagenUrl to localStorage
          const stored = JSON.parse(localStorage.getItem('currentUser') || '{}')
          stored.imagenUrl = user.imagenUrl
          localStorage.setItem('currentUser', JSON.stringify(stored))

          // Update topbar avatar immediately
          const avatarIcon = document.querySelector('.user-avatar-icon')
          if (avatarIcon && user.imagenUrl) {
            avatarIcon.innerHTML = `<img src="${user.imagenUrl}" alt="avatar" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid #BFDBFE;" onerror="this.outerHTML='<i class=\\'fas fa-user-circle\\'></i>'">`
          }
        }
      } catch (e) {
        console.warn('[PERFIL] No se pudo obtener datos frescos:', e)
      }
    }

    const avatarHtml = user.imagenUrl
      ? `<img src="${user.imagenUrl}" alt="${user.nombre}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block'">`
      : ''
    const iconStyle = user.imagenUrl ? 'display:none;' : 'display:inline-block;'

    const profileHTML = `
      <div style="text-align: center; padding-top: 10px;">
        <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px;">
          <div style="width: 90px; height: 90px; border-radius: 50%; overflow: hidden; background: #E0E7FF; display: flex; align-items: center; justify-content: center; border: 3px solid #BFDBFE; margin-bottom: 12px;">
            ${avatarHtml}
            <i class="fas fa-user-circle" style="font-size: 60px; color: #3B82F6; ${iconStyle}"></i>
          </div>
          <h3 style="margin: 0; color: #1E293B; font-size: 20px;">${user.nombre}</h3>
          <p style="margin: 4px 0 0; color: #64748B; font-size: 14px;">${user.rol}</p>
        </div>
        <div style="text-align: left;">
          <div style="background: #F1F5F9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; margin-bottom: 5px;">Email</label>
                <p style="margin: 0; color: #1E293B; word-break: break-all;">${user.email}</p>
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; margin-bottom: 5px;">Cédula</label>
                <p style="margin: 0; color: #1E293B;">${user.cedula}</p>
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; margin-bottom: 5px;">Teléfono</label>
                <p style="margin: 0; color: #1E293B;">${user.telefono}</p>
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; margin-bottom: 5px;">Rol</label>
                <p style="margin: 0; color: #1E293B;">${user.rol}</p>
              </div>
            </div>
          </div>
          <div>
            <label style="display: block; font-size: 12px; font-weight: 600; color: #64748B; margin-bottom: 5px;">Dirección</label>
            <p style="margin: 0; color: #1E293B;">${user.direccion}</p>
          </div>
        </div>
      </div>
    `

    Swal.fire({
      title: 'Mi Perfil',
      html: profileHTML,
      confirmButtonColor: '#4ea93b',
      confirmButtonText: 'Cerrar',
      customClass: {
        popup: 'swal2-custom-profile'
      }
    })
  }
}
