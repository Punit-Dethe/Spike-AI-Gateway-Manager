"""Service process management"""

import subprocess
import psutil
import httpx
import time
from pathlib import Path
from typing import List, Dict, Optional
from enum import Enum
from collections import deque


class ServiceStatus(Enum):
    """Service status states"""
    STOPPED = "stopped"
    STARTING = "starting"
    RUNNING = "running"
    STOPPING = "stopping"
    ERROR = "error"


class ServiceHealth(Enum):
    """Service health states"""
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"


class ServiceProcess:
    """Wrapper for managing a backend service subprocess"""
    
    def __init__(self, name: str, command: List[str], port: int, cwd: str, health_check_url: Optional[str] = None):
        """
        Initialize ServiceProcess
        
        Args:
            name: Service name
            command: Command and arguments to launch service
            port: Port the service listens on
            cwd: Working directory for the process
            health_check_url: URL to check service health (optional)
        """
        self.name = name
        self.command = command
        self.port = port
        self.cwd = Path(cwd)
        self.health_check_url = health_check_url or f"http://localhost:{port}/health"
        
        self.process: Optional[subprocess.Popen] = None
        self.status = ServiceStatus.STOPPED
        self.health = ServiceHealth.UNKNOWN
        self.error_message: Optional[str] = None
        
        self.log_buffer = deque(maxlen=50)
        
    def start(self, env: Optional[Dict[str, str]] = None) -> bool:
        """
        Start the service subprocess
        
        Args:
            env: Environment variables to pass to subprocess
            
        Returns:
            True if started successfully
        """
        if self.process and self.process.poll() is None:
            print(f"{self.name} is already running")
            return True
        
        try:
            self.status = ServiceStatus.STARTING
            self.error_message = None
            
            import os
            process_env = os.environ.copy()
            if env:
                process_env.update(env)
            
            self.process = subprocess.Popen(
                self.command,
                cwd=str(self.cwd),
                env=process_env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                stdin=subprocess.DEVNULL,
                text=True,
                bufsize=1,
                creationflags=subprocess.CREATE_NO_WINDOW if hasattr(subprocess, 'CREATE_NO_WINDOW') else 0
            )
            
            time.sleep(2)
            
            if self.process.poll() is not None:
                self.status = ServiceStatus.ERROR
                self.error_message = f"Process exited immediately with code {self.process.returncode}"
                return False
            
            self.status = ServiceStatus.RUNNING
            self.health = ServiceHealth.UNKNOWN
            return True
            
        except Exception as e:
            self.status = ServiceStatus.ERROR
            self.error_message = str(e)
            print(f"Error starting {self.name}: {e}")
            return False
    
    def stop(self, timeout: int = 10) -> bool:
        """
        Stop the service gracefully
        
        Args:
            timeout: Seconds to wait before force-killing
            
        Returns:
            True if stopped successfully
        """
        if not self.process:
            self.status = ServiceStatus.STOPPED
            return True
        
        try:
            self.status = ServiceStatus.STOPPING
            
            if self.process.poll() is None:
                try:
                    proc = psutil.Process(self.process.pid)
                    proc.terminate()
                    proc.wait(timeout=timeout)
                except psutil.TimeoutExpired:
                    proc.kill()
                    proc.wait(timeout=2)
                except psutil.NoSuchProcess:
                    pass
            
            self.process = None
            self.status = ServiceStatus.STOPPED
            self.health = ServiceHealth.UNKNOWN
            return True
            
        except Exception as e:
            print(f"Error stopping {self.name}: {e}")
            self.status = ServiceStatus.ERROR
            self.error_message = str(e)
            return False
    
    def is_healthy(self) -> bool:
        """
        Check if service is responding to health checks
        
        Returns:
            True if service is healthy
        """
        if not self.process or self.process.poll() is not None:
            self.health = ServiceHealth.UNHEALTHY
            return False
        
        try:
            response = httpx.get(self.health_check_url, timeout=2.0)
            is_healthy = response.status_code == 200
            self.health = ServiceHealth.HEALTHY if is_healthy else ServiceHealth.UNHEALTHY
            return is_healthy
        except:
            self.health = ServiceHealth.UNHEALTHY
            return False
    
    def get_logs(self, lines: int = 50) -> List[str]:
        """
        Retrieve recent log lines
        
        Args:
            lines: Number of lines to retrieve
            
        Returns:
            List of log lines
        """
        return list(self.log_buffer)[-lines:]
    
    def read_output(self):
        """Read and buffer output from process (non-blocking)"""
        if not self.process or not self.process.stdout:
            return
        
        try:
            import select
            if hasattr(select, 'select'):
                ready, _, _ = select.select([self.process.stdout], [], [], 0)
                if ready:
                    line = self.process.stdout.readline()
                    if line:
                        self.log_buffer.append(line.strip())
        except:
            pass
    
    def is_running(self) -> bool:
        """Check if process is currently running"""
        return self.process is not None and self.process.poll() is None
