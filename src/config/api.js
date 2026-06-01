/**
 * Configuracion central de la API.
 * Todas las peticiones deben usar API_BASE_URL, apiUrl() o los clientes http-client / axios.
 *
 * Variable de entorno (Vite): VITE_API_BASE_URL
 * Ejemplos:
 *   Local HTTP:  http://localhost:56398/api
 *   Local HTTPS: https://localhost:56397/api
 *   Ngrok:       https://xxxx.ngrok-free.app/api
 *   Railway:     https://tu-api.up.railway.app/api
 */

const DEFAULT_LOCAL_API = 'http://localhost:56398/api'

/**
 * Normaliza la URL base: sin barra final, siempre termina en /api
 * @param {string} raw
 * @returns {string}
 */
export function normalizeApiBaseUrl(raw) {
  if (!raw || typeof raw !== 'string') return ''
  let url = raw.trim()
  if (!url) return ''
  url = url.replace(/\/+$/, '')
  if (!url.endsWith('/api')) {
    url = `${url}/api`
  }
  return url
}

const envUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  ''

/** En dev sin .env: /api pasa por el proxy de Vite (evita CORS y avisos de ngrok) */
const DEV_PROXY_API = '/api'

export const API_BASE_URL =
  normalizeApiBaseUrl(envUrl) ||
  (import.meta.env.DEV ? DEV_PROXY_API : DEFAULT_LOCAL_API)

/** true si la URL viene de .env (no del fallback local/proxy) */
export const API_CONFIGURED_VIA_ENV = Boolean(normalizeApiBaseUrl(envUrl))

/** true si las peticiones van al proxy relativo /api (recomendado en npm run dev + ngrok) */
export const API_USES_VITE_PROXY =
  import.meta.env.DEV && API_BASE_URL === DEV_PROXY_API

/**
 * Construye URL absoluta para un endpoint (/ventas, /auth/login, etc.)
 * @param {string} path
 * @returns {string}
 */
export function apiUrl(path = '') {
  const endpoint = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${endpoint}`
}

if (import.meta.env.DEV) {
  const mode = API_CONFIGURED_VIA_ENV
    ? '(env)'
    : API_USES_VITE_PROXY
      ? '(proxy Vite → revisa VITE_API_PROXY_TARGET o VITE_API_BASE_URL en .env.local)'
      : '(default local)'
  console.info('[API] Base URL:', API_BASE_URL, mode)
}

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTRO: '/auth/registro',

  CLIENTES: '/clientes',
  CLIENTES_BY_ID: (id) => `/clientes/${id}`,
  CLIENTES_BUSCAR: '/clientes/buscar',

  PRODUCTOS: '/productos',
  PRODUCTOS_BY_ID: (id) => `/productos/${id}`,
  PRODUCTOS_DISPONIBLES: '/productos/disponibles',

  VENTAS: '/ventas',
  VENTAS_BY_ID: (id) => `/ventas/${id}`,
  VENTAS_BY_NUMERO: (numeroFactura) => `/ventas/numero/${numeroFactura}`,
  VENTAS_PDF: (id) => `/ventas/${id}/pdf`,
  VENTAS_PDF_BY_NUMERO: (numeroFactura) => `/ventas/numero/${numeroFactura}/pdf`,

  USUARIOS: '/usuarios',
  USUARIOS_BY_ID: (id) => `/usuarios/${id}`,
  USUARIOS_DESBLOQUEAR: (id) => `/usuarios/${id}/desbloquear`,

  ROLES: '/roles',

  VENTAS_MES_ACTUAL: '/ventas/mes-actual',

  PRODUCTOS_IMAGEN: (id) => `/productos/${id}/imagen`,

  USUARIOS_IMAGEN: (id) => `/usuarios/${id}/imagen`,

  CLIENTES_BY_USER: (userId) => `/clientes/by-user/${userId}`,
  CLIENTES_AGREGAR_SALDO: (id) => `/clientes/${id}/agregar-saldo`,
  CLIENTES_MI_PERFIL: (id) => `/clientes/${id}/mi-perfil`,

  LOGS_INTENTOS_LOGIN: '/logs/intentos-login',
  LOGS_INTENTOS_LOGIN_STATS: '/logs/intentos-login/estadisticas',
  LOGS_INTENTOS_LOGIN_PDF: '/logs/intentos-login/pdf',
  LOGS_ERRORES: '/logs/errores',
  LOGS_ERRORES_STATS: '/logs/errores/estadisticas',
  LOGS_ERRORES_PDF: '/logs/errores/pdf',
  LOGS_ERROR_REVISAR: (id) => `/logs/errores/${id}/revisar`,

  ERROR_LOGS: '/errorlogs',
  ERROR_LOGS_BY_ID: (id) => `/errorlogs/${id}`,
  ERROR_LOGS_REVISAR: (id) => `/errorlogs/${id}/revisar`,
  ERROR_LOGS_RESUMEN_TIPO: '/errorlogs/resumen/por-tipo',
  ERROR_LOGS_RESUMEN_SEVERIDAD: '/errorlogs/resumen/por-severidad',

  AUDITORIAS_ACCIONES: '/auditorias/acciones',
  AUDITORIAS_BY_USUARIO: (id) => `/auditorias/usuario/${id}`,
  AUDITORIAS_BY_MODULO: (modulo) => `/auditorias/modulo/${modulo}`,
  AUDITORIAS_REGISTRAR: '/auditorias/registrar',

  ELIMINACIONES_USUARIOS: '/eliminacionesusuarios',
  ELIMINACIONES_USUARIOS_BY_ID: (id) => `/eliminacionesusuarios/${id}`,
  ELIMINACIONES_USUARIOS_BUSCAR: (termino) => `/eliminacionesusuarios/buscar/${termino}`,
  ELIMINACIONES_USUARIOS_POR_FECHA: '/eliminacionesusuarios/por-fecha',
  ELIMINACIONES_USUARIOS_ESTADISTICAS: '/eliminacionesusuarios/estadisticas',
  ELIMINACIONES_USUARIOS_PDF: '/eliminacionesusuarios/pdf',

  ELIMINACIONES_PRODUCTOS: '/eliminacionesproductos',
  ELIMINACIONES_PRODUCTOS_BY_ID: (id) => `/eliminacionesproductos/${id}`,
  ELIMINACIONES_PRODUCTOS_BUSCAR: (termino) => `/eliminacionesproductos/buscar/${termino}`,
  ELIMINACIONES_PRODUCTOS_ESTADISTICAS: '/eliminacionesproductos/estadisticas',
  ELIMINACIONES_PRODUCTOS_PDF: '/eliminacionesproductos/pdf',

  RESUMEN_FACTURAS: '/resumenfacturas',
  RESUMEN_FACTURAS_BY_VENTA: (ventaId) => `/resumenfacturas/venta/${ventaId}`,
  RESUMEN_FACTURAS_RANGO: '/resumenfacturas/rango',
  RESUMEN_FACTURAS_STATS: '/resumenfacturas/estadisticas'
}
