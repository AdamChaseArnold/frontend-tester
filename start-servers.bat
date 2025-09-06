@echo off
echo Starting Frontend Tester Application...
echo.

echo Starting Backend Server on port 4001...
start "Backend Server" cmd /k "cd /d %~dp0server && node server.js"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server on port 4000...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:4001
echo Frontend: http://localhost:4000
echo.
pause
