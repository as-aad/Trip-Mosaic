Write-Host "Starting FastAPI Backend Server..." -ForegroundColor Green
Write-Host ""
Write-Host "Make sure you have:" -ForegroundColor Yellow
Write-Host "1. Activated your virtual environment (venv\Scripts\Activate.ps1)" -ForegroundColor White
Write-Host "2. Installed dependencies (pip install -r requirements.txt)" -ForegroundColor White
Write-Host "3. Set up your MySQL database and updated .env file" -ForegroundColor White
Write-Host "4. Run migrations (alembic upgrade head)" -ForegroundColor White
Write-Host ""
Write-Host "Starting server..." -ForegroundColor Cyan

try {
    uvicorn app.main:app --reload
} catch {
    Write-Host "Error starting server. Make sure uvicorn is installed and virtual environment is activated." -ForegroundColor Red
    Read-Host "Press Enter to continue"
}
