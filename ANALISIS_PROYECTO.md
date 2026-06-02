# 📊 ANÁLISIS COMPLETO DEL PROYECTO FRONTEND

## 1. RESUMEN EJECUTIVO

Este es un **Sistema de Gestión Comercial (POS - Punto de Venta)** desarrollado con **Vanilla JavaScript + Vite**.

- **Tipo**: Single Page Application (SPA) sin frameworks
- **Propósito**: Gestión de clientes, productos, ventas y facturas
- **Arquitectura**: Modular (páginas, servicios, componentes, utilidades)
- **Autenticación**: JWT (tokens almacenados en localStorage)
- **Backend**: API REST en .NET (Railway)

---

## 2. ARQUITECTURA GENERAL

```
Frontend (Vite + Vanilla JS)
    ↓
[Autenticación - JWT]
    ↓
[Router] → Páginas (Clientes, Productos, Ventas, etc.)
    ↓
[Servicios] → Llamadas HTTP (httpClient / axios)
    ↓
[API Backend] (https://backend-facturas-production-a3ab.up.railway.app/api)
```

---

## 3. ESTRUCTURA DE CARPETAS

```
src/
├── main.js                 # Punto de entrada - Inicialización de la app
├── router.js              # Sistema de navegación entre páginas
├── store.js               # Estado global (patrón observable)
├── login.js               # Lógica de login y registro
│
├── config/
│   └── api.js            # Configuración centralizada de URLs y endpoints
│
├── pages/                # Todas las páginas (15 páginas)
│   ├── dashboard.js
│   ├── clientes.js
│   ├── productos.js
│   ├── ventas.js
│   ├── nuevaventa.js     # Crear nuevas facturas
│   ├── usuarios.js
│   ├── logs.js           # (Solo Admin)
│   ├── error-logs.js     # (Solo Admin)
│   ├── auditoria.js      # (Solo Admin)
│   └── eliminaciones-*.js # Registros de eliminaciones (Admin)
│
├── services/             # Lógica de negocio (CRUD + API)
│   ├── http-client.js    # Cliente HTTP con Fetch
│   ├── authService.js    # Login/Logout
│   ├── clienteService.js
│   ├── productoService.js
│   ├── ventaService.js
│   ├── usuarioService.js
│   ├── auditoria*.js
│   └── ... otros servicios
│
├── components/           # Componentes reutilizables
│   ├── GlobalModal.js    # Modal global singleton
│   └── PaginationAdvanced.js # Paginación
│
├── utils/               # Utilidades y helpers
│   ├── apiResponse.js   # Normalización de respuestas API
│   ├── axios.js         # Cliente Axios configurado
│   ├── errorHandler.js  # Extracción y mostrado de errores
│   ├── helpers.js       # Funciones helpers (formato fecha, moneda, etc)
│   ├── cedulaValidator.js
│   └── tableUi.js       # Generación de tablas HTML
│
└── assets/
    └── styles/
        └── main.css     # Estilos CSS (Desktop + Mobile)
```

---

## 4. FLUJO DE EJECUCIÓN

### 4.1 Inicialización
```
index.html
    ↓
src/main.js (App class)
    ↓
checkAuth() → Verifica token en localStorage
    ├─ ✅ Autenticado → setupDOM() → setupNavigation() → navigateToDashboard()
    └─ ❌ No autenticado → Redirige a /login.html
```

### 4.2 Sistema de Autenticación
```
login.html
    ↓
login.js (formulario + validaciones)
    ↓
authService.login(email, contrasena)
    ↓
httpClient.post('/auth/login', datos)
    ↓
Backend valida credenciales
    ↓
✅ Respuesta exitosa:
   - Guarda token en localStorage ('authToken')
   - Guarda usuario en localStorage ('currentUser')
   - Redirige a index.html
```

---

## 5. COMPONENTES CLAVE

### 5.1 ROUTER (`router.js`)

**Sistema de navegación SPA sin librerías**

```javascript
router.navigateTo(pageName)
    ↓
1. Verifica permisos (admin vs usuario normal)
2. Carga la clase de la página (Dashboard, Clientes, etc.)
3. Llama a page.render() → obtiene HTML
4. Inyecta en #mainContent
5. Llama a page.init() → inicializa event listeners
```

**Páginas protegidas (solo Admin)**:
- usuarios
- logs
- error-logs
- auditoria
- eliminaciones-*

### 5.2 STORE (`store.js`)

**Patrón Observable simple para estado global**

```javascript
store.state = {
  currentUser: null,
  currentPage: 'dashboard',
  isLoading: false
}

store.subscribe(callback)  // Se ejecuta cuando state cambia
store.setState(newState)   // Actualiza state + notifica
```

### 5.3 SERVICIOS HTTP

**Dos clientes HTTP disponibles:**

1. **httpClient** (Fetch API) - Usado por la mayoría
2. **apiClient** (Axios) - Disponible para casos especiales

Ambos:
- Usan `API_BASE_URL` de `config/api.js`
- Agregan automáticamente token JWT
- Manejan errores 401, 403, 500+
- Soportan headers especiales para ngrok

---

## 6. PÁGINAS Y SUS FUNCIONALIDADES

| Página | Descripción | Permisos | Funciones |
|--------|-------------|----------|-----------|
| **Dashboard** | Panel principal con estadísticas | Todos | Ver resumen, gráficos de ventas |
| **Clientes** | CRUD de clientes | Todos (crear: Admin) | Listar, buscar, crear, editar, eliminar |
| **Productos** | CRUD de productos | Todos (crear: Admin) | Listar, buscar, crear, editar, eliminar |
| **Ventas** | Ver todas las facturas | Todos | Listar, buscar, ver detalles, descargar PDF |
| **Nueva Venta** | Crear nueva factura | Todos | Seleccionar cliente/productos, crear factura |
| **Usuarios** | CRUD de usuarios | **Admin** | Listar, crear, editar, eliminar, desbloquear |
| **Logs** | Registro de logins | **Admin** | Ver intentos de acceso, estadísticas |
| **Error-Logs** | Registro de errores | **Admin** | Ver errores del sistema, marcar revisados |
| **Auditoría** | Registro de cambios | **Admin** | Ver quién cambió qué y cuándo |
| **Eliminaciones** | Registros de borrados | **Admin** | Clientes/Productos/Usuarios/Ventas eliminados |

---

## 7. PATRONES Y CONVENCIONES

### 7.1 Estructura de Página

```javascript
export class MiPagina {
  constructor() {
    // Estado local
    this.datos = []
    this.currentPage = 1
    this.loading = false
  }

  render() {
    // Retorna HTML de la página
    // NO ejecuta event listeners aquí
    return `<div>...</div>`
  }

  init() {
    // Se ejecuta DESPUÉS que render() inyecta el HTML
    // Aquí van event listeners y lógica
    this.loadData()
    this.setupListeners()
  }

  async loadData() {
    this.loading = true
    try {
      const { data } = await servicioX.getPage({...})
      this.datos = data
      this.render() // ⚠️ Vuelve a renderizar si es necesario
    } catch (error) {
      showErrorAlert(error)
    } finally {
      this.loading = false
    }
  }

  setupListeners() {
    const btn = document.querySelector('.btn-agregar')
    btn?.addEventListener('click', () => this.handleAdd())
  }
}
```

### 7.2 Llamadas a API

**Patrón de Servicio:**

```javascript
export const miServicio = {
  async getPage({ page = 1, limit = 30, search = '' } = {}) {
    try {
      const query = new URLSearchParams({ page, limit })
      if (search) query.append('search', search)
      const response = await httpClient.get(`/endpoint?${query}`)
      return unwrapPaged(response) // Normaliza respuesta
    } catch (error) {
      console.error('[miServicio] Error:', error)
      throw error
    }
  }
}
```

**Uso:**

```javascript
const { data, total, page, limit } = await miServicio.getPage({
  page: 1,
  limit: 30,
  search: 'busqueda'
})
```

### 7.3 Manejo de Errores

```javascript
// Opción 1: ShowAlert
try {
  await servicio.create(datos)
  showSuccessAlert('Creado', 'Registro creado correctamente')
} catch (error) {
  showErrorAlert(error, 'Error al crear')
}

// Opción 2: Extracción manual
const msg = extractErrorMessage(error, 'Mensaje default')
console.error(msg)
```

### 7.4 Paginación

```javascript
const pagination = new PaginationAdvanced({
  currentPage: 1,
  totalItems: 100,
  itemsPerPage: 10,
  onChange: (newPage) => this.loadPage(newPage)
})

pagination.goToNext()
pagination.goToPage(5)
pagination.update(200) // Actualiza total
```

---

## 8. COMPONENTES REUTILIZABLES

### 8.1 GlobalModal (Singleton)

```javascript
const modal = GlobalModal.getInstance()

modal.open(
  'Título del Modal',
  '<p>Contenido HTML</p>',
  () => console.log('Modal cerrado')
)

modal.close()
```

Usado en: nuevaventa.js (seleccionar cliente/productos)

### 8.2 PaginationAdvanced

Usado en: Clientes, Productos, Ventas, Logs, etc.

```javascript
this.pagination = new PaginationAdvanced({
  totalItems: 100,
  itemsPerPage: 10,
  onChange: (page) => this.loadPage(page)
})
```

---

## 9. UTILIDADES IMPORTANTES

### 9.1 apiResponse.js
- `unwrapPaged(response)` → Normaliza respuestas paginadas
- `fetchAllPaged()` → Descarga todas las páginas automáticamente

**Formato esperado:**
```json
{
  "total": 100,
  "page": 1,
  "limit": 10,
  "data": [...]
}
```

### 9.2 errorHandler.js
- `showErrorAlert(error, title, message)` → Alert con SweetAlert2
- `showSuccessAlert(title, message)` → Alert exitoso
- `extractErrorMessage(error)` → Extrae mensaje del error

### 9.3 helpers.js
- `formatCurrency(valor)` → Formatea a moneda (USD)
- `formatDate(fecha)` → Formatea a dd/mm/yyyy
- `formatDateTime(fecha)` → Con hora
- `debounce(func, wait)` → Debounce para búsquedas

---

## 10. FLUJOS COMUNES

### 10.1 Crear un Nuevo Registro

```javascript
// 1. Formulario
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const datos = { nombre, email, ... }
  
  try {
    // 2. Llamar servicio
    await servicioX.create(datos)
    
    // 3. Mostrar éxito
    showSuccessAlert('Creado', 'Registro creado correctamente')
    
    // 4. Refrescar lista
    this.loadData()
  } catch (error) {
    showErrorAlert(error, 'Error al crear')
  }
})
```

### 10.2 Buscar con Debounce

```javascript
const searchBox = document.querySelector('.search-box')

searchBox.addEventListener('input', debounce((e) => {
  const term = e.target.value
  this.buscar(term)
}, 500))
```

### 10.3 Descargar PDF

```javascript
const btnDescargar = document.querySelector('.btn-pdf')
btnDescargar.addEventListener('click', async () => {
  try {
    const blob = await ventaService.getPdf(id)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `factura-${id}.pdf`
    a.click()
  } catch (error) {
    showErrorAlert(error)
  }
})
```

---

## 11. ESTADO DE LA APLICACIÓN

### 11.1 localStorage
- **authToken** → JWT token (usado en headers)
- **currentUser** → JSON del usuario logueado
  ```json
  {
    "id": 1,
    "nombreUsuario": "admin",
    "nombreCompleto": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "Admin",
    "imagenUrl": "https://..."
  }
  ```

### 11.2 Store Global
```javascript
store.getState() // { currentUser, currentPage, isLoading }
store.setState({ isLoading: true })
store.subscribe(callback) // Se ejecuta en cambios
```

---

## 12. FLUJO DE NUEVA VENTA (Ejemplo Completo)

```
1. Usuario hace click en "Nueva Venta"
   ↓
2. router.navigateTo('nuevaventa')
   ↓
3. new NuevaVenta().render() → HTML inyectado
   ↓
4. new NuevaVenta().init() → Event listeners
   ↓
5. Usuario hace click en "Seleccionar Cliente"
   ↓
6. GlobalModal.open() → Muestra lista de clientes
   ↓
7. Usuario selecciona cliente
   ↓
8. Modal se cierra → Se guarda clienteSeleccionado
   ↓
9. Usuario selecciona productos
   ↓
10. Usuario ingresa cantidad y hace click en "Agregar"
    ↓
11. Se agrega a this.detalles[] y se recalcula total
    ↓
12. Usuario hace click en "Crear Venta"
    ↓
13. ventaService.create({ clienteId, detalles[], ... })
    ↓
14. Backend valida y crea venta
    ↓
15. showSuccessAlert() + router.navigateTo('ventas')
```

---

## 13. CONFIGURACIÓN DE CONEXIÓN AL BACKEND

**Archivo: `src/config/api.js`**

```javascript
const DEFAULT_LOCAL_API = 'https://backend-facturas-production-a3ab.up.railway.app/api'

export const API_BASE_URL = 
  normalizeApiBaseUrl(envUrl) ||
  (import.meta.env.DEV ? DEV_PROXY_API : DEFAULT_LOCAL_API)
```

**En desarrollo:**
- Usa proxy Vite: `/api` → redirige según `.env.local`
- O usa `VITE_API_BASE_URL` si está configurado

**En producción:**
- Usa `DEFAULT_LOCAL_API` (Railway)
- O `.env.production` si existe

---

## 14. SEGURIDAD

✅ **Implementado:**
- JWT tokens en localStorage
- Token se envía en header `Authorization: Bearer <token>`
- Logout limpia tokens
- 401 redirige a login automáticamente
- Validaciones de rol (Admin vs Usuario)
- Validaciones en cliente (cédula, email, etc.)

⚠️ **Notas:**
- Tokens en localStorage no son 100% seguros (XSS)
- Validaciones en cliente pueden ser burladas
- El backend debe validar TODAS las operaciones

---

## 15. PROBLEMAS COMUNES

| Problema | Causa | Solución |
|----------|-------|----------|
| "No autenticado" en login | Token/usuario no guardado | Ver consola (F12) → Network |
| Páginas en blanco | Error en init() | Ver console (F12) para errores |
| Búsqueda lenta | Sin debounce | Usar `debounce()` en event listeners |
| CORS error | URL incorrecta | Verificar `VITE_API_BASE_URL` en .env |
| PDF no descarga | Respuesta no es blob | Ver `getBlob()` en http-client.js |
| Token expirado | JWT expirado | Logout automático a login.html |

---

## 16. PRÓXIMAS MEJORAS SUGERIDAS

1. **Persistencia de sesión**
   - Refrescar token antes de que expire
   - Recordar usuario (opcional)

2. **Optimización**
   - Caché de clientes/productos frecuentes
   - Lazy loading de páginas
   - Compresión de imágenes

3. **UX/UI**
   - Validación en tiempo real (RealTime)
   - Atajos de teclado
   - Modo oscuro

4. **Testing**
   - Tests unitarios (Jest)
   - Tests de integración (E2E)

5. **Performance**
   - Bundle analysis
   - Code splitting por página
   - Prefetch de recursos

---

## 17. RESUMEN DE ARCHIVOS CRÍTICOS

| Archivo | Propósito |
|---------|-----------|
| `main.js` | Inicialización de la app |
| `router.js` | Navegación entre páginas |
| `store.js` | Estado global |
| `config/api.js` | URLs y endpoints |
| `services/http-client.js` | Cliente HTTP |
| `utils/errorHandler.js` | Manejo de errores |
| `utils/helpers.js` | Funciones utilitarias |
| `pages/*.js` | Páginas del sistema |

---

Este análisis cubre todo lo necesario para entender, mantener y extender el proyecto.
