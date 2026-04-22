# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

import os
import sys
import site

# Find the site-packages directory
site_packages = [p for p in site.getsitepackages() if 'site-packages' in p][0]

a = Analysis(
    ['app.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('data', 'data'),
        ('templates', 'templates'),
        ('version.txt', '.'),
        # Include python-multipart compatibility loader files
        (os.path.join(site_packages, '_python_multipart_loader.py'), '.'),
    ],
    hiddenimports=[
        'fastapi',
        'uvicorn',
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'pydantic',
        'httpx',
        'starlette',
        'jinja2',
        'curl_cffi',
        'curl_cffi.requests',
        'websockets',
        'tiktoken',
        'PIL',
        'PIL.Image',
        'pybase64',
        'diskcache',
        'apscheduler',
        'ua_generator',
        'jwt',
        'multipart',
        'python_multipart',
        'python_multipart.multipart',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=['pyi_rth_multipart.py'],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='chat2api',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
