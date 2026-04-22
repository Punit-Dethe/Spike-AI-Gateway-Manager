"""Secure token storage with encryption"""

import json
from pathlib import Path
from typing import Optional, Dict
from cryptography.fernet import Fernet


class TokenStore:
    """Manages encrypted storage of browser session tokens"""
    
    def __init__(self, config_path: Path):
        """
        Initialize TokenStore with config directory path
        
        Args:
            config_path: Path to configuration directory
        """
        self.config_path = Path(config_path)
        self.config_path.mkdir(parents=True, exist_ok=True)
        
        self.tokens_file = self.config_path / "tokens.enc"
        self.key_file = self.config_path / ".key"
        
        self.key = self._load_or_create_key()
        self.cipher = Fernet(self.key)
        
    def _load_or_create_key(self) -> bytes:
        """
        Load encryption key from file or create new one
        
        Returns:
            Encryption key bytes
        """
        if self.key_file.exists():
            with open(self.key_file, 'rb') as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(self.key_file, 'wb') as f:
                f.write(key)
            return key
    
    def save_token(self, provider: str, token: str) -> None:
        """
        Encrypt and save token for provider
        
        Args:
            provider: Provider name ("gemini" or "chatgpt")
            token: Browser session token
        """
        tokens = self._load_tokens()
        tokens[provider] = token
        self._save_tokens(tokens)
    
    def get_token(self, provider: str) -> Optional[str]:
        """
        Decrypt and retrieve token for provider
        
        Args:
            provider: Provider name ("gemini" or "chatgpt")
            
        Returns:
            Decrypted token or None if not found
        """
        tokens = self._load_tokens()
        return tokens.get(provider)
    
    def validate_token_format(self, provider: str, token: str) -> bool:
        """
        Validate token format (basic structure check)
        
        Args:
            provider: Provider name
            token: Token to validate
            
        Returns:
            True if token format is valid
        """
        if not token or not isinstance(token, str):
            return False
        
        token = token.strip()
        
        if len(token) < 10:
            return False
        
        if provider == "gemini":
            return True
        elif provider == "chatgpt":
            return True
        
        return False
    
    def mask_token(self, token: str) -> str:
        """
        Return masked token showing only last 8 characters
        
        Args:
            token: Token to mask
            
        Returns:
            Masked token string
        """
        if not token:
            return ""
        
        if len(token) <= 8:
            return "*" * len(token)
        
        return "*" * (len(token) - 8) + token[-8:]
    
    def _load_tokens(self) -> Dict[str, str]:
        """
        Load and decrypt tokens from file
        
        Returns:
            Dictionary of provider -> token
        """
        if not self.tokens_file.exists():
            return {}
        
        try:
            with open(self.tokens_file, 'rb') as f:
                encrypted_data = f.read()
            
            if not encrypted_data:
                return {}
            
            decrypted_data = self.cipher.decrypt(encrypted_data)
            return json.loads(decrypted_data.decode('utf-8'))
        except Exception as e:
            print(f"Error loading tokens: {e}")
            return {}
    
    def _save_tokens(self, tokens: Dict[str, str]) -> None:
        """
        Encrypt and save tokens to file
        
        Args:
            tokens: Dictionary of provider -> token
        """
        try:
            json_data = json.dumps(tokens).encode('utf-8')
            encrypted_data = self.cipher.encrypt(json_data)
            
            with open(self.tokens_file, 'wb') as f:
                f.write(encrypted_data)
        except Exception as e:
            print(f"Error saving tokens: {e}")
            raise
