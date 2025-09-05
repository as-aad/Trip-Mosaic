@echo off
echo Starting FastAPI Backend Server...
echo.
echo Make sure you have:
echo 1. Activated your virtual environment (venv\Scripts\activate)
echo 2. Installed dependencies (pip install -r requirements.txt)
echo 3. Set up your MySQL database and updated .env file
echo 4. Run migrations (alembic upgrade head)
echo.
echo Starting server...
uvicorn app.main:app --reload
pause
