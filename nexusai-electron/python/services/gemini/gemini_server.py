import asyncio
import uvicorn
import os
import sys
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Any
from gemini_webapi import GeminiClient

# ── TOKEN CONFIGURATION ──────────────────────────────────
# Tokens are loaded from environment variables or config file
# DO NOT hardcode tokens here - they will be exposed in the build!

def get_token(key, default=""):
    """Get token from environment variable or return default"""
    return os.environ.get(key, default)

PSID   = get_token('GEMINI_PSID', '')
PSIDTS = get_token('GEMINI_PSIDTS', '')

# Validate tokens
if not PSID or not PSIDTS:
    print("[WARNING] Gemini tokens not configured!")
    print("[INFO] Set GEMINI_PSID and GEMINI_PSIDTS environment variables")
# ─────────────────────────────────────────────────────────

DEFAULT_MODEL = "gemini-3-flash"

# Maps friendly/external names → internal names the library actually knows
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
        print("[ERROR] Gemini tokens not configured! Server will not work.")
        print("[INFO] Please configure tokens in the Spike app.")
        return
    
    try:
        client = GeminiClient(PSID, PSIDTS)
        await client.init(timeout=30)
        print("[OK] Gemini client ready!")
        print(f"[INFO] Default model: {DEFAULT_MODEL}")
        print(f"[INFO] PSID: {PSID[:15]}...")
        print(f"[INFO] PSIDTS: {PSIDTS[:15]}...")
    except Exception as e:
        print(f"[ERROR] Failed to initialize Gemini client: {e}")
        print("[INFO] Please check your tokens and try again.")

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
        return "\n".join(p for p in parts if p)
    return str(content)

def build_prompt(messages: List[Message]) -> str:
    parts = []
    for msg in messages:
        text = extract_text(msg.content)
        if not text.strip():
            continue
        role_label = {"user": "User", "assistant": "Assistant", "system": "System"}.get(msg.role, msg.role.capitalize())
        parts.append(f"{role_label}: {text}")
    return "\n\n".join(parts)

@app.post("/v1/chat/completions")
async def chat(req: ChatRequest):
    prompt = build_prompt(req.messages)
    requested_model = req.model if req.model else DEFAULT_MODEL
    # Map to internal library name, fallback to unspecified if unknown
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
    uvicorn.run(app, host="0.0.0.0", port=6969)