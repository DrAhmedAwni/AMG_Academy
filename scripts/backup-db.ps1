param(
  [string]$DatabaseUrl = $env:DATABASE_URL,
  [string]$OutputDir = "backups"
)

if (-not $DatabaseUrl) {
  throw "DATABASE_URL is required."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$resolvedOutputDir = Resolve-Path -LiteralPath $OutputDir -ErrorAction SilentlyContinue
if (-not $resolvedOutputDir) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
  $resolvedOutputDir = Resolve-Path -LiteralPath $OutputDir
}

$backupPath = Join-Path $resolvedOutputDir "amg-academy-$timestamp.dump"
Write-Host "Creating backup at $backupPath"
pg_dump --format=custom --file="$backupPath" "$DatabaseUrl"

if ($LASTEXITCODE -ne 0) {
  throw "pg_dump failed with exit code $LASTEXITCODE"
}

Write-Host "Backup complete: $backupPath"
