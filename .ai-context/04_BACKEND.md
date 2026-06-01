# 04_BACKEND.md

**No aplica** — Este proyecto es **frontend exclusivamente**.

## Contexto

El backend está en un repositorio separado:
- **Repo**: https://github.com/bviteri6442/backend-facturas
- **Stack**: .NET (probablemente C# + ASP.NET Core)
- **Database**: PostgreSQL (mencionado en documentación)
- **API**: REST HTTP

Este frontend **depende completamente** del backend para funcionalidad. Sin él, la app no puede:
- Autenticar usuarios
- Persistir datos
- Generar reportes
- Validar cambios

## Integración Frontend-Backend

### URL de API

**Variable de entorno**: `VITE_API_BASE_URL`

| Ambiente | Valor |
|----------|-------|
| Desarrollo local | `http://localhost:56398/api` |
| Desarrollo con ngrok | `https://xxx.ngrok-free.app/api` |
| Producción | `https://backend-facturas-production.up.railway.app/api` |

### Headers esperados en requests

```javascript
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
ngrok-skip-browser-warning: true (si es ngrok)
```

### Endpoints consumidos

Documentados en [API_ENDPOINTS.md](../API_ENDPOINTS.md) (revisar ese archivo para lista completa).

**Ejemplos**:
- `GET /api/usuarios` — Listar usuarios
- `POST /api/ventas` — Crear venta
- `GET /api/productos` — Listar productos
- `GET /api/auditoria` — Obtener logs de auditoría

## Requisitos para ejecutar proyecto

**Obligatorio**: Backend API debe estar en ejecución (local, ngrok o production).

Sin backend, frontend mostrará errores 500/timeout en cualquier operación de datos.

---

**Próxima auditoría**: Revisar repositorio backend-facturas por separado cuando se audite la arquitectura completa.
