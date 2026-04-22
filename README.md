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

Spike is a comprehensive desktop application that provides a unified gateway to multiple AI services. Perfect for developers, students, and anyone working on AI projects who needs a reliable, local API gateway with built-in testing and monitoring capabilities.

### Why Spike?

- **🎯 Unified API**: Single endpoint for multiple AI providers (Gemini, ChatGPT)
- **💬 Built-in Chat**: Test your AI integrations directly in the app
- **📊 Real-time Monitoring**: Live service status and comprehensive logging
- **🔒 Privacy-First**: Everything runs locally on your machine
- **🎨 Beautiful UI**: Clean, modern interface with a premium aesthetic
- **🚀 Easy Setup**: One-click installation and service management

---

## ✨ Features

### Core Functionality
- **Unified Proxy Server**: Route requests to different AI backends through a single endpoint
- **Service Management**: Start, stop, and monitor AI services with one click
- **Token Management**: Easy configuration for Gemini and ChatGPT authentication
- **In-App Chat Interface**: Test your AI integrations without leaving the app

### Developer Tools
- **Comprehensive Logging**: Full application logs with export and copy functionality
- **Service Status Dashboard**: Real-time monitoring of all services
- **API Endpoint Display**: Quick access to your local API endpoints
- **Error Tracking**: Detailed error logs for troubleshooting

### User Experience
- **System Tray Integration**: Runs in the background, always accessible
- **macOS-Style Controls**: Premium window controls with smooth animations
- **Responsive Design**: Clean, modern UI that adapts to your workflow
- **Quick Start Guide**: Built-in tutorials to get you up and running

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
