# 🗺️ MAPA RÁPIDO DEL PROYECTO

## Donde encontrar cada cosa

### 🔐 AUTENTICACIÓN
- **Páginas**: `login.html` y `index.html`
- **Lógica**: `src/login.js`
- **Servicio**: `src/services/authService.js`
- **Validaciones**: Email, contraseña, cédula, etc.

### 📊 PÁGINAS PRINCIPALES

**PÚBLICO (Todos ven):**
- Dashboard: `src/pages/dashboard.js`
- Clientes: `src/pages/clientes.js`
- Productos: `src/pages/productos.js`
- Ventas: `src/pages/ventas.js`
- Nueva Venta: `src/pages/nuevaventa.js` ⭐ **Más compleja**
- Perfil: `src/pages/perfil.js`

**SOLO ADMIN:**
- Usuarios: `src/pages/usuarios.js`
- Logs: `src/pages/logs.js`
- Error-Logs: `src/pages/error-logs.js`
- Auditoría: `src/pages/auditoria.js`
- Eliminaciones: `src/pages/eliminaciones-*.js` (4 variantes)

### 🔧 SERVICIOS (API)

Ubicados en `src/services/`:

```
authService.js          ← Login/Logout
clienteService.js       ← CRUD Clientes
productoService.js      ← CRUD Productos
ventaService.js         ← CRUD Ventas
usuarioService.js       ← CRUD Usuarios
auditoriaService.js     ← Auditoría
logsService.js          ← Logs de login
errorLogService.js      ← Logs de error
rolService.js           ← Roles
cloudinaryService.js    ← Subir imágenes
http-client.js          ← Cliente HTTP (Fetch)
```

### 🎨 COMPONENTES

Ubicados en `src/components/`:
- **GlobalModal.js** → Modal reutilizable (singleton)
- **PaginationAdvanced.js** → Paginación

### 🛠️ UTILIDADES

Ubicadas en `src/utils/`:

```
api.js                  ← Configuración de URLs ⭐
axios.js                ← Cliente Axios
http-client.js          ← Cliente Fetch ← MÁS USADO
apiResponse.js          ← unwrapPaged(), fetchAllPaged()
errorHandler.js         ← showErrorAlert(), showSuccessAlert()
helpers.js              ← formatCurrency(), formatDate(), debounce()
cedulaValidator.js      ← Validación de cédula ecuatoriana
tableUi.js              ← Generación de tablas HTML
```

### 📋 ARCHIVOS RAÍZ

```
index.html              ← Página principal (con app)
login.html              ← Página de login
package.json            ← Dependencias
vite.config.js          ← Configuración de Vite
jsconfig.json           ← Alias de rutas

.env.production         ← Variables en producción
.env.example            ← Ejemplo de variables
```

### 📚 DOCUMENTACIÓN

```
README.md               ← Info general
API_ENDPOINTS.md        ← Documentación de API
CONEXION_BACKEND_NGROK.md  ← Conexión con ngrok
INSTRUCCIONES_EJECUCION.md ← Cómo ejecutar
... otros .md
```

---

## Flujos de CRUD comunes

### LISTAR (Ejemplo: Clientes)

1. Página: `src/pages/clientes.js`
2. Servicio: `src/services/clienteService.js` → `getPage()`
3. Utilidad: `src/utils/apiResponse.js` → `unwrapPaged()`
4. Resultado: `{ data, total, page, limit }`

```javascript
const { data } = await clienteService.getPage({ page: 1, limit: 10 })
// data = [{ id, nombre, email, ... }]
```

### CREAR (Ejemplo: Cliente)

1. Página: `src/pages/clientes.js` (formulario)
2. Servicio: `src/services/clienteService.js` → `create()`
3. HTTP: `src/services/http-client.js` → `post()`
4. Alerta: `src/utils/errorHandler.js` → `showSuccessAlert()`

```javascript
try {
  await clienteService.create({ nombre, email, ... })
  showSuccessAlert('Creado', 'Cliente creado correctamente')
  this.loadData() // Refrescar lista
} catch (error) {
  showErrorAlert(error, 'Error al crear')
}
```

### EDITAR (Ejemplo: Cliente)

```javascript
try {
  await clienteService.update(id, { nombre, email, ... })
  showSuccessAlert('Actualizado', 'Cliente actualizado')
  this.loadData()
} catch (error) {
  showErrorAlert(error, 'Error al actualizar')
}
```

### ELIMINAR (Ejemplo: Cliente)

```javascript
Swal.fire({
  title: '¿Eliminar?',
  text: 'Esta acción es irreversible',
  icon: 'warning',
  showCancelButton: true
}).then(async (result) => {
  if (result.isConfirmed) {
    try {
      await clienteService.delete(id)
      showSuccessAlert('Eliminado', 'Cliente eliminado')
      this.loadData()
    } catch (error) {
      showErrorAlert(error)
    }
  }
})
```

---

## Endpoints de API (en backend)

**Base URL**: `https://backend-facturas-production-a3ab.up.railway.app/api`

### Auth
- `POST /auth/login` → Login
- `POST /auth/registro` → Registro

### Clientes
- `GET /clientes` → Listar (paginado)
- `GET /clientes/{id}` → Obtener uno
- `POST /clientes` → Crear
- `PUT /clientes/{id}` → Actualizar
- `DELETE /clientes/{id}` → Eliminar
- `GET /clientes/buscar` → Buscar

### Productos
- `GET /productos` → Listar
- `POST /productos` → Crear
- `PUT /productos/{id}` → Actualizar
- `DELETE /productos/{id}` → Eliminar

### Ventas
- `GET /ventas` → Listar
- `GET /ventas/{id}` → Obtener
- `POST /ventas` → Crear
- `GET /ventas/{id}/pdf` → Descargar PDF
- `GET /ventas/numero/{numeroFactura}` → Por número

### Usuarios
- `GET /usuarios` → Listar
- `POST /usuarios` → Crear
- `PUT /usuarios/{id}` → Actualizar
- `DELETE /usuarios/{id}` → Eliminar
- `POST /usuarios/{id}/desbloquear` → Desbloquear

Ver `src/config/api.js` para más endpoints...

---

## Cómo navegar en desarrollo

### Ejecutar la app
```bash
npm install
npm run dev
# Abre http://localhost:3000
```

### Ver errores
Abre DevTools (F12) → Console
Busca logs como: `[API]`, `[HTTP]`, `[AXIOS]`

### Cambiar backend en desarrollo
Crea `.env.local`:
```
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=https://tu-ngrok.ngrok-free.app
```

### Build para producción
```bash
npm run build
# Genera dist/
npm run preview
# Ver cómo se ve en producción
```

---

## Datos importantes a recordar

| Concepto | Valor/Ubicación |
|----------|----------------|
| Puerto dev | 3000 |
| Puerto build | 4173 |
| Items por página | 10 o 30 (según página) |
| IVA estándar | 19% |
| Formato cédula | XX-XXX-XXX-X (Ecuador) |
| Moneda | USD ($) |
| Zona horaria | Ecuador (UTC-5) |
| Fecha formato | dd/mm/yyyy |
| Token almacenado en | localStorage.authToken |
| Usuario almacenado en | localStorage.currentUser (JSON) |

---

## Acciones rápidas

**Para agregar una nueva página:**

1. Crear archivo: `src/pages/MiPagina.js`
2. Exportar clase: `export class MiPagina { render(), init() }`
3. Importar en `src/router.js`
4. Agregar a `this.pages = { 'mi-pagina': MiPagina }`
5. Agregar link en HTML del menú con `data-page="mi-pagina"`

**Para agregar un nuevo servicio:**

1. Crear archivo: `src/services/miServicio.js`
2. Usar `httpClient` (no axios)
3. Devolver respuestas normalizadas con `unwrapPaged()`
4. Manejar errores con try/catch

**Para cambiar la API:**

1. Editar `src/config/api.js` → `DEFAULT_LOCAL_API`
2. O crear `.env.production` → `VITE_API_BASE_URL=...`

---

Este mapa te ayudará a navegar rápidamente por la codebase.
