# 🛠️ 01_TECH_STACK.md

## Lenguajes y Runtimes

| Componente | Especificación | Detalles |
|-----------|----------------|---------|
| **Lenguaje principal** | JavaScript (ES2021+) | Vanilla, sin TypeScript |
| **Runtime objetivo** | Node.js 18+ (build) | Vite corre en Node |
| **Browser target** | ES2021 compatible | Modernos (Chrome, Firefox, Safari, Edge) |
| **Módulos** | ESM (ES Modules) | Import/export estándar |

**No hay TypeScript configurado.** ESLint aparenta soportar TS pero es falso positivo (config heredada de Vue).

---

## Build & Bundler

| Tool | Versión | Propósito |
|------|---------|----------|
| **Vite** | 5.4.21 | Dev server, bundler, HMR |
| **Node.js (build)** | Recomendado 18+ | Runtime para npm scripts |

**Build output**: Vite genera carpeta `dist/` con HTML + JS bundled + assets (por defecto).

---

## Frameworks y Librerías

### HTTP & API Communication

| Librería | Versión | Uso |
|----------|---------|-----|
| **Axios** | 1.6.7 | HTTP client principal (fallback legacy) |
| **Fetch API** | Nativo | HTTP client primario (http-client.js) |

**Situación actual**: Proyecto tiene ambos implementados (`http-client.js` usa Fetch, servicios también usan Axios). Híbrido innecesario.

### UI & Componentes

| Librería | Versión | Uso |
|----------|---------|-----|
| **SweetAlert2** | 11.10.7 | Modales, confirmaciones, alertas |
| **FontAwesome Free** | 7.2.0 | Iconografía CSS |

**Nota**: No hay framework UI (Material UI, Bootstrap, Tailwind, etc.). Estilos vanilla CSS.

### PDF & Reporting

| Librería | Versión | Uso |
|----------|---------|-----|
| **jsPDF** | 2.5.1 | Generación de facturas en PDF |
| **jsPDF-autotable** | 3.8.2 | Tablas en PDFs |

---

## Package Management

| Aspecto | Configuración | Status |
|---------|---------------|--------|
| **Gestor** | npm | ✅ Presente |
| **Lockfile** | package-lock.json | ✅ Presente |
| **Semver** | ✅ Respetado | Rangos con ^ (minor updates) |

**package.json**:
```json
{
  "name": "punto-venta-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "vite preview --host 0.0.0.0 --port 3000"
  }
}
```

---

## Linting & Formatting

| Tool | Config | Status |
|------|--------|--------|
| **ESLint** | .eslintrc.cjs | ✅ Presente (pero misconfigured) |
| **Prettier** | Ninguno | ❌ No instalado |

**Problema ESLint**: 
- Extiende `plugin:vue/vue3-essential` pero proyecto NO usa Vue
- Comentarios de reglas sugen dev error pero se ignoran
- Debería ser config vanilla JavaScript + browser env

---

## Variables de Entorno

**Manejo**: Vite `loadEnv()` con prefijo `VITE_`

| Variable | Propósito | Formato |
|----------|-----------|---------|
| `VITE_API_BASE_URL` | URL base de API | `http://localhost:56398/api` |
| `VITE_API_URL` | Fallback (legacy) | Mismo formato |
| `VITE_API_PROXY_TARGET` | Proxy dev (evita CORS) | `https://xxx.ngrok-free.app` |

**Archivos presentes**:
- `.env.example` — Template de variables
- `.env.local` — Desarrollo (NO commiteado)
- `.env.production` — Build production

---

## CSS & Styling

| Aspecto | Implementación |
|--------|-----------------|
| **Framework** | Ninguno (vanilla CSS) |
| **Preprocessor** | Ninguno (CSS directo) |
| **CSS-in-JS** | No |
| **Tailwind** | No |
| **PostCSS** | No |

**Ubicación**: `src/assets/styles/` (login.css, main.css)

---

## Database / ORM (No aplica — Frontend Only)

Backend maneja persistencia. Frontend solo consume REST API.

---

## Servicios Externos Integrados

| Servicio | Tipo | Evidencia |
|----------|------|-----------|
| **Cloudinary** | Image storage / CDN | `cloudinaryService.js` presente |
| **Backend API** | REST (custom) | Múltiples servicios apuntando a ella |

**No hay**: Auth0, Firebase, Stripe, email, analytics integrados en frontend.

---

## DevOps & Infrastructure

### Containerización

| Tool | Present | Config |
|------|---------|--------|
| **Docker** | ❌ No | No Dockerfile |
| **Docker Compose** | ❌ No | No docker-compose.yml |
| **Kubernetes** | ❌ No | No manifests |

### IaC

| Tool | Present | Config |
|------|---------|--------|
| **Terraform** | ❌ No | No .tf files |
| **Pulumi** | ❌ No | No Pulumi config |

### Deployment Platform

| Platform | Evidence |
|----------|----------|
| **Railway** | ✅ railway.toml presente |
| **Vercel** | ❌ No |
| **Netlify** | ❌ No |

**railroad.toml** configurado para Railway deployment.

### CI/CD

| Tool | Evidence |
|------|----------|
| **.github/workflows** | ❌ No GitHub Actions detectadas |
| **GitLab CI** | ❌ No |
| **CircleCI** | ❌ No |

**Situación**: CI/CD manual (probablemente). Railway puede auto-deploy en push.

---

## Resumen de Dependencias

### Producción (5 packages)

```
@fortawesome/fontawesome-free@^7.2.0
axios@^1.6.7
jspdf@^2.5.1
jspdf-autotable@^3.8.2
sweetalert2@^11.10.7
```

**Total packages en node_modules**: ~50-100 (incluyendo transitive deps)

### Desarrollo (1 package)

```
vite@^5.4.21
```

**Herramientas faltantes**:
- ❌ ESLint (configurado pero no instalado)
- ❌ Prettier (no hay formatter automático)
- ❌ Jest / Vitest (sin testing framework)
- ❌ Husky (sin git hooks)

---

## Versiones Críticas Detectadas

| Package | Current | Outdated? | Risk |
|---------|---------|-----------|------|
| Vite | 5.4.21 | ✅ Up-to-date | Bajo |
| Axios | 1.6.7 | ⚠️ 1.7.2 disponible | Muy bajo (patch) |
| jsPDF | 2.5.1 | ✅ Current | Bajo |
| SweetAlert2 | 11.10.7 | ⚠️ 11.10.8+ | Muy bajo (patch) |
| FontAwesome | 7.2.0 | ⚠️ 6.5.x es muy vieja | Bajo (cosmético) |

**Recomendación**: Ejecutar `npm audit` y `npm update` en próxima sesión.

---

## 🔗 ARCHIVOS CLAVE

- [package.json](../package.json) — Definición de dependencias
- [package-lock.json](../package-lock.json) — Lock file exacto
- [vite.config.js](../vite.config.js) — Configuración de build
- [.eslintrc.cjs](.eslintrc.cjs) — Linter config (misconfigured)
- [.env.example](../.env.example) — Template variables
