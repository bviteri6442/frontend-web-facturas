# ⚠️ 11_TECH_DEBT.md

## Priorized Tech Debt Backlog

---

## 🔴 CRITICAL (Fix Immediately)

### 1. **Insecure Token Storage (localStorage)**

**Problem**: JWT stored in localStorage, vulnerable to XSS.

**Files affected**: 
- [src/main.js](../src/main.js#L25)
- [src/login.js](../src/login.js)

**Impact**: High (security breach risk)  
**Effort**: S (small)  
**Estimated time**: 2-4 hours

**Solution**:
1. Migrate to secure HttpOnly + Secure cookies (backend change needed)
2. Or: Implement refresh token + in-memory token storage
3. Implement CSP headers to mitigate XSS

**Blocking**: Other security fixes depend on this.

---

### 2. **No Input Sanitization (XSS Risk)**

**Problem**: innerHTML used with user data without sanitization.

**Example**:
```javascript
// src/pages/*.js
this.mainContent.innerHTML = `<div>${userData.nombre}</div>`
```

**Files affected**: All page files in [src/pages/](../src/pages/)

**Impact**: High (XSS vulnerability)  
**Effort**: M (medium)  
**Estimated time**: 4-6 hours

**Solution**:
1. Install DOMPurify
2. Replace innerHTML with textContent where possible
3. Sanitize all dynamic HTML

---

### 3. **JWT without Expiration Checking**

**Problem**: Token stored indefinitely. No refresh or expiration check.

**Files affected**:
- [src/main.js](../src/main.js)
- [src/services/authService.js](../src/services/authService.js)

**Impact**: High (stale session risk)  
**Effort**: M (medium)  
**Estimated time**: 3-4 hours

**Solution**:
1. Decode JWT and check exp claim
2. Implement refresh token endpoint
3. Add auto-logout on expiration

---

### 4. **RBAC Enforced Only Client-Side**

**Problem**: Role checks in JavaScript. User can edit source to bypass.

**Files affected**: [src/main.js](../src/main.js#L65)

**Impact**: High (authorization bypass)  
**Effort**: S (small, document only)  
**Estimated time**: 1 hour

**Solution**:
- Document that backend MUST validate every request
- Remove sensitive business logic from frontend role checks
- Treat frontend RBAC as UI/UX only

---

## 🟠 HIGH (Fix Soon)

### 5. **No Error Handling Global**

**Problem**: Sporadic try-catch. Errors not centralized. Users see generic "HTTP 500".

**Files affected**: All service files in [src/services/](../src/services/)

**Impact**: Medium (UX poor on errors)  
**Effort**: M (medium)  
**Estimated time**: 3-4 hours

**Solution**:
1. Create ErrorBoundary-like global handler
2. Implement retry logic for failed requests
3. User-friendly error messages

---

### 6. **Dual HTTP Clients (Axios + Fetch)**

**Problem**: Project uses both. Unnecessary complexity.

**Files affected**:
- [src/services/http-client.js](../src/services/http-client.js)
- [src/services/axios.js](../src/services/axios.js)
- [src/utils/axios.js](../src/utils/axios.js)

**Impact**: Medium (confusion, bundle bloat)  
**Effort**: S (small)  
**Estimated time**: 1-2 hours

**Solution**:
- Remove Axios, standardize on Fetch
- Or: Remove Fetch, standardize on Axios
- Recommend Fetch (smaller bundle, native)

---

### 7. **SPA Router without URL History**

**Problem**: Page doesn't change URL. Can't bookmark or share URLs. No back button.

**Files affected**: [src/router.js](../src/router.js)

**Impact**: Medium (UX limitation)  
**Effort**: L (large)  
**Estimated time**: 4-6 hours

**Solution**:
1. Implement window.history.pushState()
2. Add popstate listener for back button
3. Parse URL to determine initial page

---

### 8. **No Testing Framework**

**Problem**: 0% test coverage. Refactoring risky. Bugs found in production.

**Files affected**: All code

**Impact**: Medium (long-term risk)  
**Effort**: XL (very large)  
**Estimated time**: 20+ hours

**Solution**:
1. Install Jest or Vitest
2. Write unit tests for services (high priority)
3. Write integration tests for pages (medium priority)
4. Write e2e tests (low priority initially)

---

### 9. **ESLint Misconfigured**

**Problem**: Config references Vue but project doesn't use Vue.

**Files affected**: [.eslintrc.cjs](.eslintrc.cjs)

**Impact**: Low (cosmetic)  
**Effort**: S (small)  
**Estimated time**: 30 minutes

**Solution**:
1. Remove Vue plugin references
2. Fix browser/node env config
3. Install ESLint in devDeps
4. Run in CI

---

## 🟡 MEDIUM (Fix This Sprint)

### 10. **No Rate Limiting Frontend**

**Problem**: User can spam clicks, sending 10+ requests/second.

**Files affected**: Page event listeners

**Impact**: Medium (server load, UX)  
**Effort**: S (small)  
**Estimated time**: 1-2 hours

**Solution**:
1. Debounce button clicks
2. Show loading state to disable buttons
3. Implement request queuing

---

### 11. **Missing JSDoc Comments**

**Problem**: Functions lack documentation. Parameters un-typed.

**Files affected**: All service/utility files

**Impact**: Low-Medium (developer experience)  
**Effort**: M (medium)  
**Estimated time**: 4-6 hours

**Solution**:
1. Add JSDoc to all functions
2. Document parameters and returns
3. Generate docs with JSDoc CLI

---

### 12. **No Accessibility (a11y)**

**Problem**: Missing ARIA labels, focus management. Screen reader unfriendly.

**Files affected**: All pages and components

**Impact**: Medium (legal + UX)  
**Effort**: M (medium)  
**Estimated time**: 6-8 hours

**Solution**:
1. Add ARIA labels to all inputs
2. Implement focus trap in modals
3. Add semantic HTML (role, aria-label)
4. Test with axe or Lighthouse

---

### 13. **Code Duplication in Services**

**Problem**: Each service (Usuario, Producto, Cliente) has identical CRUD methods.

**Files affected**: [src/services/](../src/services/)

**Impact**: Low-Medium (maintainability)  
**Effort**: M (medium)  
**Estimated time**: 3-4 hours

**Solution**:
1. Create BaseService class
2. Child services extend BaseService
3. Reduce from 13 services to ~3-4 + base

---

### 14. **God Class: NuevaVenta Page**

**Problem**: Presumes single page handles:
- Product listing + selection
- Cart state management
- Total calculations
- PDF generation
- Backend submission

**Files affected**: [src/pages/nuevaventa.js](../src/pages/nuevaventa.js)

**Impact**: Medium (testability, complexity)  
**Effort**: L (large)  
**Estimated time**: 6-8 hours

**Solution**:
1. Extract Cart to separate component/service
2. Extract PDF logic to dedicated module
3. Break page into sub-components

---

## 🟢 LOW (Nice to Have)

### 15. **No Sentry / Error Monitoring**

**Problem**: Errors in production invisible.

**Impact**: Low (observability)  
**Effort**: S (small)  
**Estimated time**: 2-3 hours

**Solution**: Install Sentry SDK, configure.

---

### 16. **No Bundle Analysis**

**Problem**: Unknown bundle composition. Missing optimization opportunities.

**Impact**: Low (performance)  
**Effort**: S (small)  
**Estimated time**: 1 hour

**Solution**: Use `vite-plugin-visualizer` to analyze bundle.

---

### 17. **No Prettier Formatter**

**Problem**: Inconsistent formatting. Manual code style reviews.

**Impact**: Low (cosmetic)  
**Effort**: S (small)  
**Estimated time**: 1 hour

**Solution**: Install Prettier, add git hook.

---

### 18. **Hardcoded Strings / Magic Numbers**

**Problem**: Port 56398, URLs scattered.

**Impact**: Low (maintainability)  
**Effort**: S (small)  
**Estimated time**: 1 hour

**Solution**: Centralize in constants file.

---

## Implementation Roadmap

```
Phase 1 — Security (CRITICAL) — 2-3 weeks
├── [ ] Fix localStorage token issue
├── [ ] Add input sanitization (DOMPurify)
├── [ ] JWT expiration checking
└── [ ] RBAC documentation

Phase 2 — Code Quality (HIGH) — 2-3 weeks
├── [ ] Global error handling
├── [ ] Remove Axios duplication
├── [ ] Fix ESLint config
├── [ ] Accessibility audit

Phase 3 — Testing (MEDIUM) — Ongoing
├── [ ] Setup Jest/Vitest
├── [ ] Unit tests for services
├── [ ] Integration tests for pages
└── [ ] E2E tests critical flows

Phase 4 — Polish (LOW) — As time allows
├── [ ] Sentry setup
├── [ ] Bundle analysis
├── [ ] Performance optimization
└── [ ] Documentation
```

---

## 🔗 ARCHIVOS CLAVE

Todos los archivos mencionados arriba.

---

**Total Estimated Effort**: ~80-100 hours (critical + high + medium)  
**With team of 2**: ~4-5 weeks of focused work
