$source = Join-Path $PSScriptRoot "..\..\backend\docs\openapi.yaml"
$destinationDir = Join-Path $PSScriptRoot "..\public"
$destination = Join-Path $destinationDir "openapi.yaml"

if (-not (Test-Path $source)) {
    Write-Error "OpenAPI source file not found: $source"
    exit 1
}

if (-not (Test-Path $destinationDir)) {
    New-Item -ItemType Directory -Path $destinationDir | Out-Null
}

Copy-Item $source $destination -Force
Write-Host "Synced OpenAPI spec to $destination"
