/**
 * Normaliza respuestas del backend para listas y objetos.
 * Evita mostrar "0 registros" cuando la API fallo o devolvio vacio sin datos.
 */

export function assertApiData(response, resourceLabel = 'datos') {
  if (response === null || response === undefined) {
    throw new Error(
      `No se pudieron cargar ${resourceLabel}. Revisa la consola (F12), ` +
      'VITE_API_BASE_URL en .env.local y que el backend/ngrok esten activos.'
    )
  }
}

export function unwrapList(response, nestedKeys = []) {
  assertApiData(response)
  if (Array.isArray(response)) return response
  if (response?.data && Array.isArray(response.data)) return response.data
  for (const key of nestedKeys) {
    if (response?.[key] && Array.isArray(response[key])) return response[key]
  }
  return []
}

export function unwrapProductosPage(response) {
  assertApiData(response, 'productos')
  if (response?.productos && Array.isArray(response.productos)) {
    return {
      total: response.total ?? response.productos.length,
      page: response.page ?? 1,
      limit: response.limit ?? response.productos.length,
      productos: response.productos
    }
  }
  const list = unwrapList(response)
  return { total: list.length, page: 1, limit: list.length, productos: list }
}
