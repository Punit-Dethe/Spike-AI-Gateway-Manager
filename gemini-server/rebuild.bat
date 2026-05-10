@echo off
echo Stopping any running SpikeLite instances...
taskkill /F /IM SpikeLite.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Rebuilding SpikeLite...
python build_minimal.py

echo.
echo Done! You can now run dist\SpikeLite.exe
pause
