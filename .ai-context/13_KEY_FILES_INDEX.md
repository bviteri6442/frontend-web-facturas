# 📇 13_KEY_FILES_INDEX.md

## Quick Navigation Index

### Core Application Files

| File | Purpose | Lines | Priority |
|------|---------|-------|----------|
| [index.html](../index.html) | Main app entry point (HTML) | ~50 | P0 |
| [src/main.js](../src/main.js) | Application bootstrap | ~150 | P0 |
| [src/router.js](../src/router.js) | SPA routing | ~100 | P0 |
| [src/store.js](../src/store.js) | Global state management | ~40 | P0 |
| [src/login.js](../src/login.js) | Login/register page logic | ~200+ | P0 |

### Configuration Files

| File | Purpose | Type |
|------|---------|------|
| [vite.config.js](../vite.config.js) | Vite build config | Build |
| [src/config/api.js](../src/config/api.js) | API URL configuration | Config |
| [.env.example](../.env.example) | Environment template | Config |
| [.env.local](../.env.local) | Development environment | Config (gitignored) |
| [.eslintrc.cjs](.eslintrc.cjs) | ESLint configuration | Lint |

---

## Feature Modules (Pages)

| Page | File | Functionality | CRUD Operations |
|------|------|---------------|-----------------|
| **Dashboard** | [src/pages/dashboard.js](../src/pages/dashboard.js) | Overview, stats | Read |
| **Usuarios** | [src/pages/usuarios.js](../src/pages/usuarios.js) | User management | CRUD |
| **Productos** | [src/pages/productos.js](../src/pages/productos.js) | Product catalog | CRUD |
| **Clientes** | [src/pages/clientes.js](../src/pages/clientes.js) | Customer database | CRUD |
| **Ventas** | [src/pages/ventas.js](../src/pages/ventas.js) | Sales history | Read |
| **Nueva Venta** | [src/pages/nuevaventa.js](../src/pages/nuevaventa.js) | Create sale + PDF | Create |
| **Logs** | [src/pages/logs.js](../src/pages/logs.js) | System audit logs | Read |
| **Error Logs** | [src/pages/error-logs.js](../src/pages/error-logs.js) | Backend errors | Read |
| **Auditoria** | [src/pages/auditoria.js](../src/pages/auditoria.js) | Change tracking | Read |
| **Perfil** | [src/pages/perfil.js](../src/pages/perfil.js) | User profile (modal) | Read/Update |
| **Eliminaciones*** | [src/pages/eliminaciones-*.js](../src/pages/) | Soft-delete logs (4 variants) | Read |

---

## Service Layer (API Abstraction)

| Service | File | Entities | Purpose |
|---------|------|----------|---------|
| **HTTP Client** | [src/services/http-client.js](../src/services/http-client.js) | - | Fetch wrapper with auth |
| **Axios** | [src/services/axios.js](../src/services/axios.js) | - | Axios instance (fallback) |
| **Auth** | [src/services/authService.js](../src/services/authService.js) | usuarios (login) | Authentication |
| **Usuarios** | [src/services/usuarioService.js](../src/services/usuarioService.js) | usuarios | User CRUD |
| **Productos** | [src/services/productoService.js](../src/services/productoService.js) | productos | Product CRUD |
| **Clientes** | [src/services/clienteService.js](../src/services/clienteService.js) | clientes | Customer CRUD |
| **Ventas** | [src/services/ventaService.js](../src/services/ventaService.js) | ventas | Sales queries |
| **Auditoria** | [src/services/auditoriaService.js](../src/services/auditoriaService.js) | auditoria | Audit logs |
| **Logs** | [src/services/logsService.js](../src/services/logsService.js) | logs | System logs |
| **Error Logs** | [src/services/errorLogService.js](../src/services/errorLogService.js) | error_logs | Error tracking |
| **Eliminaciones** | [src/services/eliminacion*Service.js](../src/services/) | soft_delete_logs | Deletion tracking (3 services) |
| **Resumen Factura** | [src/services/resumenFacturaService.js](../src/services/resumenFacturaService.js) | ventas | Invoice summary |
| **Roles** | [src/services/rolService.js](../src/services/rolService.js) | roles | Role listing |
| **Cloudinary** | [src/services/cloudinaryService.js](../src/services/cloudinaryService.js) | - | Image storage |

---

## Reusable Components

| Component | File | Purpose | Usage |
|-----------|------|---------|-------|
| **GlobalModal** | [src/components/GlobalModal.js](../src/components/GlobalModal.js) | Generic confirmation modals | Used in deletions, confirmations |
| **PaginationAdvanced** | [src/components/PaginationAdvanced.js](../src/components/PaginationAdvanced.js) | Pagination controls | Used in list pages |

---

## Utilities & Helpers

| Utility | File | Functions | Purpose |
|---------|------|-----------|---------|
| **Helpers** | [src/utils/helpers.js](../src/utils/helpers.js) | `formatCurrency()`, `formatDate()`, etc. | Formatting utilities |
| **Cedula Validator** | [src/utils/cedulaValidator.js](../src/utils/cedulaValidator.js) | `validateCedula()` | Ecuador ID validation |
| **Error Handler** | [src/utils/errorHandler.js](../src/utils/errorHandler.js) | `handleApiError()` | Error formatting |
| **API Response** | [src/utils/apiResponse.js](../src/utils/apiResponse.js) | Response parsing | Response type checking |
| **Axios Utils** | [src/utils/axios.js](../src/utils/axios.js) | Axios config | Axios initialization |

---

## Styling

| File | Scope | Size |
|------|-------|------|
| [src/assets/styles/login.css](../src/assets/styles/login.css) | Login page | ~500 lines |
| [src/assets/styles/main.css](../src/assets/styles/main.css) | App layout + all pages | ~1000+ lines |

---

## Documentation Files

| Document | Purpose |
|----------|---------|
| [README.md](../README.md) | Project overview + setup |
| [API_ENDPOINTS.md](../API_ENDPOINTS.md) | Backend API endpoints consumed |
| [PROYECTO_COMPLETO.md](../PROYECTO_COMPLETO.md) | Complete feature documentation |
| [CONEXION_BACKEND_NGROK.md](../CONEXION_BACKEND_NGROK.md) | Ngrok tunneling guide |
| [FUNCIONALIDAD_VENTAS.md](../FUNCIONALIDAD_VENTAS.md) | Sales feature details |
| [INICIO_RAPIDO.md](../INICIO_RAPIDO.md) | Quick start guide |
| [INSTRUCCIONES_EJECUCION.md](../INSTRUCCIONES_EJECUCION.md) | Execution instructions |
| [MEJORAS_ERRORES.md](../MEJORAS_ERRORES.md) | Known issues + improvements |
| [RAILWAY_BACKEND_LOCAL.md](../RAILWAY_BACKEND_LOCAL.md) | Railway deployment guide |

---

## Build Artifacts (Generated)

| Directory | Purpose | Gitignored? |
|-----------|---------|------------|
| `dist/` | Vite build output | ✅ Yes |
| `node_modules/` | Dependencies | ✅ Yes |
| `.next/` | (if Next.js) | ✅ N/A |

---

## Static Assets

| Path | Contents |
|------|----------|
| [public/](../public/) | Static files (images, etc.) |
| [login.html](../login.html) | Login page HTML |

---

## File Statistics

| Category | Count | Lines |
|----------|-------|-------|
| Pages | 14 | ~2000 |
| Services | 13 | ~1500 |
| Components | 2 | ~300 |
| Utils | 5 | ~500 |
| Styles | 2 | ~1500 |
| Config | 5 | ~200 |
| **Total** | **~40** | **~5500-6000** |

---

## Critical Path (Most Important Files to Understand)

**For new developers, read in this order**:

1. [README.md](../README.md) — Overview
2. [src/main.js](../src/main.js) — App bootstrap
3. [src/router.js](../src/router.js) — Navigation
4. [src/pages/dashboard.js](../src/pages/dashboard.js) — Example page
5. [src/services/authService.js](../src/services/authService.js) — Auth flow
6. [src/services/usuarioService.js](../src/services/usuarioService.js) — API pattern
7. [vite.config.js](../vite.config.js) — Build setup
8. [src/config/api.js](../src/config/api.js) — API configuration

---

## Dangerous/Sensitive Files

| File | Why | Action |
|------|-----|--------|
| `.env.local` | Dev secrets | ✅ Gitignored |
| `.env.production` | Prod secrets | ⚠️ Check if committed |
| `pdfendpointsdelbackend.pdf` | Backend URLs exposed | 🔴 Should not be in repo |

---

## 🔗 FILES AT A GLANCE

All files above with their purposes clearly mapped.
