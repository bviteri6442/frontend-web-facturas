/**
 * Normaliza respuestas del backend para listas y objetos paginados.
 */

export function assertApiData(response, resourceLabel = 'datos') {
  if (response === null || response === undefined) {
    throw new Error(
      `No se pudieron cargar ${resourceLabel}. Revisa la consola (F12), ` +
      'VITE_API_BASE_URL en .env.local y que el backend esté activo.'
    )
  }
}

/** Respuesta paginada estándar: { total, page, limit, data } */
export function unwrapPaged(response, resourceLabel = 'datos') {
  assertApiData(response, resourceLabel)
  const body = response?.data ?? response

  if (body && typeof body === 'object' && Array.isArray(body.data)) {
    return {
      total: Number(body.total ?? body.data.length),
      page: Number(body.page ?? 1),
      limit: Number(body.limit ?? body.data.length),
      data: body.data
    }
  }

  const list = unwrapList(response)
  return {
    total: list.length,
    page: 1,
    limit: list.length,
    data: list
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
