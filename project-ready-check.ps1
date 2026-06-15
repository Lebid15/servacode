param(
    [string]$EnvFile = ".env.production",
    [switch]$LocalMode
)

$ErrorActionPreference = "Continue"

$ReportFile = "project-readiness-report.txt"
$Passes = 0
$Warnings = 0
$Failures = 0

function Add-ReportLine { param([string]$Line) Add-Content -Path $ReportFile -Value $Line -Encoding UTF8 }

function Result {
    param([string]$Status, [string]$Title, [string]$Details = "")

    $line = "[$Status] $Title"
    if ($Details -ne "") { $line += " - $Details" }

    switch ($Status) {
        "PASS" { $script:Passes++; Write-Host $line -ForegroundColor Green }
        "WARN" { $script:Warnings++; Write-Host $line -ForegroundColor Yellow }
        "FAIL" { $script:Failures++; Write-Host $line -ForegroundColor Red }
        default { Write-Host $line }
    }

    Add-ReportLine $line
}

function Run {
    param([string]$Command, [string]$Title, [string]$Required = "false")

    Add-ReportLine ""
    Add-ReportLine "--- $Title ---"
    Add-ReportLine $Command

    $output = cmd /c $Command 2>&1
    $code = $LASTEXITCODE
    $output | ForEach-Object { Add-ReportLine $_ }

    if ($code -eq 0) { Result "PASS" $Title }
    elseif ($Required -eq "true") { Result "FAIL" $Title "ExitCode=$code" }
    else { Result "WARN" $Title "ExitCode=$code" }
}

function Read-Env {
    param([string]$Path)

    $map = @{}
    if (!(Test-Path $Path)) { return $map }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if ($line -eq "" -or $line.StartsWith("#")) { return }
        $parts = $line -split "=", 2
        if ($parts.Count -eq 2) { $map[$parts[0].Trim()] = $parts[1].Trim() }
    }

    return $map
}

Clear-Content -Path $ReportFile -ErrorAction SilentlyContinue
Add-ReportLine "Project Readiness Report"
Add-ReportLine "Generated: $(Get-Date)"
Add-ReportLine "Project: $(Get-Location)"
Add-ReportLine "Mode: $(if ($LocalMode) { 'LOCAL' } else { 'PRODUCTION READINESS' })"
Add-ReportLine "=================================================="

Write-Host ""
Write-Host "=== Full Project Readiness Check ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "`n--- Structure ---" -ForegroundColor Cyan
Add-ReportLine ""
Add-ReportLine "## Structure"

$requiredFolders = @("backend", "public_site", "admin_panel", "docs", "deployment")
foreach ($folder in $requiredFolders) {
    if (Test-Path $folder) { Result "PASS" "Folder exists: $folder" }
    elseif ($folder -in @("docs", "deployment")) { Result "WARN" "Folder missing: $folder" }
    else { Result "FAIL" "Folder missing: $folder" }
}

$requiredFiles = @("README.md", ".gitignore")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) { Result "PASS" "File exists: $file" } else { Result "WARN" "File missing: $file" }
}

if (Test-Path "frontend") { Result "WARN" "Old frontend folder still exists" } else { Result "PASS" "No old frontend folder found" }

Write-Host "`n--- Environment ---" -ForegroundColor Cyan
Add-ReportLine ""
Add-ReportLine "## Environment"

$envData = Read-Env $EnvFile
if (Test-Path $EnvFile) { Result "PASS" "Env file exists: $EnvFile" } else { Result "WARN" "Env file missing: $EnvFile" "Use examples before deployment" }

$envRequired = @("APP_ENV", "DEBUG", "DATABASE_URL", "SECRET_KEY", "BACKEND_CORS_ORIGINS", "ALLOWED_HOSTS", "NEXT_PUBLIC_API_BASE_URL")
foreach ($key in $envRequired) {
    if ($envData.ContainsKey($key) -and $envData[$key] -ne "") { Result "PASS" "Env variable exists: $key" }
    elseif ($LocalMode) { Result "WARN" "Missing env variable: $key" "Allowed in local mode if shell env provides it" }
    else { Result "FAIL" "Missing env variable: $key" }
}

Write-Host "`n--- Backend ---" -ForegroundColor Cyan
Add-ReportLine ""
Add-ReportLine "## Backend"

if (Test-Path "backend\manage.py") { Result "PASS" "Backend Django project exists" } else { Result "FAIL" "Backend Django project missing" }
Run "cd backend && python manage.py check" "Django system check" "true"
Run "cd backend && python scripts\quality_check.py" "Backend quality check" "true"
Run "cd backend && python manage.py showmigrations platform_api" "Django migration status" "true"
Run "cd backend && python manage.py migrate --plan" "Django migration plan" "true"
Run "curl.exe -s -i http://localhost:8000/api/v1/health" "Backend health endpoint" "false"

Write-Host "`n--- Public Site ---" -ForegroundColor Cyan
Add-ReportLine ""
Add-ReportLine "## Public Site"

if (Test-Path "public_site\package.json") {
    Result "PASS" "public_site package.json exists"
    Run "cd public_site && npm run quality" "public_site quality" "true"
    Run "cd public_site && npm run build" "public_site build" "true"
} else {
    Result "FAIL" "public_site package.json missing"
}

Write-Host "`n--- Admin Panel ---" -ForegroundColor Cyan
Add-ReportLine ""
Add-ReportLine "## Admin Panel"

if (Test-Path "admin_panel\package.json") {
    Result "PASS" "admin_panel package.json exists"
    Run "cd admin_panel && pnpm run quality" "admin_panel quality" "true"
    Run "cd admin_panel && pnpm run build" "admin_panel build" "true"
} else {
    Result "FAIL" "admin_panel package.json missing"
}

Add-ReportLine ""
Add-ReportLine "=================================================="
Add-ReportLine "Summary"
Add-ReportLine "PASS: $Passes"
Add-ReportLine "WARN: $Warnings"
Add-ReportLine "FAIL: $Failures"

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "PASS: $Passes" -ForegroundColor Green
Write-Host "WARN: $Warnings" -ForegroundColor Yellow
Write-Host "FAIL: $Failures" -ForegroundColor Red
Write-Host "`nReport saved to: $ReportFile" -ForegroundColor Cyan

if ($Failures -gt 0) { exit 1 }
if ($Warnings -gt 0) { exit 2 }
exit 0
