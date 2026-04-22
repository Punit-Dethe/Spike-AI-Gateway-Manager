"""Configuration management for persistent settings"""

import json
from pathlib import Path
from typing import Any, Dict, Optional


class ConfigManager:
    """Manages application configuration and settings persistence"""
    
    def __init__(self, config_path: Path):
        """
        Initialize ConfigManager with config directory path
        
        Args:
            config_path: Path to configuration directory
        """
        self.config_path = Path(config_path)
        self.config_path.mkdir(parents=True, exist_ok=True)
        
        self.config_file = self.config_path / "settings.json"
        self.config: Dict[str, Any] = {}
        
        self.load()
    
    def load(self) -> None:
        """Load configuration from disk"""
        if not self.config_file.exists():
            self.config = {}
            return
        
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
        except json.JSONDecodeError as e:
            print(f"Error loading config (invalid JSON): {e}")
            self.config = {}
        except Exception as e:
            print(f"Error loading config: {e}")
            self.config = {}
    
    def save(self) -> None:
        """Save configuration to disk"""
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=2)
        except Exception as e:
            print(f"Error saving config: {e}")
            raise
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Get configuration value
        
        Args:
            key: Configuration key
            default: Default value if key not found
            
        Returns:
            Configuration value or default
        """
        return self.config.get(key, default)
    
    def set(self, key: str, value: Any) -> None:
        """
        Set configuration value
        
        Args:
            key: Configuration key
            value: Value to set
        """
        self.config[key] = value
        self.save()
    
    def get_window_geometry(self) -> Dict[str, Optional[int]]:
        """
        Get saved window geometry
        
        Returns:
            Dictionary with width, height, x, y
        """
        return {
            'width': self.get('window_width', 900),
            'height': self.get('window_height', 700),
            'x': self.get('window_x'),
            'y': self.get('window_y')
        }
    
    def set_window_geometry(self, width: int, height: int, x: int, y: int) -> None:
        """
        Save window geometry
        
        Args:
            width: Window width
            height: Window height
            x: Window x position
            y: Window y position
        """
        self.set('window_width', width)
        self.set('window_height', height)
        self.set('window_x', x)
        self.set('window_y', y)
    
    def get_service_states(self) -> Dict[str, bool]:
        """
        Get last known service states
        
        Returns:
            Dictionary of service_name -> was_running
        """
        return self.get('last_service_states', {})
    
    def set_service_states(self, states: Dict[str, bool]) -> None:
        """
        Save service states
        
        Args:
            states: Dictionary of service_name -> is_running
        """
        self.set('last_service_states', states)
