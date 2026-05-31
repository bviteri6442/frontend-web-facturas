# 🚀 INSTRUCCIONES DE INSTALACIÓN Y EJECUCIÓN - FRONTEND VUE.JS

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 16 o superior) - [Descargar aquí](https://nodejs.org/)
- **npm** (viene incluido con Node.js)
- **Backend C# .NET 8.0** corriendo en `http://localhost:5000`
- **MongoDB** corriendo en `mongodb://localhost:27017`

---

## 🔧 PASO 1: Instalación de Dependencias

Abre una terminal PowerShell en la carpeta `Front_End` y ejecuta:

```powershell
npm install
```

Este comando instalará todas las dependencias necesarias:
- Vue.js 3
- Vue Router (enrutamiento)
- Pinia (manejo de estado)
- Axios (peticiones HTTP)
- Vee-Validate & Yup (validaciones)
- SweetAlert2 (alertas)
- jsPDF (generación de PDFs)
- Vite (build tool)

**Nota:** La instalación puede tardar 2-3 minutos dependiendo de tu conexión.

---

## ⚙️ PASO 2: Configuración del Backend

Antes de ejecutar el frontend, **asegúrate de que el backend esté corriendo**.

1. Abre Visual Studio Community
2. Abre la solución `ProyectoWEB.sln` del backend
3. Ejecuta el proyecto (F5 o botón Play)
4. Verifica que Swagger esté accesible en `http://localhost:5000/swagger`

**El backend DEBE estar corriendo antes de iniciar el frontend.**

---

## 🚀 PASO 3: Ejecutar el Frontend en Modo Desarrollo

Una vez instaladas las dependencias, ejecuta:

```powershell
npm run dev
```

El servidor de desarrollo se iniciará en `http://localhost:3000`

Deberías ver un mensaje similar a:

```
  VITE v5.1.6  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

---

## 🌐 PASO 4: Acceder a la Aplicación

1. Abre tu navegador (Chrome, Firefox, Edge)
2. Navega a: `http://localhost:3000`
3. Deberías ver la pantalla de **Login**

---

## 👤 PASO 5: Crear Usuario Administrador (Si no existe)

Si es la primera vez que usas el sistema, necesitas crear un usuario administrador desde el backend:

**Opción A: Desde Swagger**
1. Ve a `http://localhost:5000/swagger`
2. Busca el endpoint `POST /api/auth/registro`
3. Ingresa estos datos de ejemplo:

```json
{
  "cedula": "1234567890",
  "correo": "admin@admin.com",
  "nombreCompleto": "Administrador Sistema",
  "contrasena": "Admin123!",
  "rolId": "ID_DEL_ROL_ADMINISTRADOR"
}
```

**Opción B: Desde MongoDB Compass**
1. Abre MongoDB Compass
2. Conecta a `mongodb://localhost:27017`
3. Busca la base de datos `PuntoVentaDb`
4. Inserta un usuario directamente en la colección `Usuarios`

**Nota:** La contraseña debe cumplir:
- Entre 4 y 10 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
- Al menos un símbolo (@$!%*?&)

---

## 🔐 PASO 6: Iniciar Sesión

Usa las credenciales del usuario que creaste:

- **Correo:** admin@admin.com
- **Contraseña:** Admin123!

Una vez autenticado, serás redirigido al **Dashboard**.

---

## 📂 Estructura del Proyecto

```
Front_End/
├── public/              # Archivos estáticos
├── src/
│   ├── assets/         # Estilos CSS
│   ├── components/     # Componentes reutilizables
│   ├── config/         # Configuración API
│   ├── router/         # Configuración de rutas
│   ├── services/       # Servicios API
│   ├── stores/         # Stores de Pinia
│   ├── utils/          # Utilidades y helpers
│   ├── views/          # Vistas/Páginas
│   ├── App.vue         # Componente raíz
│   └── main.js         # Punto de entrada
├── index.html          # HTML principal
├── package.json        # Dependencias
├── vite.config.js      # Configuración Vite
└── README.md           # Documentación
```

---

## 🎯 Funcionalidades Implementadas

### Para Administradores:
✅ Login con JWT
✅ Dashboard con estadísticas
✅ **Clientes:** CRUD completo con validaciones
✅ **Productos:** CRUD completo con control de stock
✅ **Ventas:** Crear, listar, ver detalle, generar PDF
✅ **Usuarios:** CRUD, desbloqueo de cuentas
✅ **Roles:** Visualización
✅ **Registro de Errores:** Visualización y detalle

### Para Usuarios (Solo Lectura):
✅ Login con JWT
✅ Dashboard
✅ Ver Clientes
✅ Ver Productos
✅ Ver Ventas

### Validaciones Implementadas:
✅ Solo letras en nombres
✅ Solo números en documentos/cédulas
✅ Formato email
✅ Contraseña segura (4-10 chars con mayúscula, minúscula, número, símbolo)
✅ Stock disponible en ventas
✅ Productos únicos por venta
✅ Precios válidos
✅ Cálculo automático de IVA (12%)

---

## 🔄 Comandos Útiles

```powershell
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview

# Linting
npm run lint
```

---

## 🐛 Solución de Problemas

### Error: "ECONNREFUSED" o "Network Error"
**Causa:** El backend no está corriendo o la URL es incorrecta.

**Solución:**
1. Verifica que el backend esté corriendo en `http://localhost:5000`
2. Revisa el archivo `src/config/api.js` y confirma la URL

### Error: "Module not found"
**Causa:** Dependencias no instaladas.

**Solución:**
```powershell
npm install
```

### Error: "Cannot read property 'token' of null"
**Causa:** No hay sesión iniciada.

**Solución:**
1. Haz logout
2. Limpia localStorage: `localStorage.clear()` en la consola del navegador
3. Vuelve a iniciar sesión

### La página está en blanco
**Causa:** Error en la consola del navegador.

**Solución:**
1. Abre las Herramientas de Desarrollador (F12)
2. Ve a la pestaña Console
3. Revisa los errores y corrígelos

### Error CORS
**Causa:** El backend no permite peticiones desde el frontend.

**Solución:**
Verifica que en el backend (Program.cs) esté configurado CORS:
```csharp
app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());
```

---

## 📊 Datos de Prueba

Para probar el sistema con datos, puedes:

1. Crear clientes manualmente desde la interfaz
2. Crear productos manualmente desde la interfaz
3. Realizar ventas de prueba

**Recomendación:** Crea al menos 5 clientes y 10 productos para ver mejor la funcionalidad del sistema.

---

## 🌍 Compilar para Producción

Cuando estés listo para desplegar:

```powershell
npm run build
```

Esto generará una carpeta `dist/` con los archivos optimizados para producción.

Puedes desplegar en:
- **Netlify** (gratis)
- **Vercel** (gratis)
- **GitHub Pages**
- **Firebase Hosting**

---

## 📱 Navegadores Soportados

✅ Chrome (recomendado)
✅ Firefox
✅ Edge
✅ Safari
⚠️ Internet Explorer (NO soportado)

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa la consola del navegador (F12)
2. Revisa la terminal donde corre el frontend
3. Verifica que el backend esté funcionando
4. Verifica que MongoDB esté corriendo
5. Limpia caché del navegador (Ctrl + Shift + Delete)

---

## ✅ Checklist de Verificación

Antes de considerar el proyecto completo, verifica:

- [ ] Backend corriendo sin errores
- [ ] MongoDB corriendo
- [ ] Frontend instalado (`npm install`)
- [ ] Frontend corriendo (`npm run dev`)
- [ ] Login funciona correctamente
- [ ] Dashboard se visualiza
- [ ] CRUD de Clientes funciona
- [ ] CRUD de Productos funciona
- [ ] Crear venta funciona
- [ ] Cálculo de IVA es correcto (12%)
- [ ] Validaciones funcionan
- [ ] Roles se respetan (Admin vs Usuario)
- [ ] PDF de factura se descarga

---

## 🎉 ¡Listo!

Tu sistema de facturación está completo y funcionando.

**Desarrollado con:**
- Vue.js 3 (Composition API)
- Vue Router (navegación)
- Pinia (estado global)
- Axios (API calls)
- Vite (build tool)
- SweetAlert2 (alertas)
- Clean Code & Best Practices

---

**Fecha:** Noviembre 2025
**Versión:** 1.0.0
