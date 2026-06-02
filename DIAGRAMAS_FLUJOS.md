# 📐 DIAGRAMAS Y FLUJOS VISUALES

## 1. FLUJO GENERAL DE LA APLICACIÓN

```
┌─────────────┐
│ Browser     │
│ index.html  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ main.js (App class) │
│ - checkAuth()       │
│ - setupDOM()        │
│ - setupNavigation() │
└──────┬──────────────┘
       │
       ├─ Token valido? ✓ ─────┐
       │                        │
       └─ Token inválido? ✗ ─┐  │
              ▼                │  │
         /login.html           │  │
              │                │  │
              ▼                │  │
          login.js             │  │
         (formulario)          │  │
              │                │  │
              ▼                │  │
        authService.login()    │  │
              │                │  │
              ▼                │  │
         httpClient.post()     │  │
              │                │  │
        ✓ OK     ✗ ERROR       │  │
         │         │           │  │
    Guardar   Alert Error      │  │
    Token        │             │  │
      │          │             │  │
      └──────────┘             │  │
                               │  │
                               └──┘
                                  │
                    ┌─────────────┘
                    │
                    ▼
         ┌─────────────────┐
         │ Dashboard Page  │
         │ (router.js)     │
         │ - navigateTo()  │
         │ - render()      │
         │ - init()        │
         └────────┬────────┘
                  │
                  ▼
      ┌───────────────────┐
      │ User clicks menu  │
      └────────┬──────────┘
               │
               ▼
    ┌──────────────────┐
    │ router.navigateTo(page)
    │ - Verify perms   │
    │ - Load Page class│
    │ - Inject HTML    │
    │ - Call init()    │
    └────────┬─────────┘
             │
             ▼
    ┌─────────────────┐
    │ Page events     │
    │ (click, input)  │
    └────────┬────────┘
             │
             ▼
    ┌──────────────────┐
    │ Service call     │
    │ (CRUD operation) │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ httpClient.get/  │
    │ post/put/delete()│
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ API Backend      │
    │ (Railway)        │
    └────────┬─────────┘
             │
        ✓ OK │ ✗ ERROR
         │   │
      Process Reject
         │   │
         ▼   ▼
    ├────────────┤
    │ Alert OK   │ Alert Error
    │ Refresh UI │
    └────────────┘
```

---

## 2. ARQUITECTURA DE COMPONENTES

```
┌──────────────────────────────────────────────────┐
│              index.html / login.html              │
└────────────────┬─────────────────────────────────┘
                 │
    ┌────────────┴──────────────┐
    ▼                           ▼
┌─────────┐               ┌────────────┐
│ main.js │◄──────────────│  login.js  │
│ (App)   │  checkAuth()  │(formulario)│
└────┬────┘               └────────────┘
     │                          │
     │        ┌──────────────────┘
     │        ▼
     │    ┌──────────────┐
     │    │  authService │
     │    └──────┬───────┘
     │           │
     ▼           ▼
┌─────────────────────────────────────┐
│ HTTP Layer (httpClient + axios)     │
│ - Headers (JWT, ngrok)              │
│ - Error handling (401, 403, 500+)   │
└────────────────┬────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │   API Backend  │
        │  (Railway URL) │
        └────────────────┘
     ▲
     │
┌────┴─────────────────────────────┐
│   Services (Normalization)        │
│ - clienteService                  │
│ - productoService                 │
│ - ventaService                    │
│ - etc.                            │
└────┬──────────────────────────────┘
     │
     │    ┌────────────────────────┐
     │    │ Utilities (apiResponse)│
     │    │ - unwrapPaged()        │
     │    │ - fetchAllPaged()      │
     │    └────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│   Page Classes           │
│ - render()               │
│ - init()                 │
│ - setupListeners()       │
│ - loadData()             │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│  Reusable Components             │
│ - GlobalModal                    │
│ - PaginationAdvanced             │
└────┬──────────────────────────────┘
     │
     ▼
┌────────────────────────┐
│   Views (HTML/CSS)     │
│   #mainContent div     │
└────────────────────────┘
```

---

## 3. FLUJO DE DATOS EN UNA PÁGINA

```
┌────────────────────────────────────────────────┐
│          class MiPagina {                      │
│  ┌──────────────────────────────────────────┐  │
│  │  constructor()                           │  │
│  │  - Inicializa variables de estado        │  │
│  │  - this.datos = []                       │  │
│  │  - this.currentPage = 1                  │  │
│  └──────────────────────────────────────────┘  │
│                    │                            │
│                    ▼                            │
│  ┌──────────────────────────────────────────┐  │
│  │  render()                                │  │
│  │  - Devuelve HTML estático               │  │
│  │  - SIN event listeners aquí              │  │
│  │  - Inyectado en #mainContent             │  │
│  └──────────────────────────────────────────┘  │
│                    │                            │
│                    ▼                            │
│  ┌──────────────────────────────────────────┐  │
│  │  init()                                  │  │
│  │  - Ejecutado DESPUÉS de render()         │  │
│  │  - Obtiene referencias del DOM           │  │
│  │  - Agrega event listeners                │  │
│  │  - Carga datos iniciales                 │  │
│  └──────────────────────────────────────────┘  │
│                    │                            │
│        ┌───────────┼────────────┐              │
│        │           │            │              │
│        ▼           ▼            ▼              │
│    ┌──────┐   ┌────────┐  ┌──────────┐        │
│    │Clicks│   │Inputs  │  │Load Data │        │
│    └───┬──┘   └────┬───┘  └────┬─────┘        │
│        │           │            │              │
│        └─────┬─────┴────────────┘              │
│              │                                  │
│              ▼                                  │
│    ┌──────────────────────┐                    │
│    │ service.getPage()    │                    │
│    │ service.create()     │                    │
│    │ service.update()     │                    │
│    │ service.delete()     │                    │
│    └────────┬─────────────┘                    │
│             │                                   │
│             ▼                                   │
│    ┌──────────────────────┐                    │
│    │ httpClient call      │                    │
│    │ (GET/POST/PUT/DEL)   │                    │
│    └────────┬─────────────┘                    │
│             │                                   │
│        ✓ OK │ ✗ ERROR                          │
│         │   │                                   │
│    Update UI Alert Error                       │
│         │   │                                   │
│         └─┬─┘                                   │
│           │                                     │
│           ▼                                     │
│    ┌──────────────────┐                        │
│    │ Update state     │                        │
│    │ Re-render if     │                        │
│    │ necessary        │                        │
│    └──────────────────┘                        │
└────────────────────────────────────────────────┘
```

---

## 4. CICLO DE PAGINACIÓN

```
┌─────────────────────────────────────────────────┐
│  PaginationAdvanced                             │
│                                                  │
│  new Pagination({                               │
│    currentPage: 1,                              │
│    totalItems: 100,                             │
│    itemsPerPage: 10,                            │
│    onChange: (newPage) => loadPage(newPage)     │
│  })                                             │
└──────────┬──────────────────────────────────────┘
           │
           ▼
      ┌──────────────────────────────┐
      │ Calculates:                  │
      │ totalPages = 100 / 10 = 10   │
      │ pageRange = [1...10]         │
      └──────────┬───────────────────┘
                 │
           ┌─────┴──────┬──────────┬──────────┐
           │            │          │          │
           ▼            ▼          ▼          ▼
      ┌─────┐      ┌──────┐  ┌────────┐ ┌──────┐
      │ < 1 │      │ << 1 │  │ > > 10 │ │10 >  │
      │ Prev│      │First │  │ Last   │ │ Next │
      └──┬──┘      └──┬───┘  └────┬───┘ └──┬───┘
         │            │            │        │
         └────────────┼────────────┴────────┘
                      │
                      ▼
            onChange(newPage) callback
                      │
                      ▼
         ┌─────────────────────────────┐
         │ loadPage(newPage)           │
         │ - this.currentPage = 2      │
         │ - Fetch new data            │
         │ - Update table HTML         │
         │ - Re-render pagination      │
         └─────────────────────────────┘
```

---

## 5. FLUJO DE AUTENTICACIÓN JWT

```
┌──────────────────────┐
│   login.html         │
│   - Email input      │
│   - Password input   │
└────────┬─────────────┘
         │
         ▼
    ┌──────────┐
    │Form      │
    │Submit    │
    └────┬─────┘
         │
         ▼
┌────────────────────────────────┐
│ authService.login(email, pwd)  │
│                                │
│ httpClient.post('/auth/login',│
│   { email, contrasena }        │
│ )                              │
└────────────────┬───────────────┘
                 │
        ┌────────┴────────┐
        │                 │
    ✓ OK │            ✗ ERROR
        │                 │
        ▼                 ▼
   ┌──────────┐     ┌─────────────┐
   │Response: │     │showErrorAlert│
   │{ token,  │     │              │
   │  user }  │     └─────────────┘
   └────┬─────┘
        │
        ▼
   ┌───────────────────────────┐
   │ localStorage.setItem(      │
   │  'authToken',             │
   │  response.token           │
   │ )                         │
   └────┬────────────────────────┘
        │
        ▼
   ┌───────────────────────────┐
   │ localStorage.setItem(      │
   │  'currentUser',           │
   │  JSON.stringify(user)     │
   │ )                         │
   └────┬────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│ window.location.href =       │
│ '/index.html'                │
│                              │
│ (Recarga página completa)    │
└──────────────────────────────┘
        │
        ▼
   ┌──────────────┐
   │ main.js      │
   │ checkAuth()  │
   │  ✓ Token OK  │
   │ setupDOM()   │
   │ showDashboard│
   └──────────────┘
```

---

## 6. FLUJO DE SOLICITUD HTTP

```
┌─────────────────────────────────┐
│ Código de la página              │
│ await servicioX.getPage({...})   │
└────────────┬────────────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ servicioX.getPage()  │
    │ - Construye query    │
    │ - Llama httpClient   │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ httpClient.get(endpoint)     │
    │ - Construye URL completa     │
    │ - getHeaders()               │
    │ - Agrega JWT token           │
    │ - Agrega headers ngrok       │
    └────────┬─────────────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ fetch(url, config)           │
    │ - method: 'GET'              │
    │ - headers: {...}             │
    │ - signal: AbortSignal        │
    └────────┬─────────────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ Backend Response             │
    │                              │
    │ 200 OK: { data: [...] }      │
    │ 400: { errors: {...} }       │
    │ 401: Unauthorized            │
    │ 500: Server Error            │
    └────────┬─────────────────────┘
             │
    ┌────────┴──────────┐
    │                   │
  Status 401        Status 200-204
    │                   │
    ▼                   ▼
┌────────────┐     ┌──────────────┐
│ localStorage   │ response.json()│
│ .removeItem    │                │
│ ('authToken')  │ return data    │
│ → /login.html  └─────┬──────────┘
└────────────┘         │
                       ▼
                ┌────────────────┐
                │ unwrapPaged()  │
                │ - Normaliza    │
                │ - { total,     │
                │   page, data } │
                └────┬───────────┘
                     │
                     ▼
            ┌────────────────────┐
            │ Return to page     │
            │ Update this.datos  │
            │ Re-render table    │
            └────────────────────┘
```

---

## 7. ESTRUCTURA DE NUEVA VENTA

```
┌──────────────────────────────────────────────────────────┐
│                    NuevaVenta                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ State:                                             │  │
│  │ - clienteSeleccionado                             │  │
│  │ - detalles: [{ productoId, cantidad, precio }...] │  │
│  │ - total (calculado)                               │  │
│  │ - totalIVA (19%)                                  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Flujo:                                             │  │
│  │                                                    │  │
│  │ 1. Usuario hace click "Seleccionar Cliente"       │  │
│  │    → GlobalModal.open()                           │  │
│  │    → Muestra lista de clientes                    │  │
│  │    → Usuario selecciona cliente                   │  │
│  │    → clienteSeleccionado = cliente                │  │
│  │                                                    │  │
│  │ 2. Usuario hace click "Seleccionar Producto"      │  │
│  │    → GlobalModal.open()                           │  │
│  │    → Muestra lista de productos                   │  │
│  │    → Usuario ingresa cantidad                     │  │
│  │    → Usuario hace click "Agregar"                 │  │
│  │    → detalles.push({...})                         │  │
│  │    → Recalcula total                              │  │
│  │                                                    │  │
│  │ 3. Usuario puede agregar múltiples productos      │  │
│  │    → Se actualiza tabla de productos              │  │
│  │    → Se actualiza total y IVA                     │  │
│  │                                                    │  │
│  │ 4. Usuario hace click "Crear Venta"               │  │
│  │    → Valida que haya cliente y productos          │  │
│  │    → ventaService.create({                        │  │
│  │         clienteId,                                │  │
│  │         fechaVenta,                               │  │
│  │         detalles,                                 │  │
│  │         totalVenta,                               │  │
│  │         ...                                       │  │
│  │       })                                          │  │
│  │    → Backend genera número de factura             │  │
│  │    → showSuccessAlert()                           │  │
│  │    → router.navigateTo('ventas')                  │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 8. ÁRBOL DE DECISIÓN - CONTROL DE ACCESO

```
                    ┌──────────────┐
                    │ User clicks  │
                    │ navigation   │
                    └───────┬──────┘
                            │
                            ▼
                ┌─────────────────────────┐
                │ router.navigateTo(page) │
                └────────┬────────────────┘
                         │
            ┌────────────┴────────────────┐
            │                             │
            ▼                             ▼
    ┌──────────────────┐        ┌──────────────────┐
    │ Admin page?      │        │ Public page?     │
    │ (usuarios, logs) │        │ (dashboard,      │
    └──────┬───────────┘        │  clientes, etc)  │
           │                    └──────┬───────────┘
      YES  │  NO                       │
          /│\                          │
         / │ \                         │
        /  │  └─────────┬──────────────┘
       /   │            │
      │    ▼            ▼
      │  Check      ✓ Load page
      │  isAdmin()    render()
      │    │          init()
      │    │
      └────┤
      ✓    │    ✗
      Load │  ───► showError()
      page │      navigateTo('dashboard')
           │
           ▼
      render()
      init()
```

---

## 9. FLUJO DE MANEJO DE ERRORES

```
try {
  await servicioX.operacion()
}
catch (error)
  │
  ├─ error.message? ───────────────────┐
  │                                    │
  ├─ error.response.data.message? ────┤
  │                                    │
  ├─ error.response.data.errors? ─────┤
  │  (extractar primer campo)           │
  │                                    │
  ├─ error.response.data.title? ──────┤
  │                                    │
  └─ error.response.statusText? ──────┤
                                      │
                                      ▼
                            extractErrorMessage()
                                      │
                                      ▼
                            showErrorAlert(error)
                                      │
                    ┌─────────────────┴──────────────┐
                    │                                │
                    ▼                                ▼
            ┌─────────────────┐          ┌────────────────────┐
            │ SweetAlert2     │          │ Console.error()    │
            │ - Icon: error   │          │ - Información      │
            │ - Title         │          │   de debug         │
            │ - Text message  │          │ - Stack trace      │
            │ - Red button    │          └────────────────────┘
            └─────────────────┘
```

---

Estos diagramas muestran visualmente cómo funciona cada parte del sistema.
