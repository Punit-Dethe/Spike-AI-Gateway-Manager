"""Standalone launcher for Unified Proxy - just imports and runs the main app"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Import and run
if __name__ == "__main__":
    from nexusai.core.unified_proxy import app
    import uvicorn
    
    print("=" * 60)
    print("NexusAI Unified Proxy")
    print("=" * 60)
    print("Gemini Bridge:  http://127.0.0.1:6969")
    print("Chat2API:       http://127.0.0.1:5005")
    print("Proxy:          http://0.0.0.0:8000")
    print("=" * 60)

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info", access_log=False)
