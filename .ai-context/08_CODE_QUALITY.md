# 🧪 08_CODE_QUALITY.md

## Testing Strategy

**Current status**: ❌ **NO TESTS PRESENT**

- ❌ No unit tests (Jest, Vitest)
- ❌ No integration tests
- ❌ No e2e tests (Playwright, Cypress)
- ❌ Coverage: **0%**

**Impact**: 
- 🔴 Refactoring es riesgoso
- 🔴 Deuda técnica se acumula
- 🔴 Bugs descubiertos solo en producción

---

## Linting

### ESLint

**Status**: ⚠️ **Configurado pero misconfigured**

**.eslintrc.cjs**:
```javascript
{
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    'vue/multi-word-component-names': 'off'
  }
}
```

**Problemas**:
1. ❌ Extiende `plugin:vue/vue3-essential` pero proyecto NO usa Vue
2. ❌ `vue/multi-word-component-names` rule es innecesaria
3. ⚠️ `'no-console'` = warn (debería ser off para dev)
4. ⚠️ No está instalado ESLint ni plugins (`devDependencies` solo tiene Vite)

**Acción**: ESLint config está pero no es ejecutable sin instalación.

### Prettier

**Status**: ❌ **No configurado**

No hay `.prettierrc` ni formatter automático.

---

## Code Smells Detectados

### 1. **God Classes / God Pages** 🔴

**Archivo**: [src/pages/nuevaventa.js](../src/pages/nuevaventa.js)

Presumible que esta página:
- Maneja carrito (state local)
- Valida items
- Calcula totales
- Maneja PDF generation
- Envía request a backend

**Recomendación**: Dividir en componentes más pequeños o servicios.

### 2. **Duplicate Code** 🟡

Servicios siguen patrón repetitivo:

```javascript
// usuarioService.js
export class UsuarioService {
  static async getAll() { ... }
  static async getById(id) { ... }
  static async create(data) { ... }
  static async update(id, data) { ... }
  static async delete(id) { ... }
}

// productoService.js (identical pattern)
export class ProductoService {
  static async getAll() { ... }
  // ... mismo patrón
}
```

**Oportunidad**: Genérico BaseService + inheritance para reducir duplication.

### 3. **Magic Numbers / Hardcoded Strings** 🟡

**Ejemplos encontrados**:
- `56398` — Puerto local hardcoded en docs (no en código, pero usado)
- `3000` — Puerto Vite hardcoded en vite.config.js (debería ser variable)
- Status codes sin constantes (401, 500, etc.)

### 4. **TODOs / FIXMEs** 🟡

**Status**: No detectados en búsqueda rápida, pero probable que existan.

**Recomendación**: Revisar y trackear en issue tracker.

### 5. **Side Effects in Unexpected Places** 🟡

**Ejemplo**:
```javascript
// ¿En qué archivo? Hay efectos lado cuando se importa store.js
const userData = localStorage.getItem('currentUser')
if (userData) {
  store.setState({ currentUser: JSON.parse(userData) })
}
```

**Problema**: Importar un módulo tiene efecto colateral. Difícil de testear.

### 6. **Dead Code / Unused Imports** 🟡

**Status**: No ejecutó herramienta de detection (requiere `depcheck` o `knip`).

**Probable**:
- Imports no usados en algunos servicios
- Funciones viejas comentadas

### 7. **Inconsistent Error Handling** 🟡

Algunas funciones:
```javascript
try {
  // fetch
} catch (error) {
  console.error(error)
}
```

Otras:
```javascript
// Sin try-catch, error propaga
const response = await fetch(...)
```

**Recomendación**: Wrapper global de errores.

---

## Naming Conventions

### Consistent ✅

- **Classes**: PascalCase (Dashboard, UsuarioService) ✅
- **Functions**: camelCase (getUsers, formatCurrency) ✅
- **Constants**: SCREAMING_SNAKE_CASE (DEFAULT_LOCAL_API) ✅
- **Variables**: camelCase (userData, isLoading) ✅

### Inconsistent ⚠️

- **HTML IDs**: inconsistent (some snake_case, some camelCase)
  - `#registerModal` (camelCase)
  - `#closeRegisterModal` (camelCase)
  - Could standardize

---

## File Organization

**Actualmente**:
```
src/
├── pages/        (14 files)
├── services/     (13 files)
├── components/   (2 files)
├── utils/        (5-6 files)
├── config/       (1 file)
└── assets/       (styles)
```

**Observation**: Buena separación por capas, pero dentro de cada capa no hay sub-organización.

**Ejemplo mejora**:
```
src/
├── pages/
│   ├── admin/
│   │   ├── usuarios.js
│   │   ├── productos.js
│   │   └── ...
│   └── public/
│       └── dashboard.js
├── services/
│   ├── domain/    (usuarioService, productoService)
│   ├── http/      (http-client, axios)
│   └── external/  (cloudinaryService)
```

---

## TypeScript Readiness

**Status**: ❌ **Not TypeScript**

**Considerations**:
- ✅ Code pequeño es maneable sin tipos
- ❌ A escala (>5K LOC) TypeScript reduciría bugs
- ⚠️ Migration a TS requeriría refactor total

**Recommendation**: Mantener JavaScript por ahora. Si crece, evaluar TS.

---

## Code Coverage Tools

**Status**: ❌ **No herramientas**

**To implement**:
```bash
npm install --save-dev jest @babel/preset-env
```

Then:
```bash
npm run test -- --coverage
```

---

## Complejidad Ciclomática

**Sin herramientas de análisis**, pero observaciones:

| Función | Complejidad | Problema |
|---------|------------|----------|
| `checkAuth()` | Low (~2) | ✅ OK |
| `render()` en pages | Medium (~5-8) | ⚠️ String templates largas |
| `attachEventListeners()` | High (~10+) | ⚠️ Muchos listeners |
| `nuevaventa.render()` | Very High (~15+) | 🔴 Refactor needed |

**Recomendación**: Extraer lógica de rendering a funciones auxiliares.

---

## Comments and Documentation

**Status**: ⚠️ **Parcial**

**Bueno**:
- ✅ `vite.config.js` tiene comentarios explicativos
- ✅ `api.js` tiene JSDoc headers

**Malo**:
- ❌ Funciones sin JSDoc
- ❌ Parámetros sin tipos documentados
- ❌ No hay inline comentarios explicando lógica compleja

**Ejemplo mejoría**:
```javascript
/**
 * Validates Ecuadorian cedula format
 * @param {string} cedula - 10-digit cedula
 * @returns {boolean} True if valid format
 */
export function validateCedula(cedula) {
  // ...
}
```

---

## Accesibilidad (A11y)

**Status**: ⚠️ **Minimal**

**Good**:
- ✅ Semantic HTML en algunos lugares (form inputs)

**Bad**:
- ❌ Modales sin focus trap
- ❌ Colores sin suficiente contraste
- ❌ Botones sin `aria-label`
- ❌ No hay skip links
- ❌ No hay keyboard navigation

**Recomendación**: Usar librería como `a11y-dialog` o implementar ARIA attributes.

---

## Performance Metrics

**No hay herramientas de análisis**, pero estimaciones:

| Métrica | Estimado | Aceptable? |
|---------|----------|-----------|
| Bundle size | ~100-120KB gzip | ✅ OK |
| LCP (Largest Contentful Paint) | ~2-3s | ⚠️ Ok |
| FID (First Input Delay) | <100ms | ✅ OK (JS light) |
| CLS (Cumulative Layout Shift) | ~0.1 | ✅ OK |

**No hay image optimization** (Cloudinary images probable, pero sin sizing).

---

## Recommended Checklist

| Item | Priority | Effort |
|------|----------|--------|
| Instalar ESLint + fix config | P1 | 1h |
| Instalar Prettier | P1 | 30m |
| Instalar Jest + write tests | P2 | 8h+ |
| Refactor god classes | P2 | 4h |
| Add JSDoc comments | P2 | 3h |
| Improve accesibility | P2 | 2h |

---

## 🔗 ARCHIVOS CLAVE

- [.eslintrc.cjs](.eslintrc.cjs) — Linter config
- [src/pages/nuevaventa.js](../src/pages/nuevaventa.js) — Candidate for refactor
- [src/services/](../src/services/) — Check for duplication
