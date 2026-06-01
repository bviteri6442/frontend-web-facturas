# 🏛️ 02_ARCHITECTURE.md

## Patrón Arquitectónico Identificado

**Patrón primario**: **Monolito Frontend Modular** con arquitectura por capas

**Clasificación**:
- ✅ No es Microservicios
- ✅ No es Serverless
- ✅ No es Component-based (React style)
- ✅ **SÍ es** Monolito modular vanilla JS con pages + services

**Justificación**: Todo el código vive en un solo proyecto Vite. Las "módulos" son:
- `pages/` — Lógica de negocio + rendering por página
- `services/` — Capa de abstracción de API (one service per entity)
- `utils/` — Funciones de utilidad compartidas
- `config/` — Configuración centralizada

**Patrones de diseño secundarios**:
- ✅ Observer Pattern (Store con subscribers)
- ✅ Service Locator (Router tiene acceso a todas las páginas)
- ⚠️ Anemic Domain Model (servicios no tienen lógica, solo API calls)
- ❌ Repository Pattern (servicios son los repositories)
- ❌ Dependency Injection (manual, nada de IoC)

---

## Flujo de Datos

```
┌─────────────────────────────────────────────────────┐
│         USUARIO (Browser)                           │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │   login.html / index.html   │
        │   (HTML estático)       │
        └────────────┬───────────┘
                     │
                     ▼
        ┌──────────────────────────┐
        │  main.js (Bootstrap)     │
        │  • checkAuth()           │
        │  • setupDOM()            │
        │  • setupNavigation()     │
        └────────────┬─────────────┘
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    ┌────────┐  ┌───────┐  ┌─────────┐
    │Router  │  │Store  │  │EventMgr │
    │navigate│  │state  │  │listeners│
    └───┬────┘  └───┬───┘  └────┬────┘
        │           │           │
        ▼           ▼           ▼
    ┌──────────────────────────────────────┐
    │    Page Classes (pages/*.js)         │
    │    • Dashboard, Usuarios, Productos  │
    │    • render()                        │
    │    • attachEventListeners()          │
    └────────────┬─────────────────────────┘
                 │
    ┌────────────┼────────────┬────────────┐
    ▼            ▼            ▼            ▼
┌──────┐    ┌──────────┐  ┌─────────┐  ┌────────┐
│Utils │    │Components│  │Services │  │Modals  │
│      │    │GlobalMdl │  │http-clt │  │SweetAl│
│format│    │Pagination│  │Axios    │  │notify │
└──────┘    └──────────┘  └────┬────┘  └────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │                           │
    ┌────────────▼────────┐     ┌──────────▼──────┐
    │   http-client.js    │     │   axios.js      │
    │   (Fetch wrapper)   │     │   (Fallback)    │
    │   • getHeaders()    │     │                 │
    │   • resolveUrl()    │     │ (Hybrid setup)  │
    │   • request()       │     │                 │
    └────────────┬────────┘     └──────────┬──────┘
                 │                         │
                 └────────────┬────────────┘
                              │
                 ┌────────────▼──────────┐
                 │   BACKEND API REST    │
                 │   (.NET)              │
                 │   /api/usuarios       │
                 │   /api/productos      │
                 │   /api/ventas         │
                 └───────────────────────┘
                              │
                 ┌────────────▼──────────┐
                 │   DATABASE            │
                 │   PostgreSQL          │
                 └───────────────────────┘
```

---

## Capas Arquitectónicas

### 1. **Presentation Layer** (index.html + login.html)

Dos puntos de entrada HTML:
- `index.html` — App principal (protegida por auth en main.js)
- `login.html` — Página de login/registro (standalone)

**Responsabilidades**:
- Estructura base DOM
- Script loading (main.js, login.js)
- Asset references (CSS, fonts)

### 2. **Application Layer** (main.js, router.js, store.js)

**main.js**:
- Bootstrap de la app
- Auth check (localStorage)
- DOM setup
- Navigation setup
- Event listener orchestration

**router.js**:
- Single Page Router implementado manualmente
- No usa librería (Vue Router, React Router, etc.)
- Mapea página names a clases
- Ejecuta render() en cambio de página
- Manejo de estados de navegación

**store.js**:
- Estado global minimalista (currentUser, currentPage, isLoading)
- Observable pattern (subscribers)
- No hay Redux/Zustand/Pinia

### 3. **Page Layer** (src/pages/*.js)

14 Page classes (cada una es un módulo):

| Clase | Responsabilidad |
|-------|-----------------|
| **Dashboard** | Resumen de ventas, estadísticas |
| **Usuarios** | CRUD de usuarios con roles |
| **Productos** | Catálogo de productos |
| **Clientes** | Cartera de clientes |
| **Ventas** | Histórico de transacciones |
| **NuevaVenta** | Crear venta (carrito + factura PDF) |
| **Logs** | Auditoría del sistema |
| **ErrorLogs** | Registro de errores backend |
| **Eliminaciones*** | Reportes de soft-deletes (4 variantes) |
| **Auditoria** | Trazabilidad de cambios |
| **Perfil** | Usuario actual (en Modal, no página completa) |

**Pattern de Page**:
```javascript
export class NombrePagina {
  constructor(mainContent) {
    this.mainContent = mainContent
  }
  
  async render() {
    // Generate HTML from service data
    this.mainContent.innerHTML = `<div>...</div>`
    this.attachEventListeners()
  }
  
  attachEventListeners() {
    // Attach all event handlers
    document.querySelector('.btn-save').addEventListener('click', () => {})
  }
}
```

### 4. **Service Layer** (src/services/*.js)

13 servicios (uno por entidad + 2 genéricos):

| Servicio | Responsabilidad |
|----------|-----------------|
| **http-client.js** | Fetch wrapper con auth headers |
| **axios.js** | Axios wrapper (fallback legacy) |
| **authService.js** | Login, logout, user validation |
| **usuarioService.js** | CRUD usuarios |
| **productoService.js** | CRUD productos |
| **clienteService.js** | CRUD clientes |
| **ventaService.js** | CRUD ventas, resumen |
| **auditoriaService.js** | Obtener logs auditoría |
| **logsService.js** | Obtener logs del sistema |
| **errorLogService.js** | Obtener error logs |
| **eliminacionUserService.js** | Reportes de users eliminados |
| **eliminacionProductoService.js** | Reportes de productos eliminados |
| **resumenFacturaService.js** | Cálculos de facturas |
| **rolService.js** | Obtener roles disponibles |
| **cloudinaryService.js** | Upload de imágenes |

**Pattern de Service**:
```javascript
export class NombreService {
  static async getAll(filters = {}) {
    const url = apiUrl(`/nombre`)
    return httpClient.get(url)
  }
  
  static async create(data) {
    const url = apiUrl(`/nombre`)
    return httpClient.post(url, data)
  }
}
```

### 5. **Utility Layer** (src/utils/*.js)

Funciones compartidas:

| Archivo | Propósito |
|---------|-----------|
| **helpers.js** | Formatters (currency, dates, etc.) |
| **cedulaValidator.js** | Validación de cédula ecuatoriana |
| **errorHandler.js** | Error parsing y formatting |
| **apiResponse.js** | Response type checking |
| **axios.js** | Axios instance config |

### 6. **Configuration Layer** (src/config/api.js)

- URL base normalization
- API URL resolution (local/ngrok/production)
- Fallback logic

---

## Módulos y Boundaries

```
frontend-web-facturas/
│
├─── PRESENTATION (HTML files)
│    ├── index.html
│    └── login.html
│
├─── APPLICATION (Bootstrap & Routing)
│    ├── main.js
│    ├── router.js (SPA routing)
│    └── store.js (global state)
│
├─── PAGES (Feature modules)
│    ├── [Users] usuarios.js
│    ├── [Products] productos.js
│    ├── [Sales] ventas.js, nuevaventa.js
│    ├── [Audit] logs.js, auditoria.js, error-logs.js
│    ├── [Reports] eliminaciones-*.js
│    └── [Dashboard] dashboard.js
│
├─── SERVICES (API Layer)
│    ├── [Auth] authService.js, http-client.js, axios.js
│    ├── [Domain] *Service.js (one per entity)
│    └── [External] cloudinaryService.js
│
├─── COMPONENTS (Reusable UI)
│    ├── GlobalModal.js
│    └── PaginationAdvanced.js
│
├─── UTILS (Shared functions)
│    ├── helpers.js
│    ├── validators.js
│    └── errorHandler.js
│
└─── CONFIG (Constants)
     └── api.js
```

---

## Dependencias Entre Módulos

**Verde = Ok, Rojo = Acoplamiento alto**

```
pages/* → services/* ✅ (dependencia esperada)
pages/* → utils/* ✅ (dependencia esperada)
pages/* → router ⚠️ (páginas acceden a router global)
pages/* → store ✅ (páginas pueden leer state)
pages/* → components/* ✅ (páginas usan modales)

services/* → config/api ✅ (acceso a URL base)
services/* → utils/* ✅ (helpers compartidos)

Login.js → main.js ⚠️ (login.js es standalone)
```

**⚠️ Problemas de acoplamiento**:
1. Páginas acceden a `window.router` (inyección global)
2. Páginas acceden a `window.store` (inyección global)
3. No hay inversión de dependencias

---

## Estilo de Rendering

**DOM Manipulation**: Vanilla JavaScript (no Virtual DOM)

- Vite no hace HMR de cambios en páginas (requiere reload manual)
- Rendering es imperativo (innerHTML, textContent)
- Event listeners attachados after render

**Ejemplo NuevaVenta.js**:
```javascript
this.mainContent.innerHTML = `
  <section class="nueva-venta">
    <div class="productos-container">
      ${productosHTML}
    </div>
    <div class="carrito-container">
      ${carritoHTML}
    </div>
  </section>
`
```

---

## Decisiones Arquitectónicas

| Decisión | Justificación | Impacto |
|----------|---------------|--------|
| Vanilla JS | Proyecto simple, sin deps pesadas | ✅ Bundle pequeño, ⚠️ boilerplate manual |
| SPA Router manual | Aprendizaje, sin deps | ⚠️ No escalable |
| Services no validados | Asume backend valida | 🔴 Seguridad comprometida |
| localStorage para auth | Simple | 🔴 Vulnerable a XSS |
| No hay tests | Rapid dev | 🔴 Deuda acumulada |

---

## 🔗 ARCHIVOS CLAVE

- [src/main.js](../src/main.js) — Application bootstrap
- [src/router.js](../src/router.js) — SPA routing manual
- [src/store.js](../src/store.js) — Global state management
- [src/pages/](../src/pages/) — Feature modules
- [src/services/](../src/services/) — API abstraction layer
