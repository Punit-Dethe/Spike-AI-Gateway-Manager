@echo off
echo ========================================
echo Building Spike with Bundled Python
echo ========================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from python.org
    echo During installation, check "Add Python to PATH"
    pause
    exit /b 1
)

echo.
echo Step 1: Installing Python dependencies...
python -m pip install --upgrade pip
python -m pip install pyinstaller fastapi uvicorn httpx pydantic requests gemini-webapi curl-cffi python-multipart

echo.
echo Step 2: Building Chat2API executable...
cd python\services\chat2api
if exist dist rmdir /s /q dist
if exist build rmdir /s /q build
python -m PyInstaller chat2api.spec
if errorlevel 1 (
    echo ERROR: Failed to build Chat2API
    cd ..\..\..
    pause
    exit /b 1
)
cd ..\..\..

echo.
echo Step 3: Building Gemini Server executable...
cd python\services\gemini
if exist dist rmdir /s /q dist
if exist build rmdir /s /q build
python -m PyInstaller gemini_server.spec
if errorlevel 1 (
    echo ERROR: Failed to build Gemini Server
    cd ..\..\..
    pause
    exit /b 1
)
cd ..\..\..

echo.
echo Step 4: Building Unified Proxy executable...
cd python\nexusai\core
if exist dist rmdir /s /q dist
if exist build rmdir /s /q build
python -m PyInstaller unified_proxy.spec
if errorlevel 1 (
    echo ERROR: Failed to build Unified Proxy
    cd ..\..\..
    pause
    exit /b 1
)
cd ..\..\..

echo.
echo Step 5: Copying executables to bin directory...
if not exist bin mkdir bin
copy python\services\chat2api\dist\chat2api.exe bin\
copy python\services\gemini\dist\gemini_server.exe bin\
copy python\nexusai\core\dist\unified_proxy.exe bin\

echo.
echo Step 6: Building Electron app...
call npm run build:vite
if errorlevel 1 (
    echo ERROR: Failed to build Vite frontend
    pause
    exit /b 1
)

echo.
echo Step 7: Building Electron installer...
call npm run build:electron
if errorlevel 1 (
    echo ERROR: Failed to build Electron installer
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Standalone executables created in bin\
echo Installer created in dist-installer\
echo.
pause
