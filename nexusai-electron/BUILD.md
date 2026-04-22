# NexusAI Gateway - Build & Distribution Guide

This guide explains how to build a production-ready Windows installer for NexusAI Gateway.

## Prerequisites

### Required Software

1. **Node.js 18+**
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **Python 3.8+**
   - Download: https://www.python.org/downloads/
   - ⚠️ **Important**: Check "Add Python to PATH" during installation
   - Verify: `python --version`

3. **Git** (for cloning dependencies)
   - Download: https://git-scm.com/
   - Verify: `git --version`

### System Requirements

- Windows 10/11 (64-bit)
- 4GB RAM minimum
- 2GB free disk space

## Build Process

### Option 1: Automated Build (Recommended)

Simply run the build script:

```bash
build.bat
```

This will:
1. Install Node.js dependencies
2. Build the React frontend
3. Install Python dependencies
4. Create the Windows installer

The installer will be created in `dist-installer/` folder.

### Option 2: Manual Build

If you prefer to build step-by-step:

```bash
# 1. Install Node.js dependencies
npm install

# 2. Build React frontend
npm run build:vite

# 3. Install Python dependencies
python -m pip install -r requirements.txt

# 4. Build Windows installer
npm run build:electron
```

## Installer Output

After successful build, you'll find:

```
dist-installer/
└── NexusAI Gateway-Setup-1.0.0.exe
```

## Distribution

### For End Users

The installer (`NexusAI Gateway-Setup-1.0.0.exe`) is a standalone executable that:

1. **Checks for Python** - Prompts user to install Python if not found
2. **Installs Dependencies** - Automatically installs all required Python packages
3. **Creates Shortcuts** - Adds desktop and start menu shortcuts
4. **Configures Services** - Sets up Chat2API and Gemini Bridge

### Installation Steps for Users

1. **Download** the installer
2. **Run** `NexusAI Gateway-Setup-1.0.0.exe`
3. **Follow** the installation wizard
4. **Launch** NexusAI Gateway from desktop or start menu

## First-Time Setup

After installation, users need to:

### 1. Configure Gemini Bridge (Optional)

- Open NexusAI Gateway
- Go to **Services** tab
- Click **Configure** on Gemini Bridge
- Enter PSID and PSIDTS tokens
- Click **Save Tokens**

### 2. Configure Chat2API (Optional)

- Go to **Services** tab
- Click **Configure** on Chat2API
- Click **Copy URL** to get the token URL
- Open the URL in browser and copy the access token
- Click **Open Token Management**
- Paste the token in the Chat2API interface

### 3. Start Services

- Start **Gemini Bridge** (if configured)
- Start **Chat2API** (if configured)
- Start **Unified Proxy** (main service)

## Troubleshooting Build Issues

### "Node.js not found"

- Install Node.js from https://nodejs.org/
- Restart your terminal/command prompt
- Verify with `node --version`

### "Python not found"

- Install Python from https://www.python.org/
- Make sure "Add Python to PATH" was checked during installation
- Restart your terminal/command prompt
- Verify with `python --version`

### "npm install fails"

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rmdir /s /q node_modules
del package-lock.json

# Reinstall
npm install
```

### "Python dependencies fail"

```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies with verbose output
python -m pip install -r requirements.txt --verbose
```

### "electron-builder fails"

- Make sure you have created an icon file at `assets/icon.ico`
- Check that all files in `python/` directory are accessible
- Try running with administrator privileges

## Icon Requirements

The installer needs an icon file:

- **Location**: `assets/icon.ico`
- **Format**: ICO (Windows Icon)
- **Sizes**: 256x256, 128x128, 64x64, 48x48, 32x32, 16x16
- **Tool**: Use online converters or tools like GIMP to create ICO files

## Advanced Configuration

### Customizing the Installer

Edit `electron-builder.yml` to customize:

- Application name
- Installation directory
- Shortcuts
- License agreement
- Installer appearance

### Code Signing (Optional)

For production distribution, consider code signing:

1. Obtain a code signing certificate
2. Add to `electron-builder.yml`:

```yaml
win:
  certificateFile: path/to/certificate.pfx
  certificatePassword: your-password
```

## File Size Optimization

The installer includes:
- Electron runtime (~150MB)
- React application (~5MB)
- Python services (~10MB)
- Node modules (bundled)

**Total size**: ~200-250MB

To reduce size:
- Remove unused Python packages from `requirements.txt`
- Use `asar` packing (enabled by default)
- Remove development dependencies

## Updating the Application

To release a new version:

1. Update version in `package.json`
2. Rebuild: `build.bat`
3. Distribute new installer

The installer will:
- Uninstall previous version
- Install new version
- Preserve user configuration

## Support

For build issues:
- Check the build logs in the terminal
- Verify all prerequisites are installed
- Ensure you have administrator privileges
- Check disk space availability

## License

MIT License - See LICENSE.txt for details
