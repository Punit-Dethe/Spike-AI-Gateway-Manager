# Command Reference

Complete reference for Spike API endpoints, commands, and common operations.

---

## Table of Contents

- [API Endpoints](#api-endpoints)
- [Service Ports](#service-ports)
- [Model Reference](#model-reference)
- [Common Operations](#common-operations)
- [Error Handling](#error-handling)
- [File Locations](#file-locations)
- [Troubleshooting](#troubleshooting)

---

## API Endpoints

### Base URL

```
http://localhost:8000
```

### Chat Completions

```bash
POST /v1/chat/completions
```

**Request:**
```json
{
  "model": "gpt-4o",
  "messages": [{"role": "user", "content": "Hello"}]
}
```

**Response:**
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Response text"
    }
  }]
}
```

### List Models

```bash
GET /v1/models
```

Returns all available models from both ChatGPT and Gemini.

### Health Check

```bash
GET /health
```

Returns service health status.

---

## Service Ports

| Service | Port | Purpose |
|---------|------|---------|
| Unified Proxy | 8000 | Main API endpoint |
| Gemini Bridge | 6969 | Gemini backend |
| Chat2API | 5005 | ChatGPT backend |
| Token Management | 5005 | Token configuration UI |

---

## Model Reference

### ChatGPT Models

```
gpt-4o              Latest, most capable
gpt-4o-mini         Fast and efficient
gpt-4-turbo         High performance
gpt-4               Complex reasoning
gpt-3.5-turbo       General use
o1                  Advanced reasoning
o1-mini             Efficient reasoning
o1-pro              Professional tasks
o3-mini             Latest mini model
o3-mini-high        Enhanced mini model
```

### Gemini Models

```
gemini-3-flash      Fastest
gemini-2.0-flash    Balanced
gemini-3.1-flash    Enhanced
gemini-3.1-pro      Most capable
```

### Model Selection Guide

**For speed:** `gemini-3-flash`, `gpt-4o-mini`  
**For quality:** `gemini-3.1-pro`, `gpt-4o`  
**For reasoning:** `o1`, `o1-pro`, `gemini-3.1-pro`  
**For general use:** `gemini-2.0-flash`, `gpt-3.5-turbo`

---

## Common Operations

### Start Services

**Via Dashboard:**
1. Open Spike
2. Navigate to Dashboard
3. Click "Start Services"
4. Wait for green status indicators

**Verify services are running:**
```bash
curl http://localhost:8000/health
```

### Stop Services

**Via Dashboard:**
1. Open Spike
2. Navigate to Services tab
3. Click "Stop" on each service

**Note:** If a port is already in use, click "Stop" to kill any existing processes, then click "Start" again.

### Configure ChatGPT Token

1. Visit `https://chatgpt.com/api/auth/session`
2. Copy `accessToken` value
3. In Spike: Services → Chat2API → Configure Token
4. Paste token and save
5. Restart Chat2API service

### Configure Gemini Tokens

1. Open DevTools (F12) on `https://gemini.google.com`
2. Go to Application → Cookies
3. Copy `__Secure-1PSID` and `__Secure-1PSIDTS`
4. In Spike: Services → Gemini Bridge → Configure Tokens
5. Paste both tokens and save
6. Restart Gemini Bridge service

### View Logs

1. Open Spike
2. Navigate to Logs tab
3. Use "Copy to Clipboard" or "Export Logs" as needed

### Test API Connection

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "test"}]}'
```

---

## Error Handling

### Connection Refused

**Cause:** Services not running  
**Solution:** Start services from Dashboard

### Port Already in Use

**Cause:** Previous service instance still running  
**Solution:** 
1. Click "Stop" on the service in Spike
2. Wait 2-3 seconds
3. Click "Start" again

If issue persists:
```bash
# Windows: Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

### Authentication Failed

**Cause:** Invalid or expired tokens  
**Solution:** Update tokens in Services tab and restart service

### Model Not Found

**Cause:** Invalid model name  
**Solution:** Use valid model from [Model Reference](#model-reference)

### Service Unavailable (503)

**Cause:** Backend service not responding  
**Solution:** 
1. Check service status in Dashboard
2. Click "Stop" then "Start" on affected service
3. Check logs for errors

### Timeout Errors

**Cause:** Slow network or overloaded service  
**Solution:** 
- Check internet connection
- Try different model
- Increase timeout in your code

---

## File Locations

### Application Files

```
Installation:     C:\Program Files\Spike\
User Data:        %APPDATA%\spike\
Logs:             %APPDATA%\spike\logs\spike.log
```

### Configuration Files

```
Gemini Tokens:    python/services/gemini/gemini_server.py
ChatGPT Tokens:   python/services/chat2api/data/token.txt
Error Tokens:     python/services/chat2api/data/error_token.txt
```

### Accessing Log File

**Via Spike:**
- Logs tab → Copy/Export

**Via File Explorer:**
1. Press Win+R
2. Type `%APPDATA%\spike\logs`
3. Open `spike.log`

---

## Troubleshooting

### Service Won't Start

**Check port availability:**
```bash
netstat -ano | findstr :8000
netstat -ano | findstr :6969
netstat -ano | findstr :5005
```

**Solution:**
1. Click "Stop" on the service
2. Wait for status to show "Stopped"
3. Click "Start" again

### Token Issues

**Symptoms:**
- 401 Unauthorized errors
- "Authentication failed" messages

**Solution:**
1. Get fresh tokens from browser
2. Update in Services tab
3. Restart affected service
4. Verify with test request

### Slow Responses

**Possible causes:**
- Network latency
- Model complexity
- Service overload

**Solutions:**
- Use faster model (`gemini-3-flash`, `gpt-4o-mini`)
- Check internet connection
- Restart services
- Try different provider

### API Not Responding

**Diagnostic steps:**
1. Check Dashboard for service status
2. Verify all services show green
3. Test health endpoint: `curl http://localhost:8000/health`
4. Check logs for errors
5. Restart services if needed

### Services Show Red Status

**Solution:**
1. Click on service to expand details
2. Read error message
3. Common fixes:
   - Update tokens if authentication error
   - Click "Stop" then "Start" if port conflict
   - Check logs for specific error details

---

## Development Commands

### Run in Development Mode

```bash
cd nexusai-electron
npm run dev
```

### Build for Production

```bash
cd nexusai-electron
npm run build
```

### Install Dependencies

```bash
# Node.js dependencies
npm install

# Python dependencies
pip install -r requirements.txt
```

### Run Tests

```bash
# Test API endpoint
curl http://localhost:8000/v1/models

# Test Gemini directly
curl http://localhost:6969/health

# Test Chat2API directly
curl http://localhost:5005/health
```

---

## Best Practices

### Token Management

- Refresh tokens when they expire (typically every few weeks)
- Keep tokens secure and never commit to version control
- Use separate tokens for development and production

### Service Management

- Always stop services before closing Spike
- Use "Stop" button if services become unresponsive
- Check logs when troubleshooting issues

### API Usage

- Implement retry logic for network errors
- Use appropriate timeouts (30-60 seconds)
- Handle rate limiting gracefully
- Cache responses when appropriate

### Error Handling

```python
import requests
from requests.exceptions import RequestException

def safe_chat(message, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.post(
                'http://localhost:8000/v1/chat/completions',
                json={
                    "model": "gpt-4o",
                    "messages": [{"role": "user", "content": message}]
                },
                timeout=30
            )
            response.raise_for_status()
            return response.json()['choices'][0]['message']['content']
        except RequestException as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # Exponential backoff
```

---

## Additional Resources

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [User Guide](nexusai-electron/USER_GUIDE.md) - Detailed usage instructions
- [Contributing](CONTRIBUTING.md) - Contribution guidelines
- [GitHub Issues](https://github.com/yourusername/spike/issues) - Report bugs
