"""Standalone script to run the Unified Proxy server"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path so we can import nexusai modules
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from nexusai.core.unified_proxy import UnifiedProxy


async def main():
    """Run the unified proxy server"""
    print("[INFO] Starting Unified Proxy...")
    print("[INFO] Gemini backend: http://localhost:6969")
    print("[INFO] Chat2API backend: http://localhost:5005")
    
    proxy = UnifiedProxy(
        gemini_url="http://localhost:6969",
        chat2api_url="http://localhost:5005"
    )
    
    print("[INFO] Unified Proxy listening on http://0.0.0.0:8000")
    await proxy.start_async(host="0.0.0.0", port=8000)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[INFO] Unified Proxy stopped")
    except Exception as e:
        print(f"[ERROR] Failed to start Unified Proxy: {e}")
        sys.exit(1)
