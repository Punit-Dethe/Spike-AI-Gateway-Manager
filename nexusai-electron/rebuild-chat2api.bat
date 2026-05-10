@echo off
echo ========================================
echo Rebuilding Chat2API with Updated tiktoken
echo ========================================
echo.

cd python\services\chat2api

echo [1/3] Installing dependencies with updated tiktoken...
python -m pip install -r requirements.txt --upgrade
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Installing PyInstaller...
python -m pip install pyinstaller
if errorlevel 1 (
    echo ERROR: Failed to install PyInstaller
    pause
    exit /b 1
)

echo.
echo [3/3] Building executable...
pyinstaller chat2api.spec --clean
if errorlevel 1 (
    echo ERROR: Failed to build executable
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Chat2API rebuilt successfully
echo ========================================
echo.
echo Executable location: dist\chat2api.exe
echo.
echo Next steps:
echo 1. Copy dist\chat2api.exe to ..\..\..\bin\chat2api.exe
echo 2. Rebuild Spike installer: npm run build
echo.
pause
