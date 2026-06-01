# 🧠 AGENT MEMORY — PuntoVenta Frontend (Facturas)

> **Última auditoría**: 31 de mayo de 2026  
> **Versión auditada**: main branch (en desarrollo)  
> **Auditor**: 5-Expert Staff Engineer (Architecture, Full-Stack, Security, DevOps, QA)

---

## 🎯 IDENTIDAD DEL PROYECTO

**PuntoVenta Frontend** es un panel administrativo web para gestionar un sistema de punto de venta y facturación. SPA (Single Page Application) construida con Vite 5 + JavaScript vanilla, responsable de autenticación, gestión de clientes, productos, ventas, usuarios, auditoría y reportes. 

**Estado actual**: En desarrollo activo, desplegable en Railway. Requiere backend API REST (.NET) ejecutándose localmente o en la nube. Repositorio público en GitHub bajo licencia abierta.

---

## 🏗️ STACK PRINCIPAL

| Capa | Tecnología | Versión | Observación |
|------|-----------|---------|------------|
| **Frontend** | Vite (MPA) | 5.4.21 | Bundler, dev server, no SSR |
| **Lenguaje** | JavaScript (vanilla) | ES2021+ | Sin TypeScript, módulos ESM |
| **HTTP Client** | Axios + Fetch (híbrido) | 1.6.7 | Dual-stack con fallback |
| **Auth** | JWT + localStorage | - | Token Bearer en headers |
| **PDF/Reports** | jsPDF + jsPDF-autotable | 2.5.1 / 3.8.2 | Generación de facturas |
| **UI Alerts** | SweetAlert2 | 11.10.7 | Modales y confirmaciones |
| **Icons** | FontAwesome Free | 7.2.0 | Icons CSS + fonts |
| **Backend** | REST API (.NET) | - | Requerido, no en este repo |
| **Database** | PostgreSQL (backend) | - | Fuera del scope del frontend |
| **Infra** | Railway / Ngrok (dev) | - | Deploy y tunneling |

---

## 🧩 ARQUITECTURA EN UNA FRASE

**Monolito frontend modular con component-like pages y service layer**, separado en `pages/` (lógica + rendering), `services/` (API calls), `utils/` (helpers), y `components/` (reutilizables). Routing SPA con Class-based Router. State management minimalista (Observable pattern).

---

## 📁 RUTAS CLAVE

- **Entry point**: [src/main.js](../src/main.js)  
- **Login**: [login.html](../login.html) + [src/login.js](../src/login.js)  
- **Configuración API**: [src/config/api.js](../src/config/api.js)  
- **Routing**: [src/router.js](../src/router.js)  
- **State**: [src/store.js](../src/store.js)  
- **Servicios API**: [src/services/](../src/services/) (13 servicios)  
- **Páginas**: [src/pages/](../src/pages/) (14 páginas)  
- **Componentes reutilizables**: [src/components/](../src/components/) (GlobalModal, PaginationAdvanced)  
- **Estilos**: [src/assets/styles/](../src/assets/styles/)  
- **Build config**: [vite.config.js](../vite.config.js)  
- **Linter config**: [.eslintrc.cjs](.eslintrc.cjs)  

---

## 🚦 ESTADO ACTUAL

| Aspecto | Estado | Detalles |
|--------|--------|---------|
| **Deployado** | ✅ Sí | Railway (`backend-facturas-production.up.railway.app`) |
| **Testing** | ❌ No | Sin tests unit, integration ni e2e |
| **Documentación** | ⚠️ Parcial | 7 archivos .md con guías (falta arch docs) |
| **Deuda técnica** | 🔴 Alta | Auth inseguro, no hay validaciones, code smells |
| **Cobertura de código** | 0% | Sin herramientas de test |
| **Performance** | ⚠️ Desconocida | Sin bundle analysis, no hay monitoring |

---

## 🚨 RED FLAGS CRÍTICOS

**Cualquier nuevo dev debe saber AHORA:**

1. **🔐 Autenticación almacenada en localStorage** — Vulnerable a XSS. Tokens sin rotación, sin refresh logic. CRÍTICO.

2. **❌ Sin validación server-side esperada** — El frontend valida inputs (cédula, emails) pero asume backend también lo hará. Sin interceptores globales de errores.

3. **🛠️ ESLint misconfigured** — Extrae config de Vue aunque proyecto NO usa Vue. Falsos positivos ignorados.

4. **📦 Sin manejo de versiones exactas** — `package-lock.json` presente pero devDependencies solo tiene `vite` (sin Prettier/ESLint instalados).

5. **🔄 Sin testing = deuda acumulada** — Cualquier refactor es riesgoso. Rutas críticas no testeadas (login, ventas, PDFs).

6. **🌐 CORS/Ngrok hardcoded en variables** — Múltiples `.env` files (.local, .production). Fácil cometer errores.

7. **📄 Rutas muchas, componentes pocos** — 14 páginas en src/pages/ pero solo 2 componentes reutilizables. Alto acoplamiento a DOM.

8. **🔑 Secretos en repo potencial** — No hay .env.local en .gitignore explícitamente (aunque .git ignora private), pero PDF con endpoints del backend sí está commiteado.

---

## 📜 CONVENCIONES DEL PROYECTO

### 📂 Estructura de carpetas

```
src/
├── main.js                    # Bootstrap app (check auth, init DOM, setup)
├── login.js                   # Login page logic (register, login handlers)
├── router.js                  # SPA Router (class-based)
├── store.js                   # Observable state store
├── config/
│   └── api.js                 # API URL normalization + constants
├── pages/                     # Page classes (cada página = clase JS)
│   ├── dashboard.js
│   ├── usuarios.js
│   └── ...
├── services/                  # API services (cada entidad = servicio)
│   ├── http-client.js         # Fetch wrapper con auth
│   ├── axios.js               # Axios wrapper (fallback)
│   ├── authService.js
│   └── ...
├── components/                # Reusable components (modal, pagination)
│   ├── GlobalModal.js
│   └── PaginationAdvanced.js
├── utils/                     # Helpers (formatters, validators)
│   ├── apiResponse.js         # Response handling
│   ├── errorHandler.js        # Error formatting
│   ├── helpers.js             # Misc utilities
│   └── ...
└── assets/
    └── styles/                # CSS (vanilla, no framework)
        ├── login.css
        └── main.css
```

### 🏛️ Naming conventions

- **Páginas** (classes): `PascalCase` (ej: `Dashboard`, `Clientes`)  
- **Servicios** (classes): `PascalCase` (ej: `UsuarioService`)  
- **Funciones** (modules): `camelCase` (ej: `formatCurrency`, `validateCedula`)  
- **Constantes**: `SCREAMING_SNAKE_CASE` (ej: `DEFAULT_LOCAL_API`)  

### 🔌 Patrones de uso

**Páginas** son clases que extienden lógica de negocio + renderizado:
```javascript
export class Dashboard {
  constructor(mainContent) {
    this.mainContent = mainContent
  }
  async render() { /* HTML generation */ }
}
```

**Servicios** wrappean HTTP calls:
```javascript
export class UsuarioService {
  static async getAll() { /* fetch usuarios */ }
}
```

**Event listeners** se attachen en render(), no en constructor.

### 🔐 Auth flow

1. Usuario entra en `/login.html`  
2. `login.js` captura credenciales, llama `authService.login()`  
3. Backend retorna JWT + user object  
4. Frontend almacena en `localStorage` (`authToken`, `currentUser`)  
5. `http-client.js` inyecta `Authorization: Bearer {token}` en headers  
6. Si token expira: error 401 → redirigir a login (no hay refresh)

---

## 🔗 REFERENCIA RÁPIDA

- [00_PROJECT_OVERVIEW.md](00_PROJECT_OVERVIEW.md) → Tipo, propósito, tamaño  
- [01_TECH_STACK.md](01_TECH_STACK.md) → Versiones exactas, dependencias  
- [02_ARCHITECTURE.md](02_ARCHITECTURE.md) → Diagrama, patrón, módulos  
- [03_FRONTEND.md](03_FRONTEND.md) → Routing, state, styling, componentes  
- [07_SECURITY.md](07_SECURITY.md) → Vulnerabilidades, OWASP, fixes  
- [08_CODE_QUALITY.md](08_CODE_QUALITY.md) → Linting, testing, smells  
- [09_DEPENDENCIES.md](09_DEPENDENCIES.md) → Packages, vulnerabilidades  
- [11_TECH_DEBT.md](11_TECH_DEBT.md) → Backlog priorizado de mejoras  
- [14_EXECUTIVE_REPORT.md](14_EXECUTIVE_REPORT.md) → Scorecard + recomendaciones  

---

## 🤖 INSTRUCCIONES PARA EL AGENTE

Antes de hacer **cualquier modificación** al código:

1. ✅ Lee este `AGENT_MEMORY.md` completo  
2. ✅ Lee el archivo numerado relevante (ej: `03_FRONTEND.md` para cambios UI)  
3. ✅ Respeta convenciones documentadas (naming, estructura, auth flow)  
4. ⚠️ Si la modificación toca **auth, API calls, o seguridad**: avisa al usuario ANTES  
5. 📝 Si encuentras info nueva no documentada: actualiza el archivo relevante + AGENT_MEMORY.md  

**No asumas nada.** Si tienes dudas sobre cómo se hace algo en el proyecto, **lee el archivo pertinente primero**.

---

**Última actualización**: 31-May-2026  
**Próximas auditorías**: Cada 4 semanas o tras cambios arquitectónicos  
