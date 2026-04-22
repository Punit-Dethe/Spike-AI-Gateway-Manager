# Quick Command Reference

All the commands you need for NexusAI Gateway development and distribution.

## 🚀 Quick Start

```bash
# First time setup
setup.bat

# Start development
npm run dev

# Build installer
build.bat
```

---

## 📦 Installation & Setup

### Initial Setup (First Time)
```bash
# Automated setup (recommended)
setup.bat

# Manual setup
npm install
python -m pip install -r requirements.txt
```

### Check Prerequisites
```bash
# Check Node.js
node --version

# Check Python
python --version

# Check npm
npm --version

# Check Git
git --version
```

---

## 💻 Development

### Start Development Server
```bash
# Start both Vite and Electron
npm run dev

# Start only Vite (frontend)
npm run dev:vite

# Start only Electron (after Vite is running)
electron .
```

### Development Tasks
```bash
# Install new npm package
npm install <package-name>

# Install new Python package
python -m pip install <package-name>

# Update requirements.txt
python -m pip freeze > requirements.txt

# Clear cache
npm cache clean --force
```

---

## 🔨 Building

### Build Frontend Only
```bash
npm run build:vite
```

### Build Installer Only
```bash
npm run build:electron
```

### Full Build (Automated)
```bash
# Windows
build.bat

# Manual (all steps)
npm install
npm run build:vite
python -m pip install -r requirements.txt
npm run build:electron
```

### Clean Build
```bash
# Remove build artifacts
rmdir /s /q dist
rmdir /s /q dist-installer
rmdir /s /q node_modules

# Fresh install
npm install
npm run build
```

---

## 🧪 Testing

### Test Development Build
```bash
npm run dev
# Then test in the opened window
```

### Test Production Build
```bash
# Build installer
build.bat

# Install on clean Windows machine
# Test all features
```

### Test Python Services
```bash
# Test Gemini Bridge
cd python/services/gemini
python gemini_server.py

# Test Chat2API
cd python/services/chat2api
python app.py

# Test Unified Proxy
cd python/nexusai/core
python unified_proxy_standalone.py
```

---

## 📝 Code Quality

### Linting
```bash
# Run ESLint (if configured)
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Type Checking
```bash
# Run TypeScript compiler
npx tsc --noEmit
```

### Format Code
```bash
# Format with Prettier (if configured)
npm run format
```

---

## 🔧 Maintenance

### Update Dependencies
```bash
# Update npm packages
npm update

# Update specific package
npm update <package-name>

# Update Python packages
python -m pip install --upgrade -r requirements.txt

# Update pip itself
python -m pip install --upgrade pip
```

### Check for Outdated Packages
```bash
# Check npm packages
npm outdated

# Check Python packages
python -m pip list --outdated
```

### Security Audit
```bash
# Audit npm packages
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## 📦 Distribution

### Create Release Build
```bash
# 1. Update version in package.json
# 2. Build installer
build.bat

# 3. Test installer
# Install on clean machine

# 4. Create GitHub release
# Upload dist-installer/NexusAI Gateway-Setup-1.0.0.exe
```

### Version Management
```bash
# Bump patch version (1.0.0 → 1.0.1)
npm version patch

# Bump minor version (1.0.0 → 1.1.0)
npm version minor

# Bump major version (1.0.0 → 2.0.0)
npm version major
```

---

## 🐛 Debugging

### View Logs
```bash
# Electron logs (in dev mode)
# Check the terminal where you ran npm run dev

# Python service logs
# Check the Services tab in the app
```

### Debug Mode
```bash
# Start with DevTools open
npm run dev
# DevTools opens automatically in development
```

### Check Ports
```bash
# Check if port is in use
netstat -ano | findstr :8000
netstat -ano | findstr :5005
netstat -ano | findstr :6969

# Kill process on port
taskkill /F /PID <process-id>
```

---

## 🗂️ File Operations

### Clean Project
```bash
# Remove build artifacts
rmdir /s /q dist
rmdir /s /q dist-installer

# Remove dependencies
rmdir /s /q node_modules

# Remove Python cache
for /d /r . %d in (__pycache__) do @if exist "%d" rmdir /s /q "%d"
del /s /q *.pyc
```

### Backup Project
```bash
# Create backup (exclude node_modules and build artifacts)
xcopy /E /I /EXCLUDE:exclude.txt . ..\nexusai-backup\
```

---

## 🌐 Git Operations

### Initial Setup
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <repository-url>
git push -u origin main
```

### Daily Workflow
```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Description of changes"

# Push
git push

# Pull latest
git pull
```

### Create Release
```bash
# Create tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag
git push origin v1.0.0

# Create GitHub release from tag
# Upload installer to release
```

---

## 🔍 Troubleshooting Commands

### Node.js Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall node_modules
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Python Issues
```bash
# Reinstall Python packages
python -m pip uninstall -r requirements.txt -y
python -m pip install -r requirements.txt

# Check Python path
where python

# Check installed packages
python -m pip list
```

### Build Issues
```bash
# Clean and rebuild
rmdir /s /q dist
rmdir /s /q dist-installer
npm run build:vite
npm run build:electron
```

### Port Conflicts
```bash
# Find process using port
netstat -ano | findstr :8000

# Kill process
taskkill /F /PID <pid>

# Or restart computer
shutdown /r /t 0
```

---

## 📊 Useful Checks

### Project Health
```bash
# Check all prerequisites
node --version && python --version && git --version

# Check project structure
tree /F

# Check file sizes
dir /s
```

### Performance
```bash
# Check build size
dir dist-installer

# Check installed size
dir "C:\Program Files\NexusAI Gateway" /s
```

---

## 🎯 Common Workflows

### Daily Development
```bash
1. git pull
2. npm run dev
3. Make changes
4. Test
5. git add .
6. git commit -m "message"
7. git push
```

### Release Workflow
```bash
1. Update version in package.json
2. Update CHANGELOG.md
3. build.bat
4. Test installer
5. git tag v1.0.0
6. git push origin v1.0.0
7. Create GitHub release
8. Upload installer
```

### Bug Fix Workflow
```bash
1. Reproduce bug
2. Fix code
3. Test fix
4. npm run build
5. Test installer
6. Commit and push
```

---

## 💡 Pro Tips

```bash
# Run multiple commands
npm run build:vite && npm run build:electron

# Run command in background
start /B npm run dev

# Open folder in Explorer
explorer .

# Open in VS Code
code .

# Quick test build
npm run build:vite && electron .
```

---

## 📚 Help Commands

```bash
# npm help
npm help

# electron-builder help
npx electron-builder --help

# Python help
python --help

# Git help
git --help
```

---

**Bookmark this page for quick reference!** 🔖
