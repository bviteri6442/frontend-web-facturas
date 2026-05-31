/**
 * Utilidad para extraer mensajes de error claros
 * Prioriza mensajes específicos del servidor sobre mensajes genéricos
 */
import Swal from 'sweetalert2'

export const extractErrorMessage = (error, defaultMessage = 'Ocurrió un error inesperado.') => {
  // Caso 1: Error con mensaje directo
  if (error?.message) {
    return error.message
  }

  // Caso 2: Error de respuesta con mensaje específico
  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  // Caso 3: Errores de validación de campos
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors
    const firstError = Object.values(errors)[0]
    return Array.isArray(firstError) ? firstError[0] : firstError
  }

  // Caso 4: Respuesta con título (validación)
  if (error?.response?.data?.title) {
    return error.response.data.title
  }

  // Caso 5: Mensaje de respuesta con formato alternativo
  if (error?.response?.statusText) {
    return error.response.statusText
  }

  return defaultMessage
}

/**
 * Mostrar error en SweetAlert con mensaje extraído
 */
export const showErrorAlert = (error, title = 'Error', defaultMessage = 'Ocurrió un error inesperado.') => {
  const errorMessage = extractErrorMessage(error, defaultMessage)
  
  Swal.fire({
    icon: 'error',
    title: title,
    text: errorMessage,
    confirmButtonColor: '#f05454',
    allowOutsideClick: false
  })
}

/**
 * Mostrar éxito en SweetAlert
 */
export const showSuccessAlert = (title = 'Éxito', text = 'Operación completada exitosamente.') => {
  Swal.fire({
    icon: 'success',
    title: title,
    text: text,
    confirmButtonColor: '#10B981',
    allowOutsideClick: false
  })
}

/**
 * Mostrar advertencia en SweetAlert
 */
export const showWarningAlert = (title = 'Advertencia', text = 'Por favor revisa los datos.') => {
  Swal.fire({
    icon: 'warning',
    title: title,
    text: text,
    confirmButtonColor: '#F59E0B',
    allowOutsideClick: false
  })
}
