@echo off
echo Starting Cyberpunk Frontend Tester Docker Deployment...
echo.

echo Checking Docker installation...
docker --version
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

echo.
echo Checking Docker Compose...
docker-compose --version
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not available
    pause
    exit /b 1
)

echo.
echo Building and starting all services...
docker-compose up --build

echo.
echo Deployment complete!
echo Frontend: http://localhost:3000
echo Backend Health: http://localhost:5000/api/health
echo.
echo To view E2E test results: docker-compose logs e2e-tests
echo To stop services: docker-compose down
pause
