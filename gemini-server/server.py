"""
Gemini API Server - Main Backend
Handles Gemini API requests using gemini-webapi library
"""

import asyncio
import sys
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Any
from gemini_webapi import GeminiClient
import json
import os
from pathlib import Path
from fastapi.responses import FileResponse

app = FastAPI(title="Spike Lite API Server")

# Mount static files
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# CORS for web UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Serve the web UI"""
    return FileResponse(static_dir / "index.html")

# Global client
client: Optional[GeminiClient] = None
client_initialized = False

# Token storage
PSID = ""
PSIDTS = ""

# Token persistence file
# Use AppData folder when running as exe, otherwise use script directory
if getattr(sys, 'frozen', False):
    # Running as exe - use AppData
    import os
    appdata = Path(os.getenv('APPDATA')) / 'SpikeLite'
    appdata.mkdir(exist_ok=True)
    TOKEN_FILE = appdata / "tokens.json"
else:
    # Running as script - use script directory
    TOKEN_FILE = Path(__file__).parent / "tokens.json"

def load_tokens():
    """Load tokens from file"""
    global PSID, PSIDTS
    try:
        if TOKEN_FILE.exists():
            with open(TOKEN_FILE, 'r') as f:
                data = json.load(f)
                PSID = data.get('psid', '')
                PSIDTS = data.get('psidts', '')
                print(f"✓ Tokens loaded from {TOKEN_FILE}")
    except Exception as e:
        print(f"⚠ Failed to load tokens: {e}")

def save_tokens_to_file():
    """Save tokens to file"""
    try:
        with open(TOKEN_FILE, 'w') as f:
            json.dump({
                'psid': PSID,
                'psidts': PSIDTS
            }, f)
        print(f"✓ Tokens saved to {TOKEN_FILE}")
    except Exception as e:
        print(f"⚠ Failed to save tokens: {e}")

def delete_tokens_file():
    """Delete tokens file"""
    try:
        if TOKEN_FILE.exists():
            TOKEN_FILE.unlink()
            print(f"✓ Tokens file deleted")
    except Exception as e:
        print(f"⚠ Failed to delete tokens file: {e}")

# Load tokens on startup
load_tokens()

# Model mapping
MODEL_MAP = {
    "gemini-3-flash": "gemini-3-flash",
    "gemini-3.1-flash": "gemini-3-flash",
    "gemini-2.0-flash": "gemini-3-flash",
    "gemini-3.1-pro": "gemini-3-pro",
    "gemini-3-pro": "gemini-3-pro",
}

class Message(BaseModel):
    role: str
    content: Any

class ChatRequest(BaseModel):
    model: str = "gemini-2.0-flash"
    messages: List[Message]
    stream: Optional[bool] = False
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None

class TokenConfig(BaseModel):
    psid: str
    psidts: str

def extract_text(content: Any) -> str:
    """Extract text from message content"""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict):
                if block.get("type") == "text":
                    parts.append(block.get("text", ""))
            elif isinstance(block, str):
                parts.append(block)
        return "\n".join(p for p in parts if p)
    return str(content)

def build_prompt(messages: List[Message]) -> str:
    """Build prompt from messages"""
    parts = []
    for msg in messages:
        text = extract_text(msg.content)
        if not text.strip():
            continue
        role_label = {
            "user": "User",
            "assistant": "Assistant",
            "system": "System"
        }.get(msg.role, msg.role.capitalize())
        parts.append(f"{role_label}: {text}")
    return "\n\n".join(parts)

@app.post("/api/tokens")
async def save_tokens(config: TokenConfig):
    """Save Gemini tokens"""
    global PSID, PSIDTS, client, client_initialized
    
    PSID = config.psid
    PSIDTS = config.psidts
    
    # Save to file
    save_tokens_to_file()
    
    # Reset client
    if client:
        try:
            await client.close()
        except:
            pass
    client = None
    client_initialized = False
    
    return {"status": "success", "message": "Tokens saved"}

@app.delete("/api/tokens")
async def clear_tokens():
    """Clear all tokens"""
    global PSID, PSIDTS, client, client_initialized
    
    PSID = ""
    PSIDTS = ""
    
    # Delete tokens file
    delete_tokens_file()
    
    # Reset client
    if client:
        try:
            await client.close()
        except:
            pass
    client = None
    client_initialized = False
    
    return {"status": "success", "message": "Tokens cleared"}

@app.get("/api/tokens")
async def get_tokens():
    """Get current tokens (masked)"""
    psid_length = len(PSID)
    psidts_length = len(PSIDTS)
    
    return {
        "psid": PSID[:20] + "..." if psid_length > 20 else PSID,
        "psidts": PSIDTS[:20] + "..." if psidts_length > 20 else PSIDTS,
        "psid_length": psid_length,
        "psidts_length": psidts_length,
        "configured": bool(PSID and PSIDTS)
    }

@app.post("/api/initialize")
async def initialize_client():
    """Initialize Gemini client"""
    global client, client_initialized
    
    if not PSID or not PSIDTS:
        raise HTTPException(status_code=400, detail="Tokens not configured")
    
    try:
        if client:
            await client.close()
        
        client = GeminiClient(PSID, PSIDTS)
        await client.init(timeout=30)
        client_initialized = True
        
        return {"status": "success", "message": "Client initialized"}
    except Exception as e:
        client_initialized = False
        raise HTTPException(status_code=500, detail=f"Failed to initialize: {str(e)}")

@app.post("/api/stop")
async def stop_client():
    """Stop Gemini client"""
    global client, client_initialized
    
    if client:
        try:
            await client.close()
        except:
            pass
    
    client = None
    client_initialized = False
    
    return {"status": "success", "message": "Client stopped"}

@app.get("/api/status")
async def get_status():
    """Get server status"""
    return {
        "tokens_configured": bool(PSID and PSIDTS),
        "client_initialized": client_initialized,
        "ready": client_initialized
    }

@app.post("/v1/chat/completions")
async def chat_completion(req: ChatRequest):
    """OpenAI-compatible chat completion endpoint"""
    global client, client_initialized
    
    # Auto-initialize if needed
    if not client_initialized:
        if not PSID or not PSIDTS:
            raise HTTPException(status_code=400, detail="Tokens not configured")
        try:
            client = GeminiClient(PSID, PSIDTS)
            await client.init(timeout=30)
            client_initialized = True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to initialize: {str(e)}")
    
    # Build prompt
    prompt = build_prompt(req.messages)
    
    # Map model
    internal_model = MODEL_MAP.get(req.model, "gemini-3-flash")
    
    try:
        # Generate content
        response = await client.generate_content(prompt, model=internal_model)
        
        # Return OpenAI format
        return JSONResponse({
            "id": "gemini-1",
            "object": "chat.completion",
            "created": 1234567890,
            "model": req.model,
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": response.text
                },
                "finish_reason": "stop"
            }],
            "usage": {
                "prompt_tokens": len(prompt.split()),
                "completion_tokens": len(response.text.split()),
                "total_tokens": len(prompt.split()) + len(response.text.split())
            }
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@app.get("/v1/models")
async def list_models():
    """List available models"""
    return JSONResponse({
        "object": "list",
        "data": [
            {"id": "gemini-3-flash", "object": "model", "owned_by": "google"},
            {"id": "gemini-3.1-flash", "object": "model", "owned_by": "google"},
            {"id": "gemini-3.1-pro", "object": "model", "owned_by": "google"},
            {"id": "gemini-2.0-flash", "object": "model", "owned_by": "google"}
        ]
    })

@app.on_event("shutdown")
async def shutdown():
    """Cleanup on shutdown"""
    global client
    if client:
        try:
            await client.close()
        except:
            pass

def run_server(port: int = 6969):
    """Run the FastAPI server"""
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")

if __name__ == "__main__":
    run_server()
