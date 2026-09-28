@echo off
title BHUVISION // SatQuery AI Cockpit
color 0b
echo ================================================================
echo   BHUVISION // SatQuery AI - Surveillance Cockpit
echo   Smart India Hackathon 2026 // SIH26167 // ISRO // Team BANKAI
echo ================================================================
echo.
echo [1/3] Checking environment and port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Terminating stale process on port 8000 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo [2/3] Scheduling browser launch at http://127.0.0.1:8000/app...
start "" powershell -Command "Start-Sleep -Milliseconds 1500; Start-Process 'http://127.0.0.1:8000/app'"

echo [3/3] Starting backend server on http://localhost:8000/app ...
cd /d "%~dp0backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
pause
