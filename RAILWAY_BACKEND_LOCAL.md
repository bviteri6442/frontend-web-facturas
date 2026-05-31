# Desplegar el frontend web en Railway usando tu API local

Guía paso a paso para publicar **frontend-web-facturas** en Railway mientras la API sigue corriendo en **tu PC** (PostgreSQL local).

---

## Concepto importante

Railway ejecuta tu web **en internet**. Desde allí **no existe** `localhost` de tu computadora.

```
Usuario → https://tu-web.up.railway.app  →  ???  →  http://localhost:56398  ❌ no alcanza tu PC
```

Para que la web en Railway hable con tu API local necesitas una **URL pública temporal** hacia tu PC. La forma más simple: **ngrok** (plan gratuito).

Alternativa más estable: desplegar también el **backend** en Railway o usar **Supabase** (ver `backend/README.md`).

---

## Resumen del flujo

1. API corriendo en tu PC (`dotnet run`, puerto **56398**).
2. **ngrok** expone ese puerto → URL pública `https://xxxx.ngrok-free.app`.
3. En Railway defines `VITE_API_BASE_URL=https://xxxx.ngrok-free.app/api`.
4. Railway construye el front con esa URL y la sirve al mundo.
5. Tu PC debe seguir encendida con la API y ngrok activos.

---

## Parte 1 — Preparar el backend en tu PC

### 1.1 PostgreSQL local

- Servicio PostgreSQL activo.
- Base `PuntoVentaDb` (o la que uses en `appsettings.Development.json`).

### 1.2 Arrancar la API

```powershell
cd "d:\TRABAJOSCLASES\Proyecto Final\App_Movil_Carrito\backend\PuntoVenta.Api"
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet run
```

Comprueba en el navegador de **tu PC**:

- `http://localhost:56398/swagger` o la URL HTTP que muestre la consola.

Anota el puerto HTTP (suele ser **56398**).

### 1.3 CORS

Tu API ya permite cualquier origen en desarrollo (`AllowAnyOrigin`). La web en Railway podrá llamar a la API sin cambiar código.

---

## Parte 2 — Exponer la API con ngrok

### 2.1 Instalar ngrok

1. Cuenta gratis: https://ngrok.com  
2. Descarga para Windows o: `winget install ngrok`  
3. En el dashboard de ngrok copia tu **Authtoken** y ejecuta una vez:

```powershell
ngrok config add-authtoken TU_TOKEN_DE_NGROK
```

### 2.2 Túnel al puerto de la API

Con la API **ya corriendo**, en **otra terminal**:

```powershell
ngrok http 56398
```

Verás algo como:

```text
Forwarding   https://a1b2c3d4.ngrok-free.app -> http://localhost:56398
```

**Copia la URL HTTPS** (sin `/api` al final). Ejemplo base:

```text
https://a1b2c3d4.ngrok-free.app
```

### 2.3 Probar que responde

En el navegador (desde cualquier red):

```text
https://a1b2c3d4.ngrok-free.app/swagger
```

Si abre Swagger, la API es alcanzable desde internet.

### 2.4 URL para el frontend

La variable del front debe terminar en **`/api`**:

```text
VITE_API_BASE_URL=https://a1b2c3d4.ngrok-free.app/api
```

> En el plan gratuito de ngrok la URL **cambia** cada vez que reinicias ngrok. Tendrás que actualizar la variable en Railway y **volver a desplegar** el front.

---

## Parte 3 — Crear el servicio en Railway (frontend web)

### 3.1 Proyecto y servicio

1. Entra a https://railway.app  
2. **New Project**  
3. **Deploy from GitHub repo**  
4. Conecta tu cuenta de GitHub si hace falta.  
5. Elige el repositorio **`frontend-web-facturas`**.  
6. Railway crea un **servicio** con ese repo (raíz `/`).

### 3.2 Comprobar build

En **Settings** del servicio:

- **Root Directory:** vacío o `/` (raíz del repo).  
- **Builder:** Nixpacks (por `railway.toml` o detección automática).

Build esperado:

- Install: `npm install`  
- Build: `npm run build`  
- Start: `npm run preview` en `$PORT`

### 3.3 Variables de entorno (clave)

1. Abre el servicio **frontend-web-facturas**.  
2. Pestaña **Variables** → **+ New Variable** (o **RAW Editor**).

Añade:

| Nombre | Valor (ejemplo) |
|--------|------------------|
| `VITE_API_BASE_URL` | `https://a1b2c3d4.ngrok-free.app/api` |

Sustituye por **tu** URL de ngrok + `/api`.

**Importante:** Vite lee esta variable en el **momento del build**. Si cambias ngrok o la URL, debes **Redeploy**.

Opcional (Railway suele inyectarla sola):

| Nombre | Valor |
|--------|--------|
| `NODE_ENV` | `production` |

No hace falta poner `localhost` en Railway; no funcionaría desde la nube.

### 3.4 Desplegar

1. **Deploy** → espera build verde.  
2. Si falla el build, revisa **Deployments** → logs.  
3. **Settings** → **Networking** → **Generate Domain**.  
4. Abre: `https://TU-DOMINIO.up.railway.app/login.html`

### 3.5 Probar login

- Usuario de tu BD local (ej. `admin@test.com` / `Password123!`).  
- Si falla: F12 → pestaña **Red** → ver si las peticiones van a la URL de ngrok y no a `localhost`.

---

## Parte 4 — Mantener todo funcionando

| Componente | Debe estar |
|------------|------------|
| PostgreSQL | Activo en tu PC |
| `dotnet run` (API) | Terminal abierta |
| `ngrok http 56398` | Terminal abierta |
| Railway front | Desplegado con `VITE_API_BASE_URL` correcta |

Si apagas la PC o cierras ngrok, la web en Railway dejará de conectar con la API.

---

## Parte 5 — Cuando cambie la URL de ngrok

1. Reinicias ngrok → nueva URL `https://NUEVA.ngrok-free.app`  
2. Railway → Variables → edita `VITE_API_BASE_URL`  
3. **Deploy** → **Redeploy** (rebuild obligatorio)

---

## Alternativas a ngrok

| Herramienta | Uso |
|-------------|-----|
| **Cloudflare Tunnel** | Gratis, URL más estable con dominio propio |
| **localtunnel** | `npx localtunnel --port 56398` |
| **Desplegar API en Railway** | No dependes de tu PC; BD en Supabase/Railway Postgres |

Para producción real se recomienda **backend en Railway + Supabase**, no depender de ngrok.

---

## Checklist rápido

- [ ] API local responde en `http://localhost:56398`  
- [ ] `ngrok http 56398` activo  
- [ ] Swagger abre con la URL `https://....ngrok-free.app`  
- [ ] Repo `frontend-web-facturas` en GitHub  
- [ ] Servicio Railway conectado al repo  
- [ ] Variable `VITE_API_BASE_URL=https://....ngrok-free.app/api`  
- [ ] Deploy exitoso + dominio generado  
- [ ] Login OK en `https://TU-DOMINIO.up.railway.app/login.html`
