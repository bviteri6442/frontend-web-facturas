/**
 * Normaliza respuestas del backend para listas y objetos paginados.
 * Formato API: { total, page, limit, data: [...] }
 */

export function assertApiData(response, resourceLabel = 'datos') {
  if (response === null || response === undefined) {
    throw new Error(
      `No se pudieron cargar ${resourceLabel}. Revisa la consola (F12), ` +
      'VITE_API_BASE_URL y que el backend esté activo.'
    )
  }
}

/** Detecta el sobre paginado estándar del backend .NET */
export function isPagedEnvelope(obj) {
  return (
    obj != null &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    Array.isArray(obj.data) &&
    (typeof obj.total === 'number' || typeof obj.total === 'string')
  )
}

/** Respuesta paginada: devuelve { total, page, limit, data } */
export function unwrapPaged(response, resourceLabel = 'datos') {
  assertApiData(response, resourceLabel)

  // Caso normal: httpClient devuelve { total, page, limit, data }
  if (isPagedEnvelope(response)) {
    return {
      total: Number(response.total),
      page: Number(response.page ?? 1),
      limit: Number(response.limit ?? response.data.length),
      data: response.data
    }
  }

  // Doble envoltorio raro: { data: { total, page, limit, data } }
  if (isPagedEnvelope(response?.data)) {
    const env = response.data
    return {
      total: Number(env.total),
      page: Number(env.page ?? 1),
      limit: Number(env.limit ?? env.data.length),
      data: env.data
    }
  }

  // Lista plana (legacy)
  const list = unwrapList(response)
  return {
    total: list.length,
    page: 1,
    limit: list.length,
    data: list
  }
}

export function unwrapList(response, nestedKeys = []) {
  if (response === null || response === undefined) return []

  if (isPagedEnvelope(response)) return response.data

  if (Array.isArray(response)) return response

  if (isPagedEnvelope(response?.data)) return response.data.data

  if (response?.data && Array.isArray(response.data)) return response.data

  for (const key of nestedKeys) {
    if (response?.[key] && Array.isArray(response[key])) return response[key]
  }
  return []
}

/** Carga todas las páginas (límite backend 200). Usar solo cuando haga falta. */
export async function fetchAllPaged(fetchPage, options = {}) {
  const limit = options.limit ?? 200
  const maxPages = options.maxPages ?? 500
  let page = 1
  let all = []
  let total = 0

  while (page <= maxPages) {
    const result = await fetchPage({ page, limit, ...(options.params || {}) })
    total = result.total
    all = all.concat(result.data)
    if (result.data.length === 0 || all.length >= total) break
    page++
  }

  return { total, data: all }
}

export function unwrapProductosPage(response) {
  const paged = unwrapPaged(response, 'productos')
  return {
    total: paged.total,
    page: paged.page,
    limit: paged.limit,
    productos: paged.data
  }
}
