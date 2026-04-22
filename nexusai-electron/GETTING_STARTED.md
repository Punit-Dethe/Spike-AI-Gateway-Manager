# Getting Started with NexusAI Gateway

Welcome! This guide will help you get started whether you're a **user**, **developer**, or **distributor**.

## 🎯 Choose Your Path

### I'm a User
**I just want to use NexusAI Gateway**

👉 Go to [USER_GUIDE.md](USER_GUIDE.md)

Quick steps:
1. Download the installer
2. Run it
3. Configure your AI services
4. Start chatting!

---

### I'm a Developer
**I want to contribute or modify the code**

👉 Go to [BUILD.md](BUILD.md)

Quick steps:
1. Install Node.js and Python
2. Run `setup.bat`
3. Run `npm run dev`
4. Start coding!

---

### I'm a Distributor
**I want to build and release the installer**

👉 Go to [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)

Quick steps:
1. Create an icon (see [ICON_GUIDE.md](ICON_GUIDE.md))
2. Run `build.bat`
3. Test the installer
4. Distribute!

---

## 📚 Documentation Overview

| Document | Purpose | Audience |
|----------|---------|----------|
| [README.md](README.md) | Project overview | Everyone |
| [USER_GUIDE.md](USER_GUIDE.md) | How to use the app | End users |
| [BUILD.md](BUILD.md) | How to build from source | Developers |
| [ICON_GUIDE.md](ICON_GUIDE.md) | How to create the icon | Developers/Distributors |
| [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) | Release process | Distributors |
| [LICENSE.txt](LICENSE.txt) | Legal terms | Everyone |

---

## 🚀 Quick Start Matrix

### For Users

| Task | Command/Action |
|------|----------------|
| Install | Run `NexusAI Gateway-Setup-1.0.0.exe` |
| Configure ChatGPT | Services → Chat2API → Configure |
| Configure Gemini | Services → Gemini Bridge → Configure |
| Start Services | Click Start buttons |
| Use Chat | Go to Chat tab |
| Use API | `http://localhost:8000/v1` |

### For Developers

| Task | Command |
|------|---------|
| Setup | `setup.bat` |
| Dev Mode | `npm run dev` |
| Build Frontend | `npm run build:vite` |
| Build Installer | `build.bat` |
| Clean | Delete `dist/`, `dist-installer/`, `node_modules/` |

### For Distributors

| Task | Command/Action |
|------|----------------|
| Create Icon | See [ICON_GUIDE.md](ICON_GUIDE.md) |
| Build | `build.bat` |
| Test | Install on clean Windows |
| Release | Upload to GitHub Releases |
| Announce | Update README, social media |

---

## 🔧 System Requirements

### For Users
- Windows 10/11 (64-bit)
- Python 3.8+
- 4GB RAM
- 500MB disk space

### For Developers
- Windows 10/11 (64-bit)
- Node.js 18+
- Python 3.8+
- Git
- 8GB RAM recommended
- 2GB disk space

---

## 📦 What's Included

```
nexusai-electron/
├── 📄 Documentation
│   ├── README.md              ← Start here
│   ├── GETTING_STARTED.md     ← You are here
│   ├── USER_GUIDE.md          ← For users
│   ├── BUILD.md               ← For developers
│   ├── ICON_GUIDE.md          ← Icon creation
│   └── RELEASE_CHECKLIST.md   ← Release process
│
├── 🎨 Application
│   ├── electron/              ← Electron main process
│   ├── src/                   ← React UI
│   ├── python/                ← Python services
│   └── assets/                ← Icons and resources
│
├── ⚙️ Configuration
│   ├── package.json           ← Node.js config
│   ├── electron-builder.yml   ← Build config
│   ├── requirements.txt       ← Python deps
│   └── tailwind.config.js     ← Styling config
│
└── 🛠️ Scripts
    ├── setup.bat              ← Development setup
    ├── build.bat              ← Build installer
    └── installer.nsh          ← Installer script
```

---

## 🎓 Learning Path

### Beginner Path
1. Read [README.md](README.md) - Understand what NexusAI Gateway is
2. Read [USER_GUIDE.md](USER_GUIDE.md) - Learn how to use it
3. Install and try it out
4. Explore the Chat interface
5. Try the API with cURL or Python

### Developer Path
1. Read [README.md](README.md) - Project overview
2. Read [BUILD.md](BUILD.md) - Build process
3. Run `setup.bat` - Set up development environment
4. Run `npm run dev` - Start development mode
5. Explore the code structure
6. Make changes and test
7. Build installer with `build.bat`

### Distributor Path
1. Read [README.md](README.md) - Project overview
2. Read [ICON_GUIDE.md](ICON_GUIDE.md) - Create icon
3. Read [BUILD.md](BUILD.md) - Build process
4. Read [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) - Release process
5. Build and test installer
6. Prepare release materials
7. Distribute

---

## 🆘 Getting Help

### Common Questions

**Q: Where do I start?**
A: Choose your path above (User/Developer/Distributor)

**Q: The installer doesn't work**
A: Check [BUILD.md](BUILD.md) troubleshooting section

**Q: How do I get AI tokens?**
A: See [USER_GUIDE.md](USER_GUIDE.md) "Getting Tokens" section

**Q: Can I contribute?**
A: Yes! See [README.md](README.md) Contributing section

**Q: What license is this?**
A: MIT License - see [LICENSE.txt](LICENSE.txt)

### Support Channels

- 📖 Documentation (you're reading it!)
- 🐛 GitHub Issues (for bugs)
- 💬 GitHub Discussions (for questions)
- 📧 Email (for private inquiries)

---

## ✅ Next Steps

### If you're a User:
1. ✅ You've read this guide
2. → Go to [USER_GUIDE.md](USER_GUIDE.md)
3. → Download and install
4. → Configure your services
5. → Start using NexusAI Gateway!

### If you're a Developer:
1. ✅ You've read this guide
2. → Go to [BUILD.md](BUILD.md)
3. → Run `setup.bat`
4. → Run `npm run dev`
5. → Start developing!

### If you're a Distributor:
1. ✅ You've read this guide
2. → Go to [ICON_GUIDE.md](ICON_GUIDE.md)
3. → Create your icon
4. → Go to [BUILD.md](BUILD.md)
5. → Build the installer
6. → Go to [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)
7. → Release!

---

## 🎉 Welcome to NexusAI Gateway!

We're excited to have you here. Whether you're using, developing, or distributing NexusAI Gateway, we hope this documentation helps you succeed.

**Happy coding! 🚀**
