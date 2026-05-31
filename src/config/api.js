
// Configuración de API
// En producción usa la variable de entorno VITE_API_BASE_URL
// En desarrollo usa el backend local

const DATABASE = 'postgresql' // Opciones: 'postgresql' o 'sqlite'

const BACKENDS = {
  postgresql: 'https://localhost:56397/api',
  sqlite: 'http://localhost:56398/api'
}

// Usar variable de entorno en producción, o el backend local en desarrollo
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || BACKENDS[DATABASE]

// Para mostrar en la UI qué base de datos está en uso
export const CURRENT_DATABASE = import.meta.env.VITE_API_BASE_URL ? 'AZURE' : DATABASE.toUpperCase()

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTRO: '/auth/registro',
  
  // Clientes
  CLIENTES: '/clientes',
  CLIENTES_BY_ID: (id) => `/clientes/${id}`,
  CLIENTES_BUSCAR: '/clientes/buscar',
  
  // Productos
  PRODUCTOS: '/productos',
  PRODUCTOS_BY_ID: (id) => `/productos/${id}`,
  PRODUCTOS_DISPONIBLES: '/productos/disponibles',
  
  // Ventas
  VENTAS: '/ventas',
  VENTAS_BY_ID: (id) => `/ventas/${id}`,
  VENTAS_BY_NUMERO: (numeroFactura) => `/ventas/numero/${numeroFactura}`,
  VENTAS_PDF: (id) => `/ventas/${id}/pdf`,
  VENTAS_PDF_BY_NUMERO: (numeroFactura) => `/ventas/numero/${numeroFactura}/pdf`,
  
  // Usuarios
  USUARIOS: '/usuarios',
  USUARIOS_BY_ID: (id) => `/usuarios/${id}`,
  USUARIOS_DESBLOQUEAR: (id) => `/usuarios/${id}/desbloquear`,
  
  // Roles
  ROLES: '/roles',
  
  // Ventas - endpoints adicionales
  VENTAS_MES_ACTUAL: '/ventas/mes-actual',

  // Productos - endpoints adicionales
  PRODUCTOS_IMAGEN: (id) => `/productos/${id}/imagen`,

  // Usuarios - endpoints adicionales
  USUARIOS_IMAGEN: (id) => `/usuarios/${id}/imagen`,

  // Clientes - endpoints adicionales
  CLIENTES_BY_USER: (userId) => `/clientes/by-user/${userId}`,
  CLIENTES_AGREGAR_SALDO: (id) => `/clientes/${id}/agregar-saldo`,
  CLIENTES_MI_PERFIL: (id) => `/clientes/${id}/mi-perfil`,

  // Logs (Auditoría)
  LOGS_INTENTOS_LOGIN: '/logs/intentos-login',
  LOGS_INTENTOS_LOGIN_STATS: '/logs/intentos-login/estadisticas',
  LOGS_INTENTOS_LOGIN_PDF: '/logs/intentos-login/pdf',
  LOGS_ERRORES: '/logs/errores',
  LOGS_ERRORES_STATS: '/logs/errores/estadisticas',
  LOGS_ERRORES_PDF: '/logs/errores/pdf',
  LOGS_ERROR_REVISAR: (id) => `/logs/errores/${id}/revisar`,
  
  // Error Logs (controlador directo /errorlogs)
  ERROR_LOGS: '/errorlogs',
  ERROR_LOGS_BY_ID: (id) => `/errorlogs/${id}`,
  ERROR_LOGS_REVISAR: (id) => `/errorlogs/${id}/revisar`,
  ERROR_LOGS_RESUMEN_TIPO: '/errorlogs/resumen/por-tipo',
  ERROR_LOGS_RESUMEN_SEVERIDAD: '/errorlogs/resumen/por-severidad',

  // Auditorías
  AUDITORIAS_ACCIONES: '/auditorias/acciones',
  AUDITORIAS_BY_USUARIO: (id) => `/auditorias/usuario/${id}`,
  AUDITORIAS_BY_MODULO: (modulo) => `/auditorias/modulo/${modulo}`,
  AUDITORIAS_REGISTRAR: '/auditorias/registrar',

  // Eliminaciones de Usuarios
  ELIMINACIONES_USUARIOS: '/eliminacionesusuarios',
  ELIMINACIONES_USUARIOS_BY_ID: (id) => `/eliminacionesusuarios/${id}`,
  ELIMINACIONES_USUARIOS_BUSCAR: (termino) => `/eliminacionesusuarios/buscar/${termino}`,
  ELIMINACIONES_USUARIOS_POR_FECHA: '/eliminacionesusuarios/por-fecha',
  ELIMINACIONES_USUARIOS_ESTADISTICAS: '/eliminacionesusuarios/estadisticas',
  ELIMINACIONES_USUARIOS_PDF: '/eliminacionesusuarios/pdf',

  // Eliminaciones de Productos
  ELIMINACIONES_PRODUCTOS: '/eliminacionesproductos',
  ELIMINACIONES_PRODUCTOS_BY_ID: (id) => `/eliminacionesproductos/${id}`,
  ELIMINACIONES_PRODUCTOS_BUSCAR: (termino) => `/eliminacionesproductos/buscar/${termino}`,
  ELIMINACIONES_PRODUCTOS_ESTADISTICAS: '/eliminacionesproductos/estadisticas',
  ELIMINACIONES_PRODUCTOS_PDF: '/eliminacionesproductos/pdf',

  // Resumen Facturas (BD secundaria 'ejemplo')
  RESUMEN_FACTURAS: '/resumenfacturas',
  RESUMEN_FACTURAS_BY_VENTA: (ventaId) => `/resumenfacturas/venta/${ventaId}`,
  RESUMEN_FACTURAS_RANGO: '/resumenfacturas/rango',
  RESUMEN_FACTURAS_STATS: '/resumenfacturas/estadisticas'
}
