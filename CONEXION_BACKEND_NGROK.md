# Conectar el frontend (repo clonado) al backend de un companero via ngrok

Si el **login funciona** pero **clientes, productos y facturas salen en 0** o ngrok muestra **"no content"**, casi siempre es configuracion de URL o una version vieja del codigo.

---

## Por que Railway si y tu PC no

| Entorno | Como se configura la API |
|---------|---------------------------|
| **Railway** | Variable `VITE_API_BASE_URL` en el panel → se **incrusta al compilar** (`npm run build`). |
| **Tu PC (`npm run dev`)** | Lee **`.env.local`** al arrancar Vite. Si falta o esta mal, el login puede ir a una URL y el resto a otra (version antigua) o a `localhost`. |

Abrir en el navegador `https://xxxx.ngrok-free.app/api` y ver **404** es **normal**: no hay pagina en `/api`; la API vive en rutas como `/api/Auth/login`, `/api/Clientes`, etc. (Swagger: `/swagger`).

---

## Checklist para quien clona solo `frontend-web`

### 1. Codigo actualizado

```powershell
git pull origin main
```

Debe existir `src/services/http-client.js` importando `API_BASE_URL` desde `src/config/api.js` (sin `localhost` hardcodeado).

### 2. Archivo `.env.local` (crear desde `.env.example`)

**Recomendado en desarrollo** (proxy Vite → ngrok):

```env
VITE_API_PROXY_TARGET=https://c2b3-164-163-162-35.ngrok-free.app
VITE_API_BASE_URL=/api
```

**Alternativa** (misma idea que Railway):

```env
VITE_API_BASE_URL=https://c2b3-164-163-162-35.ngrok-free.app/api
```

Sustituye la URL por la que te pase quien tiene el backend encendido.

### 3. Reiniciar el servidor de Vite

```powershell
npm install
npm run dev
```

Cada cambio en `.env.local` exige **cerrar y volver a ejecutar** `npm run dev`.

### 4. Comprobar en el navegador (F12 → Consola)

Debe aparecer algo como:

```text
[API] Base URL: /api (env)
```

o

```text
[API] Base URL: https://....ngrok-free.app/api (env)
```

Si ves `http://localhost:56398/api` sin quererlo, el `.env.local` no se esta leyendo.

### 5. Backend y ngrok del dueno de la API

En la PC del dueno del backend deben estar **a la vez**:

1. PostgreSQL + `dotnet run` (API en puerto **56398** u otro).
2. `ngrok http 56398` (misma URL que pusiste en `.env.local`).

Si ngrok se reinicia, **cambia la URL** → actualizar `.env.local` (y Railway si aplica) y redeploy/reiniciar dev.

### 6. Probar con sesion limpia

1. Cerrar sesion o borrar en DevTools → Application → Local Storage: `authToken`, `currentUser`.
2. Entrar de nuevo en `/login.html`.
3. En **Network**, una peticion `GET .../api/clientes` debe llevar cabecera `Authorization: Bearer ...` y responder **200** con JSON (array).

---

## Que significa "no content" en ngrok

En el inspector de ngrok, **"no content"** en un **GET** suele referirse al **cuerpo de la peticion** (vacio), no a que la API no tenga datos.

Revisa en ngrok el **codigo de respuesta**:

| Codigo | Causa habitual |
|--------|----------------|
| **200** + JSON con datos | Front mal parseado o BD vacia en ese backend |
| **401** | Token ausente o expirado → volver a login |
| **403** | Rol sin permiso |
| **404** | Ruta mal escrita |
| **502** | ngrok activo pero API apagada en la PC del dueno |

---

## Endpoints que usa este frontend (alineados con Swagger)

| Modulo | Metodo | Ruta |
|--------|--------|------|
| Login | POST | `/api/Auth/login` |
| Clientes | GET | `/api/Clientes` |
| Productos | GET | `/api/productos` (paginado: `{ total, productos: [...] }`) |
| Ventas | GET | `/api/Ventas` |

Todas las rutas anteriores (excepto login) requieren **JWT** en `Authorization: Bearer {token}`.

---

## Si sigue fallando

1. Comparar en Network la URL exacta del login vs la de `clientes`.
2. Pegar en Swagger (ngrok `/swagger`) el mismo token y probar `GET /api/Clientes`.
3. Confirmar que el dueno del backend ve datos en **su** Swagger con el mismo tunel.

Si Swagger devuelve datos y el front no, el problema es solo configuracion o version del repo clonado.
