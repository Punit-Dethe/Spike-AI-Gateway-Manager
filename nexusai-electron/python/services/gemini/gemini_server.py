import asyncio
import uvicorn
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Any
from gemini_webapi import GeminiClient

# ── PASTE YOUR COOKIES HERE ──────────────────────────────
PSID   = "g.a0009AhUeW27GYF4j6CXQXHK5Pb_QFcuDpu6tOdJjicOh3gYSd51DeW5PYRCzRYLDEEoDDUjbAACgYKAVgSARcSFQHGX2MioHlDGC6IV_vGFLHGM03WORoVAUF8yKqcuo37QmlgOkSTGai7iepQ0076"
PSIDTS = "sidts-CjcBWhotCVYTJ8cTMNPaKamY5Go8XNMNq_1dfUv28y-5V4EHdd98ttfxiP9RGTA9voLFi5pitAr7EAA"
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
    client = GeminiClient(PSID, PSIDTS)
    await client.init(timeout=30)
    print("[OK] Gemini client ready!")
    print(f"[INFO] Default model: {DEFAULT_MODEL}")

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