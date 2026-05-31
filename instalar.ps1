# ========================================
# SCRIPT DE INSTALACIÓN AUTOMÁTICA
# Sistema de Facturación - Frontend Vue.js
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   INSTALACIÓN FRONTEND VUE.JS" -ForegroundColor Cyan
Write-Host "   Sistema de Facturación" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "✓ Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ ERROR: Node.js no está instalado" -ForegroundColor Red
    Write-Host "  Descarga Node.js desde: https://nodejs.org/" -ForegroundColor Red
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit
}
Write-Host "  ✓ Node.js instalado: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Verificar npm
Write-Host "✓ Verificando npm..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ ERROR: npm no está instalado" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit
}
Write-Host "  ✓ npm instalado: v$npmVersion" -ForegroundColor Green
Write-Host ""

# Instalar dependencias
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   INSTALANDO DEPENDENCIAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Esto puede tardar 2-3 minutos..." -ForegroundColor Yellow
Write-Host ""

npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ ERROR: Falló la instalación de dependencias" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ✓ INSTALACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Mostrar siguiente paso
Write-Host "📋 SIGUIENTE PASO:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Asegúrate de que el BACKEND esté corriendo" -ForegroundColor Yellow
Write-Host "   - Abre Visual Studio Community" -ForegroundColor White
Write-Host "   - Ejecuta el proyecto Backend (F5)" -ForegroundColor White
Write-Host "   - Verifica que esté en: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "2. Ejecuta el FRONTEND con:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Abre el navegador en:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""

# Preguntar si desea ejecutar ahora
$ejecutar = Read-Host "¿Deseas ejecutar el servidor de desarrollo ahora? (S/N)"

if ($ejecutar -eq "S" -or $ejecutar -eq "s") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   INICIANDO SERVIDOR DE DESARROLLO" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "Para ejecutar manualmente más tarde, usa:" -ForegroundColor Yellow
    Write-Host "npm run dev" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona Enter para salir"
}
