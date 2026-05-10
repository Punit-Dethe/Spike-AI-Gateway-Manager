# Gemini API Server

OpenAI-compatible API server for Google Gemini using cookie authentication.

## Features

- ✅ **System Tray App** - Runs in background with tray icon
- ✅ **Web Dashboard** - Beautiful web interface for configuration
- ✅ **OpenAI Compatible** - Works with any OpenAI client
- ✅ **Lightweight** - ~35-40 MB memory usage
- ✅ **No API Key Needed** - Uses browser cookies

## Quick Start

### Option 1: Run from Source

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Run the app**:
```bash
python tray_app.py
```

3. **Configure**:
   - Tray icon appears
   - Browser opens automatically
   - Enter your Gemini cookies
   - Click "Initialize Client"

### Option 2: Build Executable

1. **Build**:
```bash
python build.py
```

2. **Run**:
```bash
dist/GeminiServer.exe
```

## How to Get Cookies

1. Go to https://gemini.google.com
2. Sign in with your Google account
3. Open DevTools (F12) → Application → Cookies
4. Copy `__Secure-1PSID` and `__Secure-1PSIDTS`
5. Paste into the web dashboard

## API Usage

### Endpoint
```
http://localhost:6969
```

### Example (Python)
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:6969/v1",
    api_key="dummy"  # Not used, but required by client
)

response = client.chat.completions.create(
    model="gemini-2.0-flash",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)
```

### Example (curl)
```bash
curl http://localhost:6969/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.0-flash",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Available Models

- `gemini-3-flash`
- `gemini-3.1-flash`
- `gemini-3.1-pro`
- `gemini-2.0-flash`

## System Requirements

- Windows 10/11
- Python 3.8+ (for source)
- 50 MB disk space
- 40 MB RAM

## Architecture

```
System Tray App (Python)
    ↓
FastAPI Server (port 6969)
    ↓
gemini-webapi Library
    ↓
Google Gemini API
```

## Troubleshooting

### Tokens not working
- Make sure cookies are fresh (< 24 hours)
- Copy the ENTIRE cookie value
- Try getting new cookies

### Server won't start
- Check if port 6969 is available
- Try running as administrator

### Client initialization fails
- Verify cookies are correct
- Check internet connection
- Make sure Gemini works in your browser

## License

MIT License - Free to use and modify

## Credits

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Uses [gemini-webapi](https://github.com/HanaokaYuzu/Gemini-API)
- System tray with [pystray](https://github.com/moses-palmer/pystray)
