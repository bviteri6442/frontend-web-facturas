# 📦 05_DATABASE.md

**No aplica** — Este proyecto es **frontend exclusivamente**.

## Context

Database es gestionada por el backend (.NET API).

**Motor**: PostgreSQL (mencionado en documentación)

**Frontend role**: 
- Consume endpoints REST del backend
- NO ejecuta SQL
- NO accede directo a BD

## Integración desde Frontend

### Services que interactúan con datos

| Service | Entidades | Operaciones |
|---------|-----------|-------------|
| usuarioService.js | usuarios | CRUD |
| productoService.js | productos | CRUD |
| clienteService.js | clientes | CRUD |
| ventaService.js | ventas | CR (read-mostly) |
| auditoriaService.js | auditoria logs | R (read-only) |
| errorLogService.js | error logs | R (read-only) |
| eliminación*Service.js | eliminación logs | R (read-only) |

### Data Flow

```
Frontend Page
    ↓
Service.fetch()
    ↓
HTTP GET/POST/PUT/DELETE /api/endpoint
    ↓
Backend Controller
    ↓
ORM (Entity Framework, etc.)
    ↓
PostgreSQL
```

---

## Recomendaciones

1. Backend debe implementar:
   - Índices en PK + FK
   - Foreign key constraints
   - Check constraints para validación
   - Particionamiento si es necesario (por fecha, por cliente)

2. Frontend puede:
   - Implementar caching de resultados (si no hay)
   - Usar paginación para large result sets

---

**Próxima revisión**: Auditar schema de PostgreSQL en backend repo separadamente.
