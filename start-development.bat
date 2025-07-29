@echo off
echo Starting development environment...

echo Checking environment configuration...
if not exist .env.local (
    echo WARNING: .env.local not found!
    echo Please copy the appropriate example file:
    echo.
    echo For local development: copy .env.development.example .env.local
    echo For Docker development: copy .env.docker.example .env.local
    echo.
    echo Then edit .env.local with your actual API keys.
    echo See ENV_SETUP.md for detailed instructions.
    echo.
    pause
    exit /b 1
)

echo Stopping any existing containers...
docker compose down

echo Building and starting development containers...
docker compose up -d --build

echo Development environment ready!
echo Application available at: http://localhost:3000
echo ChromaDB available at: http://localhost:8000

echo.
echo To check container status:
echo docker compose ps
echo.
echo To view logs:
echo docker compose logs -f
echo.
echo To stop:
echo docker compose down

pause
