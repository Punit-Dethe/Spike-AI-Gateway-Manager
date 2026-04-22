# NexusAI Gateway

A premium desktop application for managing AI service backends with a unified API gateway.

![NexusAI Gateway](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 🎨 **Beautiful UI** - ClawX-inspired design with beige theme
- 🔄 **Unified API** - Single endpoint for multiple AI services
- 💬 **Built-in Chat** - Test your AI models directly in the app
- 🔧 **Easy Configuration** - Simple token management
- 🚀 **Service Management** - Start/stop services with one click
- 📊 **Real-time Status** - Monitor service health

## Supported AI Services

- **ChatGPT** (GPT-4o, GPT-4, GPT-3.5, O1, O3)
- **Google Gemini** (Gemini 3 Flash, 2.0 Flash, 3.1 Pro)

## Quick Start

### For End Users

1. Download `NexusAI Gateway-Setup-1.0.0.exe`
2. Run the installer
3. Follow the setup wizard
4. Launch NexusAI Gateway
5. Configure your AI services
6. Start chatting!

📖 **Full guide**: See [USER_GUIDE.md](USER_GUIDE.md)

### For Developers

#### Prerequisites

- Node.js 18+
- Python 3.8+
- Git

#### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd nexusai-electron

# Install dependencies
npm install

# Install Python dependencies
python -m pip install -r requirements.txt

# Run in development mode
npm run dev
```

#### Building Installer

```bash
# Automated build
build.bat

# Or manual build
npm run build:vite
npm run build:electron
```

📖 **Full guide**: See [BUILD.md](BUILD.md)

## Architecture

```
┌─────────────────────────────────────────┐
│         NexusAI Gateway (Electron)      │
│  ┌───────────────────────────────────┐  │
│  │     React UI (Chat Interface)     │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │   Service Manager (Node.js)       │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│  Gemini  │ │ Chat2API │ │  Unified │
│  Bridge  │ │          │ │  Proxy   │
│ :6969    │ │ :5005    │ │ :8000    │
└──────────┘ └──────────┘ └──────────┘
      │           │           │
      ▼           ▼           ▼
   Gemini      ChatGPT    Unified API
```

## API Endpoint

Once running, access the unified API at:

```
http://localhost:8000/v1/chat/completions
```

Compatible with OpenAI API format.

## Project Structure

```
nexusai-electron/
├── electron/              # Electron main process
│   ├── main.js           # Service management
│   └── preload.js        # IPC bridge
├── src/                  # React application
│   ├── components/       # UI components
│   ├── styles/          # Tailwind CSS
│   └── App.tsx          # Main app component
├── python/              # Python services
│   ├── nexusai/         # Core services
│   └── services/        # AI backends
│       ├── chat2api/    # ChatGPT bridge
│       └── gemini/      # Gemini bridge
├── requirements.txt     # Python dependencies
├── package.json        # Node.js dependencies
└── electron-builder.yml # Build configuration
```

## Technologies

### Frontend
- **Electron** - Desktop framework
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Python** - Service runtime
- **FastAPI** - API framework
- **Uvicorn** - ASGI server
- **httpx** - HTTP client

## Configuration

### Service Ports

- **Unified Proxy**: 8000
- **Gemini Bridge**: 6969
- **Chat2API**: 5005

### Token Storage

- **Gemini**: `python/services/gemini/gemini_server.py`
- **Chat2API**: `python/services/chat2api/data/token.txt`

## Screenshots

### Chat Interface
Beautiful chat interface with model selection and markdown support.

### Services Management
Easy service control with real-time status monitoring.

### Configuration
Simple token management for all AI services.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE.txt](LICENSE.txt) for details.

## Acknowledgments

- **Chat2API** - ChatGPT API bridge by [LanQian528](https://github.com/LanQian528/chat2api)
- **ClawX** - UI design inspiration
- **Electron** - Desktop framework
- **React** - UI framework

## Support

For issues and questions:
- Check [USER_GUIDE.md](USER_GUIDE.md) for usage help
- Check [BUILD.md](BUILD.md) for build issues
- Open an issue on GitHub

---

**Made with ❤️ for the AI community**
