@echo off
echo Setting up portable Python environment...

REM Create python-embed directory if it doesn't exist
if not exist "python-embed" mkdir python-embed

REM Download Python embeddable package (3.11.9)
echo Downloading Python embeddable package...
curl -L -o python-embed.zip https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip

REM Extract Python
echo Extracting Python...
tar -xf python-embed.zip -C python-embed
del python-embed.zip

REM Download get-pip.py
echo Downloading pip installer...
curl -L -o python-embed/get-pip.py https://bootstrap.pypa.io/get-pip.py

REM Uncomment import site in python311._pth
echo Configuring Python paths...
cd python-embed
powershell -Command "(Get-Content python311._pth) -replace '#import site', 'import site' | Set-Content python311._pth"

REM Install pip
echo Installing pip...
python.exe get-pip.py

REM Install dependencies
echo Installing Python dependencies...
python.exe -m pip install -r ../requirements.txt

cd ..
echo.
echo Portable Python setup complete!
echo Python is now in: python-embed\
pause
