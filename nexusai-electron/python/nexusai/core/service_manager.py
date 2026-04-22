"""Service orchestration and management"""

import sys
import threading
from pathlib import Path
from typing import Dict, Optional
from PyQt6.QtCore import QObject, pyqtSignal

from .service_process import ServiceProcess, ServiceStatus, ServiceHealth
from .token_store import TokenStore
from .unified_proxy import UnifiedProxy


class ServiceManager(QObject):
    """Orchestrates all backend services"""
    
    service_status_changed = pyqtSignal(str, str, str)
    
    def __init__(self, root_path: Path, token_store: TokenStore):
        """
        Initialize ServiceManager
        
        Args:
            root_path: Root directory of NexusAI
            token_store: TokenStore instance for accessing tokens
        """
        super().__init__()
        self.root_path = Path(root_path)
        self.token_store = token_store
        self.services: Dict[str, ServiceProcess] = {}
        self.proxy: Optional[UnifiedProxy] = None
        self.proxy_thread: Optional[threading.Thread] = None
        
        self.initialize_services()
    
    def initialize_services(self) -> None:
        """Create service process instances"""
        python_exe = sys.executable
        
        gemini_script = self.root_path / "services" / "gemini" / "gemini_server.py"
        if gemini_script.exists():
            self.services["gemini"] = ServiceProcess(
                name="Gemini Bridge",
                command=[python_exe, str(gemini_script)],
                port=6969,
                cwd=str(gemini_script.parent),
                health_check_url="http://localhost:6969/v1/models"
            )
        
        self.proxy = UnifiedProxy(
            gemini_url="http://localhost:6969",
            chat2api_url="http://localhost:5005"
        )
    
    def start_all(self) -> None:
        """Start all services in sequence"""
        print("Starting all services...")
        
        if "gemini" in self.services:
            success = self.start_service("gemini")
            if success:
                import time
                print("Waiting for Gemini to initialize...")
                time.sleep(5)
        
        self.start_service("proxy")
    
    def stop_all(self) -> None:
        """Stop all services in reverse sequence"""
        print("Stopping all services...")
        
        self.stop_service("proxy")
        
        if "gemini" in self.services:
            self.stop_service("gemini")
    
    def start_service(self, name: str) -> bool:
        """
        Start individual service
        
        Args:
            name: Service name
            
        Returns:
            True if started successfully
        """
        if name == "proxy":
            return self._start_proxy()
        
        if name not in self.services:
            print(f"Service {name} not found")
            return False
        
        service = self.services[name]
        
        env = {}
        if name == "gemini":
            token = self.token_store.get_token("gemini")
            if token:
                env["GEMINI_ACCESS_TOKEN"] = token
        
        print(f"Starting {service.name}...")
        success = service.start(env=env if env else None)
        print(f"{service.name} start result: {success}, status: {service.status.value}")
        
        self._emit_status_change(name, service.status.value, service.error_message or "")
        
        return success
    
    def stop_service(self, name: str) -> bool:
        """
        Stop individual service
        
        Args:
            name: Service name
            
        Returns:
            True if stopped successfully
        """
        if name == "proxy":
            return self._stop_proxy()
        
        if name not in self.services:
            print(f"Service {name} not found")
            return False
        
        service = self.services[name]
        success = service.stop()
        
        self._emit_status_change(name, service.status.value, service.error_message or "")
        
        return success
    
    def get_service_status(self, name: str) -> ServiceStatus:
        """
        Get current service status
        
        Args:
            name: Service name
            
        Returns:
            Service status
        """
        if name == "proxy":
            if self.proxy_thread and self.proxy_thread.is_alive():
                return ServiceStatus.RUNNING
            return ServiceStatus.STOPPED
        
        if name in self.services:
            return self.services[name].status
        
        return ServiceStatus.STOPPED
    
    def get_overall_health(self) -> ServiceHealth:
        """
        Aggregate health across all services
        
        Returns:
            Overall health status
        """
        all_healthy = True
        any_unhealthy = False
        
        for service in self.services.values():
            if service.status == ServiceStatus.RUNNING:
                if service.health == ServiceHealth.UNHEALTHY:
                    any_unhealthy = True
                elif service.health != ServiceHealth.HEALTHY:
                    all_healthy = False
        
        if any_unhealthy:
            return ServiceHealth.UNHEALTHY
        elif all_healthy:
            return ServiceHealth.HEALTHY
        else:
            return ServiceHealth.UNKNOWN
    
    def check_service_health(self, name: str) -> bool:
        """
        Check health of specific service
        
        Args:
            name: Service name
            
        Returns:
            True if healthy
        """
        if name == "proxy":
            try:
                import httpx
                response = httpx.get("http://localhost:8000/health", timeout=2.0)
                return response.status_code == 200
            except:
                return False
        
        if name in self.services:
            return self.services[name].is_healthy()
        
        return False
    
    def get_service_logs(self, name: str, lines: int = 50) -> list:
        """
        Get logs for service
        
        Args:
            name: Service name
            lines: Number of lines to retrieve
            
        Returns:
            List of log lines
        """
        if name in self.services:
            return self.services[name].get_logs(lines)
        return []
    
    def _start_proxy(self) -> bool:
        """Start the unified proxy"""
        if self.proxy_thread and self.proxy_thread.is_alive():
            print("Proxy already running")
            return True
        
        try:
            def run_proxy():
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(self.proxy.start_async(host="0.0.0.0", port=8000))
            
            self.proxy_thread = threading.Thread(target=run_proxy, daemon=True)
            self.proxy_thread.start()
            
            import time
            time.sleep(1)
            
            self._emit_status_change("proxy", "running", "")
            return True
            
        except Exception as e:
            print(f"Error starting proxy: {e}")
            self._emit_status_change("proxy", "error", str(e))
            return False
    
    def _stop_proxy(self) -> bool:
        """Stop the unified proxy"""
        if self.proxy and self.proxy.server:
            try:
                self.proxy.server.should_exit = True
                self.proxy_thread = None
                self._emit_status_change("proxy", "stopped", "")
                return True
            except Exception as e:
                print(f"Error stopping proxy: {e}")
                return False
        return True
    
    def _emit_status_change(self, service: str, status: str, error: str):
        """Emit status change signal"""
        self.service_status_changed.emit(service, status, error)
