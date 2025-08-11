@echo off
setlocal enabledelayedexpansion

echo 🚀 Building OrderFlow Docker Image...

REM Check if we're in the right directory
if not exist "Dockerfile.prod" (
    echo ❌ Error: Dockerfile.prod not found. Please run this script from the project root.
    exit /b 1
)

REM Build frontend first
echo 📦 Building frontend...
cd frontend
call npm ci
if errorlevel 1 (
    echo ❌ Error: npm ci failed
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo ❌ Error: npm run build failed
    exit /b 1
)

cd ..

REM Check if frontend build was successful
if not exist "frontend\dist" (
    echo ❌ Error: Frontend build failed. frontend\dist directory not found.
    exit /b 1
)

echo ✅ Frontend built successfully

REM Build Docker image
echo 🐳 Building Docker image...
docker build -f Dockerfile.prod -t orderflow:latest .

if errorlevel 1 (
    echo ❌ Error: Docker build failed
    exit /b 1
)

echo ✅ Docker image built successfully!
echo 📋 Image details:
docker images orderflow:latest

echo.
echo 🚀 To run the container:
echo    docker run -p 8080:8080 orderflow:latest
echo.
echo 🔍 To test the health endpoint:
echo    curl http://localhost:8080/health

pause 