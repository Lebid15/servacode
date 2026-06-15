# =====================================================
# Final Public Site Check
# يشغل فحص الموقع العام خطوة بخطوة على Windows PowerShell
# =====================================================

$ErrorActionPreference = "Stop"

Write-Host "Stopping old Node processes..." -ForegroundColor Cyan
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Cleaning Next.js cache..." -ForegroundColor Cyan
if (Test-Path ".next") {
  Remove-Item -Recurse -Force ".next"
}

if (Test-Path "node_modules\.cache") {
  Remove-Item -Recurse -Force "node_modules\.cache"
}

Write-Host "Running type-check..." -ForegroundColor Cyan
npm run type-check

Write-Host "Running lint..." -ForegroundColor Cyan
npm run lint

Write-Host "Running build..." -ForegroundColor Cyan
npm run build

Write-Host ""
Write-Host "PUBLIC SITE CHECK PASSED ✅" -ForegroundColor Green
Write-Host "Run now: npm run dev:3000" -ForegroundColor Yellow
