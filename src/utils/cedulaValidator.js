/**
 * VALIDADOR DE CÉDULAS ECUATORIANAS - Módulo para Frontend
 * Acepta formatos: 1705678901 o 17-056-789-01
 * Retorna: boolean (true si es válida, false si no)
 */

// Calcular dígito verificador con algoritmo Módulo 10
function calcularDigitoVerificador(primeros9Digitos) {
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
  let suma = 0
  
  for (let i = 0; i < 9; i++) {
    let digito = parseInt(primeros9Digitos[i])
    let producto = digito * coeficientes[i]
    
    if (producto >= 9) {
      producto -= 9
    }
    
    suma += producto
  }
  
  const residuo = suma % 10
  return residuo === 0 ? 0 : 10 - residuo
}

/**
 * Valida una cédula ecuatoriana de persona natural
 * @param {string|number} cedula - Cédula con o sin guiones
 * @returns {boolean} true si es válida, false si no
 */
export function validarCedula(cedula) {
  try {
    if (!cedula) return false
    
    const cedulaStr = String(cedula).trim()
    const soloDigitos = cedulaStr.replace(/-/g, '').replace(/\s/g, '')
    
    // Validar que sea solo dígitos
    if (!/^\d+$/.test(soloDigitos)) return false
    
    // Validar que tenga exactamente 10 dígitos
    if (soloDigitos.length !== 10) return false
    
    // Extraer componentes
    const codigoProvinicia = parseInt(soloDigitos.substring(0, 2))
    const tercerDigito = parseInt(soloDigitos[2])
    const primeros9Digitos = soloDigitos.substring(0, 9)
    const digitoVerificadorRecibido = parseInt(soloDigitos[9])
    
    // Validar provincia [01-24] o 30
    if ((codigoProvinicia < 1 || codigoProvinicia > 24) && codigoProvinicia !== 30) {
      return false
    }
    
    // Validar tercer dígito [0-5] para personas naturales
    if (tercerDigito < 0 || tercerDigito > 5) {
      return false
    }
    
    // Validar que no todos los dígitos sean iguales
    if (/^(\d)\1{9}$/.test(soloDigitos)) {
      return false
    }
    
    // Validar dígito verificador
    const digitoVerificadorCalculado = calcularDigitoVerificador(primeros9Digitos)
    
    if (digitoVerificadorRecibido !== digitoVerificadorCalculado) {
      return false
    }
    
    return true
    
  } catch (error) {
    return false
  }
}

/**
 * Formatea una cédula al formato XX-XXX-XXX-XX
 * @param {string} cedula - Cédula con o sin guiones
 * @returns {string|null} Cédula formateada o null si es inválida
 */
export function formatearCedula(cedula) {
  if (!cedula) return null
  
  const limpia = String(cedula).replace(/-/g, '').replace(/\s/g, '')
  if (!/^\d{10}$/.test(limpia)) {
    return null
  }
  
  return `${limpia.substring(0, 2)}-${limpia.substring(2, 5)}-${limpia.substring(5, 8)}-${limpia.substring(8, 10)}`
}

/**
 * Obtiene mensajes de error claros para validación
 * @param {string} cedula - Cédula a validar
 * @returns {string} Mensaje de error o vacío si es válida
 */
export function obtenerErrorCedula(cedula) {
  if (!cedula) {
    return 'La cédula es requerida'
  }
  
  const cedulaStr = String(cedula).trim()
  const soloDigitos = cedulaStr.replace(/-/g, '').replace(/\s/g, '')
  
  if (!/^\d+$/.test(soloDigitos)) {
    return 'La cédula debe contener solo dígitos'
  }
  
  if (soloDigitos.length !== 10) {
    return 'La cédula debe tener exactamente 10 dígitos'
  }
  
  const codigoProvinicia = parseInt(soloDigitos.substring(0, 2))
  if ((codigoProvinicia < 1 || codigoProvinicia > 24) && codigoProvinicia !== 30) {
    return `Código de provincia inválido (${String(codigoProvinicia).padStart(2, '0')})`
  }
  
  const tercerDigito = parseInt(soloDigitos[2])
  if (tercerDigito < 0 || tercerDigito > 5) {
    return 'La cédula debe ser de persona natural (tercer dígito 0-5)'
  }
  
  if (/^(\d)\1{9}$/.test(soloDigitos)) {
    return 'La cédula no puede tener todos los dígitos iguales'
  }
  
  const primeros9Digitos = soloDigitos.substring(0, 9)
  const digitoVerificadorCalculado = calcularDigitoVerificador(primeros9Digitos)
  const digitoVerificadorRecibido = parseInt(soloDigitos[9])
  
  if (digitoVerificadorRecibido !== digitoVerificadorCalculado) {
    return 'El dígito verificador es incorrecto'
  }
  
  return ''
}
