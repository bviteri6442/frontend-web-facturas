# 🎨 03_FRONTEND.md

## Framework y Versión

**Framework principal**: Vanilla JavaScript (ES2021+)  
**Build tool**: Vite 5.4.21  
**Type system**: Ninguno (JavaScript dinámico)  

**¿Por qué Vanilla?**
- Proyecto pequeño-mediano
- Control total sobre DOM
- Bundle pequeño (~50-100KB gzipped estimado)
- Aprendizaje activo

---

## Entry Point y Bootstrap

**index.html**:
```html
<body id="app">
  <div id="mainContent"></div>
  <script type="module" src="./src/main.js"></script>
</body>
```

**main.js** (44 líneas):
1. Importa Router, Store, Page classes
2. Expone globales: `window.router`, `window.store`
3. Crea App class:
   - `checkAuth()` → redirige a login si no hay token
   - `setupDOM()` → inyecta navbar HTML
   - `setupNavigation()` → attach event listeners a links
   - `manageAdminMenu()` → show/hide menú según rol
   - `setupEventListeners()` → handlers globales
   - `navigateToDashboard()` → ruta inicial

---

## Routing (SPA Router Manual)

**Archivo**: [src/router.js](../src/router.js)  
**Tipo**: Class-based router

```javascript
export class Router {
  constructor() {
    this.currentPage = 'dashboard'
    this.pages = {
      'dashboard': Dashboard,
      'usuarios': Usuarios,
      'productos': Productos,
      // ... 14 páginas total
    }
  }
  
  async navigateTo(pageName) {
    const Page = this.pages[pageName]
    const pageInstance = new Page(mainContent)
    await pageInstance.render()
    this.currentPage = pageName
    window.scrollTo(0, 0)
  }
}
```

**¿Cómo se navega?**
```javascript
router.navigateTo('usuarios')
```

**Características**:
- ✅ SPA (no page reloads)
- ✅ History no está implementado (no back/forward)
- ❌ No hay URL changes (router.navigateTo() no actualiza window.location)
- ❌ No es compatible con bookmarks o compartir URLs

**Problemas**:
1. Si usuario actualiza página, pierde contexto (siempre carga dashboard)
2. No hay historial (no puedes volver atrás)
3. Si compartis la URL, amigo ve dashboard, no la página que compartiste

---

## State Management

**Patrón**: Observable Pattern (minimalista)

**Archivo**: [src/store.js](../src/store.js)

```javascript
export class Store {
  constructor() {
    this.state = {
      currentUser: null,
      currentPage: 'dashboard',
      isLoading: false
    }
    this.subscribers = []
  }
  
  setState(newState) {
    this.state = { ...this.state, ...newState }
    this.notify() // Notificar subscribers
  }
  
  subscribe(callback) {
    this.subscribers.push(callback)
    return () => { /* unsubscribe */ }
  }
}
```

**Estado global**: Solo 3 propiedades (currentUser, currentPage, isLoading)  
**Persistencia**: currentUser se carga desde localStorage en store.js initialization

**¿Qué falta?**
- ❌ No hay state para datos (usuarios fetched, productos, etc.)
- ❌ Cada página mantiene su propio state local (en memoria, se pierden si cambias de página)
- ❌ No hay caching de API calls
- ❌ No hay rollback o undo

**Comparación**:
```
Redux    → 🔴 Overkill para este proyecto
Zustand  → 🟢 Perfecto (si fuese TypeScript/React)
Jotai    → 🟢 Perfecto (atómico, minimalista)
Custom   → ✅ Actual (minimalista, funciona, no escalable)
```

---

## Data Fetching

**Patrones**: Fetch + Axios (híbrido)

### HTTP Client Primario (http-client.js)

```javascript
class HttpClient {
  async get(url, options = {}) { /* fetch + auth */ }
  async post(url, data, options = {}) { /* fetch + auth */ }
  async put(url, data, options = {}) { /* fetch + auth */ }
  async delete(url, options = {}) { /* fetch + auth */ }
}
```

**Características**:
- ✅ Fetch API wrapper
- ✅ Auto-inject `Authorization: Bearer {token}`
- ✅ ngrok header injection (`ngrok-skip-browser-warning`)
- ✅ Error handling basic
- ✅ URL normalization

**Error handling**:
```javascript
if (!response.ok) {
  throw new Error(`HTTP ${response.status}`)
}
```

### Axios Fallback (axios.js)

Proyecto tiene también `axios.js` (instancia configurada) pero servicios usan más Fetch.

**Situación**: Dual-stack innecesario. Debería ser solo uno.

### Cache Strategy

**No hay cache implementado**:
- Cada cambio de página re-fetch todos los datos
- No hay SWR (stale-while-revalidate)
- No hay localStorage caching
- No hay API result memoization

### Error Handling Global

**errorHandler.js**:
```javascript
export function handleApiError(error) {
  if (error.response?.status === 401) {
    // Token expirado → logout
  }
  return {
    message: error.message,
    code: error.code
  }
}
```

**¿Dónde se usa?** Sporádicamente. No hay error boundary global.

---

## Styling

**Sistema**: Vanilla CSS (2 archivos)

| Archivo | Propósito |
|---------|-----------|
| `main.css` | App styles (layout, table, forms) |
| `login.css` | Login page styles |

**Características de CSS**:
- ✅ No hay preprocessor (Sass/Less)
- ✅ No hay CSS-in-JS
- ✅ No hay Tailwind
- ✅ Variables CSS nativas presentes

**Responsive**:
- ✅ Media queries presentes
- ✅ Mobile-first aparenta ser el enfoque

**Dark mode**: ❌ No implementado

**Accesibilidad**:
- ⚠️ Algunos colores sin suficiente contraste
- ⚠️ Modales no tienen focus trap
- ⚠️ Semántica HTML débil (divs en lugar de buttons/header)

---

## Componentes

Proyecto tiene **2 componentes reutilizables**:

### GlobalModal.js

Modal genérico para confirmaciones:
```javascript
export class GlobalModal {
  constructor(title, message, onConfirm) {
    this.title = title
    this.message = message
    this.onConfirm = onConfirm
  }
  
  show() { /* renderiza modal */ }
  hide() { /* oculta */ }
}
```

**Uso**:
```javascript
const modal = new GlobalModal('Confirmación', '¿Estás seguro?', () => {
  // lógica
})
modal.show()
```

### PaginationAdvanced.js

Paginación con navegación:
```javascript
export class PaginationAdvanced {
  render(currentPage, totalPages, onPageChange) {
    // HTML para botones prev/next
    // onPageChange callback
  }
}
```

**Observación**: Componentes son muy simples, más como funciones que objetos

---

## Build y Bundling

**Bundler**: Vite 5.4.21  
**Entrada**: index.html (vite busca modules desde aquí)

**vite.config.js**:
```javascript
export default defineConfig(({ mode }) => ({
  appType: 'mpa',  // Multi-Page App
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        ...
      }
    }
  }
}))
```

**Features habilitadas**:
- ✅ HMR (Hot Module Replacement) en dev
- ✅ Proxy `/api` a backend
- ✅ Alias `@` para imports
- ❌ No hay optimizaciones específicas (minification es default)

**Build output**:
- Genera carpeta `dist/`
- HTML + bundled JS + assets
- Tree-shaking automático

**Bundle size estimate**:
- Vite core: ~10KB gzipped
- SweetAlert2: ~20KB
- jsPDF: ~30KB
- Axios: ~10KB
- FontAwesome CSS: ~15KB
- **Total estimado**: ~100-120KB gzipped

---

## Convenciones y Patterns

### File organization

```
pages/
├── dashboard.js        // export class Dashboard
├── usuarios.js         // export class Usuarios
└── ...

services/
├── authService.js      // export class AuthService
├── usuarioService.js   // export class UsuarioService
└── ...

components/
├── GlobalModal.js      // export class GlobalModal
└── PaginationAdvanced.js
```

### Importing

```javascript
import { Dashboard } from './pages/dashboard.js'
import { usuarioService } from './services/usuarioService.js'
```

**Nota**: Exports son CJS style (`export class Foo`) pero imports son ESM.

### Event Handling

Todos los event listeners se attachen en `attachEventListeners()` (no inline):

```javascript
async render() {
  this.mainContent.innerHTML = `...`
  this.attachEventListeners() // Siempre al final
}

attachEventListeners() {
  document.querySelector('.btn-save').addEventListener('click', async () => {
    // handler
  })
}
```

---

## Performance y UX

### Positivos ✅

- Bundle pequeño (Vite es eficiente)
- No hay blocker de JS pesados
- HMR en dev es rápido
- Carga página = load+render (no chunking)

### Negativos ❌

- Re-render completo de página en cada navegación
- No hay lazy loading de páginas (todas en bundle)
- No hay Service Worker (sin offline)
- No hay compression de assets
- No hay CDN hints

### Load Timing

- **Inicial**: ~2-3s (Primera carga, fetch auth user)
- **Navegación intra-app**: ~500ms (fetch + render)
- **PDF generation**: ~1-2s (jsPDF processing)

---

## 🔗 ARCHIVOS CLAVE

- [index.html](../index.html) — Entry point app
- [login.html](../login.html) — Login entry point
- [src/main.js](../src/main.js) — Bootstrap
- [src/router.js](../src/router.js) — Routing
- [src/store.js](../src/store.js) — State
- [src/pages/](../src/pages/) — Page modules
- [src/components/](../src/components/) — Reusable UI
- [vite.config.js](../vite.config.js) — Build config
- [src/assets/styles/](../src/assets/styles/) — CSS
