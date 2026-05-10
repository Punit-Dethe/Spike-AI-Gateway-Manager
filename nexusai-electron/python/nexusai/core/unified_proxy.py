"""
Unified API Proxy - Routes requests to Gemini or ChatGPT backends
Simple, efficient passthrough proxy with model-based routing
"""

import httpx
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse

app = FastAPI(title="NexusAI Unified Proxy")

# Backend service URLs
GEMINI_URL = "http://localhost:6969"
CHAT2API_URL = "http://localhost:5005"


def route_to_backend(model: str) -> str:
    """Route request to appropriate backend based on model name"""
    model_lower = model.lower()
    
    # ChatGPT models → Chat2API
    if model_lower.startswith(("gpt-", "o1", "o3")):
        return CHAT2API_URL
    
    # Gemini models → Gemini Bridge
    return GEMINI_URL


@app.post("/v1/chat/completions")
async def chat_completions(request: Request):
    """Forward chat requests to appropriate backend"""
    try:
        # Get raw body and parse for routing
        body = await request.body()
        
        import json
        try:
            body_json = json.loads(body)
            model = body_json.get("model", "gemini-3-flash")
            stream = body_json.get("stream", False)
        except:
            model = "gemini-3-flash"
            stream = False
        
        # Route to backend
        backend_url = route_to_backend(model)
        target_url = f"{backend_url}/v1/chat/completions"
        
        # Forward headers (remove host)
        headers = dict(request.headers)
        headers.pop("host", None)
        
        # Handle streaming vs non-streaming
        if stream:
            async def generate():
                async with httpx.AsyncClient(timeout=120.0) as client:
                    async with client.stream("POST", target_url, content=body, headers=headers) as response:
                        async for chunk in response.aiter_bytes():
                            yield chunk
            
            return StreamingResponse(generate(), media_type="text/event-stream")
        else:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(target_url, content=body, headers=headers)
                
                return JSONResponse(
                    status_code=response.status_code,
                    content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"error": response.text}
                )
    
    except httpx.ConnectError:
        return JSONResponse(
            status_code=503,
            content={"error": {"message": "Backend service unavailable", "type": "service_unavailable"}}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": {"message": f"Proxy error: {str(e)}", "type": "internal_error"}}
        )


@app.get("/v1/models")
async def list_models():
    """Aggregate models from all backends"""
    models = []
    
    # Try Gemini
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{GEMINI_URL}/v1/models")
            if response.status_code == 200:
                models.extend(response.json().get("data", []))
    except:
        pass
    
    # Try Chat2API
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{CHAT2API_URL}/v1/models")
            if response.status_code == 200:
                models.extend(response.json().get("data", []))
    except:
        pass
    
    # Fallback if backends are down
    if not models:
        models = [
            {"id": "gemini-3-flash", "object": "model", "owned_by": "google"},
            {"id": "gemini-2.0-flash", "object": "model", "owned_by": "google"},
            {"id": "gpt-4o", "object": "model", "owned_by": "openai"},
            {"id": "gpt-4o-mini", "object": "model", "owned_by": "openai"},
        ]
    
    return {"object": "list", "data": models}


@app.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy", "service": "unified-proxy"}


if __name__ == "__main__":
    print("=" * 60)
    print("NexusAI Unified Proxy")
    print("=" * 60)
    print(f"Gemini Bridge:  {GEMINI_URL}")
    print(f"Chat2API:       {CHAT2API_URL}")
    print(f"Proxy:          http://0.0.0.0:8000")
    print("=" * 60)
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info", access_log=False)
