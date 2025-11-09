# Script para permitir el puerto 5000 en el firewall de Windows
# Ejecuta este script como Administrador

Write-Host "Configurando firewall para permitir el puerto 5000..." -ForegroundColor Yellow

# Crear regla de entrada para el puerto 5000
New-NetFirewallRule -DisplayName "Lorei Backend API - Puerto 5000" `
    -Direction Inbound `
    -LocalPort 5000 `
    -Protocol TCP `
    -Action Allow `
    -Profile Any

Write-Host "✅ Regla de firewall creada exitosamente" -ForegroundColor Green
Write-Host "El puerto 5000 ahora está permitido para conexiones entrantes" -ForegroundColor Green



