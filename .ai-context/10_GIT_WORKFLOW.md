# 🔗 10_GIT_WORKFLOW.md

## Branching Strategy

**Detected**: Likely **Trunk-Based Development** (simple)

**Evidence**:
- README mentions `main` branch
- GitHub URL: github.com/bviteri6442/frontend-web-facturas
- No evidence of feature/develop/release branches

**Current workflow** (inferred):
1. Dev works in feature branch or main
2. Commits to main
3. Railway auto-deploys on push

---

## Commit Conventions

**Status**: ⚠️ **Not enforced**

No evidence of:
- ❌ Conventional Commits (feat:, fix:, etc.)
- ❌ Commit message template
- ❌ Atomic commits
- ❌ Signed commits

**Recommendation**: Adopt Conventional Commits + Husky hooks.

---

## Git Hooks

**Status**: ❌ **Not configured**

- ❌ No Husky
- ❌ No lefthook
- ❌ No pre-commit framework

**Opportunity**: Add pre-commit hooks for:
- Lint (ESLint)
- Format (Prettier)
- Type-check (TypeScript, if added)

---

## .gitignore

**Status**: ✅ **Present and reasonable**

Presumible ignores:
- node_modules/
- dist/
- .env.local (development)
- .DS_Store
- etc.

**Verify**: Algunos archivos sensibles (pdfendpointsdelbackend.pdf) están commiteados.

---

## Tags and Releases

**Status**: ❌ **Unknown**

No version tags detected in docs. Should follow semver:
- v1.0.0 — stable release
- v1.1.0 — minor feature
- v1.0.1 — patch

---

## CODEOWNERS

**Status**: ❌ **Not present**

No `.github/CODEOWNERS` file.

**Recommendation**: Add for future team:
```
* @bviteri6442
src/pages/ @bviteri6442
src/services/ @bviteri6442
```

---

## Pull Request Templates

**Status**: ❌ **Not present**

No `.github/PULL_REQUEST_TEMPLATE.md`.

**Opportunity**: Create for future PRs:
```markdown
## Description
[What does this PR do?]

## Changes
- [ ] Feature
- [ ] Bug fix
- [ ] Refactor

## Testing
[How to test?]

## Checklist
- [ ] Tests added
- [ ] No breaking changes
- [ ] Documentation updated
```

---

## Branching Recommendation

**Proposed workflow** (if team grows):

1. **main** — production-ready
2. **develop** — staging/pre-release
3. **feature/** — feature branches from develop
4. **bugfix/** — bug fixes from main
5. **hotfix/** — urgent production fixes

**Current simple approach** (trunk-based) is fine for solo dev.

---

## Repository Health

| Check | Status |
|-------|--------|
| Public visibility | ✅ Yes |
| Actively maintained | ⚠️ Appears active |
| Documented | ✅ 7 .md files |
| License | ❓ Unknown (check LICENSE file) |
| Last commit | ⚠️ Unknown (check GitHub) |
| Open issues | ❓ Unknown |

---

## 🔗 ARCHIVOS CLAVE

- [.gitignore](../.gitignore) — Ignored files
- [.git/config](../.git/config) — Git configuration
