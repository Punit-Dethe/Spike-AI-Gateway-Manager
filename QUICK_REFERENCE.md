# Spike - Quick Reference Guide

## 🚀 Quick Start

```bash
# Download and install
1. Download Spike-Setup-1.0.0.exe
2. Run installer
3. Launch Spike

# Configure services
1. Go to Services tab
2. Add your AI tokens
3. Click Start Services

# Start using
1. Go to Chat tab
2. Select AI provider
3. Start chatting!
```

## 📡 API Endpoints

| Service | Port | Endpoint |
|---------|------|----------|
| Unified Proxy | 8000 | `http://localhost:8000` |
| Gemini Bridge | 6969 | `http://localhost:6969` |
| Chat2API | 5005 | `http://localhost:5005` |
| Token Management | 5005 | `http://localhost:5005/tokens` |

## 🎯 Common Tasks

### Start Services
```
Dashboard → Choose Provider → Start Services
```

### Add Gemini Token
```
Services → Gemini Bridge → Configure Tokens → Enter PSID & PSIDTS → Save
```

### Add ChatGPT Token
```
Services → Chat2API → Configure Token → Follow 2-step process → Restart
```

### View Logs
```
Logs → Copy/Export/Clear
```

### Test API
```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "gemini-3-flash", "messages": [{"role": "user", "content": "Hello!"}]}'
```

## 🔧 Troubleshooting

### Service Won't Start
1. Check if port is already in use
2. Verify tokens are configured
3. Check logs for errors
4. Restart the application

### API Not Responding
1. Ensure services are running (green status)
2. Check firewall settings
3. Verify endpoint URL
4. Check logs for errors

### Token Issues
1. Verify token format
2. Check token expiration
3. Re-enter tokens
4. Restart service

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Minimize | Click yellow button |
| Maximize | Click green button |
| Close to tray | Click red button |
| Show from tray | Click tray icon |

## 📁 File Locations

| Item | Location |
|------|----------|
| Application | `C:\Program Files\Spike\` |
| Logs | `%APPDATA%\spike\logs\spike.log` |
| Gemini Tokens | `python/services/gemini/gemini_server.py` |
| ChatGPT Tokens | `python/services/chat2api/data/token.txt` |

## 🎨 UI Navigation

```
┌─────────────────────────────────────┐
│ ○ ○ ○                               │ ← Window controls
├──────────┬──────────────────────────┤
│ Chat     │                          │
│ Dashboard│  Main Content Area       │
│ Services │                          │
│ Logs     │                          │
└──────────┴──────────────────────────┘
```

## 🔑 Token Sources

### Gemini (PSID & PSIDTS)
1. Open Chrome DevTools (F12)
2. Go to Application → Cookies
3. Find `gemini.google.com`
4. Copy PSID and PSIDTS values

### ChatGPT (Access Token)
1. Visit `https://chatgpt.com/api/auth/session`
2. Copy the `accessToken` value
3. Paste in Spike token management

## 📊 Service Status

| Color | Status | Meaning |
|-------|--------|---------|
| 🟢 Green | Running | Service is active |
| 🟡 Yellow | Starting | Service is initializing |
| 🔴 Red | Stopped | Service is not running |
| ⚠️ Orange | Error | Service encountered an error |

## 💻 Development

```bash
# Clone repository
git clone https://github.com/yourusername/spike.git

# Install dependencies
cd spike/nexusai-electron
npm install
pip install -r requirements.txt

# Run in dev mode
npm run dev

# Build for production
npm run build
```

## 🐛 Common Errors

### "Port already in use"
**Solution**: Stop other services using the port or restart Spike

### "Module not found"
**Solution**: Run `pip install -r requirements.txt`

### "Token invalid"
**Solution**: Re-enter tokens and restart service

### "Service crashed"
**Solution**: Check logs for details, restart service

## 📞 Getting Help

1. **Check Logs**: Logs tab in Spike
2. **Read Docs**: USER_GUIDE.md
3. **Search Issues**: GitHub Issues
4. **Ask Community**: GitHub Discussions
5. **Report Bug**: Create new issue

## 🔗 Useful Links

- **Repository**: https://github.com/yourusername/spike
- **Issues**: https://github.com/yourusername/spike/issues
- **Discussions**: https://github.com/yourusername/spike/discussions
- **Releases**: https://github.com/yourusername/spike/releases

## 📝 Quick Tips

- ✅ Services must be running before API calls
- ✅ Tokens are stored locally and securely
- ✅ Close button minimizes to tray
- ✅ Right-click tray icon to quit
- ✅ Logs are automatically saved
- ✅ Services restart automatically on token change

## 🎯 Best Practices

1. **Keep tokens secure** - Don't share or commit them
2. **Monitor logs** - Check for errors regularly
3. **Update regularly** - Install new versions when available
4. **Report issues** - Help improve Spike
5. **Contribute** - Share your improvements

---

**Need more help?** Check the full [User Guide](nexusai-electron/USER_GUIDE.md)
