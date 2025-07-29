@echo off
echo Starting local development (non-Docker)...

echo Checking environment configuration...
if not exist .env.local (
    echo Creating .env.local from development example...
    copy .env.development.example .env.local
    echo.
    echo IMPORTANT: Please edit .env.local with your actual API keys!
    echo See ENV_SETUP.md for detailed instructions.
    echo.
    pause
)

echo Checking if ChromaDB is needed...
echo You can either:
echo 1. Run ChromaDB in Docker: docker run -p 8000:8000 chromadb/chroma
echo 2. Or start the full development stack: start-development.bat
echo.

echo Installing dependencies...
npm install

echo Building the application...
npm run build
if %errorlevel% neq 0 (
    echo Build failed! Please fix errors before starting.
    pause
    exit /b 1
)

echo Starting development server...
echo Application will be available at: http://localhost:3000
echo.
npm run dev

pause
