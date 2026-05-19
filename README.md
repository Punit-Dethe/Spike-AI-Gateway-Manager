<div align="center">
  <img src="nexusai-electron/assets/icon-256.png" alt="Spike Logo" width="120" height="120">

  # Spike

  **Transform browser-based AI into a standard REST API**

  <p>
    <a href="#quick-start">Quick Start</a> •
    <a href="#cloudflare-tunnel">Public Tunnel</a> •
    <a href="#api-reference">API Reference</a> •
    <a href="API_DOCUMENTATION.md">Documentation</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

---

Spike converts ChatGPT and Google Gemini into OpenAI-compatible APIs that run locally on your machine — and optionally exposes them publicly via a Cloudflare tunnel. No API keys, no usage fees, just your browser session tokens.

```python
import requests

response = requests.post('http://localhost:8000/v1/chat/completions', json={
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Explain quantum computing"}]
})

print(response.json()['choices'][0]['message']['content'])
```

---

## Why Spike

**Free AI Access**  
Use ChatGPT and Gemini without API costs. Perfect for students, researchers, and developers building prototypes.

**Standard API Format**  
OpenAI-compatible endpoints work with existing tools and libraries. Drop-in replacement for OpenAI's API.

**Automatic Provider Routing**  
Switch between ChatGPT and Gemini by changing the model name. No configuration needed.

**Local and Private**  
Everything runs on your machine. Your data never leaves your computer.

**Public Access via Tunnel**  
Expose your local API at a public URL with one click. Share it with teammates or hit it from a hosted project.

**Built-in Testing**  
Test prompts in the integrated chat interface before writing code.

---

## Quick Start

### Installation

1. Download the latest release from [Releases](../../releases)
2. Run `Spike-Setup-1.0.0.exe`
3. Launch Spike from the Start Menu

All Python dependencies are bundled. No separate installation required.

### Configuration

**For ChatGPT:**
1. Visit `https://chatgpt.com/api/auth/session` in your browser
2. Copy the `accessToken` value
3. In Spike: Services → ChatGPT → Configure Token → Paste token

**For Gemini:**
1. Open Developer Tools (F12) on `https://gemini.google.com`
2. Go to Application → Cookies → `gemini.google.com`
3. Copy `__Secure-1PSID` and `__Secure-1PSIDTS` values
4. In Spike: Services → Gemini → Configure Tokens → Paste both

### Start Services

1. Open Spike → Dashboard
2. Click **Start** on the Unified Proxy (and any bridge you need)
3. Wait for the green status indicator

### Make Your First Call

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## Cloudflare Tunnel

Spike can expose your local API at a public `trycloudflare.com` URL — no Cloudflare account, no DNS config, no port forwarding required.

### How It Works

The tunnel forwards requests from a public HTTPS URL to your local Unified Proxy (`localhost:8000`). Anyone with the URL can call your API as if it were a hosted service.

### Setup

1. Open Spike → **Dashboard**
2. In the **Public API Endpoint** card, click **Install Cloudflare Tunnel**
3. Spike downloads the connector (~22 MB) in the background — no admin rights needed
4. Once installed, toggle the switch to **On**
5. Your public URL appears immediately — copy and share it

```
https://your-name-here.trycloudflare.com/v1
```

Use it exactly like the local endpoint:

```python
import requests

response = requests.post('https://your-name-here.trycloudflare.com/v1/chat/completions', json={
    "model": "gemini-2.0-flash",
    "messages": [{"role": "user", "content": "Hello from the internet"}]
})

print(response.json()['choices'][0]['message']['content'])
```

### Things to Know

- **Ephemeral URL** — the URL changes each time you start the tunnel. For a stable URL, use the Local Project Setup to deploy your own server.
- **Toggle anytime** — turn the tunnel on or off from the Dashboard or Services tab. Your preference is saved across sessions.
- **Local still works** — the local endpoint (`localhost:8000`) is always available alongside the public one.
- **Tunnel only wraps the Unified Proxy** — the individual bridges (Gemini, ChatGPT) are not exposed directly.

---

## Local Project Setup

Want to run a standalone Gemini API server without the full Spike app? Use the **Standalone Setup** feature to generate a portable, deployable server with your tokens baked in.

### What You Get

- A self-contained Python server — no connection to Spike at runtime
- OpenAI-compatible API on port 7777
- Four files: everything needed to run anywhere
- One-command install and start

### How to Create

1. Open Spike → **Dashboard** → **Open setup wizard**
2. Enter your Gemini tokens (PSID and PSIDTS)
3. Choose a project folder
4. Click **Create Setup**

### What Gets Created

```
your-folder/
├── gemini_server.py    # API server with your tokens
├── requirements.txt    # Python dependencies
├── setup.py            # One-command installer
└── README.txt          # Documentation
```

### Usage

```bash
cd your-folder
python setup.py
```

The server installs dependencies, starts on `http://localhost:7777`, and tests itself automatically.

### Deployment

The folder is portable and can be deployed to any platform with Python 3.8+:

- Cloud platforms (Heroku, Railway, Render, DigitalOcean)
- Containers (Docker, Kubernetes)
- Any VPS or local network machine

---

## API Reference

### Endpoint

```
POST http://localhost:8000/v1/chat/completions
```

### Request

```json
{
  "model": "gpt-4o",
  "messages": [
    {"role": "user", "content": "Your message"}
  ],
  "temperature": 0.7,
  "max_tokens": 2000
}
```

### Response

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "model": "gpt-4o",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Response text"
    },
    "finish_reason": "stop"
  }]
}
```

### Available Models

**ChatGPT**
- `gpt-4o` — Latest, most capable
- `gpt-4o-mini` — Fast and efficient
- `gpt-4-turbo`, `gpt-4`, `gpt-3.5-turbo`
- `o1`, `o1-mini`, `o1-pro` — Advanced reasoning
- `o3-mini`, `o3-mini-high`

**Gemini**
- `gemini-2.0-flash` — Balanced (recommended)
- `gemini-3-flash` — Fastest
- `gemini-3.1-flash` — Enhanced
- `gemini-3.1-pro` — Most capable

### Provider Routing

Spike routes automatically based on model name:
- `gpt-*`, `o1*`, `o3*` → ChatGPT bridge
- `gemini*` → Gemini bridge

No provider parameter needed.

---

## Integration Examples

### Python

```python
import requests

def chat(message, model="gpt-4o", base_url="http://localhost:8000"):
    response = requests.post(
        f'{base_url}/v1/chat/completions',
        json={
            "model": model,
            "messages": [{"role": "user", "content": message}]
        }
    )
    return response.json()['choices'][0]['message']['content']

# Local
answer = chat("What is Python?")

# Public tunnel
answer = chat("What is Python?", base_url="https://your-name.trycloudflare.com")
```

### OpenAI Python Library

```python
from openai import OpenAI

# Local
client = OpenAI(base_url="http://localhost:8000/v1", api_key="not-needed")

# Public tunnel
client = OpenAI(base_url="https://your-name.trycloudflare.com/v1", api_key="not-needed")

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}]
)

print(response.choices[0].message.content)
```

### JavaScript

```javascript
async function chat(message, model = 'gpt-4o', baseUrl = 'http://localhost:8000') {
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: message }]
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}
```

---

## Architecture

Spike runs three local services:

| Service | Port | Role |
|---------|------|------|
| Unified Proxy | 8000 | Routes requests by model name. This is the main endpoint. |
| Gemini | 6969 | Connects to Google Gemini via browser session tokens. |
| ChatGPT | 5005 | Bridges the ChatGPT web interface to API format. |

The optional **Cloudflare Tunnel** wraps the Unified Proxy and exposes it at a public HTTPS URL. The bridges themselves remain local.

---

## Troubleshooting

**Services won't start**  
Use the **Kill** button in the Services tab to force-terminate any process holding the port, then click **Start** again.

**Authentication errors**  
Update your tokens in the Services tab. Tokens expire periodically. After updating, restart the affected service.

**Tunnel URL not appearing**  
Make sure the Unified Proxy is running before starting the tunnel. The tunnel needs a live local service to connect to.

**Slow responses**  
Try a faster model (`gemini-3-flash` or `gpt-4o-mini`). Check your internet connection.

**Connection refused**  
Ensure services show a green status in the Dashboard. If not, click Stop then Start to restart them.

**View detailed logs**  
Open the **Logs** tab in Spike. Use Export to share logs when reporting issues.

---

## Development

### Prerequisites

- Windows 10/11 (64-bit)
- Node.js 16+
- Python 3.8+ (for building only)

### Build from Source

```bash
git clone https://github.com/yourusername/spike.git
cd spike/nexusai-electron

npm install
npm run dev          # Development mode
build-standalone.bat # Production build (bundles Python)
```

### Project Structure

```
spike/
├── nexusai-electron/
│   ├── electron/       # Main process + IPC handlers
│   ├── src/            # React frontend
│   ├── python/         # Backend services
│   │   ├── nexusai/    # Unified proxy
│   │   └── services/   # Gemini and ChatGPT bridges
│   └── assets/         # Icons
├── gemini-server/      # Spike Lite (standalone Gemini gateway)
└── docs/               # Documentation
```

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Acknowledgments

Built with Electron, React, FastAPI, and Python. Thanks to the Chat2API project for the ChatGPT bridge implementation.

---

## Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/spike/issues)
- **Docs:** [API Documentation](API_DOCUMENTATION.md) · [Command Reference](COMMAND_REFERENCE.md) · [User Guide](nexusai-electron/USER_GUIDE.md)
