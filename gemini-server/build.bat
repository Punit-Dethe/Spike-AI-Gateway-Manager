@echo off
echo ========================================
echo   Spike Lite - Build Executable
echo ========================================
echo.
echo Building standalone executable...
echo This may take a few minutes...
echo.
python build.py
echo.
echo ========================================
echo Build complete!
echo Executable: dist\SpikeLite.exe
echo ========================================
echo.
pause
