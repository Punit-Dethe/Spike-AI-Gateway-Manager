"""
Spike Lite - System Tray Application
Manages the server and provides system tray interface
"""

import sys
import threading
import webbrowser
import time
import socket
import logging
from pathlib import Path
from datetime import datetime
from PIL import Image, ImageDraw
import pystray
from pystray import MenuItem as item
import uvicorn
from server import app as fastapi_app

# Setup logging
log_file = Path(__file__).parent / "spike_lite.log"
if hasattr(sys, '_MEIPASS'):
    # When running as exe, log to user's temp folder
    import tempfile
    log_file = Path(tempfile.gettempdir()) / "spike_lite.log"

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file, mode='w'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

logger.info("="*60)
logger.info("Spike Lite Starting")
logger.info(f"Log file: {log_file}")
logger.info(f"Python version: {sys.version}")
logger.info(f"Running as exe: {hasattr(sys, '_MEIPASS')}")
if hasattr(sys, '_MEIPASS'):
    logger.info(f"_MEIPASS: {sys._MEIPASS}")
logger.info("="*60)

class SingleInstanceChecker:
    """Ensure only one instance of the application runs"""
    def __init__(self, port=6970):
        self.port = port
        self.socket = None
        logger.info(f"SingleInstanceChecker initialized on port {port}")
        
    def is_already_running(self):
        """Check if another instance is already running"""
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.bind(('127.0.0.1', self.port))
            logger.info("No other instance detected")
            return False
        except socket.error as e:
            logger.warning(f"Another instance is running: {e}")
            return True
    
    def cleanup(self):
        """Release the socket"""
        if self.socket:
            try:
                self.socket.close()
                logger.info("Instance checker socket closed")
            except Exception as e:
                logger.error(f"Error closing socket: {e}")

class SpikeLiteApp:
    def __init__(self):
        self.server_thread = None
        self.server_running = False
        self.icon = None
        self.port = 6969
        self.instance_checker = SingleInstanceChecker()
        logger.info(f"SpikeLiteApp initialized, server port: {self.port}")
        
    def create_icon(self):
        """Create system tray icon"""
        logger.info("Creating system tray icon...")
        
        # Use the logo.png file
        logo_path = Path(__file__).parent / "logo.png"
        logger.info(f"Looking for logo at: {logo_path}")
        
        # For PyInstaller, check in _MEIPASS
        if not logo_path.exists() and hasattr(sys, '_MEIPASS'):
            logo_path = Path(sys._MEIPASS) / "logo.png"
            logger.info(f"Trying PyInstaller path: {logo_path}")
        
        if logo_path.exists():
            try:
                image = Image.open(logo_path)
                logger.info(f"Logo loaded successfully, size: {image.size}")
                # Resize to 64x64 if needed
                if image.size != (64, 64):
                    image = image.resize((64, 64), Image.Resampling.LANCZOS)
                    logger.info("Logo resized to 64x64")
                return image
            except Exception as e:
                logger.error(f"Failed to load logo: {e}", exc_info=True)
        else:
            logger.warning(f"Logo not found at {logo_path}, using fallback")
        
        # Fallback: Create a simple icon
        logger.info("Creating fallback icon")
        width = 64
        height = 64
        image = Image.new('RGB', (width, height), color='white')
        draw = ImageDraw.Draw(image)
        draw.ellipse([4, 4, 60, 60], fill='#b39f7e', outline='#7d6b52', width=2)
        
        try:
            from PIL import ImageFont
            font = ImageFont.truetype("arial.ttf", 32)
            draw.text((18, 12), 'S', fill='white', font=font)
        except:
            draw.text((20, 18), 'S', fill='white')
        
        logger.info("Fallback icon created")
        return image
    
    def start_server(self):
        """Start the FastAPI server in background thread"""
        if self.server_running:
            logger.warning("Server already running, skipping start")
            return
        
        logger.info("Starting FastAPI server...")
        
        def run():
            import asyncio
            import io
            
            logger.info(f"Server thread started, thread ID: {threading.get_ident()}")
            
            # Redirect stdout/stderr to log when running as exe without console
            if hasattr(sys, '_MEIPASS') and not sys.stdout:
                logger.info("Redirecting stdout/stderr to log file")
                sys.stdout = io.StringIO()
                sys.stderr = io.StringIO()
            
            # Fix for Windows and PyInstaller
            if sys.platform == 'win32':
                logger.info("Setting Windows event loop policy")
                asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
            
            # Create new event loop for this thread
            logger.info("Creating new event loop")
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            logger.info(f"Configuring uvicorn on 127.0.0.1:{self.port}")
            
            # Configure uvicorn with log config that works without console
            log_config = uvicorn.config.LOGGING_CONFIG
            log_config["handlers"]["default"]["stream"] = "ext://sys.stderr"
            log_config["handlers"]["access"]["stream"] = "ext://sys.stderr"
            
            config = uvicorn.Config(
                app=fastapi_app,
                host="127.0.0.1",
                port=self.port,
                log_level="info",
                access_log=False,  # Disable access log to avoid stdout issues
                loop="asyncio",
                log_config=log_config
            )
            server = uvicorn.Server(config)
            
            try:
                logger.info("Starting uvicorn server...")
                loop.run_until_complete(server.serve())
                logger.info("Uvicorn server stopped")
            except Exception as e:
                logger.error(f"Server error: {e}", exc_info=True)
            finally:
                logger.info("Closing event loop")
                loop.close()
        
        self.server_thread = threading.Thread(target=run, daemon=True, name="ServerThread")
        self.server_thread.start()
        self.server_running = True
        logger.info("Server thread started")
        
        # Wait for server to start
        logger.info("Waiting for server to start (3 seconds)...")
        time.sleep(3)
        
        # Verify server is running
        logger.info("Verifying server is running...")
        try:
            import requests
            response = requests.get(f"http://127.0.0.1:{self.port}/api/status", timeout=5)
            logger.info(f"Server verification response: {response.status_code}")
            if response.status_code == 200:
                logger.info(f"✓ Server running successfully on http://127.0.0.1:{self.port}")
                print(f"✓ Server running on http://127.0.0.1:{self.port}")
            else:
                logger.warning(f"Server responded with unexpected status: {response.status_code}")
                logger.warning(f"Response body: {response.text}")
        except Exception as e:
            logger.error(f"Could not verify server: {e}", exc_info=True)
            logger.error("Server may not have started correctly!")
            
            # Try to check if port is in use
            try:
                test_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                result = test_socket.connect_ex(('127.0.0.1', self.port))
                if result == 0:
                    logger.info(f"Port {self.port} is open (something is listening)")
                else:
                    logger.error(f"Port {self.port} is not open (nothing listening)")
                test_socket.close()
            except Exception as se:
                logger.error(f"Could not check port: {se}")
    
    def open_dashboard(self, icon, item):
        """Open web dashboard in browser"""
        logger.info("Opening dashboard in browser")
        try:
            webbrowser.open(f"http://localhost:{self.port}")
            logger.info("Browser opened successfully")
        except Exception as e:
            logger.error(f"Failed to open browser: {e}", exc_info=True)
    
    def quit_app(self, icon, item):
        """Quit the application"""
        logger.info("Quit requested")
        self.server_running = False
        self.instance_checker.cleanup()
        icon.stop()
        logger.info("Application exiting")
        sys.exit(0)
    
    def run(self):
        """Run the system tray application"""
        logger.info("Running main application")
        
        # Check for existing instance
        if self.instance_checker.is_already_running():
            logger.warning("Another instance is already running!")
            print("⚠ Spike Lite is already running!")
            print("Check your system tray for the running instance.")
            
            # Try to open the dashboard of the running instance
            try:
                webbrowser.open(f"http://localhost:{self.port}")
                logger.info("Opened dashboard of existing instance")
            except Exception as e:
                logger.error(f"Could not open dashboard: {e}")
            
            # Show message box on Windows
            try:
                import ctypes
                ctypes.windll.user32.MessageBoxW(
                    0,
                    "Spike Lite is already running!\n\nCheck your system tray.",
                    "Spike Lite",
                    0x40 | 0x0
                )
                logger.info("Showed message box")
            except Exception as e:
                logger.error(f"Could not show message box: {e}")
            
            sys.exit(1)
        
        # Start server
        logger.info("Starting server...")
        self.start_server()
        
        # Create icon
        logger.info("Creating tray icon...")
        icon_image = self.create_icon()
        
        # Create menu
        logger.info("Creating tray menu...")
        menu = pystray.Menu(
            item('Open Dashboard', self.open_dashboard, default=True),
            item('Server Status', lambda: None, enabled=False),
            item(f'  Running on port {self.port}', lambda: None, enabled=False),
            pystray.Menu.SEPARATOR,
            item('Exit', self.quit_app)
        )
        
        # Create and run tray icon
        logger.info("Creating system tray icon...")
        self.icon = pystray.Icon(
            "spike_lite",
            icon_image,
            "Spike Lite - OpenAI Gateway",
            menu
        )
        
        # Auto-open dashboard on first run
        logger.info("Waiting 1 second before opening dashboard...")
        time.sleep(1)
        logger.info("Opening dashboard...")
        try:
            webbrowser.open(f"http://localhost:{self.port}")
            logger.info("Dashboard opened")
        except Exception as e:
            logger.error(f"Failed to open dashboard: {e}", exc_info=True)
        
        # Run icon (blocks)
        logger.info("Starting system tray icon (blocking)...")
        try:
            self.icon.run()
        except Exception as e:
            logger.error(f"Tray icon error: {e}", exc_info=True)
        finally:
            logger.info("Cleaning up...")
            self.instance_checker.cleanup()
            logger.info("Application ended")

if __name__ == "__main__":
    try:
        logger.info("Starting Spike Lite application")
        tray_app = SpikeLiteApp()
        tray_app.run()
    except Exception as e:
        logger.critical(f"Fatal error: {e}", exc_info=True)
        print(f"\n\nFATAL ERROR: {e}")
        print(f"Check log file: {log_file}")
        input("Press Enter to exit...")
        sys.exit(1)
