# PuntoVenta — Frontend Web (Facturas)

Panel administrativo del sistema de punto de venta. **Vite 5** + JavaScript (módulos ES).

Repositorio GitHub: **https://github.com/bviteri6442/frontend-web-facturas**

Requiere la API en ejecución: **https://github.com/bviteri6442/backend-facturas**

---

## Requisitos

| Herramienta | Versión |
|-------------|---------|
| Node.js | 18 o superior |
| npm | 9+ |

---

## Configuración local

```powershell
cd ruta\a\frontend-web
npm install
copy .env.example .env.local
```

Edita `.env.local` (no se sube a Git):

```env
# HTTP (puerto típico de dotnet run)
VITE_API_BASE_URL=http://localhost:56398/api

# O HTTPS si usas el perfil con certificado:
# VITE_API_BASE_URL=https://localhost:56397/api
```

La variable correcta es **`VITE_API_BASE_URL`** (ver `src/config/api.js`).  
Tambien se acepta `VITE_API_URL` por compatibilidad.

**Conectar al backend de un companero (ngrok):** guia completa en [`CONEXION_BACKEND_NGROK.md`](CONEXION_BACKEND_NGROK.md).

**Recomendado en `npm run dev` + ngrok** (evita CORS y paginas HTML de ngrok):

```env
VITE_API_PROXY_TARGET=https://TU-SUBDOMINIO.ngrok-free.app
VITE_API_BASE_URL=/api
```

**Importante:** Tras cambiar `.env.local`, reinicia `npm run dev`. Todos los servicios (`http-client`, `axios`, PDFs) leen la misma URL.

---

## Ejecutar en desarrollo

**Terminal 1:** API (repo backend) con PostgreSQL activo.

**Terminal 2:**

```powershell
npm run dev
```

Abre la URL que muestre Vite (ej. `http://localhost:3000`) y entra a **`/login.html`**.

### Credenciales de prueba (si existen en tu BD)

| Correo | Contraseña |
|--------|------------|
| `admin@test.com` | `Password123!` |

---

## Subir este proyecto a GitHub (primer push)

Ejecuta **dentro de la carpeta `frontend-web`** (no dentro del monorepo padre):

```powershell
cd "d:\TRABAJOSCLASES\Proyecto Final\App_Movil_Carrito\frontend-web"

git init
git add .
git commit -m "Initial commit: panel web PuntoVenta"
git branch -M main
git remote add origin https://github.com/bviteri6442/frontend-web-facturas.git
git push -u origin main
```

Si el remoto ya existe y solo quieres actualizar:

```powershell
git add .
git commit -m "Actualización panel web"
git push origin main
```

---

## Despliegue en Railway

### Web en Railway + API en tu PC (local)

Railway **no puede** usar `http://localhost:56398` directamente. Necesitas exponer tu API con **ngrok** y configurar `VITE_API_BASE_URL` con esa URL pública.

**Guía completa paso a paso:** [RAILWAY_BACKEND_LOCAL.md](./RAILWAY_BACKEND_LOCAL.md)

### Web en Railway + API en Railway / Supabase

### 1. Crear servicio

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**.
2. Elige el repo **`frontend-web-facturas`**.
3. Root directory: `/` (raíz del repo).

### 2. Variables de entorno (importante)

Vite **incrusta** la URL de la API en el build. Configura **antes del deploy**:

| Variable | Ejemplo |
|----------|---------|
| `VITE_API_BASE_URL` | `https://TU-API.up.railway.app/api` |

Sustituye por la URL pública de tu servicio **backend-facturas** en Railway (termina en `/api`).

### 3. Build y arranque

Railway detecta `package.json`:

- **Build:** `npm install` + `npm run build`
- **Start:** usa `railway.toml` → `npm run preview` en el puerto `$PORT`

El archivo `railway.toml` ya está en la raíz de este repo.

### 4. Dominio

En Railway → servicio web → **Settings** → **Generate Domain**.  
Abre `https://tu-dominio.up.railway.app/login.html`.

### 5. CORS

El backend debe permitir el origen de este front (hoy usa CORS abierto en desarrollo; en producción conviene restringir al dominio Railway del front).

---

## Build manual (sin Railway)

```powershell
npm run build
npm run preview
```

Salida estática en `dist/`.

---

## Estructura útil

| Ruta | Descripción |
|------|-------------|
| `index.html` | App principal (tras login) |
| `login.html` | Inicio de sesión |
| `src/main.js` | Entrada SPA |
| `src/config/api.js` | URL base de la API |
| `src/assets/styles/main.css` | Estilos globales |

---

## Paleta UI

| Token | Color |
|-------|-------|
| Principal | `#4ea93b` |
| Fondo | `#f4f9f4` |
| Texto | `#222629` |
| Contraste (CTA) | `#f05454` |
