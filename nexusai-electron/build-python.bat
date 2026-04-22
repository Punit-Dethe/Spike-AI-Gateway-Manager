@echo off
echo ========================================
echo Building Python Services
echo ========================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.11 or higher
    pause
    exit /b 1
)

REM Check if PyInstaller is installed
pip show pyinstaller >nul 2>&1
if errorlevel 1 (
    echo Installing PyInstaller...
    pip install pyinstaller
)

echo.
echo Building Gemini Service...
cd python\services\gemini
pyinstaller --onefile --name gemini_server --hidden-import=gemini_webapi --hidden-import=fastapi --hidden-import=uvicorn --collect-all gemini_webapi --collect-all fastapi --collect-all uvicorn gemini_server.py
cd ..\..\..

echo.
echo Building Chat2API Service...
cd python\services\chat2api
pyinstaller --onefile --name chat2api --hidden-import=fastapi --hidden-import=uvicorn --add-data "data;data" --add-data "templates;templates" --collect-all fastapi --collect-all uvicorn app.py
cd ..\..\..

echo.
echo Building Unified Proxy...
cd python\nexusai\core
pyinstaller --onefile --name unified_proxy --hidden-import=fastapi --hidden-import=uvicorn --collect-all fastapi --collect-all uvicorn unified_proxy_standalone.py
cd ..\..\..

echo.
echo ========================================
echo Python services built successfully!
echo Executables are in dist folders
echo ========================================
pause
