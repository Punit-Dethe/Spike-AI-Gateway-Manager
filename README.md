<div align="center">
  <img src="nexusai-electron/assets/icon-256.png" alt="Spike Logo" width="120" height="120">
  
  # Spike
  
  **Transform browser-based AI into a standard REST API**
  
  <p>
    <a href="#quick-start">Quick Start</a> •
    <a href="#api-reference">API Reference</a> •
    <a href="API_DOCUMENTATION.md">Documentation</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

---

Spike converts ChatGPT and Google Gemini into OpenAI-compatible APIs that run locally on your machine. No API keys, no usage fees—just your browser session tokens.

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

**Built-in Testing**  
Test prompts in the integrated chat interface before writing code.

---

## Quick Start

### Installation

1. Download the latest release from [Releases](../../releases)
2. Run `Spike-Setup-1.0.0.exe`
3. Launch Spike from the Start Menu

**That's it!** All Python dependencies are bundled. No separate installation required.

### Configuration

**For ChatGPT:**
1. Visit `https://chatgpt.com/api/auth/session` in your browser
2. Copy the `accessToken` value
3. In Spike: Services → Chat2API → Configure Token → Paste token

**For Gemini:**
1. Open Developer Tools (F12) on `https://gemini.google.com`
2. Go to Application → Cookies → `gemini.google.com`
3. Copy `__Secure-1PSID` and `__Secure-1PSIDTS` values
4. In Spike: Services → Gemini Bridge → Configure Tokens → Paste both

### Start Services

1. Open Spike Dashboard
2. Click "Start Services"
3. Wait for green status indicators

### Make API Calls

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

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
  "max_tokens": 2000,
  "stream": false
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

**ChatGPT Models**
- `gpt-4o` - Latest, most capable
- `gpt-4o-mini` - Fast and efficient
- `gpt-4-turbo` - High performance
- `gpt-4` - Complex reasoning
- `gpt-3.5-turbo` - General use
- `o1`, `o1-mini`, `o1-pro` - Advanced reasoning
- `o3-mini`, `o3-mini-high` - Latest models

**Gemini Models**
- `gemini-3-flash` - Fastest
- `gemini-2.0-flash` - Balanced
- `gemini-3.1-flash` - Enhanced
- `gemini-3.1-pro` - Most capable

### Provider Routing

Spike automatically routes requests based on model name:
- Models starting with `gpt-`, `o1`, or `o3` route to ChatGPT
- Models starting with `gemini` route to Gemini

No provider parameter needed—just change the model name.

---

## Integration Examples

### Python

```python
import requests

def chat(message, model="gpt-4o"):
    response = requests.post(
        'http://localhost:8000/v1/chat/completions',
        json={
            "model": model,
            "messages": [{"role": "user", "content": message}]
        }
    )
    return response.json()['choices'][0]['message']['content']

# Use ChatGPT
answer = chat("What is Python?", model="gpt-4o")

# Use Gemini
answer = chat("What is Python?", model="gemini-3-flash")
```

### JavaScript

```javascript
async function chat(message, model = 'gpt-4o') {
  const response = await fetch('http://localhost:8000/v1/chat/completions', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      model: model,
      messages: [{role: 'user', content: message}]
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// Use ChatGPT
const answer = await chat('What is JavaScript?', 'gpt-4o');

// Use Gemini
const answer = await chat('What is JavaScript?', 'gemini-3-flash');
```

### OpenAI Python Library

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="not-needed"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}]
)

print(response.choices[0].message.content)
```

---

## Use Cases

**Student Projects**  
Build AI-powered applications without API costs. Perfect for coursework and learning.

**Rapid Prototyping**  
Test ideas with multiple AI models before committing to paid APIs.

**Research and Comparison**  
Compare responses from different models and providers side-by-side.

**Personal Applications**  
Create chatbots, content generators, and coding assistants for personal use.

**Development and Testing**  
Test AI integrations locally before deploying to production.

---

## Architecture

Spike consists of three services:

**Unified Proxy (Port 8000)**  
Routes requests to appropriate backends based on model name. Provides OpenAI-compatible API.

**Gemini Bridge (Port 6969)**  
Connects to Google Gemini using browser session authentication. Handles Gemini-specific API format.

**Chat2API (Port 5005)**  
Bridges ChatGPT web interface to API format. Manages token-based authentication.

All services run locally. No external dependencies beyond the AI providers themselves.

---

## Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference with examples
- [User Guide](nexusai-electron/USER_GUIDE.md) - Detailed usage instructions
- [Quick Reference](QUICK_REFERENCE.md) - Common tasks and troubleshooting
- [Contributing](CONTRIBUTING.md) - How to contribute to Spike

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

# Install dependencies
npm install

# Development mode (requires Python installed)
npm run dev

# Build standalone installer (bundles Python)
build-standalone.bat
```

See [BUILD_INSTRUCTIONS.md](nexusai-electron/BUILD_INSTRUCTIONS.md) for detailed build instructions.

### Project Structure

```
spike/
├── nexusai-electron/
│   ├── electron/          # Main process
│   ├── src/               # React frontend
│   ├── python/            # Backend services
│   │   ├── nexusai/       # Core logic
│   │   └── services/      # AI bridges
│   └── assets/            # Icons and images
└── docs/                  # Documentation
```

---

## Troubleshooting

**Services won't start**  
If a port is already in use, click "Stop" on the service to kill any existing processes, then click "Start" again. This ensures a clean restart.

**Authentication errors**  
Update your tokens in the Services tab. Tokens expire and need periodic renewal. After updating, restart the affected service.

**Slow responses**  
Check your internet connection. Try a different model or provider. Faster models include `gemini-3-flash` and `gpt-4o-mini`.

**Connection refused**  
Ensure services are running (green status in Dashboard). If services show red, click "Stop" then "Start" to restart them.

**View detailed logs**  
Open the Logs tab in Spike. Use Copy or Export to share logs when reporting issues.

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Ways to contribute:**
- Report bugs and issues
- Suggest new features
- Improve documentation
- Submit pull requests
- Help others in discussions

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

Built with Electron, React, FastAPI, and Python. Special thanks to the Chat2API project for ChatGPT bridge implementation.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/spike/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/spike/discussions)
- **Documentation**: [API Docs](API_DOCUMENTATION.md) | [Command Reference](COMMAND_REFERENCE.md) | [User Guide](nexusai-electron/USER_GUIDE.md)
