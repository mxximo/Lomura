param([int]$Port = 8000)
$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path $PSScriptRoot -Parent
$configurationFile = Join-Path $projectDirectory 'backend\.env'
if (Test-Path -LiteralPath $configurationFile) {
    foreach ($configurationLine in Get-Content -LiteralPath $configurationFile) {
        if ($configurationLine -match '^([A-Z_]+)=(.*)$') {
            if (-not [Environment]::GetEnvironmentVariable($Matches[1])) {
                [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process')
            }
        }
    }
}
$runtimePath = Join-Path $projectDirectory '.venv-release\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $runtimePath)) { $runtimePath = Join-Path $projectDirectory '.venv\Scripts\python.exe' }
Set-Location -LiteralPath $projectDirectory
& $runtimePath -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port $Port --no-access-log
