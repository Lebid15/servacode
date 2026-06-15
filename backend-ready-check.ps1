param(
    [string]$EnvFile = ".env.production",
    [string]$BackendUrl = "http://localhost:8000/api/v1/health",
    [switch]$LocalMode
)

$ErrorActionPreference = "Continue"

$ReportFile = "backend-readiness-report.txt"
$Failures = 0
$Warnings = 0
$Passes = 0

function Write-CheckResult {
    param(
        [string]$Status,
        [string]$Title,
        [string]$Details = ""
    )

    $line = "[$Status] $Title"
    if ($Details -ne "") { $line += " - $Details" }

    switch ($Status) {
        "PASS" { $script:Passes++ ; Write-Host $line -ForegroundColor Green }
        "WARN" { $script:Warnings++ ; Write-Host $line -ForegroundColor Yellow }
        "FAIL" { $script:Failures++ ; Write-Host $line -ForegroundColor Red }
        default { Write-Host $line }
    }

    Add-Content -Path $ReportFile -Value $line -Encoding UTF8
}

function Invoke-CheckCommand {
    param(
        [string]$Command,
        [string]$Title,
        [switch]$Required
    )

    Add-Content -Path $ReportFile -Value "`n--- $Title ---" -Encoding UTF8
    Add-Content -Path $ReportFile -Value $Command -Encoding UTF8

    $output = cmd /c $Command 2>&1
    $exitCode = $LASTEXITCODE
    $output | ForEach-Object { Add-Content -Path $ReportFile -Value $_ -Encoding UTF8 }

    if ($exitCode -eq 0) {
        Write-CheckResult "PASS" $Title
    } elseif ($Required) {
        Write-CheckResult "FAIL" $Title "ExitCode=$exitCode"
    } else {
        Write-CheckResult "WARN" $Title "ExitCode=$exitCode"
    }
}

function Get-EnvFileData {
    param([string]$Path)

    $envMap = @{}
    if (!(Test-Path $Path)) { return $envMap }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if ($line -eq "" -or $line.StartsWith("#")) { return }
        $parts = $line -split "=", 2
        if ($parts.Count -eq 2) { $envMap[$parts[0].Trim()] = $parts[1].Trim() }
    }

    return $envMap
}

Clear-Content -Path $ReportFile -ErrorAction SilentlyContinue
Add-Content -Path $ReportFile -Value "Backend Readiness Report" -Encoding UTF8
Add-Content -Path $ReportFile -Value "Generated: $(Get-Date)" -Encoding UTF8
Add-Content -Path $ReportFile -Value "Project: $(Get-Location)" -Encoding UTF8
Add-Content -Path $ReportFile -Value "Mode: $(if ($LocalMode) { 'LOCAL' } else { 'PRODUCTION-READINESS' })" -Encoding UTF8
Add-Content -Path $ReportFile -Value "========================================" -Encoding UTF8

Write-Host "`n=== Backend Readiness Check ===`n" -ForegroundColor Cyan

if (Test-Path "backend\manage.py") { Write-CheckResult "PASS" "Django manage.py exists" } else { Write-CheckResult "FAIL" "Django manage.py missing" }
if (Test-Path "backend\requirements.txt") { Write-CheckResult "PASS" "Backend requirements.txt exists" } else { Write-CheckResult "FAIL" "Backend requirements.txt missing" }
if (Test-Path "backend\platform_api\migrations\0001_initial.py") { Write-CheckResult "PASS" "Django initial migration exists" } else { Write-CheckResult "FAIL" "Django initial migration missing" }

$envData = Get-EnvFileData $EnvFile
if (Test-Path $EnvFile) { Write-CheckResult "PASS" "$EnvFile exists" } else { Write-CheckResult "WARN" "$EnvFile missing" "Use .env.production.example as a template before deployment" }

$requiredVars = @("APP_ENV", "DATABASE_URL", "SECRET_KEY", "BACKEND_CORS_ORIGINS", "ALLOWED_HOSTS")
foreach ($key in $requiredVars) {
    if ($envData.ContainsKey($key) -and $envData[$key] -ne "") { Write-CheckResult "PASS" "Env variable exists: $key" }
    elseif ($LocalMode) { Write-CheckResult "WARN" "Missing env variable: $key" "Allowed in local mode if shell env provides it" }
    else { Write-CheckResult "FAIL" "Missing env variable: $key" }
}

if ($envData.ContainsKey("SECRET_KEY")) {
    if ($envData["SECRET_KEY"].Length -ge 40) { Write-CheckResult "PASS" "SECRET_KEY length looks safe" } else { Write-CheckResult "FAIL" "SECRET_KEY is too short" }
}

Invoke-CheckCommand "cd backend && python manage.py check" "Django system check" -Required
Invoke-CheckCommand "cd backend && python scripts\quality_check.py" "Backend quality check" -Required
Invoke-CheckCommand "cd backend && python manage.py showmigrations platform_api" "Django migration status" -Required
Invoke-CheckCommand "cd backend && python manage.py migrate --plan" "Django migration plan" -Required
Invoke-CheckCommand "curl.exe -s -i $BackendUrl" "Backend health endpoint responds" -Required:$false

Add-Content -Path $ReportFile -Value "`n========================================" -Encoding UTF8
Add-Content -Path $ReportFile -Value "Summary" -Encoding UTF8
Add-Content -Path $ReportFile -Value "PASS: $Passes" -Encoding UTF8
Add-Content -Path $ReportFile -Value "WARN: $Warnings" -Encoding UTF8
Add-Content -Path $ReportFile -Value "FAIL: $Failures" -Encoding UTF8

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "PASS: $Passes" -ForegroundColor Green
Write-Host "WARN: $Warnings" -ForegroundColor Yellow
Write-Host "FAIL: $Failures" -ForegroundColor Red
Write-Host "`nReport saved to: $ReportFile" -ForegroundColor Cyan

if ($Failures -gt 0) { exit 1 }
if ($Warnings -gt 0) { exit 2 }
exit 0
