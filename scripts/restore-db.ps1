param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,
  [string]$DatabaseUrl = $env:DATABASE_URL
)

if (-not $DatabaseUrl) {
  throw "DATABASE_URL is required."
}

$resolvedBackup = Resolve-Path -LiteralPath $BackupFile -ErrorAction Stop
Write-Host "Restoring backup from $resolvedBackup"
pg_restore --clean --if-exists --no-owner --dbname="$DatabaseUrl" "$resolvedBackup"

if ($LASTEXITCODE -ne 0) {
  throw "pg_restore failed with exit code $LASTEXITCODE"
}

Write-Host "Restore complete."
