# ❓ PREGUNTAS FRECUENTES & TROUBLESHOOTING

## PROBLEMAS DE CONEXIÓN

### P: "No autenticado, redirigiendo a login..." al iniciar
**Síntomas**: Página abierta pero no carga nada, se va a login.html
**Causa**: Token expirado o no existe

**Soluciones**:
1. Limpiar localStorage: Abre DevTools (F12) → Console
   ```javascript
   localStorage.clear()
   ```
2. Hacer login nuevamente
3. Si persiste, verificar que `authService.login()` está grabando el token

**Verificación**:
```javascript
// En Console (F12)
localStorage.getItem('authToken')  // Debe tener un valor largo
localStorage.getItem('currentUser')  // Debe ser JSON válido
```

---

### P: "Error de conexión, no se pudo conectar con el servidor"
**Síntomas**: Pop-up rojo "Error de Conexión"
**Causa**: Backend no está en línea o URL incorrecta

**Soluciones**:
1. Verificar que el backend está en línea: https://backend-facturas-production-a3ab.up.railway.app/api
2. Verificar VITE_API_BASE_URL en .env o .env.local
3. Verificar en DevTools → Network que la URL sea correcta
4. Verificar que no hay CORS error (si lo hay, el proxy Vite está roto)

**Para verificar la URL**:
```javascript
// En Console
import { API_BASE_URL } from '/src/config/api.js'
console.log('API URL:', API_BASE_URL)
```

---

### P: CORS Error en DevTools
**Síntomas**: "Access to XMLHttpRequest blocked by CORS policy"
**Causa**: El proxy de Vite no está correctamente configurado

**Soluciones**:
1. En desarrollo, asegúrate que `npm run dev` está ejecutándose
2. Crea `.env.local` con:
   ```
   VITE_API_BASE_URL=/api
   VITE_API_PROXY_TARGET=https://backend-facturas-production-a3ab.up.railway.app
   ```
3. Reinicia `npm run dev`

**Verificación**:
- En DevTools → Network, busca solicitud a `/api`
- Debe decir Status 200, no 301/302
- No debe mostrar HTML de ngrok

---

### P: "El servidor devolvió HTML en lugar de JSON"
**Síntomas**: Error que dice exactamente esto
**Causa**: URL está apuntando a ngrok sin /api, o a una página HTML

**Soluciones**:
1. Verificar que API_BASE_URL termina en `/api`
2. Si usas ngrok: `https://xxxx.ngrok-free.app/api` (con /api)
3. Revisar que no hay una página HTML de advertencia de ngrok

---

## PROBLEMAS DE INTERFAZ

### P: Página en blanco con solo el sidebar
**Síntomas**: Menú visible pero contenido vacío
**Causa**: Error en `init()` de la página

**Soluciones**:
1. Abre DevTools (F12) → Console
2. Busca errores en rojo
3. Copia el error en búsqueda
4. Revisa el archivo de la página correspondiente

**Debug**:
```javascript
// En Console
store.getState()  // Ver estado global
router.currentPage  // Ver página actual
```

---

### P: Tabla no carga datos, muestra "Cargando..."
**Síntomas**: Spinner infinito en tabla
**Causa**: Problema en servicio.getPage()

**Soluciones**:
1. Abre DevTools → Network → XHR
2. Busca solicitud fallida (rojo)
3. Revisa la respuesta del error
4. Verifica que los parámetros sean correctos

**Debug**:
```javascript
// En Console de la página
// Después de hacer click en un botón que carga datos
// Espera y luego revisa la respuesta
```

---

### P: Paginación no funciona
**Síntomas**: Botones de siguiente/anterior no cambian página
**Causa**: Listener no asignado o PaginationAdvanced no inicializado

**Soluciones**:
1. Verifica que `this.pagination = new PaginationAdvanced({...})` está en `init()`
2. Verifica que `onChange` callback está definido
3. Verifica que `pagination.goToNext()` es llamado

---

### P: Modal de confirmación no aparece
**Síntomas**: Hago click en eliminar y nada pasa
**Causa**: Swal.fire() no está siendo llamado o hay error previo

**Soluciones**:
1. Verifica que SweetAlert2 está importado: `import Swal from 'sweetalert2'`
2. Verifica que el listener está asignado
3. Abre DevTools → Console y revisa errores

---

## PROBLEMAS DE DATOS

### P: Búsqueda muy lenta
**Síntomas**: Cada tecla que escribo recarga la tabla
**Causa**: Sin debounce

**Soluciones**:
1. Importa debounce: `import { debounce } from '../utils/helpers.js'`
2. Usa en event listener:
   ```javascript
   searchBox.addEventListener('input', debounce((e) => {
     this.buscar(e.target.value)
   }, 500))
   ```

---

### P: Valores duplicados en tabla
**Síntomas**: Los mismos datos aparecen 2 veces
**Causa**: `render()` se ejecuta 2 veces o datos no se limpian

**Soluciones**:
1. En `init()`, primero limpia datos:
   ```javascript
   this.datos = []  // Limpiar antes de cargar
   await this.loadData()
   ```
2. No llames a `render()` en `init()`
3. Usa `innerHTML = ''` para limpiar contenedor antes de agregar

---

### P: Filtros no se persisten al cambiar página
**Síntomas**: Filtro se pierde cuando voy a la siguiente página
**Causa**: Filtro guardado localmente pero no enviado en siguiente solicitud

**Soluciones**:
1. Guarda filtro en `this.searchTerm`
2. En `loadPage()`, envía el filtro:
   ```javascript
   await this.loadPage(newPage) {
     const { data } = await servicioX.getPage({
       page: newPage,
       search: this.searchTerm  // ← Incluir aquí
     })
   }
   ```

---

## PROBLEMAS DE AUTENTICACIÓN

### P: Token expira muy rápido (5 minutos)
**Síntomas**: Cada 5 minutos me desloguea
**Causa**: Backend configura expiración corta

**Soluciones**:
1. Contactar administrador del backend para cambiar duración
2. O implementar refresh token (más avanzado)

---

### P: "Acceso Denegado" en página de admin siendo admin
**Síntomas**: No puedo entrar a usuarios aunque soy admin
**Causa**: El rol en localStorage no coincide con el del backend

**Soluciones**:
1. Desloguea y vuelve a loguear
2. Verifica que el rol es exactamente "Admin" (mayúscula)
3. En Console:
   ```javascript
   const user = JSON.parse(localStorage.getItem('currentUser'))
   console.log('Rol:', user.rol)
   ```

---

### P: Avatar no carga
**Síntomas**: Icono de usuario en lugar de foto
**Causa**: URL de imagen inválida o CORS bloqueado

**Soluciones**:
1. Verifica que imagenUrl sea una URL válida
2. Verifica que el servidor permite CORS (usualmente sí)
3. Intenta con otra imagen

---

## PROBLEMAS DE CREACIÓN/EDICIÓN

### P: "Ocurrió un error inesperado" sin detalles
**Síntomas**: Alert rojo genérico
**Causa**: Error sin mensaje específico

**Soluciones**:
1. Abre DevTools → Console
2. Busca logs del servicio: `[clienteService] Error:...`
3. Lee el mensaje completo
4. Copia y busca qué significa

---

### P: "Validación de campo" error pero sin especificar
**Síntomas**: No sé qué campo está mal
**Causa**: Response del backend tiene `errors: { campo: ["mensaje"] }`

**Soluciones**:
1. El extractErrorMessage() ya debería mostrar el primer error
2. Si no aparece, abre DevTools → Network
3. Haz el request de nuevo (click en botón)
4. Busca request fallida (rojo)
5. Abre Response y busca `errors`

---

### P: Cambios no se guardan
**Síntomas**: Hago click en Actualizar y vuelve a los datos anteriores
**Causa**: Request falló pero no se mostró error

**Soluciones**:
1. Abre DevTools → Network → XHR
2. Hace click en Actualizar
3. Busca solicitud
4. Revisa Status code
5. Si es 400/422, lee el error en Response

---

## PROBLEMAS DE DESCARGA DE ARCHIVOS

### P: PDF no se descarga
**Síntomas**: Hago click en descargar y nada pasa
**Causa**: Respuesta no es Blob o error en descarga

**Soluciones**:
1. Verifica que httpClient.getBlob() se usa (no httpClient.get())
2. Abre DevTools → Network → XHR
3. Verifica que el request tiene Status 200
4. En Console:
   ```javascript
   // Prueba manual
   const blob = await ventaService.getPdf(1)
   const url = URL.createObjectURL(blob)
   const a = document.createElement('a')
   a.href = url
   a.download = 'factura.pdf'
   a.click()
   ```

---

## PROBLEMAS DE DESEMPEÑO

### P: Página muy lenta
**Síntomas**: Demora mucho en cargar datos
**Causa**: Muchas solicitudes o mucho datos

**Soluciones**:
1. Verifica en Network → XHR cuántas solicitudes hay
2. Limita `limit` en getPage(): max 200 items
3. Implementa caché simple
4. Usa `fetchAllPaged()` solo cuando realmente necesites todos

---

### P: Renderizado lento con tablas grandes
**Síntomas**: Scroll lento, interfaz congelada
**Causa**: Demasiado DOM

**Soluciones**:
1. Limita items por página a 10-30 máximo
2. Usa virtualization (librería)
3. Simplifica HTML de cada fila

---

## PROBLEMAS DE BUILD/DEPLOYMENT

### P: `npm run build` falla
**Síntomas**: Error durante compilación
**Causa**: Depende del error específico

**Soluciones**:
1. Lee el error completo
2. Busca el archivo mencionado
3. Verifica que no hay sintaxis inválida
4. Intenta: `npm install` y `npm run build` de nuevo

---

### P: Build genera archivos muy grandes
**Síntomas**: dist/ es > 500KB
**Causa**: Librerías incluidas

**Soluciones**:
1. Analiza bundle: https://www.npmjs.com/package/vite-plugin-visualizer
2. Intenta:
   ```bash
   npm install --save-dev vite-plugin-visualizer
   ```

---

## DEBUGGING AVANZADO

### Herramientas

**DevTools (F12)**
```
Console → Ver logs, errores, ejecutar código
Network → Ver solicitudes HTTP, respuestas
Storage → Ver localStorage, sessionStorage
Elements → Inspeccionar HTML, CSS
```

**Logs en código**
```javascript
console.log('[PREFIJO] Mensaje:', variable)
console.error('[ERROR] Error:', error)
console.table(array)  // Muestra array en tabla
```

**Forzar errores**
```javascript
// En Console
throw new Error('Error para testing')
```

**Ejecutar código manual**
```javascript
// En Console
import { ventaService } from '/src/services/ventaService.js'
const { data } = await ventaService.getPage({ page: 1, limit: 10 })
console.table(data)
```

---

## CHECKLIST DE TROUBLESHOOTING

Cuando algo no funciona, sigue este orden:

- [ ] Abre DevTools (F12)
- [ ] Ve a Console y lee todos los errores
- [ ] Busca logs con `[PREFIJO]`
- [ ] Ve a Network → XHR
- [ ] Haz la acción que falla
- [ ] Busca request fallida (rojo)
- [ ] Lee Status code y Response
- [ ] Verifica localStorage
- [ ] Intenta refrescar página (F5)
- [ ] Intenta `localStorage.clear()` y login de nuevo
- [ ] Revisa el archivo de la página correspondiente
- [ ] Busca `console.error()` en el código
- [ ] Intenta en otra página similar
- [ ] Revisa VITE_API_BASE_URL

---

## CONTACTO PARA AYUDA

**Información a proporcionar:**

1. **¿Qué intentabas hacer?**
2. **¿Qué sucedió?**
3. **¿Qué esperabas que sucediera?**
4. **Error exacto** (de Console o popup)
5. **Pasos para reproducir**
6. **Screenshot o video**
7. **Salida de Console** (F12 → Console → Copiar todo)
8. **Status de Network** (F12 → Network → XHR → última solicitud)

---

Este documento debería cubrir la mayoría de problemas comunes.
Si el problema persiste, proporciona la información de "Contacto para Ayuda".
