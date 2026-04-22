# NexusAI Gateway - User Guide

Welcome to NexusAI Gateway! This guide will help you get started with your AI gateway manager.

## What is NexusAI Gateway?

NexusAI Gateway is a desktop application that provides a unified interface to multiple AI services:

- **ChatGPT** (via Chat2API)
- **Google Gemini** (via Gemini Bridge)
- **Unified API** - Single endpoint for all AI models

## Installation

### System Requirements

- **Operating System**: Windows 10/11 (64-bit)
- **Python**: 3.8 or higher
- **RAM**: 4GB minimum
- **Disk Space**: 500MB free space

### Installation Steps

1. **Download** the installer: `NexusAI Gateway-Setup-1.0.0.exe`

2. **Run** the installer
   - Double-click the downloaded file
   - If Windows SmartScreen appears, click "More info" → "Run anyway"

3. **Follow** the installation wizard
   - Choose installation directory (default: `C:\Program Files\NexusAI Gateway`)
   - Select shortcuts (Desktop and Start Menu recommended)
   - Click "Install"

4. **Python Check**
   - The installer will check for Python
   - If Python is not found, you'll be prompted to install it
   - Download Python from: https://www.python.org/downloads/
   - ⚠️ **Important**: Check "Add Python to PATH" during Python installation

5. **Dependency Installation**
   - The installer automatically installs required Python packages
   - This may take 2-5 minutes depending on your internet speed

6. **Launch**
   - Click "Finish" to launch NexusAI Gateway
   - Or use the desktop shortcut

## First-Time Setup

### Overview

NexusAI Gateway has three main services:

1. **Unified Proxy** (Port 8000) - Main gateway that routes requests
2. **Gemini Bridge** (Port 6969) - Connects to Google Gemini
3. **Chat2API** (Port 5005) - Connects to ChatGPT

### Quick Start

#### Option 1: Use ChatGPT Only

1. Go to **Services** tab
2. Click **Configure** on **Chat2API**
3. Follow the 2-step process:
   - **Step 1**: Click "Copy URL" and open it in your browser
   - Copy the access token from the browser
   - **Step 2**: Click "Open Token Management"
   - Paste your token in the text area
   - Click "Upload Tokens"
4. Go back to NexusAI Gateway
5. Click **Start** on **Chat2API**
6. Click **Start** on **Unified Proxy**
7. Done! Your API is available at `http://localhost:8000/v1`

#### Option 2: Use Google Gemini Only

1. Go to **Services** tab
2. Click **Configure** on **Gemini Bridge**
3. Enter your Google session tokens:
   - **PSID**: Your Google PSID cookie
   - **PSIDTS**: Your Google PSIDTS cookie
   - (See "Getting Gemini Tokens" section below)
4. Click **Save Tokens**
5. Click **Start** on **Gemini Bridge**
6. Click **Start** on **Unified Proxy**
7. Done! Your API is available at `http://localhost:8000/v1`

#### Option 3: Use Both Services

Follow both Option 1 and Option 2, then start all three services.

## Using the Chat Interface

1. Go to **Chat** tab
2. Select your AI provider (ChatGPT or Gemini)
3. Select a model
4. Click **Start Chat**
5. Type your message and press Enter

## Getting Tokens

### ChatGPT Token

1. Open your browser
2. Go to: `https://chatgpt.com/api/auth/session`
3. Log in to ChatGPT if needed
4. Copy the `accessToken` value from the JSON response
5. Paste it in Chat2API token management

### Gemini Tokens (PSID & PSIDTS)

1. Open Chrome/Edge browser
2. Go to: `https://gemini.google.com/`
3. Log in to your Google account
4. Open Developer Tools (F12)
5. Go to **Application** tab → **Cookies** → `https://gemini.google.com`
6. Find and copy:
   - `__Secure-1PSID` → This is your **PSID**
   - `__Secure-1PSIDTS` → This is your **PSIDTS**
7. Paste them in NexusAI Gateway

## API Usage

Once services are running, you can use the unified API:

### Endpoint

```
http://localhost:8000/v1/chat/completions
```

### Example Request (cURL)

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

### Example Request (Python)

```python
import requests

response = requests.post(
    "http://localhost:8000/v1/chat/completions",
    json={
        "model": "gpt-4o",
        "messages": [
            {"role": "user", "content": "Hello!"}
        ]
    }
)

print(response.json())
```

### Available Models

**ChatGPT Models:**
- `gpt-4o`
- `gpt-4o-mini`
- `gpt-4-turbo`
- `gpt-4`
- `gpt-3.5-turbo`
- `o1`
- `o1-mini`
- `o1-pro`
- `o3-mini`
- `o3-mini-high`

**Gemini Models:**
- `gemini-3-flash` (default)
- `gemini-2.0-flash`
- `gemini-3.1-flash`
- `gemini-3.1-pro`

## Troubleshooting

### Services Won't Start

**Problem**: Service shows "Error" status

**Solutions**:
1. Check if the port is already in use
2. Click **Stop** then **Start** again
3. Restart NexusAI Gateway
4. Check if Python is installed: Open Command Prompt and type `python --version`

### "Port Already in Use" Error

**Problem**: Port 8000, 5005, or 6969 is already in use

**Solutions**:
1. Close other applications using these ports
2. Restart your computer
3. Use Task Manager to end processes using these ports

### Chat2API Token Not Working

**Problem**: Token is rejected or expired

**Solutions**:
1. Get a fresh token from `https://chatgpt.com/api/auth/session`
2. Make sure you're logged in to ChatGPT
3. Try logging out and back in to ChatGPT
4. Clear your browser cookies and log in again

### Gemini Bridge Not Working

**Problem**: Gemini tokens are invalid

**Solutions**:
1. Get fresh PSID and PSIDTS cookies
2. Make sure you're logged in to Google
3. Try using an incognito/private browser window
4. Check that cookies are from `gemini.google.com`

### Python Not Found

**Problem**: Installer says Python is not installed

**Solutions**:
1. Download Python from https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. Restart your computer
4. Run the NexusAI installer again

## Advanced Usage

### Using with Other Applications

You can use NexusAI Gateway with any application that supports OpenAI-compatible APIs:

- **Continue.dev** (VS Code extension)
- **Open WebUI**
- **LibreChat**
- **Custom applications**

Just point them to: `http://localhost:8000/v1`

### Running on Startup

To start NexusAI Gateway automatically:

1. Press `Win + R`
2. Type `shell:startup` and press Enter
3. Create a shortcut to NexusAI Gateway in this folder

### Changing Ports

Ports are configured in the application code. To change them:

1. Navigate to installation directory
2. Edit `electron/main.js`
3. Find `serviceConfig` and change port numbers
4. Restart NexusAI Gateway

## Uninstallation

1. Go to **Settings** → **Apps** → **Installed apps**
2. Find "NexusAI Gateway"
3. Click **Uninstall**
4. Follow the uninstallation wizard

## Privacy & Security

- **Local Only**: All services run locally on your computer
- **No Data Collection**: NexusAI Gateway doesn't collect or send your data
- **Token Storage**: Tokens are stored locally in configuration files
- **Network**: Only communicates with AI services you configure

## Support

### Getting Help

- Check this user guide
- Review the troubleshooting section
- Check application logs in the installation directory

### Reporting Issues

When reporting issues, include:
- Windows version
- Python version (`python --version`)
- Error messages from the application
- Steps to reproduce the problem

## Updates

To update NexusAI Gateway:

1. Download the latest installer
2. Run the new installer
3. It will automatically update your installation
4. Your configuration and tokens will be preserved

## License

NexusAI Gateway is released under the MIT License.

---

**Enjoy using NexusAI Gateway!** 🚀
