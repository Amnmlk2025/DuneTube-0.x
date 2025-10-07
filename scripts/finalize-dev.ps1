param()

$repoRoot = Split-Path -Parent $PSScriptRoot
Write-Host "==> Finalizing dev environment in $repoRoot" -ForegroundColor Cyan

Push-Location $repoRoot

try {
    Write-Host "`n==> Installing frontend dependencies" -ForegroundColor Yellow
    npm install --prefix frontend

    Write-Host "`n==> Installing backend requirements" -ForegroundColor Yellow
    python -m pip install -r backend/requirements.txt

    Write-Host "`n==> Applying database migrations" -ForegroundColor Yellow
    python backend/manage.py migrate

    Write-Host "`n==> Restarting process manager" -ForegroundColor Yellow
    pm2 restart all

    Write-Host "`n==> Finalize script completed successfully" -ForegroundColor Green
} finally {
    Pop-Location
}
