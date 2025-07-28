@echo off
setlocal enabledelayedexpansion

REM Docker management script for Next.js RAG application (Windows)

if "%1"=="" goto usage
if "%1"=="dev" goto dev
if "%1"=="prod" goto prod
if "%1"=="build" goto build
if "%1"=="logs" goto logs
if "%1"=="stop" goto stop
if "%1"=="clean" goto clean
if "%1"=="health" goto health
goto usage

:usage
echo Usage: %0 {dev^|prod^|build^|logs^|stop^|clean^|health}
echo.
echo Commands:
echo   dev     - Start development environment
echo   prod    - Start production environment
echo   build   - Build the Next.js application
echo   logs    - Show logs from all services
echo   stop    - Stop all services
echo   clean   - Stop and remove all containers, networks, and volumes
echo   health  - Check health of running services
goto end

:check_docker
where docker >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH
    exit /b 1
)

where docker-compose >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed or not in PATH
    exit /b 1
)
goto :eof

:check_env
if not exist .env.local (
    echo [WARNING] .env.local file not found
    if exist .env.local.example (
        echo [INFO] Copying .env.local.example to .env.local
        copy .env.local.example .env.local >nul
        echo [WARNING] Please edit .env.local and add your API keys
    ) else (
        echo [ERROR] .env.local.example file not found
        exit /b 1
    )
)
goto :eof

:dev
call :check_docker
call :check_env
echo [INFO] Starting development environment...
docker-compose up -d
if errorlevel 1 goto error
echo [SUCCESS] Development environment started!
echo [INFO] Application: http://localhost:3000
echo [INFO] Admin Panel: http://localhost:3000/admin
echo [INFO] ChromaDB: http://localhost:8000
goto end

:prod
call :check_docker
call :check_env
echo [INFO] Starting production environment...
docker-compose -f docker-compose.prod.yaml up -d
if errorlevel 1 goto error
echo [SUCCESS] Production environment started!
echo [INFO] Application: http://localhost:3000
echo [INFO] Admin Panel: http://localhost:3000/admin
goto end

:build
call :check_docker
echo [INFO] Building Next.js application...
docker-compose build nextjs-app
if errorlevel 1 goto error
echo [SUCCESS] Build completed!
goto end

:logs
call :check_docker
echo [INFO] Showing logs from all services...
docker-compose logs -f
goto end

:stop
call :check_docker
echo [INFO] Stopping all services...
docker-compose down
docker-compose -f docker-compose.prod.yaml down 2>nul
echo [SUCCESS] All services stopped!
goto end

:clean
call :check_docker
echo [WARNING] This will remove all containers, networks, and volumes!
set /p confirm="Are you sure? (y/N): "
if /i "!confirm!"=="y" (
    echo [INFO] Cleaning up...
    docker-compose down --volumes --remove-orphans
    docker-compose -f docker-compose.prod.yaml down --volumes --remove-orphans 2>nul
    echo [SUCCESS] Cleanup completed!
) else (
    echo [INFO] Cleanup cancelled
)
goto end

:health
call :check_docker
echo [INFO] Checking health of services...
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo [ERROR] No containers are running
    goto end
)

echo [SUCCESS] Containers are running

REM Check application health
curl -f -s http://localhost:3000/api/health >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Next.js application is not responding
) else (
    echo [SUCCESS] Next.js application is healthy
)

REM Check ChromaDB health
curl -f -s http://localhost:8000/api/v1/heartbeat >nul 2>nul
if errorlevel 1 (
    echo [ERROR] ChromaDB is not responding
) else (
    echo [SUCCESS] ChromaDB is healthy
)
goto end

:error
echo [ERROR] Command failed!
exit /b 1

:end
endlocal
