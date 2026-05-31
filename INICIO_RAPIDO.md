# 🚀 INICIO RÁPIDO - 3 PASOS

## 📌 OPCIÓN 1: Instalación Automática (Recomendada)

1. **Abre PowerShell** en esta carpeta (Front_End)
2. **Ejecuta:**
   ```powershell
   .\instalar.ps1
   ```
3. **Sigue las instrucciones** en pantalla

---

## 📌 OPCIÓN 2: Instalación Manual

### PASO 1: Instalar Dependencias
```powershell
npm install
```

### PASO 2: Ejecutar Backend
1. Abre **Visual Studio Community**
2. Abre el archivo **ProyectoWEB.sln** del backend
3. Presiona **F5** para ejecutar
4. Verifica que esté en `http://localhost:5000/swagger`

### PASO 3: Ejecutar Frontend
```powershell
npm run dev
```

### PASO 4: Acceder
Abre tu navegador en: **http://localhost:3000**

---

## 🔑 Credenciales Iniciales

Para iniciar sesión, necesitas crear un usuario administrador primero.

**Desde Swagger (Backend):**
1. Ve a `http://localhost:5000/swagger`
2. Ejecuta `POST /api/auth/registro` con:

```json
{
  "cedula": "1234567890",
  "correo": "admin@admin.com",
  "nombreCompleto": "Administrador",
  "contrasena": "Admin123!",
  "rolId": "ROL_ID_AQUI"
}
```

Luego inicia sesión con:
- **Correo:** admin@admin.com
- **Contraseña:** Admin123!

---

## ⚠️ Requisitos Previos

- [x] Node.js 16+ instalado
- [x] Backend corriendo en puerto 5000
- [x] MongoDB corriendo
- [x] Navegador moderno (Chrome, Firefox, Edge)

---

## 🆘 ¿Problemas?

Lee el archivo **INSTRUCCIONES_EJECUCION.md** para solución de problemas.

---

## ✅ Verificación Rápida

Ejecuta estos comandos para verificar:

```powershell
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar dependencias
npm list --depth=0
```

---

¡Listo! 🎉
