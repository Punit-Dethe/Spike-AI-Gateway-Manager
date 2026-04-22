"""Unified API proxy that routes requests to backend services"""

import asyncio
import httpx
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse
from typing import Optional
import uvicorn


class UnifiedProxy:
    """HTTP proxy that routes requests to appropriate AI backend"""
    
    def __init__(self, gemini_url: str = "http://localhost:6969", chat2api_url: str = "http://localhost:5005"):
        """
        Initialize UnifiedProxy with backend URLs
        
        Args:
            gemini_url: URL for Gemini Bridge service
            chat2api_url: URL for Chat2API service
        """
        self.gemini_url = gemini_url
        self.chat2api_url = chat2api_url
        self.app: Optional[FastAPI] = None
        self.server: Optional[uvicorn.Server] = None
        self.server_task: Optional[asyncio.Task] = None
        
    def create_app(self) -> FastAPI:
        """
        Create FastAPI application with routes
        
        Returns:
            Configured FastAPI app
        """
        app = FastAPI(title="NexusAI Unified Proxy")
        
        @app.post("/v1/chat/completions")
        async def chat_completions(request: Request):
            return await self._handle_chat_completions(request)
        
        @app.get("/v1/models")
        async def list_models():
            return await self._handle_list_models()
        
        @app.get("/health")
        async def health():
            return {"status": "healthy"}
        
        return app
    
    def route_request(self, model: str) -> str:
        """
        Determine backend URL based on model name
        
        Args:
            model: Model name from request
            
        Returns:
            Backend service URL
            
        Raises:
            ValueError: If model is unknown
        """
        model_lower = model.lower()
        
        if model_lower.startswith(("gpt-", "o1", "o3")):
            return self.chat2api_url
        elif model_lower.startswith("gemini"):
            return self.gemini_url
        else:
            raise ValueError(f"Unknown model: {model}")
    
    async def _handle_chat_completions(self, request: Request):
        """Handle POST /v1/chat/completions"""
        try:
            body = await request.json()
            model = body.get("model", "gemini-3-flash")
            stream = body.get("stream", False)
            
            backend_url = self.route_request(model)
            target_url = f"{backend_url}/v1/chat/completions"
            
            if stream:
                return await self._forward_streaming_request(target_url, body, request.headers)
            else:
                return await self._forward_request(target_url, body, request.headers)
                
        except ValueError as e:
            return JSONResponse(
                status_code=400,
                content={"error": {"message": str(e), "type": "invalid_request_error"}}
            )
        except httpx.ConnectError:
            return JSONResponse(
                status_code=503,
                content={"error": {"message": "Backend service unavailable", "type": "service_unavailable"}}
            )
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": {"message": str(e), "type": "internal_error"}}
            )
    
    async def _handle_list_models(self):
        """Handle GET /v1/models - aggregate from all backends"""
        models = []
        
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                try:
                    response = await client.get(f"{self.gemini_url}/v1/models")
                    if response.status_code == 200:
                        data = response.json()
                        if "data" in data:
                            models.extend(data["data"])
                except:
                    pass
                
                try:
                    response = await client.get(f"{self.chat2api_url}/v1/models")
                    if response.status_code == 200:
                        data = response.json()
                        if "data" in data:
                            models.extend(data["data"])
                except:
                    pass
        except:
            pass
        
        if not models:
            models = [
                {"id": "gemini-3-flash", "object": "model", "owned_by": "google"},
                {"id": "gemini-2.0-flash", "object": "model", "owned_by": "google"},
            ]
        
        return JSONResponse({"object": "list", "data": models})
    
    async def _forward_request(self, target_url: str, body: dict, headers: dict):
        """Forward non-streaming request to backend"""
        # Extract Authorization header if present
        forward_headers = {"Content-Type": "application/json"}
        if "authorization" in headers or "Authorization" in headers:
            auth_header = headers.get("authorization") or headers.get("Authorization")
            forward_headers["Authorization"] = auth_header
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                target_url,
                json=body,
                headers=forward_headers
            )
            return JSONResponse(
                status_code=response.status_code,
                content=response.json()
            )
    
    async def _forward_streaming_request(self, target_url: str, body: dict, headers: dict):
        """Forward streaming request to backend"""
        # Extract Authorization header if present
        forward_headers = {"Content-Type": "application/json"}
        if "authorization" in headers or "Authorization" in headers:
            auth_header = headers.get("authorization") or headers.get("Authorization")
            forward_headers["Authorization"] = auth_header
        
        async def generate():
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    target_url,
                    json=body,
                    headers=forward_headers
                ) as response:
                    async for chunk in response.aiter_bytes():
                        yield chunk
        
        return StreamingResponse(
            generate(),
            media_type="text/event-stream"
        )
    
    async def start_async(self, host: str = "0.0.0.0", port: int = 8000):
        """Start the proxy server asynchronously"""
        self.app = self.create_app()
        config = uvicorn.Config(
            self.app,
            host=host,
            port=port,
            log_level="info",
            access_log=False
        )
        self.server = uvicorn.Server(config)
        await self.server.serve()
    
    def start(self, host: str = "0.0.0.0", port: int = 8000):
        """
        Start the proxy server in background
        
        Args:
            host: Host to bind to
            port: Port to listen on
        """
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        self.server_task = loop.create_task(self.start_async(host, port))
    
    async def stop_async(self):
        """Stop the proxy server asynchronously"""
        if self.server:
            self.server.should_exit = True
            await asyncio.sleep(0.1)
    
    def stop(self):
        """Stop the proxy server"""
        if self.server_task:
            asyncio.run(self.stop_async())
