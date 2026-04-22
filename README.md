# Spike - AI Gateway Manager

<div align="center">

![Spike Logo](nexusai-electron/assets/icon-256.png)

**A beautiful, local AI gateway that bridges multiple AI providers with a unified API**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-Windows-blue.svg)](https://www.microsoft.com/windows)
[![Electron](https://img.shields.io/badge/Electron-28.0.0-47848F.svg)](https://www.electronjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB.svg)](https://www.python.org/)

[Features](#features) • [Installation](#installation) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 🌟 Overview

**Spike turns your browser AI into a real API.**

Use ChatGPT and Google Gemini in your code without paying for API access. Spike runs locally on your computer and provides a standard OpenAI-compatible API that works with any programming language.

**The magic?** Just change the model name to switch providers - Spike handles the routing automatically.

```python
import requests

# Use ChatGPT - model name starts with "gpt"
response = requests.post('http://localhost:8000/v1/chat/completions', json={
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
})

# Use Gemini - model name starts with "gemini"  
response = requests.post('http://localhost:8000/v1/chat/completions', json={
    "model": "gemini-3-flash",
    "messages": [{"role": "user", "content": "Hello!"}]
})

# Same endpoint, different models = different providers!
print(response.json()['choices'][0]['message']['content'])
```

### Perfect For:

- 🎓 **Students**: Build AI projects without API costs
- 💻 **Developers**: Prototype with multiple AI models
- 🔬 **Researchers**: Test and compare different models
- 🚀 **Startups**: MVP development without API bills
- 🎨 **Hobbyists**: Experiment with AI freely

### Why Spike?

| Feature | Spike | Traditional APIs |
|---------|-------|------------------|
| **Cost** | Free (use your browser sessions) | $$ Pay per token |
| **Setup** | 5 minutes | API keys, billing setup |
| **Privacy** | 100% local | Data sent to API servers |
| **Models** | ChatGPT + Gemini | Single provider |
| **Testing** | Built-in chat interface | External tools needed |

---

## ✨ Features

### 🚀 API Gateway
- **OpenAI-Compatible API**: Works with existing OpenAI libraries and tools
- **Multiple AI Providers**: ChatGPT (GPT-4o, GPT-4, GPT-3.5) and Gemini (3.1 Pro, 3 Flash, 2.0 Flash)
- **No API Keys Needed**: Use your browser session tokens
- **Local & Private**: All processing happens on your machine
- **Unified Endpoint**: Single API for all providers

### 💻 Developer Tools
- **Built-in Chat Interface**: Test your prompts before coding
- **Real-time Logs**: Debug API calls and responses
- **Service Dashboard**: Monitor all services at a glance
- **Token Management**: Easy configuration for all providers
- **Export Logs**: Share logs for troubleshooting

### 🎨 User Experience
- **One-Click Setup**: Install and start in minutes
- **System Tray**: Runs in background, always available
- **Beautiful UI**: Clean, modern interface
- **Cross-Model Testing**: Compare responses from different models

---

## 📦 Installation

### Prerequisites
- **Windows 10/11** (64-bit)
- **Python 3.8+** (automatically managed by the installer)
- **Node.js 16+** (for development only)

### Download & Install

1. **Download the latest release**
   - Go to [Releases](../../releases)
   - Download `Spike-Setup-1.0.0.exe`

2. **Run the installer**
   - Double-click the downloaded file
   - Follow the installation wizard
   - Choose your installation directory

3. **Launch Spike**
   - Find Spike in your Start Menu
   - Or use the desktop shortcut

That's it! Spike will handle all dependencies automatically.

---

## 🚀 Quick Start

### 1. Configure Your AI Services

#### For Google Gemini:
1. Click on **Services** in the sidebar
2. Expand the **Gemini Bridge** section
3. Click **Configure Tokens**
4. Enter your PSID and PSIDTS tokens
5. Click **Save Tokens**

#### For ChatGPT:
1. Click on **Services** in the sidebar
2. Expand the **Chat2API** section
3. Click **Configure Token**
4. Follow the two-step process to add your ChatGPT token
5. Restart the service

### 2. Start Services

1. Go to the **Dashboard**
2. Choose your preferred AI provider (Gemini or ChatGPT)
3. Click **Start Services**
4. Wait for services to initialize (status indicators will turn green)

### 3. Test Your Setup

**Option A: Use the Built-in Chat**
1. Click on **Chat** in the sidebar
2. Select your AI provider
3. Start chatting!

**Option B: Use the API**
```bash
# Your unified API endpoint
http://localhost:8000

# Example request
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3-flash",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## 📚 Documentation

### Service Architecture

Spike consists of three main services:

1. **Unified Proxy** (Port 8000)
   - Routes requests to appropriate AI backends
   - Provides a consistent API interface
   - Handles authentication and error management

2. **Gemini Bridge** (Port 6969)
   - Connects to Google Gemini API
   - Uses browser session authentication
   - Supports Gemini 2.0 Flash and Pro models

3. **Chat2API** (Port 5005)
   - Bridges ChatGPT web interface to API
   - Token-based authentication
   - Supports GPT-4 and GPT-3.5 models

### Configuration Files

- **Gemini Tokens**: Stored in `python/services/gemini/gemini_server.py`
- **ChatGPT Tokens**: Stored in `python/services/chat2api/data/token.txt`
- **Application Logs**: `%APPDATA%/spike/logs/spike.log`

### API Endpoints

Once services are running:

- **Unified Proxy**: `http://localhost:8000`
- **Gemini Direct**: `http://localhost:6969`
- **Chat2API Direct**: `http://localhost:5005`
- **Token Management**: `http://localhost:5005/tokens`

---

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/spike.git
cd spike/nexusai-electron

# Install dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Run in development mode
npm run dev

# Build for production
npm run build
```

### Project Structure

```
spike/
├── nexusai-electron/          # Main Electron application
│   ├── electron/              # Electron main process
│   ├── src/                   # React frontend
│   │   ├── components/        # UI components
│   │   └── styles/            # CSS styles
│   ├── python/                # Python services
│   │   ├── nexusai/           # Core application logic
│   │   └── services/          # AI service bridges
│   └── assets/                # Icons and images
├── docs/                      # Documentation
└── README.md                  # This file
```

### Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Desktop**: Electron 28
- **Backend**: Python 3.11, FastAPI, Uvicorn
- **AI Services**: Google Gemini API, ChatGPT Web Interface

---

## 🤝 Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Test on Windows before submitting

### Reporting Issues

Found a bug? Have a feature request? Please open an issue with:
- Clear description of the problem/feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (Windows version, Python version, etc.)

---

## 📋 Use Cases

### Perfect for:

- **Students**: Build AI-powered projects for coursework
- **Developers**: Integrate multiple AI providers in your applications
- **Researchers**: Test and compare different AI models
- **Hobbyists**: Experiment with AI without complex setup
- **Teams**: Share a local AI gateway for development

### Example Projects:

- Chatbots and virtual assistants
- Content generation tools
- Code completion and analysis
- Research and data analysis
- Educational applications
- Prototyping and testing

---

## 🔒 Privacy & Security

- **Local First**: All services run on your machine
- **No Data Collection**: We don't collect or transmit your data
- **Token Security**: Tokens are stored locally and never shared
- **Open Source**: Full transparency - review the code yourself

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.txt) file for details.

---

## 🙏 Acknowledgments

- **Chat2API**: For the ChatGPT bridge implementation
- **Electron**: For the amazing desktop framework
- **React & Tailwind**: For the beautiful UI components
- **FastAPI**: For the robust Python backend
- **Community**: For feedback and contributions

---

## 📞 Support

- **Documentation**: Check the [User Guide](nexusai-electron/USER_GUIDE.md)
- **Issues**: Open an issue on GitHub
- **Discussions**: Join our GitHub Discussions
- **Email**: [Your contact email]

---

## 🗺️ Roadmap

### Coming Soon
- [ ] macOS and Linux support
- [ ] Additional AI provider integrations
- [ ] Plugin system for custom providers
- [ ] Cloud sync for settings
- [ ] Multi-language support
- [ ] Dark mode theme

### Future Ideas
- Mobile companion app
- Team collaboration features
- Usage analytics and insights
- Custom model fine-tuning
- API rate limiting and quotas

---

<div align="center">

**Made with ❤️ for the AI community**

[⭐ Star us on GitHub](../../stargazers) • [🐛 Report Bug](../../issues) • [💡 Request Feature](../../issues)

</div>
