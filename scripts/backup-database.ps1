param(
  [string]$OutputDir = ".\backups"
)

if (-not $env:DATABASE_URL) {
  Write-Error "DATABASE_URL is required before running a production backup."
  exit 1
}

if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
  Write-Error "pg_dump was not found. Install PostgreSQL client tools first."
  exit 1
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$target = Join-Path $OutputDir "trippilot-$timestamp.dump"

pg_dump $env:DATABASE_URL --format=custom --no-owner --no-privileges --file=$target

if ($LASTEXITCODE -ne 0) {
  Write-Error "Database backup failed."
  exit $LASTEXITCODE
}

Write-Host "Backup created: $target"
