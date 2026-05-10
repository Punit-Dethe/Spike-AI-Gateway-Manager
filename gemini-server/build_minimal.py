"""
Minimal build script - only includes necessary dependencies
"""

import PyInstaller.__main__
from pathlib import Path

def build():
    """Build the executable with minimal dependencies"""
    print("Building Spike Lite (minimal) executable...")
    
    # Get paths
    logo_path = Path(__file__).parent / "logo.png"
    
    # PyInstaller arguments - MINIMAL
    args = [
        'tray_app.py',
        '--name=SpikeLite',
        '--onefile',
        '--noconsole',  # No terminal window - system tray only
        '--windowed',
        f'--icon={logo_path}' if logo_path.exists() else '--icon=NONE',
        
        # Data files
        '--add-data=static;static',
        '--add-data=server.py;.',
        '--add-data=logo.png;.',
        '--add-data=logo-trans.png;.',
        
        # Only include what we need
        '--hidden-import=uvicorn.logging',
        '--hidden-import=uvicorn.loops.auto',
        '--hidden-import=uvicorn.protocols.http.auto',
        '--hidden-import=uvicorn.protocols.http.h11_impl',
        '--hidden-import=uvicorn.protocols.websockets.auto',
        '--hidden-import=uvicorn.lifespan.on',
        '--hidden-import=requests',
        
        # Collect only essential packages
        '--collect-all=gemini_webapi',
        '--collect-all=curl_cffi',
        '--collect-all=pystray',
        
        # EXCLUDE heavy packages we don't need
        '--exclude-module=torch',
        '--exclude-module=torchvision',
        '--exclude-module=torchaudio',
        '--exclude-module=tensorflow',
        '--exclude-module=scipy',
        '--exclude-module=pandas',
        '--exclude-module=numpy',
        '--exclude-module=sklearn',
        '--exclude-module=cv2',
        '--exclude-module=matplotlib',
        '--exclude-module=PIL.ImageQt',
        '--exclude-module=PyQt5',
        '--exclude-module=PyQt6',
        '--exclude-module=PySide2',
        '--exclude-module=PySide6',
        '--exclude-module=tkinter',
        '--exclude-module=jupyter',
        '--exclude-module=notebook',
        '--exclude-module=IPython',
        '--exclude-module=pytest',
        '--exclude-module=setuptools',
        '--exclude-module=wheel',
        '--exclude-module=pip',
    ]
    
    # Run PyInstaller
    PyInstaller.__main__.run(args)
    
    print("\n✅ Build complete!")
    print(f"📦 Executable: dist/SpikeLite.exe")
    print(f"📊 Size: Should be ~40-50 MB (not 500+ MB!)")
    print(f"📝 Log file will be in: %TEMP%\\spike_lite.log")
    print("\nTo run: dist\\SpikeLite.exe")
    print("\nConsole window will show for debugging.")

if __name__ == "__main__":
    build()
