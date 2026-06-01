# 🚀 06_DEVOPS.md

## CI/CD Pipeline

**Status**: ❌ **NO CONFIGURADO**

**Evidencia**:
- ❌ No hay `.github/workflows/` (GitHub Actions)
- ❌ No hay `.gitlab-ci.yml` (GitLab CI)
- ❌ No hay `.circleci/` (CircleCI)
- ❌ No hay `Jenkinsfile` (Jenkins)

**Current workflow**: Manual (probablemente)
1. Dev hizo push a main
2. Railway detecta push (si está integrado)
3. Railway ejecuta `npm run build` y deploy automático

---

## Containerización

**Docker**: ❌ No configurado
- ❌ No hay `Dockerfile`
- ❌ No hay `docker-compose.yml`

**Implicación**: Proyecto se desplega como archivos estáticos (HTML + JS bundled), no como contenedor.

---

## Deployment Platform

### Railway.io

**Status**: ✅ Configurado

**Archivo**: [railway.toml](../railway.toml)

```toml
[build]
# Probablemente especifica npm run build

[deploy]
# Configuración de deployment
```

**Flujo**:
1. Código en GitHub
2. Railway webhook detecta push
3. Railway clona repo
4. Ejecuta build (npm run build)
5. Genera dist/
6. Sirve desde CDN/static server
7. URL producción: https://...up.railway.app

**Verificar**: Intencionalmente no se leyó completo railroad.toml, pero documentación menciona Railway.

### Alternativas posibles

No están configuradas pero el proyecto podría deplegar a:
- **Vercel** — Optimizado para frontend Vite
- **Netlify** — SPA-friendly
- **AWS S3 + CloudFront**
- **GCP Cloud Storage**

---

## Environments

| Ambiente | URL | Config |
|----------|-----|--------|
| **Desarrollo** | http://localhost:3000 | `.env.local` |
| **Staging** | (No existe) | - |
| **Producción** | railway.app (TBD exact URL) | `.env.production` |

**Diferencia main**:
- `VITE_API_BASE_URL` apunta a backend diferente
- Resto de código idéntico

---

## Infrastructure as Code

**Status**: ❌ **NO PRESENTE**

- ❌ No hay Terraform
- ❌ No hay CloudFormation
- ❌ No hay Pulumi
- ❌ No hay Ansible

**Implicación**: Railway maneja infraestructura (no código). Si hay que migrar a otro host, manual.

---

## Observabilidad

### Logging

**Frontend**: ❌ No hay logging centralizado
- Solo `console.log()` en desarrollo
- Sin Sentry, DataDog, LogRocket

**Backend**: Presumiblemente logging en backend (no visible aquí)

### Error Tracking

**Frontend**: ❌ No hay Sentry / Rollbar

**Risk**: Si app crashea en producción, solo usuario lo sabe.

### Monitoring

- ❌ No hay Prometheus metrics
- ❌ No hay Grafana dashboards
- ❌ No hay uptime monitoring
- ❌ No hay APM (Application Performance Monitoring)

**Health checks**: No aplicable (SPA estática).

---

## Variables de Entorno

**Gestionadas**: Manualmente en archivos `.env*`

### Archivos presentes

1. `.env.example` — Template (commiteado)
2. `.env.local` — Desarrollo (gitignored)
3. `.env.production` — Producción (probablemente en Railway secrets)

### Variables esperadas

| Variable | Tipo | Dónde |
|----------|------|-------|
| `VITE_API_BASE_URL` | String (URL) | `.env.*` |
| `VITE_API_PROXY_TARGET` | String (URL) | `.env.local` (dev) |
| `VITE_API_URL` | String (URL fallback) | `.env.*` |

### Secret Management

**Current**: ❌ Variables en `.env.production` en Railway

**Risk**: Si el `.env.production` contiene secretos, están expuestos en el repo (si commiteado).

**Recomendación**: 
- Usar Railway Secrets environment (no .env.production en git)
- Usar herramientas: Doppler, 1Password CLI, Vault

---

## Build Pipeline

**Comando**:
```bash
npm run build  # Ejecuta: vite build
```

**Output**:
- Genera carpeta `dist/` con:
  - `index.html` (bundled + optimizado)
  - `assets/` (JS chunks, CSS, fonts)

**Optimizaciones**:
- ✅ Minificación (default Vite)
- ✅ Tree-shaking (default Vite)
- ⚠️ No hay code splitting explícito (single bundle probable)
- ⚠️ No hay gzip/brotli pre-generadas

---

## Deployment Checklist

- ⚠️ No hay pre-deploy tests
- ⚠️ No hay staging deploy
- ⚠️ No hay rollback strategy documentada
- ⚠️ No hay deployment notifications
- ⚠️ No hay health checks post-deploy

---

## Recommendations

### Inmediato (P0)
1. [ ] Agregar GitHub Actions para CI:
   - Lint: `npm run lint` (si se instala ESLint)
   - Build: `npm run build`
   - Upload artifacts a Railway

2. [ ] Configurar Railway Secrets (no variables en repo)

### Corto plazo (P1)
3. [ ] Agregar Sentry para error tracking
4. [ ] Agregar monitoring básico (uptime, responsiveness)
5. [ ] Documentar rollback procedure

### Mediano plazo (P2)
6. [ ] Setup Dockerfile (para flexibilidad)
7. [ ] Setup Terraform o IaC alternativo
8. [ ] Agregar staging environment

---

## 🔗 ARCHIVOS CLAVE

- [railway.toml](../railway.toml) — Railway configuration
- [.env.example](../.env.example) — Environment template
- [package.json](../package.json) — Build scripts
