@echo off
echo Deploying to production...

echo Checking environment configuration...
if not exist .env.local (
    echo ERROR: .env.local not found!
    echo Please copy the production example: copy .env.production.example .env.local
    echo Then edit .env.local with your production settings.
    echo See ENV_SETUP.md for detailed instructions.
    echo.
    pause
    exit /b 1
)

echo Checking for production-specific settings...
findstr /C:"your_domain.com" .env.local >nul
if %errorlevel% equ 0 (
    echo WARNING: Please update NEXT_PUBLIC_APP_URL in .env.local with your actual domain!
)

findstr /C:"your_.*_key_here" .env.local >nul
if %errorlevel% equ 0 (
    echo WARNING: Please update API keys in .env.local with your actual keys!
)

echo Press Ctrl+C if npm dev is running, then run this script again.
pause

echo Building the application...
npm run build
if %errorlevel% neq 0 (
    echo Build failed! Please fix errors before deploying.
    pause
    exit /b 1
)

echo Stopping existing Docker containers...
docker compose down

echo Starting production containers...
docker compose -f docker-compose.prod.yaml up -d --build

echo Deployment complete!
echo Application available at: http://localhost:3000
echo ChromaDB available at: http://localhost:8000

echo.
echo IMPORTANT: Update your DNS to point to this server!
echo.
echo To check container status:
echo docker compose -f docker-compose.prod.yaml ps
echo.
echo To view logs:
echo docker compose -f docker-compose.prod.yaml logs -f
echo.
echo To stop:
echo docker compose -f docker-compose.prod.yaml down

pause
