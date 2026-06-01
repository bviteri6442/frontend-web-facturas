# 📋 00_PROJECT_OVERVIEW.md

## Tipo de Proyecto

**Categoría primaria**: Web App (SPA / MPA híbrida)  
**Subcategoría**: Admin Panel / Dashboard  
**Clasificación funcional**: Punto de Venta + Sistema de Facturación  

---

## Propósito y Contexto

Panel administrativo web para un sistema completo de **Punto de Venta (POS)** con facturación integrada. Funcionalidades principales:

- Autenticación y gestión de usuarios (con roles)
- Gestión de clientes y productos
- Creación y gestión de ventas
- Generación de facturas en PDF
- Logs de auditoría del sistema
- Reportes de eliminaciones
- Panel de control (dashboard)

---

## Estado del Ciclo de Vida

**Estado actual**: **Desarrollo activo** 

- ✅ Funcional en producción (desplegado en Railway)
- ✅ Repositorio público en GitHub (https://github.com/bviteri6442/frontend-web-facturas)
- ⚠️ Requiere backend `.NET` API en ejecución (repo separado)
- ⚠️ No completamente hardened para uso empresarial
- ❌ Sin tests automatizados

**Velocidad de cambio**: Activa (documentos como PROYECTO_COMPLETO.md y guías sugieren desarrollo en progreso)

---

## Tamaño y Scope

| Métrica | Valor | Observación |
|---------|-------|------------|
| **Archivos fuente JS** | ~30-35 archivos | 14 páginas + servicios + utils |
| **Líneas de código (aprox)** | ~3,500-4,500 LOC | Sin contar node_modules, styles |
| **Dependencias productivas** | 5 | axios, jspdf, jspdf-autotable, sweetalert2, fontawesome |
| **Dependencias desarrollo** | 1 | vite |
| **Carpetas principales** | 7 | pages, services, components, utils, config, assets, public |

---

## Arquitectura de Alto Nivel

- **Tipo de repo**: Single repo (frontend exclusivamente)
- **¿Monorepo?**: No  
- **¿Workspaces?**: No  
- **Dependencia**: Requiere backend externo (no en este repo)

**Estructura**:
```
frontend-web-facturas/
├── src/
│   ├── main.js (bootstrap)
│   ├── router.js (routing SPA)
│   ├── store.js (state management)
│   ├── login.js (auth page)
│   ├── pages/ (14 páginas)
│   ├── services/ (13 servicios API)
│   ├── components/ (2 componentes reutilizables)
│   ├── utils/ (helpers)
│   ├── config/ (API config)
│   └── assets/ (estilos)
├── public/ (assets estáticos)
├── index.html (app principal)
├── login.html (login page)
└── vite.config.js
```

---

## Despliegue y Hosting

**¿Está desplegado?** ✅ **Sí**

- **Platform**: Railway  
- **URL de producción**: https://backend-facturas-production.up.railway.app (API)
- **Frontend**: Desplegable a Vercel, Netlify o servidor web estándar
- **Status**: Activo y utilizado

**Environments**:
- 🔴 **Desarrollo**: Local (Vite dev server en http://localhost:3000)
- 🟡 **Development**: Ngrok tunneling opcional (para backend remoto)
- 🟢 **Producción**: Railway (backend API)

---

## Equipo y Contexto

- **Developer**: Aparentemente solo dev (Brigith Viteri - bviteri6442 en GitHub)
- **Estado de mantenimiento**: Activo
- **Documentación**: Sí (7 archivos .md incluidos en repo)
- **Licencia**: No especificada en repo (asumir propietaria)

---

## Requisitos de Ejecución

**Mínimos absolutos**:
- Node.js 18+
- npm 9+
- Backend API .NET ejecutándose (local, ngrok o Railway)
- PostgreSQL (en el backend, no aplicable aquí)

**Desarrollo local**:
```bash
npm install
cp .env.example .env.local
npm run dev
```

---

## Key Files para Entender el Proyecto

- [README.md](../README.md) → Guía de inicio
- [PROYECTO_COMPLETO.md](../PROYECTO_COMPLETO.md) → Documentación detallada del sistema
- [API_ENDPOINTS.md](../API_ENDPOINTS.md) → Endpoints consumidos
- [.env.example](../.env.example) → Variables de entorno esperadas

---

## 🔗 ARCHIVOS CLAVE

- [package.json](../package.json) — Versiones exactas
- [src/main.js](../src/main.js) — Bootstrap y auth check
- [vite.config.js](../vite.config.js) — Build config
