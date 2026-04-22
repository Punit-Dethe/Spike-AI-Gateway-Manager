# Changelog

All notable changes to Spike will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-22

### 🎉 Initial Release

The first public release of Spike - AI Gateway Manager!

### ✨ Features

#### Core Functionality
- **Unified Proxy Server**: Single endpoint routing to multiple AI providers
- **Service Management**: One-click start/stop for all services
- **Multi-Provider Support**: Google Gemini and ChatGPT integration
- **Token Management**: Easy configuration for AI service authentication

#### User Interface
- **Modern Desktop App**: Built with Electron for native Windows experience
- **In-App Chat**: Test AI integrations directly in the application
- **Dashboard**: Real-time service status monitoring
- **Services Panel**: Detailed service configuration and management
- **Logs Viewer**: Comprehensive logging with export and copy functionality

#### Developer Experience
- **API Endpoints**: RESTful API for easy integration
- **Real-time Status**: Live service health monitoring
- **Error Tracking**: Detailed error logs for troubleshooting
- **Quick Start Guide**: Built-in tutorials and documentation

#### Design & UX
- **Premium Aesthetic**: Beautiful beige/sand color scheme
- **macOS-Style Controls**: Elegant window controls with hover effects
- **System Tray Integration**: Minimize to tray, always accessible
- **Smooth Animations**: Polished transitions and interactions
- **Responsive Layout**: Adapts to different window sizes

### 🛠️ Technical Details

#### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons

#### Backend
- Python 3.11
- FastAPI for API services
- Uvicorn for ASGI server
- Async/await for performance

#### Desktop
- Electron 28
- Custom title bar
- IPC communication
- System tray integration

### 📦 Services

1. **Unified Proxy** (Port 8000)
   - Routes requests to appropriate backends
   - Consistent API interface
   - Authentication handling

2. **Gemini Bridge** (Port 6969)
   - Google Gemini API integration
   - Browser session authentication
   - Supports Gemini 2.0 Flash and Pro

3. **Chat2API** (Port 5005)
   - ChatGPT web interface bridge
   - Token-based authentication
   - Supports GPT-4 and GPT-3.5

### 🎯 Use Cases

Perfect for:
- Students building AI projects
- Developers integrating multiple AI providers
- Researchers testing different models
- Hobbyists experimenting with AI
- Teams sharing a local AI gateway

### 📝 Documentation

- Comprehensive README
- User Guide
- Contributing Guidelines
- Build Instructions
- API Documentation

### 🔒 Security & Privacy

- Local-first architecture
- No data collection
- Tokens stored locally
- Open source transparency

---

## [Unreleased]

### Planned Features
- macOS and Linux support
- Additional AI provider integrations
- Plugin system for custom providers
- Cloud sync for settings
- Multi-language support
- Dark mode theme

---

## Version History

- **1.0.0** - Initial public release (2026-04-22)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to Spike.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
