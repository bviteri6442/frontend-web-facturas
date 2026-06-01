# Paginación del API (Postman y front web)

El backend **no devuelve todos los registros de una vez**. Responde:

```json
{
  "total": 100018,
  "page": 1,
  "limit": 30,
  "data": [ ... hasta 30 ítems ... ]
}
```

## Postman

Base: `https://backend-facturas-production-a3ab.up.railway.app/api`

| Recurso | GET ejemplo |
|---------|-------------|
| Clientes activos | `/Clientes?page=1&limit=30&activo=true` |
| Clientes desactivados | `/Clientes?page=1&limit=30&activo=false` |
| Siguiente página | `/Clientes?page=2&limit=30&activo=true` |
| Buscar | `/Clientes?page=1&limit=30&search=alex&activo=true` |
| Solo total (1 registro) | `/Clientes?page=1&limit=1&activo=true` → usar campo **`total`** |
| Productos | `/productos?page=1&limit=30` |
| Ventas | `/Ventas?page=1&limit=30&clienteId=200043` |
| Usuarios | `/usuarios?page=1&limit=30` |

**Header:** `Authorization: Bearer TU_TOKEN_JWT`

## Front web

- Lista: pide **una página** (`page` + `limit` 10 en tablas).
- Dashboard: usa `page=1&limit=1` y muestra el **`total`** del JSON (no `data.length`).

## Front móvil

- Catálogo: `productos?page=1&limit=30` → leer `data` y `total`.
- Historial: `Ventas?clienteId=X&page=1&limit=100` → leer `data`.
