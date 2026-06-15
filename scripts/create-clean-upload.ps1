param(
    [string]$Source = "D:\platform",
    [string]$OutputZip = "D:\platform-clean-upload.zip",
    [string]$TempDir = "D:\platform-clean-upload"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $Source)) {
    throw "Source path not found: $Source"
}

Remove-Item -Recurse -Force $TempDir -ErrorAction SilentlyContinue
Remove-Item -Force $OutputZip -ErrorAction SilentlyContinue

$excludeDirs = @(
    "node_modules", ".next", "out", "dist", "build", ".git", ".turbo", ".cache", "coverage", ".vercel",
    "__pycache__", ".pytest_cache", ".mypy_cache", ".ruff_cache", ".venv", "venv", "env",
    "uploads", "media", "backend\uploads", "backend\media", "deployment\backups"
)

$excludeFiles = @(
    ".env", ".env.local", ".env.production", ".env.development", "*.log", "*.zip", "*.rar", "*.7z",
    "*.sqlite3", "db.sqlite3", "*.db", "*.pyc", "*.pyo", "*.tsbuildinfo",
    "project-readiness-report.txt", "phase-15-4-e2e-report.txt"
)

Write-Host "Creating clean upload copy..." -ForegroundColor Cyan
robocopy $Source $TempDir /E /XD $excludeDirs /XF $excludeFiles | Out-Host

if ($LASTEXITCODE -gt 7) {
    throw "Robocopy failed with exit code $LASTEXITCODE"
}

Write-Host "Compressing: $OutputZip" -ForegroundColor Cyan
Compress-Archive -Path "$TempDir\*" -DestinationPath $OutputZip -Force

Write-Host "Done: $OutputZip" -ForegroundColor Green
