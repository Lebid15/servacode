param(
    [switch]$WhatIfOnly
)

$ErrorActionPreference = "Continue"
$paths = @(
    "backend\__pycache__",
    "backend\.pytest_cache",
    "backend\.mypy_cache",
    "backend\.ruff_cache",
    "backend\db.sqlite3",
    "backend\uploads",
    "backend\media",
    "public_site\.next",
    "public_site\out",
    "public_site\dist",
    "public_site\build",
    "public_site\project-readiness-report.txt",
    "admin_panel\.next",
    "admin_panel\out",
    "admin_panel\dist",
    "admin_panel\build",
    "phase-15-4-e2e-report.txt",
    "project-readiness-report.txt"
)

$patterns = @(
    "*.pyc",
    "*.pyo",
    "*.tsbuildinfo",
    "*.log"
)

Write-Host "Cleaning local generated artifacts..." -ForegroundColor Cyan

foreach ($path in $paths) {
    if (Test-Path $path) {
        if ($WhatIfOnly) {
            Write-Host "[DRY] remove $path" -ForegroundColor Yellow
        } else {
            Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
            Write-Host "[OK] removed $path" -ForegroundColor Green
        }
    }
}

foreach ($pattern in $patterns) {
    Get-ChildItem -Path . -Recurse -Force -File -Filter $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        if ($WhatIfOnly) {
            Write-Host "[DRY] remove $($_.FullName)" -ForegroundColor Yellow
        } else {
            Remove-Item -Force $_.FullName -ErrorAction SilentlyContinue
            Write-Host "[OK] removed $($_.FullName)" -ForegroundColor Green
        }
    }
}

Write-Host "Cleanup finished." -ForegroundColor Cyan
