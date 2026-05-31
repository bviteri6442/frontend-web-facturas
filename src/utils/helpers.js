// Format currency
export const formatCurrency = (value) => {
  if (!value && value !== 0) return '$0.00'
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

// Format date
export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// Format datetime
export const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Get user role from token
export const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.rol || ''
}

// Check if user is admin
export const isAdmin = () => {
  const role = getUserRole()
  return role === 'Administrador'
}

// Validate input - only letters
export const onlyLetters = (event) => {
  const char = String.fromCharCode(event.keyCode)
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(char)) {
    event.preventDefault()
  }
}

// Validate input - only numbers
export const onlyNumbers = (event) => {
  const char = String.fromCharCode(event.keyCode)
  if (!/^[0-9]$/.test(char)) {
    event.preventDefault()
  }
}

// Validate input - only decimals
export const onlyDecimals = (event) => {
  const char = String.fromCharCode(event.keyCode)
  const currentValue = event.target.value
  
  // Allow decimal point only once
  if (char === '.' && currentValue.includes('.')) {
    event.preventDefault()
    return
  }
  
  if (!/^[0-9.]$/.test(char)) {
    event.preventDefault()
  }
}

// Calculate IVA (12% Ecuador)
export const calculateIVA = (subtotal, percentage = 12) => {
  return (subtotal * percentage) / 100
}

// Calculate total with IVA
export const calculateTotal = (subtotal, percentage = 12) => {
  return subtotal + calculateIVA(subtotal, percentage)
}

// Log error to backend
export const logError = async (error, context = '') => {
  try {
    const errorLog = {
      mensaje: error.message || 'Unknown error',
      stackTrace: error.stack || '',
      pantalla: context,
      fecha: new Date().toISOString()
    }
    
    // Send to backend (implement this service)
    console.error('Error logged:', errorLog)
    
    // You can call your error logging API here
    // await errorLogService.create(errorLog)
  } catch (err) {
    console.error('Failed to log error:', err)
  }
}
