param(
    [switch]$SkipBuild,
    [switch]$SkipPytest,
    [string]$BackendUrl = "http://127.0.0.1:8000/api/v1"
)

$ErrorActionPreference = "Continue"
$ReportFile = "phase-15-4-e2e-report.txt"
$Passes = 0
$Warnings = 0
$Failures = 0

function Add-Line { param([string]$Line = "") Add-Content -Path $ReportFile -Value $Line -Encoding UTF8 }

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
    Add-Line $line
}

function Run-Step {
    param([string]$Command, [string]$Title, [bool]$Required = $true)
    Add-Line ""
    Add-Line "--- $Title ---"
    Add-Line $Command
    $output = cmd /c $Command 2>&1
    $code = $LASTEXITCODE
    $output | ForEach-Object { Add-Line $_ }

    if ($code -eq 0) { Result "PASS" $Title }
    elseif ($Required) { Result "FAIL" $Title "ExitCode=$code" }
    else { Result "WARN" $Title "ExitCode=$code" }
}

Clear-Content -Path $ReportFile -ErrorAction SilentlyContinue
Add-Line "Phase 15.4 Full End-to-End QA Report"
Add-Line "Generated: $(Get-Date)"
Add-Line "Project: $(Get-Location)"
Add-Line "BackendUrl: $BackendUrl"
Add-Line "SkipBuild: $SkipBuild"
Add-Line "SkipPytest: $SkipPytest"
Add-Line "=================================================="

Write-Host "`n=== Phase 15.4 Full End-to-End QA ===`n" -ForegroundColor Cyan

$requiredPaths = @(
    "backend\manage.py",
    "backend\platform_api\models.py",
    "backend\platform_api\serializers.py",
    "backend\platform_api\views.py",
    "backend\tests\test_phase_15_4_end_to_end_contract.py",
    "public_site\package.json",
    "public_site\scripts\release-check.mjs",
    "admin_panel\package.json",
    "admin_panel\scripts\release-check.mjs",
    "plan.md"
)

foreach ($path in $requiredPaths) {
    if (Test-Path $path) { Result "PASS" "Required path exists: $path" }
    else { Result "FAIL" "Required path missing: $path" }
}

Run-Step "cd backend && python -m compileall config platform_api scripts tests" "Backend Python compileall" $true
Run-Step "cd backend && python scripts\quality_check.py" "Backend quality_check.py" $true

if ($SkipPytest) {
    Result "WARN" "Backend pytest skipped by flag"
} else {
    Run-Step "cd backend && pytest" "Backend pytest including Phase 15.4 E2E contract tests" $true
}

Run-Step "cd public_site && npm run release-check" "Public site release-check" $true
Run-Step "cd admin_panel && pnpm run release-check" "Admin panel release-check" $true
Run-Step "curl.exe -s -f $BackendUrl/health" "Optional running backend health check" $false
Run-Step "curl.exe -s -f $BackendUrl/public/settings" "Optional public settings API smoke check" $false

if ($SkipBuild) {
    Result "WARN" "Frontend build steps skipped by flag"
} else {
    Run-Step "cd public_site && npm run quality" "Public site quality" $true
    Run-Step "cd public_site && npm run build" "Public site build" $true
    Run-Step "cd admin_panel && pnpm run quality" "Admin panel quality" $true
    Run-Step "cd admin_panel && pnpm run build" "Admin panel build" $true
}

Add-Line ""
Add-Line "=================================================="
Add-Line "Summary"
Add-Line "PASS: $Passes"
Add-Line "WARN: $Warnings"
Add-Line "FAIL: $Failures"

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "PASS: $Passes" -ForegroundColor Green
Write-Host "WARN: $Warnings" -ForegroundColor Yellow
Write-Host "FAIL: $Failures" -ForegroundColor Red
Write-Host "`nReport saved to: $ReportFile" -ForegroundColor Cyan

if ($Failures -gt 0) { exit 1 }
if ($Warnings -gt 0) { exit 2 }
exit 0
