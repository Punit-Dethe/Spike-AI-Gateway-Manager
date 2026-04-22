@echo off
echo ========================================
echo NexusAI Gateway - Development Setup
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found: 
node --version

REM Check Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed
    echo Please install from: https://www.python.org/
    pause
    exit /b 1
)
echo [OK] Python found: 
python --version

echo.
echo Installing dependencies...
echo.

REM Install Node.js dependencies
echo [1/2] Installing Node.js packages...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install Node.js dependencies
    pause
    exit /b 1
)

REM Install Python dependencies
echo [2/2] Installing Python packages...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo To start development:
echo   npm run dev
echo.
echo To build installer:
echo   build.bat
echo.
pause
