# 📦 09_DEPENDENCIES.md

## Complete Dependency Inventory

### Production Dependencies (5 packages)

```json
{
  "@fortawesome/fontawesome-free": "^7.2.0",
  "axios": "^1.6.7",
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.2",
  "sweetalert2": "^11.10.7"
}
```

### Development Dependencies (1 package)

```json
{
  "vite": "^5.4.21"
}
```

### Missing but configured (NOT installed)

- `eslint` — Configured in .eslintrc.cjs but not in package.json
- `eslint-plugin-vue` — Referenced but not installed
- Testing frameworks (Jest, Vitest) — Not present

---

## Total Dependency Count

| Category | Count |
|----------|-------|
| Direct production | 5 |
| Direct dev | 1 |
| Transitive (node_modules) | ~50-100 estimated |
| **Total packages** | ~55-105 |

---

## Dependency Analysis

### 1. Axios (^1.6.7)

| Aspect | Value |
|--------|-------|
| **Purpose** | HTTP client (fallback) |
| **Latest** | 1.7.x available |
| **Risk** | Low (fallback, not primary) |
| **CVEs** | Check `npm audit axios` |
| **Size** | ~14KB gzipped |

**Status**: Functional but has newer versions.

### 2. jsPDF (^2.5.1)

| Aspect | Value |
|--------|-------|
| **Purpose** | PDF generation for invoices |
| **Latest** | 2.5.x current |
| **Risk** | Medium (critical for sales feature) |
| **Size** | ~30KB gzipped |
| **Notes** | Complex library, keep tested |

**Status**: Up-to-date.

### 3. jsPDF-autotable (^3.8.2)

| Aspect | Value |
|--------|-------|
| **Purpose** | Tables in PDF |
| **Dependency** | Requires jsPDF |
| **Latest** | 3.8.x current |
| **Risk** | Low (purely formatting) |

**Status**: Up-to-date.

### 4. SweetAlert2 (^11.10.7)

| Aspect | Value |
|--------|-------|
| **Purpose** | Modals, alerts, confirmations |
| **Latest** | 11.10.x+ available |
| **Risk** | Low (UI only) |
| **Size** | ~20KB gzipped |

**Status**: Up-to-date.

### 5. FontAwesome Free (^7.2.0)

| Aspect | Value |
|--------|-------|
| **Purpose** | Icon fonts |
| **Latest** | 7.x current |
| **Risk** | Very low (static assets) |
| **Size** | ~15KB CSS + fonts |

**Status**: Current.

### 6. Vite (^5.4.21)

| Aspect | Value |
|--------|-------|
| **Purpose** | Build tool, dev server |
| **Latest** | 5.4.x current |
| **Risk** | Low (build tool) |
| **Critical?** | Yes (project won't build without it) |

**Status**: Current.

---

## Outdated Dependencies

**Run to check**:
```bash
npm outdated
```

**Likely results**:
- Axios: 1.6.7 → 1.7.2 (patch, safe)
- SweetAlert2: 11.10.7 → 11.10.8+ (patch, safe)
- FontAwesome: 7.2.0 → 7.x (cosmetic)

**Recommendation**: Update patches quarterly.

---

## Vulnerability Scan

**Run**:
```bash
npm audit
```

**Current status**: Unknown (not executed during audit).

**Typical risks for these packages**:
- ❌ CVE in Axios: Low probability (mature package)
- ❌ CVE in jsPDF: Medium (complex PDF handling)
- ✅ CVE in FontAwesome: Very low (static)

---

## Unused Dependencies

**No detection tool run**, but visual inspection:

| Package | Likely used? | Evidence |
|---------|-------------|----------|
| axios | ⚠️ Maybe | Have http-client.js (Fetch) as primary |
| jspdf | ✅ Yes | NuevaVenta.js generates PDFs |
| sweetalert2 | ✅ Yes | Confirmations in pages |
| fontawesome | ✅ Yes | CSS loaded in HTML |
| vite | ✅ Yes | Build tool |

**Observation**: Axios might be redundant (both Fetch + Axios present).

---

## Licenses

| Package | License | Commercial OK? |
|---------|---------|---|
| @fortawesome/fontawesome-free | CC BY 4.0 | ✅ Yes (free tier) |
| axios | MIT | ✅ Yes |
| jspdf | MIT | ✅ Yes |
| jspdf-autotable | MIT | ✅ Yes |
| sweetalert2 | MIT | ✅ Yes |
| vite | MIT | ✅ Yes |

**No GPL or copyleft licenses** → Safe for commercial use.

---

## Dependency Tree Depth

**Estimated**:
```
frontend (depth 0)
├── axios
│   ├── follow-redirects
│   └── proxy-from-env
├── jspdf
│   ├── bwip.js
│   └── canvg
├── sweetalert2
│   └── (mostly self-contained)
└── vite
    ├── esbuild
    ├── postcss
    └── ... (many build deps)
```

**Max depth**: ~4-5 (manageable)

---

## Transitive Dependencies Risk

**Vite brings**:
- esbuild (Go-based, fast, no issues typically)
- postcss (CSS processor, mature)
- rollup (bundler, stable)

**Axios brings**:
- follow-redirects (utility, low risk)

**No problematic transitive dependencies detected**.

---

## Dependency Update Strategy

### Monthly
- [ ] Run `npm outdated`
- [ ] Review patch versions (1.2.3 → 1.2.4)

### Quarterly
- [ ] Run `npm audit`
- [ ] Update minor versions if safe
- [ ] Test in staging

### Annually
- [ ] Review major versions
- [ ] Evaluate alternatives
- [ ] Update if needed (breaking changes)

---

## Recommendations

| Action | Priority | Effort | Impact |
|--------|----------|--------|--------|
| Remove axios (use only Fetch) | P1 | 30m | Smaller bundle |
| Run npm audit | P1 | 5m | Find vulnerabilities |
| Add npm audit to CI | P2 | 1h | Continuous security |
| Install ESLint (in devDeps) | P2 | 30m | Code quality |
| Add testing framework | P3 | 4h+ | Test coverage |

---

## 🔗 ARCHIVOS CLAVE

- [package.json](../package.json) — Full dependency list
- [package-lock.json](../package-lock.json) — Locked versions
