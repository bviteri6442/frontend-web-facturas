import { authService } from './services/authService.js'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

// ============ MODAL DE REGISTRO ============
const registerModal = document.getElementById('registerModal')
const registerLink = document.getElementById('registerLink')
const closeRegisterModal = document.getElementById('closeRegisterModal')
const registerForm = document.getElementById('registerForm')
const registerBtn = document.getElementById('registerBtn')
const registerError = document.getElementById('registerError')
const registerSuccess = document.getElementById('registerSuccess')
const toggleRegPassword = document.getElementById('toggleRegPassword')
const regContrasena = document.getElementById('regContrasena')
const toggleRegConfirmPassword = document.getElementById('toggleRegConfirmPassword')
const regConfirmContrasena = document.getElementById('regConfirmContrasena')

registerLink.addEventListener('click', () => {
  registerModal.classList.add('active')
  registerForm.reset()
  registerError.classList.remove('show')
  registerSuccess.classList.remove('show')
})

closeRegisterModal.addEventListener('click', () => {
  registerModal.classList.remove('active')
})

registerModal.addEventListener('click', (e) => {
  if (e.target === registerModal) {
    registerModal.classList.remove('active')
  }
})

const filtroSoloLetrasSinEspacios = (input) => {
  input.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '')
  })
}

filtroSoloLetrasSinEspacios(document.getElementById('regNombreUsuario'))
filtroSoloLetrasSinEspacios(document.getElementById('regNombre'))
filtroSoloLetrasSinEspacios(document.getElementById('regApellido'))

document.getElementById('regNombreUsuario').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').substring(0, 20)
})
document.getElementById('regNombre').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').substring(0, 20)
})
document.getElementById('regApellido').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').substring(0, 20)
})

toggleRegPassword.addEventListener('click', (e) => {
  e.preventDefault()
  e.stopPropagation()
  const isPassword = regContrasena.type === 'password'
  regContrasena.type = isPassword ? 'text' : 'password'
  toggleRegPassword.innerHTML = isPassword
    ? '<i class="fas fa-eye-slash"></i>'
    : '<i class="fas fa-eye"></i>'
})

toggleRegConfirmPassword.addEventListener('click', (e) => {
  e.preventDefault()
  e.stopPropagation()
  const isPassword = regConfirmContrasena.type === 'password'
  regConfirmContrasena.type = isPassword ? 'text' : 'password'
  toggleRegConfirmPassword.innerHTML = isPassword
    ? '<i class="fas fa-eye-slash"></i>'
    : '<i class="fas fa-eye"></i>'
})

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('regEmail').value.trim()
  const nombreUsuario = document.getElementById('regNombreUsuario').value.trim()
  const nombre = document.getElementById('regNombre').value.trim()
  const apellido = document.getElementById('regApellido').value.trim()
  const contrasena = document.getElementById('regContrasena').value
  const confirmContrasena = document.getElementById('regConfirmContrasena').value

  try {
    registerBtn.disabled = true
    registerError.classList.remove('show')
    registerSuccess.classList.remove('show')

    const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!email || !emailRegex.test(email)) {
      throw new Error('Por favor ingresa un email válido (ej: juan@ejemplo.com)')
    }

    const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
    if (!nombreUsuario || nombreUsuario.length < 3 || nombreUsuario.length > 20 || !soloLetrasRegex.test(nombreUsuario)) {
      throw new Error('Nombre de usuario: 3-20 letras, sin números')
    }
    if (!nombre || nombre.length < 2 || !soloLetrasRegex.test(nombre)) {
      throw new Error('Nombre: 2-20 letras')
    }
    if (!apellido || apellido.length < 2 || !soloLetrasRegex.test(apellido)) {
      throw new Error('Apellido: 2-20 letras')
    }

    const contraseniaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    if (!contrasena || contrasena.length < 8 || !contraseniaRegex.test(contrasena)) {
      throw new Error('Contraseña: 8+ chars, mayús, minús, número y símbolo (@$!%*?&)')
    }
    if (contrasena !== confirmContrasena) {
      throw new Error('Las contraseñas no coinciden')
    }

    await authService.registro({
      Email: email,
      NombreUsuario: nombreUsuario,
      Nombre: nombre,
      Apellido: apellido,
      Contrasena: contrasena
    })

    await Swal.fire({
      icon: 'success',
      title: '¡Cuenta Creada!',
      text: 'Redirigiendo al login...',
      confirmButtonColor: '#10B981',
      timer: 2000,
      showConfirmButton: false
    })
    registerModal.classList.remove('active')
    registerForm.reset()
  } catch (error) {
    registerBtn.disabled = false
    await Swal.fire({
      icon: 'error',
      title: 'Error al Crear Cuenta',
      text: error.message || 'Error al crear la cuenta',
      confirmButtonColor: '#f05454'
    })
  }
})

// ============ LOGIN ============
const form = document.getElementById('loginForm')
const errorMessage = document.getElementById('errorMessage')
const loginBtn = document.getElementById('loginBtn')
const passwordInput = document.getElementById('contrasena')
const togglePasswordBtn = document.getElementById('togglePassword')

togglePasswordBtn.addEventListener('click', (e) => {
  e.preventDefault()
  const isPassword = passwordInput.type === 'password'
  passwordInput.type = isPassword ? 'text' : 'password'
  togglePasswordBtn.innerHTML = isPassword
    ? '<i class="fas fa-eye-slash"></i>'
    : '<i class="fas fa-eye"></i>'
})

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value
  const contrasena = document.getElementById('contrasena').value

  try {
    loginBtn.disabled = true
    errorMessage.classList.remove('show')

    const data = await authService.login(email, contrasena)

    if (!data?.token) {
      throw new Error(data?.mensaje || 'Credenciales incorrectas')
    }

    localStorage.setItem('authToken', data.token)
    localStorage.setItem('currentUser', JSON.stringify({
      id: data.usuarioId,
      email: data.correo,
      nombre: data.nombreCompleto,
      nombreUsuario: data.nombreUsuario,
      rol: data.rol
    }))

    window.location.href = '/index.html'
  } catch (error) {
    let mensajeUsuario = 'Error al iniciar sesión'
    if (error.response?.status === 400) {
      mensajeUsuario = 'Email o contraseña incorrectos.'
    } else if (error.friendlyMessage) {
      mensajeUsuario = error.friendlyMessage
    } else if (error.message) {
      mensajeUsuario = error.message
    }
    errorMessage.textContent = mensajeUsuario
    errorMessage.classList.add('show')
    loginBtn.disabled = false
  }
})
