# 📡 ENDPOINTS DEL BACKEND

Base URL: `http://localhost:5000/api`

---

## 🔐 Autenticación

### Login
- **Endpoint:** `POST /auth/login`
- **Body:**
```json
{
  "correo": "admin@admin.com",
  "contrasena": "Admin123!"
}
```
- **Response:**
```json
{
  "exitoso": true,
  "token": "JWT_TOKEN_HERE",
  "usuarioId": "123",
  "nombreCompleto": "Administrador",
  "correo": "admin@admin.com",
  "rol": "Administrador"
}
```

### Registro
- **Endpoint:** `POST /auth/registro`
- **Body:**
```json
{
  "cedula": "1234567890",
  "correo": "nuevo@email.com",
  "nombreCompleto": "Usuario Nuevo",
  "contrasena": "Pass123!",
  "rolId": "ROL_ID"
}
```

---

## 👥 Clientes

### Obtener Todos
- **Endpoint:** `GET /clientes`
- **Headers:** `Authorization: Bearer {token}`

### Obtener por ID
- **Endpoint:** `GET /clientes/{id}`
- **Headers:** `Authorization: Bearer {token}`

### Crear Cliente
- **Endpoint:** `POST /clientes`
- **Headers:** `Authorization: Bearer {token}` (Requiere rol Admin)
- **Body:**
```json
{
  "nombre": "Juan Pérez",
  "documento": "1234567890",
  "email": "juan@email.com",
  "telefono": "0987654321",
  "direccion": "Av. Principal 123"
}
```

### Actualizar Cliente
- **Endpoint:** `PUT /clientes/{id}`
- **Headers:** `Authorization: Bearer {token}` (Requiere rol Admin)
- **Body:**
```json
{
  "nombre": "Juan Pérez Actualizado",
  "email": "nuevo@email.com",
  "telefono": "0987654321",
  "direccion": "Nueva Dirección",
  "activo": true
}
```

### Eliminar Cliente
- **Endpoint:** `DELETE /clientes/{id}`
- **Headers:** `Authorization: Bearer {token}` (Requiere rol Admin)

---

## 📦 Productos

### Obtener Todos
- **Endpoint:** `GET /productos`
- **Headers:** `Authorization: Bearer {token}`

### Obtener por ID
- **Endpoint:** `GET /productos/{id}`
- **Headers:** `Authorization: Bearer {token}`

### Crear Producto
- **Endpoint:** `POST /productos`
- **Headers:** `Authorization: Bearer {token}` (Requiere rol Admin)
- **Body:**
```json
{
  "nombre": "Producto Ejemplo",
  "codigoBarra": "123456789",
  "descripcion": "Descripción del producto",
  "precioCosto": 10.50,
  "precioVenta": 15.00,
  "stockActual": 100,
  "stockMinimo": 10
}
```

### Actualizar Producto
- **Endpoint:** `PUT /productos/{id}`
- **Headers:** `Authorization: Bearer {token}` (Requiere rol Admin)
- **Body:**
```json
{
  "nombre": "Producto Actualizado",
  "descripcion": "Nueva descripción",
  "precioCosto": 12.00,
  "precioVenta": 18.00,
  "stockActual": 150,
  "stockMinimo": 15,
  "activo": true
}
```

### Eliminar Producto
- **Endpoint:** `DELETE /productos/{id}`
- **Headers:** `Authorization: Bearer {token}` (Requiere rol Admin)

---

## 💰 Ventas

### Obtener Todas
- **Endpoint:** `GET /ventas`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params (opcionales):**
  - `fechaInicio`: 2025-01-01
  - `fechaFin`: 2025-12-31
  - `usuarioId`: ID_USUARIO
  - `clienteId`: ID_CLIENTE
  - `estado`: Completada

### Obtener por ID
- **Endpoint:** `GET /ventas/{id}`
- **Headers:** `Authorization: Bearer {token}`

### Crear Venta
- **Endpoint:** `POST /ventas`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
```json
{
  "clienteId": 1,
  "detalles": [
    {
      "productoId": 1,
      "cantidad": 2,
      "precioUnitario": 15.00,
      "descuento": 5
    },
    {
      "productoId": 2,
      "cantidad": 1,
      "precioUnitario": 25.00,
      "descuento": 0
    }
  ],
  "observaciones": "Entrega urgente"
}
```
- **Response:**
```json
{
  "ventaId": 123,
  "numeroFactura": "FAC-00123",
  "subtotal": 53.50,
  "totalImpuesto": 6.42,
  "totalVenta": 59.92,
  "mensaje": "Venta creada exitosamente"
}
```

### Generar PDF
- **Endpoint:** `GET /ventas/{id}/pdf`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Binary (PDF file)

---

## 👤 Usuarios

### Obtener Todos
- **Endpoint:** `GET /usuarios`
- **Headers:** `Authorization: Bearer {token}` (Requiere rol Admin)

### Obtener por ID
- **Endpoint:** `GET /usuarios/{id}`
- **Headers:** `Authorization: Bearer {token}` (Requiere rol Admin)

### Crear Usuario
- **Endpoint:** `POST /usuarios`
- **Headers:** `Authorization: Bearer {token}` (Requiere rol Admin)
- **Body:**
```json
{
  "cedula": "9876543210",
  "correo": "usuario@email.com",
  "nombreCompleto": "Usuario Nuevo",
  "contrasena": "Pass123!",
  "rolId": "ROL_ID"
}
```

### Actualizar Usuario
- **Endpoint:** `PUT /usuarios/{id}`
- **Headers:** `Authorization: Bearer {token}` (Requiere rol Admin)
- **Body:**
```json
{
  "nombreCompleto": "Nombre Actualizado",
  "correo": "nuevo@email.com",
  "rolId": "NUEVO_ROL_ID",
  "activo": true
}
```

### Eliminar Usuario
- **Endpoint:** `DELETE /usuarios/{id}`
- **Headers:** `Authorization: Bearer {token}` (Requiere rol Admin)

### Desbloquear Usuario
- **Endpoint:** `POST /usuarios/{id}/desbloquear`
- **Headers:** `Authorization: Bearer {token}` (Requiere rol Admin)

---

## 🎭 Roles

### Obtener Todos
- **Endpoint:** `GET /roles`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
```json
[
  {
    "id": "123",
    "nombre": "Administrador",
    "descripcion": "Acceso total al sistema"
  },
  {
    "id": "456",
    "nombre": "Usuario",
    "descripcion": "Solo lectura"
  }
]
```

---

## ⚠️ Error Logs

### Obtener Todos
- **Endpoint:** `GET /errorlogs`
- **Headers:** `Authorization: Bearer {token}` (Requiere rol Admin)

### Registrar Error
- **Endpoint:** `POST /errorlogs`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
```json
{
  "mensaje": "Error al cargar datos",
  "stackTrace": "Error: ...",
  "pantalla": "Clientes",
  "fecha": "2025-11-21T10:30:00Z"
}
```

---

## 🔑 Códigos de Estado HTTP

- **200 OK:** Solicitud exitosa
- **201 Created:** Recurso creado exitosamente
- **400 Bad Request:** Datos inválidos
- **401 Unauthorized:** No autenticado (token inválido o expirado)
- **403 Forbidden:** Sin permisos (no es administrador)
- **404 Not Found:** Recurso no encontrado
- **500 Internal Server Error:** Error del servidor

---

## 📝 Notas Importantes

1. **Autenticación JWT:**
   - Todas las rutas (excepto login y registro) requieren token
   - Token se envía en header: `Authorization: Bearer {token}`
   - Token expira en 24 horas (configurable)

2. **Roles:**
   - **Administrador:** Acceso total (CRUD completo)
   - **Usuario:** Solo lectura (GET)

3. **Validaciones:**
   - Cédula: 6-10 dígitos
   - Documento: 6-20 dígitos
   - Contraseña: 4-10 caracteres (mayúscula, minúscula, número, símbolo)
   - Email: Formato válido

4. **IVA:**
   - Se calcula automáticamente al 12%
   - Ecuador: Impuesto al Valor Agregado

---

## 🧪 Probar con Swagger

Puedes probar todos estos endpoints desde:
**http://localhost:5000/swagger**

1. Haz login primero
2. Copia el token del response
3. Click en "Authorize" (candado verde)
4. Pega: `Bearer {tu_token}`
5. Prueba los demás endpoints

---

**Última actualización:** Noviembre 21, 2025
