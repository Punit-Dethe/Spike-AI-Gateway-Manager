/**
 * Local Gemini Setup Module
 * 
 * This module handles the creation of standalone Gemini API servers
 * that are completely isolated from the main Spike application.
 * 
 * Features:
 * - Creates standalone Python server with user-provided tokens
 * - Runs on port 7777 (separate from main app's port 6969)
 * - No connection to main app's token store
 * - Completely independent setup
 */

const { ipcMain, shell } = require('electron');
const path = require('path');

/**
 * Register all local setup IPC handlers
 * @param {Function} logSuccess - Logging function for success messages
 * @param {Function} logDetail - Logging function for detail messages
 * @param {Function} logError - Logging function for error messages
 */
function registerLocalSetupHandlers(logSuccess, logDetail, logError) {
  
  // Handler: Open terminal at specified folder
  ipcMain.handle('open-terminal', async (event, folderPath) => {
    try {
      const { spawn } = require('child_process');
      
      if (process.platform === 'win32') {
        // Use 'start' command to open cmd in a new visible window
        spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/K', `cd /d "${folderPath}"`], {
          detached: true,
          stdio: 'ignore',
          shell: true
        }).unref();
      } else if (process.platform === 'darwin') {
        spawn('open', ['-a', 'Terminal', folderPath], {
          detached: true,
          stdio: 'ignore'
        }).unref();
      } else {
        spawn('x-terminal-emulator', [], {
          cwd: folderPath,
          detached: true,
          stdio: 'ignore'
        }).unref();
      }
      
      logSuccess('Opened terminal at folder', 'SYSTEM');
      logDetail('Path', folderPath);
      return { success: true };
    } catch (error) {
      logError('Error opening terminal', 'SYSTEM', error);
      return { success: false, error: error.message };
    }
  });

  // Handler: Create local Gemini setup
  ipcMain.handle('create-local-gemini-setup', async (event, { projectPath, psid, psidts }) => {
    try {
      const fs = require('fs');
      const setupPath = path.join(projectPath, 'gemini-api');

      logSuccess('Starting local Gemini setup creation', 'SYSTEM');
      logDetail('Project Path', projectPath);

      // Create setup directory
      if (!fs.existsSync(setupPath)) {
        fs.mkdirSync(setupPath, { recursive: true });
        logSuccess('Created setup directory', 'SYSTEM');
      }

      // DEBUG: Log what tokens are being written
      logDetail('DEBUG - PSID (first 10 chars)', psid.substring(0, 10) + '...');
      logDetail('DEBUG - PSIDTS (first 10 chars)', psidts.substring(0, 10) + '...');

      // Create gemini_server.py
      const serverCode = generateServerCode(psid, psidts);
      const serverFile = path.join(setupPath, 'gemini_server.py');
      fs.writeFileSync(serverFile, serverCode, 'utf8');
      logSuccess('Created gemini_server.py', 'SYSTEM');

      // Create requirements.txt
      const requirements = generateRequirements();
      const requirementsFile = path.join(setupPath, 'requirements.txt');
      fs.writeFileSync(requirementsFile, requirements, 'utf8');
      logSuccess('Created requirements.txt', 'SYSTEM');

      // Create setup.py
      const setupScript = generateSetupScript();
      const setupFile = path.join(setupPath, 'setup.py');
      fs.writeFileSync(setupFile, setupScript, 'utf8');
      logSuccess('Created setup.py', 'SYSTEM');

      // Create README.txt
      const readme = generateReadme();
      const readmeFile = path.join(setupPath, 'README.txt');
      fs.writeFileSync(readmeFile, readme, 'utf8');
      logSuccess('Created README.txt', 'SYSTEM');

      // Verify core files were created
      const coreFilesExist = fs.existsSync(serverFile) && 
                             fs.existsSync(requirementsFile) && 
                             fs.existsSync(setupFile) &&
                             fs.existsSync(readmeFile);

      if (!coreFilesExist) {
        throw new Error('Failed to create core files');
      }

      logSuccess('Local Gemini setup created successfully', 'SYSTEM');
      logDetail('Setup Path', setupPath);
      logDetail('Files Created', 'gemini_server.py, requirements.txt, setup.py, README.txt');

      return { success: true, setupPath };
    } catch (error) {
      logError('Error creating local Gemini setup', 'SYSTEM', error);
      return { success: false, error: error.message };
    }
  });
}

/**
 * Generate the Python server code with embedded tokens
 * @param {string} psid - User's PSID token
 * @param {string} psidts - User's PSIDTS token
 * @returns {string} Complete Python server code
 */
function generateServerCode(psid, psidts) {
  // Generate a unique profile path for this setup to avoid cache contamination
  const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  // Generate a unique token ID based on the actual token values
  // This helps verify which tokens are being used
  const tokenHash = require('crypto')
    .createHash('md5')
    .update(psid + psidts)
    .digest('hex')
    .substring(0, 8);
  
  return `import asyncio
import uvicorn
import os
import tempfile
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Any
from gemini_webapi import GeminiClient

# ============================================================
# TOKEN CONFIGURATION
# These tokens are from YOUR setup - NOT from the Spike app
# ============================================================
PSID   = "${psid}"
PSIDTS = "${psidts}"

# ============================================================
# TOKEN VERIFICATION ID
# This unique ID helps verify which tokens are being used
# ============================================================
TOKEN_ID = "${tokenHash}"

# ============================================================
# ISOLATION: Use unique profile to avoid cached credentials
# ============================================================
PROFILE_DIR = os.path.join(tempfile.gettempdir(), "gemini-local-${uniqueId}")
os.makedirs(PROFILE_DIR, exist_ok=True)

DEFAULT_MODEL = "gemini-3-flash"

MODEL_MAP = {
    "gemini-3-flash":       "gemini-3-flash",
    "gemini-3-flash-plus":  "gemini-3-flash-plus",
    "gemini-3-pro":         "gemini-3-pro",
    "gemini-3.1-flash":     "gemini-3-flash",
    "gemini-3.1-pro":       "gemini-3-pro",
    "gemini-2.0-flash":     "gemini-3-flash",
    "gemini-2.0-flash-exp": "gemini-3-flash",
    "gemini":               "unspecified",
    "unspecified":          "unspecified",
}

app = FastAPI()
client = None

@app.on_event("startup")
async def startup():
    global client
    if not PSID or not PSIDTS:
        print("[ERROR] Gemini tokens not configured!")
        return
    
    print(f"[INFO] Token ID: {TOKEN_ID}")
    print(f"[INFO] This unique ID identifies which tokens are being used")
    
    try:
        # Initialize with custom profile directory
        client = GeminiClient(
            PSID, 
            PSIDTS,
            profile_dir=PROFILE_DIR,
            auto_close=False
        )
        await client.init(timeout=30)
        print(f"[OK] Gemini client initialized successfully")
        print(f"[OK] Active Token ID: {TOKEN_ID}")
    except Exception as e:
        print(f"[ERROR] Failed to initialize Gemini client")
        print(f"[ERROR] Reason: {str(e)}")
        print(f"[DEBUG] Token ID: {TOKEN_ID}")
        print(f"[DEBUG] PSID (first 10 chars): {PSID[:10]}...")
        print(f"[DEBUG] PSIDTS (first 10 chars): {PSIDTS[:10]}...")
        print(f"[DEBUG] Profile Dir: {PROFILE_DIR}")
        raise

class Message(BaseModel):
    role: str
    content: Any

class ChatRequest(BaseModel):
    model: str = DEFAULT_MODEL
    messages: List[Message]
    tools: Optional[Any] = None
    tool_choice: Optional[Any] = None
    stream: Optional[bool] = False
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None

def extract_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict):
                if block.get("type") == "text":
                    parts.append(block.get("text", ""))
                elif block.get("type") == "tool_result":
                    parts.append(str(block.get("content", "")))
            elif isinstance(block, str):
                parts.append(block)
        return "\\n".join(p for p in parts if p)
    return str(content)

def build_prompt(messages: List[Message]) -> str:
    parts = []
    for msg in messages:
        text = extract_text(msg.content)
        if not text.strip():
            continue
        role_label = {"user": "User", "assistant": "Assistant", "system": "System"}.get(msg.role, msg.role.capitalize())
        parts.append(f"{role_label}: {text}")
    return "\\n\\n".join(parts)

@app.post("/v1/chat/completions")
async def chat(req: ChatRequest):
    prompt = build_prompt(req.messages)
    requested_model = req.model if req.model else DEFAULT_MODEL
    internal_model = MODEL_MAP.get(requested_model, "unspecified")
    response = await client.generate_content(prompt, model=internal_model)
    return JSONResponse({
        "id": "gemini-1",
        "object": "chat.completion",
        "choices": [{
            "index": 0,
            "message": {"role": "assistant", "content": response.text},
            "finish_reason": "stop"
        }],
        "model": requested_model,
        "usage": {
            "prompt_tokens": len(prompt.split()),
            "completion_tokens": len(response.text.split()),
            "total_tokens": len(prompt.split()) + len(response.text.split())
        }
    })

@app.get("/v1/models")
async def list_models():
    return JSONResponse({
        "object": "list",
        "data": [
            {"id": "gemini-3-flash",   "object": "model", "owned_by": "google"},
            {"id": "gemini-3.1-flash", "object": "model", "owned_by": "google"},
            {"id": "gemini-3.1-pro",   "object": "model", "owned_by": "google"},
            {"id": "gemini-2.0-flash", "object": "model", "owned_by": "google"}
        ]
    })

if __name__ == "__main__":
    print("[INFO] Starting standalone Gemini API server on port 7777")
    print("[INFO] This server is COMPLETELY SEPARATE from the Spike app")
    uvicorn.run(app, host="0.0.0.0", port=7777)
`;
}

/**
 * Generate requirements.txt content
 * @returns {string} Requirements file content
 */
function generateRequirements() {
  return `fastapi
uvicorn
pydantic
gemini-webapi
requests
`;
}

/**
 * Generate setup.py script
 * @returns {string} Setup script content
 */
function generateSetupScript() {
  return `#!/usr/bin/env python3
"""
Gemini API Server - Setup Script
"""
import subprocess
import sys
import time
import os
import re

# Store full logs for error reporting
full_log = []

def print_header():
    print()
    print("  ╔════════════════════════════════════════════════════════╗")
    print("  ║                                                        ║")
    print("  ║           GEMINI API SERVER - SETUP                    ║")
    print("  ║                                                        ║")
    print("  ╚════════════════════════════════════════════════════════╝")
    print()

def print_step(num, title):
    print()
    print(f"  [{num}/3] {title}")
    print("  " + "─" * 56)

def print_success(msg):
    print(f"  ✓ {msg}")

def print_error(msg):
    print(f"  ✗ {msg}")

def print_warning(msg):
    print(f"  ⚠ {msg}")

def save_full_log():
    """Save full log to file for debugging"""
    try:
        with open("setup_debug.log", "w", encoding="utf-8") as f:
            f.write("\\n".join(full_log))
        print()
        print("  Full debug log saved to: setup_debug.log")
    except:
        pass

print_header()

# Step 1: Install Dependencies
print_step(1, "Installing dependencies")
try:
    result = subprocess.run(
        [sys.executable, "-m", "pip", "install", "-q", "-r", "requirements.txt"],
        capture_output=True,
        text=True
    )
    if result.returncode == 0:
        print_success("Dependencies installed")
    else:
        print_error("Failed to install dependencies")
        if result.stderr:
            print(f"\\n  Error: {result.stderr.strip()}")
        input("\\nPress Enter to exit...")
        sys.exit(1)
except Exception as e:
    print_error(f"Installation error: {e}")
    input("\\nPress Enter to exit...")
    sys.exit(1)

# Step 2: Start Server
print_step(2, "Starting server")
print("  Server: http://localhost:7777")

try:
    server_process = subprocess.Popen(
        [sys.executable, "gemini_server.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    start_time = time.time()
    server_started = False
    auth_failed = False
    error_details = []
    token_id = None
    
    # Collect output but only show important messages
    while time.time() - start_time < 15:
        line = server_process.stdout.readline()
        if line:
            full_log.append(line.rstrip())
            
            # Capture Token ID (happens early in startup)
            if "Token ID:" in line:
                match = re.search(r'Token ID: ([a-f0-9]+)', line)
                if match:
                    token_id = match.group(1)
            
            # Check for success
            if "Uvicorn running" in line or "Application startup complete" in line:
                server_started = True
                break
            
            # Check for authentication failure
            if "UNAUTHENTICATED" in line or "Invalid credentials" in line:
                auth_failed = True
                error_details.append(line.strip())
            
            # Check for other errors
            if "[ERROR]" in line or "ERROR" in line and "DeprecationWarning" not in line:
                error_details.append(line.strip())
        
        if server_process.poll() is not None:
            remaining = server_process.stdout.read()
            if remaining:
                full_log.extend(remaining.split("\\n"))
            break
        
        time.sleep(0.1)
    
    if not server_started:
        print()
        print_error("Server failed to start")
        print()
        
        if auth_failed:
            print("  Reason: Authentication Failed")
            print("  ─" * 28)
            print("  Your tokens are invalid or expired.")
            print("  Please check your PSID and PSIDTS tokens.")
            if token_id:
                print(f"  Token ID: {token_id}")
        elif error_details:
            print("  Error Details:")
            print("  ─" * 28)
            for detail in error_details[:3]:  # Show first 3 errors
                # Clean up the error message
                clean_detail = re.sub(r'^.*?\\|', '', detail).strip()
                print(f"  {clean_detail}")
        else:
            print("  Reason: Server timeout (15 seconds)")
        
        print()
        save_full_log()
        input("\\nPress Enter to exit...")
        sys.exit(1)
    
    print_success("Server started")
    
    # Extract Token ID from full log if not captured during loop
    if not token_id:
        for log_line in full_log:
            if "Token ID:" in log_line:
                match = re.search(r'Token ID: ([a-f0-9]+)', log_line)
                if match:
                    token_id = match.group(1)
                    break
    
    if token_id:
        print(f"  Token ID: {token_id}")
    
except Exception as e:
    print_error(f"Server error: {e}")
    save_full_log()
    input("\\nPress Enter to exit...")
    sys.exit(1)

# Step 3: Test API
print_step(3, "Testing API")

try:
    import requests
    time.sleep(1)
    
    response = requests.post(
        'http://localhost:7777/v1/chat/completions',
        json={
            'model': 'gemini-3-flash',
            'messages': [{'role': 'user', 'content': 'Create simple ASCII art of clouds'}]
        },
        timeout=30
    )
    
    if response.status_code == 200:
        result = response.json()
        reply = result['choices'][0]['message']['content']
        
        print_success("API is working!")
        print()
        print("  Response:")
        print("  " + "─" * 56)
        for line in reply.split('\\n')[:10]:  # Show first 10 lines
            print(f"  {line}")
        if len(reply.split('\\n')) > 10:
            print("  ...")
        print("  " + "─" * 56)
        
    else:
        print_error(f"API returned error: {response.status_code}")
        
except Exception as e:
    print_error(f"Test failed: {e}")

# Done
print()
print("  ╔════════════════════════════════════════════════════════╗")
print("  ║                                                        ║")
print("  ║                  SETUP COMPLETE!                       ║")
print("  ║                                                        ║")
print("  ║  Server: http://localhost:7777                        ║")
print("  ║                                                        ║")
print("  ║  Press Ctrl+C to stop the server                      ║")
print("  ║                                                        ║")
print("  ╚════════════════════════════════════════════════════════╝")
print()

# Keep server running
try:
    server_process.wait()
except KeyboardInterrupt:
    print()
    print("  Stopping server...")
    server_process.terminate()
    server_process.wait()
    print_success("Server stopped")
    print()
`;
}

/**
 * Generate README.txt content
 * @returns {string} README content
 */
function generateReadme() {
  return `================================================================================
                    GEMINI API SERVER - LOCAL SETUP
================================================================================

This folder contains a standalone Gemini API server that you can run locally
or deploy to any hosting platform.

CREATED BY: Spike App (Local Setup Feature)
SERVER PORT: 7777 (separate from main Spike app on port 6969)
ISOLATION: Completely independent - no connection to main app


QUICK START
================================================================================

Just run this one command:

    python setup.py

This will:
  1. Install all dependencies (fastapi, uvicorn, gemini-webapi, etc.)
  2. Start the server on http://localhost:7777
  3. Test that it's working with a sample API call
  4. Keep the server running until you press Ctrl+C


WHAT YOU'LL SEE
================================================================================

Clean, minimal output showing only what matters:

  ╔════════════════════════════════════════════════════════╗
  ║           GEMINI API SERVER - SETUP                    ║
  ╚════════════════════════════════════════════════════════╝

  [1/3] Installing dependencies
  ────────────────────────────────────────────────────────
  ✓ Dependencies installed

  [2/3] Starting server
  ────────────────────────────────────────────────────────
  Server: http://localhost:7777
  ✓ Server started
    Token ID: a1b2c3d4

  [3/3] Testing API
  ────────────────────────────────────────────────────────
  ✓ API is working!
  
  Response:
  ────────────────────────────────────────────────────────
  [ASCII art of clouds]

If something goes wrong, you'll see:
  • Clear error message (e.g., "Authentication Failed")
  • Specific reason for the failure
  • Full debug log saved to setup_debug.log


TOKEN VERIFICATION
================================================================================

What is Token ID?
------------------------------------------------------------
The Token ID is a unique 8-character identifier generated from your tokens.
It helps you verify which tokens are actually being used by the server.

Example: Token ID: a1b2c3d4

Why is this useful?
------------------------------------------------------------
  • Confirms your tokens are being used (not cached ones)
  • Different tokens = Different Token ID
  • Same tokens = Same Token ID
  • Easy to verify token switching works correctly

How to verify:
------------------------------------------------------------
  1. Create setup with Token Set A → Note Token ID (e.g., a1b2c3d4)
  2. Create setup with Token Set B → Note Token ID (e.g., e5f6g7h8)
  3. Different IDs confirm different tokens are being used

Where to find it:
------------------------------------------------------------
  • Displayed after "Server started" in setup output
  • Shown in error messages for debugging
  • Stored in gemini_server.py as TOKEN_ID variable


IMPORTANT NOTES
================================================================================

Token Management:
------------------------------------------------------------
  • Your tokens are stored in gemini_server.py (lines 26-27)
  • PSID and PSIDTS are required for authentication
  • Each setup creates its own isolated profile directory
  • Token ID is generated from your token values (MD5 hash)

Isolation:
------------------------------------------------------------
  • This server is COMPLETELY SEPARATE from the Spike app
  • Uses port 7777 (Spike app uses 6969)
  • Has its own token storage
  • Has its own cache directory
  • No connection to main app's services

Security:
------------------------------------------------------------
  • Keep gemini_server.py secure (contains your tokens)
  • Don't share this file publicly
  • Each setup uses an isolated profile directory
  • The server is for local/personal use


MANUAL SETUP (if you prefer)
================================================================================

Step 1: Install Dependencies
------------------------------------------------------------
    python -m pip install -r requirements.txt

This installs:
  • fastapi - Web framework
  • uvicorn - ASGI server
  • pydantic - Data validation
  • gemini-webapi - Gemini API client
  • requests - HTTP library


Step 2: Start the Server
------------------------------------------------------------
    python gemini_server.py

The server will be available at: http://localhost:7777

You'll see:
  [INFO] Token ID: a1b2c3d4
  [INFO] This unique ID identifies which tokens are being used
  [OK] Gemini client initialized successfully
  [OK] Active Token ID: a1b2c3d4
  [INFO] Starting standalone Gemini API server on port 7777


Step 3: Test the API
------------------------------------------------------------
Using cURL:

    curl http://localhost:7777/v1/chat/completions \\
      -H "Content-Type: application/json" \\
      -d "{\\"model\\": \\"gemini-3-flash\\", \\"messages\\": [{\\"role\\": \\"user\\", \\"content\\": \\"Hello!\\"}]}"

Using Python (see USAGE EXAMPLES section below)


TROUBLESHOOTING
================================================================================

"Authentication Failed"
------------------------------------------------------------
Problem: Your tokens are invalid or expired

Solutions:
  • Get new tokens from Google Gemini (gemini.google.com)
  • Make sure you copied the FULL PSID value (very long string)
  • Make sure you copied the FULL PSIDTS value (very long string)
  • Create a new setup from Spike app with updated tokens
  • Check Token ID to verify which tokens are being used

How to get tokens:
  1. Go to gemini.google.com and log in
  2. Open browser DevTools (F12)
  3. Go to Application → Cookies
  4. Copy __Secure-1PSID value (PSID)
  5. Copy __Secure-1PSIDTS value (PSIDTS)


"Port already in use"
------------------------------------------------------------
Problem: Another server is using port 7777

Solutions:
  • Stop the other server first
  • Or change the port in gemini_server.py (last line):
    uvicorn.run(app, host="0.0.0.0", port=7777)  ← Change 7777


"Module not found"
------------------------------------------------------------
Problem: Python dependencies not installed

Solutions:
  • Run: python -m pip install -r requirements.txt
  • Make sure you're using Python 3.8 or higher
  • Check: python --version


"Server timeout"
------------------------------------------------------------
Problem: Server took too long to start (>15 seconds)

Solutions:
  • Check setup_debug.log for detailed error information
  • Make sure you have internet connection
  • Verify your firewall isn't blocking Python
  • Try running manually: python gemini_server.py


"Token ID not showing"
------------------------------------------------------------
Problem: Token ID not displayed in output

Solutions:
  • Make sure you're using the latest version of Spike app
  • Create a NEW setup (old setups don't have Token ID feature)
  • Check gemini_server.py contains TOKEN_ID variable (line 33)


SWITCHING TOKENS
================================================================================

Method 1: Create New Setup (Recommended)
------------------------------------------------------------
  1. Open Spike app → Local Setup tab
  2. Enter your NEW tokens
  3. Choose a NEW folder
  4. Click "Create Setup"
  5. Run python setup.py in the new folder
  6. Verify Token ID is different from old setup

Method 2: Manual Edit
------------------------------------------------------------
  1. Stop the server (Ctrl+C)
  2. Open gemini_server.py in a text editor
  3. Update PSID and PSIDTS values (lines 26-27)
  4. Save the file
  5. Run python setup.py again
  6. Verify Token ID changed (confirms new tokens are used)

Verification:
------------------------------------------------------------
  • Different tokens should show DIFFERENT Token IDs
  • Same tokens should show SAME Token ID
  • If Token ID doesn't change, tokens might be the same


AVAILABLE MODELS
================================================================================

  • gemini-3-flash       - Fastest, general use (default)
  • gemini-3-flash-plus  - Enhanced flash model
  • gemini-3-pro         - Best quality, complex tasks
  • gemini-3.1-flash     - Alias for gemini-3-flash
  • gemini-3.1-pro       - Alias for gemini-3-pro
  • gemini-2.0-flash     - Alias for gemini-3-flash
  • gemini-2.0-flash-exp - Alias for gemini-3-flash

Model Mapping:
------------------------------------------------------------
The server automatically maps model names to internal Gemini models.
You can use any of the names above in your API requests.


USAGE EXAMPLES
================================================================================

Python Example:
------------------------------------------------------------
    import requests

    response = requests.post(
        'http://localhost:7777/v1/chat/completions',
        json={
            "model": "gemini-3-flash",
            "messages": [
                {"role": "user", "content": "Explain quantum computing"}
            ]
        }
    )
    
    result = response.json()
    print(result['choices'][0]['message']['content'])


JavaScript/Node.js Example:
------------------------------------------------------------
    const response = await fetch('http://localhost:7777/v1/chat/completions', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        model: 'gemini-3-flash',
        messages: [
          {role: 'user', content: 'Explain quantum computing'}
        ]
      })
    });
    
    const data = await response.json();
    console.log(data.choices[0].message.content);


cURL Example:
------------------------------------------------------------
    curl http://localhost:7777/v1/chat/completions \\
      -H "Content-Type: application/json" \\
      -d '{
        "model": "gemini-3-flash",
        "messages": [
          {"role": "user", "content": "Explain quantum computing"}
        ]
      }'


OpenAI Library Example (Python):
------------------------------------------------------------
    from openai import OpenAI

    client = OpenAI(
        base_url="http://localhost:7777/v1",
        api_key="not-needed"  # API key not required
    )

    response = client.chat.completions.create(
        model="gemini-3-flash",
        messages=[
            {"role": "user", "content": "Explain quantum computing"}
        ]
    )
    
    print(response.choices[0].message.content)


API Response Format:
------------------------------------------------------------
    {
      "id": "gemini-1",
      "object": "chat.completion",
      "choices": [{
        "index": 0,
        "message": {
          "role": "assistant",
          "content": "Response text here..."
        },
        "finish_reason": "stop"
      }],
      "model": "gemini-3-flash",
      "usage": {
        "prompt_tokens": 10,
        "completion_tokens": 50,
        "total_tokens": 60
      }
    }


DEPLOYMENT
================================================================================

This server can be deployed to any platform that supports Python:

Local Network:
------------------------------------------------------------
  • Change host in gemini_server.py: host="0.0.0.0"
  • Access from other devices: http://YOUR_IP:7777

Cloud Platforms:
------------------------------------------------------------
  • Heroku: Add Procfile with "web: python gemini_server.py"
  • Railway: Deploy directly from folder
  • Render: Use Python runtime
  • DigitalOcean: Deploy on App Platform
  • AWS/GCP/Azure: Use container or VM

Docker:
------------------------------------------------------------
  Create Dockerfile:
    FROM python:3.11-slim
    WORKDIR /app
    COPY requirements.txt .
    RUN pip install -r requirements.txt
    COPY gemini_server.py .
    EXPOSE 7777
    CMD ["python", "gemini_server.py"]

  Build and run:
    docker build -t gemini-api .
    docker run -p 7777:7777 gemini-api


FILES IN THIS SETUP
================================================================================

gemini_server.py
------------------------------------------------------------
  • Main API server (FastAPI application)
  • Contains your tokens (PSID, PSIDTS)
  • Contains Token ID for verification
  • Handles /v1/chat/completions endpoint
  • Handles /v1/models endpoint
  • Runs on port 7777

requirements.txt
------------------------------------------------------------
  • Python dependencies list
  • Used by setup.py to install packages
  • Contains: fastapi, uvicorn, pydantic, gemini-webapi, requests

setup.py
------------------------------------------------------------
  • One-command installer and launcher
  • Installs dependencies automatically
  • Starts server and tests it
  • Shows clean output with error handling
  • Saves debug log on errors

README.txt (this file)
------------------------------------------------------------
  • Complete documentation
  • Quick start guide
  • Troubleshooting tips
  • Usage examples
  • Deployment instructions


TECHNICAL DETAILS
================================================================================

Profile Isolation:
------------------------------------------------------------
Each setup uses a unique profile directory to avoid cache contamination:
  Location: C:\\Users\\USERNAME\\AppData\\Local\\Temp\\gemini-local-XXXXX
  Purpose: Stores browser profile and cached credentials
  Benefit: Multiple setups don't interfere with each other

Token ID Generation:
------------------------------------------------------------
  Algorithm: MD5 hash of (PSID + PSIDTS)
  Format: First 8 characters of hex digest
  Example: "a1b2c3d4"
  Purpose: Verify which tokens are being used

API Compatibility:
------------------------------------------------------------
  • OpenAI-compatible format
  • Works with OpenAI Python library
  • Works with any OpenAI-compatible client
  • Standard /v1/chat/completions endpoint

Error Handling:
------------------------------------------------------------
  • Clean output by default
  • Detailed errors only when needed
  • Full debug log saved to setup_debug.log
  • Specific error messages (e.g., "Authentication Failed")


SUPPORT
================================================================================

For issues and questions:
  • Check this README for troubleshooting tips
  • Check setup_debug.log for detailed error information
  • Create a new setup from Spike app if files are corrupted
  • Verify Token ID to confirm which tokens are being used

Common Issues:
  • Authentication Failed → Get new tokens from gemini.google.com
  • Port in use → Stop other server or change port
  • Module not found → Run: python -m pip install -r requirements.txt
  • Server timeout → Check internet connection and firewall


================================================================================
                              END OF README
================================================================================

Generated by: Spike App - Local Setup Feature
Version: 1.0.0
Documentation: Complete and up-to-date
`;
}
}

module.exports = { registerLocalSetupHandlers };
