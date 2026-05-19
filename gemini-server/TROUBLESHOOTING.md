# Spike Lite - Troubleshooting Guide

## 🚨 CRITICAL: Authentication Issues

### Problem: "Gemini 3 Flash Free Version" / No Chat History

**Symptoms:**
- API works but shows "Gemini 3 Flash free version"
- Chat history doesn't appear in https://gemini.google.com/app
- Responses seem generic/limited

**Root Cause:**
Your cookies are **WRONG**, **INCOMPLETE**, or **EXPIRED**. The gemini-webapi library is falling back to unauthenticated mode.

**Solution:**

1. **Get Fresh Cookies** (CRITICAL STEPS):
   
   a. Open Chrome/Edge and go to **https://gemini.google.com** (MUST be HTTPS!)
   
   b. Make sure you're logged in with your Google account
   
   c. Press **F12** to open DevTools
   
   d. Go to: **Application** tab → **Cookies** → **https://gemini.google.com**
   
   e. Find these two cookies:
      - `__Secure-1PSID`
      - `__Secure-1PSIDTS`
   
   f. **CRITICAL**: Copy the **ENTIRE VALUE** of each cookie
      - These tokens are typically **200-500+ characters long**
      - If your token is short (< 100 chars), you didn't copy it all!
      - Double-click the value field and press Ctrl+A, then Ctrl+C
   
   g. Paste into Spike Lite and click "Save Tokens"
   
   h. Click "Initialize Client" and wait 10-30 seconds

2. **Verify Authentication**:
   
   After initialization, test in the "Chat Test" tab:
   - Send a message like "Hello, what's your name?"
   - Go to https://gemini.google.com/app
   - Check if your message appears in the chat history
   - **If it appears**: ✅ Authentication successful!
   - **If it doesn't appear**: ❌ Cookies are still wrong, repeat step 1

3. **Common Mistakes**:
   
   ❌ Copying from `google.com` instead of `gemini.google.com`
   ❌ Copying from `http://` instead of `https://`
   ❌ Not copying the complete token value
   ❌ Using expired tokens (tokens expire after ~30 days)
   ❌ Copying the cookie NAME instead of the VALUE

## Other Common Issues

### Server Won't Start (Built .exe)

**Symptoms:**
- Can't connect to localhost:6969
- Browser shows "Can't connect to server"

**Solutions:**

1. **Check Console Output**:
   - Run `SpikeLite.exe` from command prompt to see errors
   - Look for error messages about ports or dependencies

2. **Check Log File**:
   ```cmd
   notepad %TEMP%\spike_lite.log
   ```
   - Look for errors during server startup
   - Check if port 6969 is already in use

3. **Port Already in Use**:
   - Close any other instance of Spike Lite
   - Check if another app is using port 6969:
     ```cmd
     netstat -ano | findstr :6969
     ```
   - Kill the process if needed:
     ```cmd
     taskkill /PID <process_id> /F
     ```

4. **Firewall Blocking**:
   - Windows Firewall might be blocking the server
   - Add exception for SpikeLite.exe in Windows Firewall settings

### Client Initialization Fails

**Symptoms:**
- "Failed to initialize" error
- Timeout errors

**Solutions:**

1. **Check Internet Connection**:
   - Make sure you have internet access
   - Try opening https://gemini.google.com in your browser

2. **Check Tokens**:
   - Make sure you saved tokens before initializing
   - Verify tokens are from the correct domain (https://gemini.google.com)
   - Get fresh tokens if they're old (> 30 days)

3. **Proxy Issues**:
   - If you're behind a corporate proxy, it might block the connection
   - Try from a different network

### Tokens Keep Expiring

**Good News**: Spike Lite has **auto-refresh enabled**!

Once you initialize the client successfully, cookies will automatically refresh in the background. You shouldn't need to update them manually unless:
- You restart the application
- The auto-refresh fails (rare)
- Your Google account session expires

### 400 Bad Request

**Cause**: Client not initialized

**Solution**: Click "Initialize Client" in the Token Settings tab before making requests

### Build Issues

**Problem**: Build takes too long or creates huge .exe

**Solution**: Make sure you're using `build_minimal.py`:
```cmd
python build_minimal.py
```

NOT `build.py` (which doesn't exist and would include unnecessary libraries)

**Expected**:
- Build time: 2-3 minutes
- Executable size: 50-60 MB
- Memory usage: 40-50 MB

### Missing Dependencies

**Problem**: Import errors when running from source

**Solution**: Install all dependencies:
```cmd
pip install -r requirements.txt
```

## Debug Mode

To see detailed logs:

1. **When running from source**:
   ```cmd
   python tray_app.py
   ```
   - Console will show all logs in real-time

2. **When running .exe**:
   - Check log file: `%TEMP%\spike_lite.log`
   - Or run from command prompt to see console output

## Getting Help

If you're still having issues:

1. **Check the log file**:
   ```cmd
   notepad %TEMP%\spike_lite.log
   ```

2. **Run from command prompt** to see errors:
   ```cmd
   cd C:\path\to\SpikeLite
   SpikeLite.exe
   ```

3. **Test in dev mode** to isolate the issue:
   ```cmd
   cd gemini-server
   python tray_app.py
   ```

4. **Verify your setup**:
   - Python version: 3.10+ (if running from source)
   - Windows version: 10/11 64-bit
   - Internet connection: Active
   - Gemini account: Active and accessible

## Quick Checklist

Before reporting an issue, verify:

- [ ] I'm using cookies from **https://gemini.google.com** (with HTTPS)
- [ ] I copied the **COMPLETE** cookie values (200-500+ characters)
- [ ] My cookies are **fresh** (< 30 days old)
- [ ] I can access https://gemini.google.com in my browser
- [ ] I clicked "Initialize Client" after saving tokens
- [ ] I checked the log file at `%TEMP%\spike_lite.log`
- [ ] Port 6969 is not in use by another application
- [ ] Windows Firewall is not blocking SpikeLite.exe

## Still Not Working?

If authentication still fails after following all steps:

1. **Try a different browser** (Chrome vs Edge)
2. **Clear browser cookies** and log in fresh to Gemini
3. **Use incognito/private mode** to get cookies
4. **Check if your account has Gemini access** (some regions/accounts have restrictions)
5. **Verify your Google account** is not restricted or suspended

---

**Remember**: The #1 cause of issues is **incorrect or incomplete cookies**. Always copy the ENTIRE cookie value!
