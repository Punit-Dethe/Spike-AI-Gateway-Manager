"""Main application window"""

from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QTextEdit, QGroupBox, QFrame, QLineEdit, QMessageBox
)
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QFont, QCloseEvent

from nexusai.core.service_manager import ServiceManager
from nexusai.core.token_store import TokenStore
from nexusai.core.config_manager import ConfigManager


class MainWindow(QMainWindow):
    """Main application window"""
    
    def __init__(self, service_manager: ServiceManager, token_store: TokenStore, config_manager: ConfigManager):
        super().__init__()
        self.service_manager = service_manager
        self.token_store = token_store
        self.config_manager = config_manager
        
        # Enable hardware acceleration
        self.setAttribute(Qt.WidgetAttribute.WA_OpaquePaintEvent)
        self.setAttribute(Qt.WidgetAttribute.WA_NoSystemBackground, False)
        
        self.setup_ui()
        self.connect_signals()
        self.restore_geometry()
        
        # Reduce timer frequency to reduce CPU usage
        self.health_timer = QTimer()
        self.health_timer.timeout.connect(self.check_health)
        self.health_timer.start(10000)  # Changed from 5000ms to 10000ms (10 seconds)
    
    def setup_ui(self):
        """Initialize UI components"""
        self.setWindowTitle("NexusAI - AI Gateway Manager")
        self.setMinimumSize(1000, 750)
        
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        layout = QVBoxLayout(central_widget)
        layout.setSpacing(20)
        layout.setContentsMargins(40, 40, 40, 40)
        
        # Header Section
        header_layout = QVBoxLayout()
        header_layout.setSpacing(8)
        
        title_label = QLabel("NexusAI")
        title_font = QFont()
        title_font.setPointSize(28)
        title_font.setBold(True)
        title_label.setFont(title_font)
        header_layout.addWidget(title_label)
        
        subtitle_label = QLabel("Local AI Gateway Manager")
        subtitle_font = QFont()
        subtitle_font.setPointSize(13)
        subtitle_label.setFont(subtitle_font)
        subtitle_label.setStyleSheet("color: #6b7280;")
        header_layout.addWidget(subtitle_label)
        
        layout.addLayout(header_layout)
        
        # Status Bar
        self.status_bar_label = QLabel("● System Ready")
        status_bar_font = QFont()
        status_bar_font.setPointSize(11)
        self.status_bar_label.setFont(status_bar_font)
        self.status_bar_label.setStyleSheet("""
            color: #6b7280; 
            padding: 12px 16px; 
            background: #f9fafb; 
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        """)
        layout.addWidget(self.status_bar_label)
        
        # API Endpoint Section (Prominent) - Solid color instead of gradient for performance
        endpoint_card = QWidget()
        endpoint_card.setStyleSheet("""
            QWidget {
                background: #6366f1;
                border-radius: 12px;
                padding: 20px;
            }
        """)
        endpoint_layout = QVBoxLayout(endpoint_card)
        endpoint_layout.setSpacing(12)
        
        endpoint_title = QLabel("Unified API Endpoint")
        endpoint_title_font = QFont()
        endpoint_title_font.setPointSize(12)
        endpoint_title_font.setBold(True)
        endpoint_title.setFont(endpoint_title_font)
        endpoint_title.setStyleSheet("color: white;")
        endpoint_layout.addWidget(endpoint_title)
        
        endpoint_url_label = QLabel("http://localhost:8000/v1")
        endpoint_url_font = QFont("Courier New")
        endpoint_url_font.setPointSize(14)
        endpoint_url_font.setBold(True)
        endpoint_url_label.setFont(endpoint_url_font)
        endpoint_url_label.setStyleSheet("""
            color: white; 
            background: rgba(255, 255, 255, 0.2); 
            padding: 12px 16px; 
            border-radius: 6px;
        """)
        endpoint_url_label.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse)
        endpoint_layout.addWidget(endpoint_url_label)
        
        copy_btn = QPushButton("📋 Copy Endpoint")
        copy_btn.setStyleSheet("""
            QPushButton {
                background-color: white;
                color: #6366f1;
                border: none;
                border-radius: 6px;
                padding: 10px 20px;
                font-size: 13px;
                font-weight: 600;
            }
        """)
        copy_btn.clicked.connect(lambda: self.copy_to_clipboard("http://localhost:8000/v1"))
        endpoint_layout.addWidget(copy_btn)
        
        layout.addWidget(endpoint_card)
        
        # Control Buttons
        control_layout = QHBoxLayout()
        control_layout.setSpacing(12)
        
        self.start_all_btn = QPushButton("▶ Start All Services")
        self.start_all_btn.setMinimumHeight(48)
        self.start_all_btn.clicked.connect(self.on_start_all)
        control_layout.addWidget(self.start_all_btn)
        
        self.stop_all_btn = QPushButton("⏹ Stop All Services")
        self.stop_all_btn.setMinimumHeight(48)
        self.stop_all_btn.clicked.connect(self.on_stop_all)
        control_layout.addWidget(self.stop_all_btn)
        
        layout.addLayout(control_layout)
        
        # Services Section
        services_label = QLabel("Services")
        services_font = QFont()
        services_font.setPointSize(16)
        services_font.setBold(True)
        services_label.setFont(services_font)
        layout.addWidget(services_label)
        
        # Gemini Service Card with Token Management
        self.gemini_group = self.create_gemini_card()
        layout.addWidget(self.gemini_group)
        
        # Proxy Service Card
        self.proxy_group = self.create_service_card("Unified Proxy", "proxy", "Port 8000")
        layout.addWidget(self.proxy_group)
        
        layout.addStretch()
        
        self.apply_styling()
    
    def create_gemini_card(self) -> QGroupBox:
        """Create Gemini service card with token management"""
        group = QGroupBox("Gemini Bridge")
        layout = QVBoxLayout()
        layout.setSpacing(12)
        
        # Status Row
        status_layout = QHBoxLayout()
        
        status_indicator = QLabel("●")
        status_indicator.setObjectName("gemini_indicator")
        status_indicator.setStyleSheet("color: #6b7280; font-size: 24px;")
        status_layout.addWidget(status_indicator)
        
        status_label = QLabel("Stopped")
        status_label.setObjectName("gemini_status")
        status_label_font = QFont()
        status_label_font.setPointSize(11)
        status_label.setFont(status_label_font)
        status_label.setStyleSheet("color: #374151; font-weight: 500;")
        status_layout.addWidget(status_label)
        
        port_label = QLabel("Port 6969")
        port_label.setStyleSheet("color: #9ca3af; font-size: 10px; padding: 4px 8px; background: #f3f4f6; border-radius: 4px;")
        status_layout.addWidget(port_label)
        
        status_layout.addStretch()
        
        start_btn = QPushButton("Start")
        start_btn.setObjectName("gemini_start")
        start_btn.clicked.connect(lambda: self.start_service("gemini"))
        status_layout.addWidget(start_btn)
        
        stop_btn = QPushButton("Stop")
        stop_btn.setObjectName("gemini_stop")
        stop_btn.clicked.connect(lambda: self.stop_service("gemini"))
        status_layout.addWidget(stop_btn)
        
        layout.addLayout(status_layout)
        
        # Error Label
        error_label = QLabel("")
        error_label.setObjectName("gemini_error")
        error_label.setStyleSheet("color: #dc2626; font-size: 11px; padding: 4px;")
        error_label.setWordWrap(True)
        error_label.hide()
        layout.addWidget(error_label)
        
        # Token Management Section
        token_section = QWidget()
        token_section.setStyleSheet("background: #f9fafb; border-radius: 6px; padding: 12px;")
        token_layout = QVBoxLayout(token_section)
        token_layout.setSpacing(8)
        
        token_title = QLabel("🔑 Gemini Cookies (PSID & PSIDTS)")
        token_title_font = QFont()
        token_title_font.setPointSize(10)
        token_title_font.setBold(True)
        token_title.setFont(token_title_font)
        token_title.setStyleSheet("color: #374151;")
        token_layout.addWidget(token_title)
        
        # PSID Input
        psid_layout = QHBoxLayout()
        psid_label = QLabel("PSID:")
        psid_label.setStyleSheet("color: #6b7280; min-width: 60px;")
        psid_layout.addWidget(psid_label)
        
        self.psid_input = QLineEdit()
        self.psid_input.setPlaceholderText("Enter your PSID cookie...")
        self.psid_input.setStyleSheet("""
            QLineEdit {
                padding: 8px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                background: white;
                color: #1f2937;
            }
            QLineEdit:focus {
                border: 1px solid #6366f1;
            }
        """)
        psid_layout.addWidget(self.psid_input)
        token_layout.addLayout(psid_layout)
        
        # PSIDTS Input
        psidts_layout = QHBoxLayout()
        psidts_label = QLabel("PSIDTS:")
        psidts_label.setStyleSheet("color: #6b7280; min-width: 60px;")
        psidts_layout.addWidget(psidts_label)
        
        self.psidts_input = QLineEdit()
        self.psidts_input.setPlaceholderText("Enter your PSIDTS cookie...")
        self.psidts_input.setStyleSheet("""
            QLineEdit {
                padding: 8px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                background: white;
                color: #1f2937;
            }
            QLineEdit:focus {
                border: 1px solid #6366f1;
            }
        """)
        psidts_layout.addWidget(self.psidts_input)
        token_layout.addLayout(psidts_layout)
        
        # Save Button
        save_tokens_btn = QPushButton("💾 Save Tokens")
        save_tokens_btn.clicked.connect(self.save_gemini_tokens)
        save_tokens_btn.setStyleSheet("""
            QPushButton {
                background-color: #10b981;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 16px;
                font-weight: 500;
            }
        """)
        token_layout.addWidget(save_tokens_btn)
        
        layout.addWidget(token_section)
        
        # Load existing tokens
        self.load_gemini_tokens()
        
        group.setLayout(layout)
        return group
    
    def create_service_card(self, title: str, service_name: str, subtitle: str = "") -> QGroupBox:
        """Create a service status card"""
        group = QGroupBox(title)
        layout = QVBoxLayout()
        
        status_layout = QHBoxLayout()
        
        status_indicator = QLabel("●")
        status_indicator.setObjectName(f"{service_name}_indicator")
        status_indicator.setStyleSheet("color: #6b7280; font-size: 24px;")
        status_layout.addWidget(status_indicator)
        
        status_label = QLabel("Stopped")
        status_label.setObjectName(f"{service_name}_status")
        status_label_font = QFont()
        status_label_font.setPointSize(11)
        status_label.setFont(status_label_font)
        status_label.setStyleSheet("color: #374151; font-weight: 500;")
        status_layout.addWidget(status_label)
        
        status_layout.addStretch()
        
        start_btn = QPushButton("Start")
        start_btn.setObjectName(f"{service_name}_start")
        start_btn.clicked.connect(lambda: self.start_service(service_name))
        status_layout.addWidget(start_btn)
        
        stop_btn = QPushButton("Stop")
        stop_btn.setObjectName(f"{service_name}_stop")
        stop_btn.clicked.connect(lambda: self.stop_service(service_name))
        status_layout.addWidget(stop_btn)
        
        layout.addLayout(status_layout)
        
        error_label = QLabel("")
        error_label.setObjectName(f"{service_name}_error")
        error_label.setStyleSheet("color: #dc2626; font-size: 11px; padding: 4px;")
        error_label.setWordWrap(True)
        error_label.hide()
        layout.addWidget(error_label)
        
        group.setLayout(layout)
        return group
    
    def load_gemini_tokens(self):
        """Load existing Gemini tokens from gemini_server.py"""
        try:
            gemini_script = self.service_manager.root_path / "services" / "gemini" / "gemini_server.py"
            if gemini_script.exists():
                with open(gemini_script, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                import re
                psid_match = re.search(r'PSID\s*=\s*["\']([^"\']+)["\']', content)
                psidts_match = re.search(r'PSIDTS\s*=\s*["\']([^"\']+)["\']', content)
                
                if psid_match:
                    self.psid_input.setText(psid_match.group(1))
                if psidts_match:
                    self.psidts_input.setText(psidts_match.group(1))
        except Exception as e:
            print(f"Error loading tokens: {e}")
    
    def save_gemini_tokens(self):
        """Save Gemini tokens to gemini_server.py"""
        psid = self.psid_input.text().strip()
        psidts = self.psidts_input.text().strip()
        
        if not psid or not psidts:
            from PyQt6.QtWidgets import QMessageBox
            QMessageBox.warning(self, "Missing Tokens", "Please enter both PSID and PSIDTS tokens.")
            return
        
        try:
            gemini_script = self.service_manager.root_path / "services" / "gemini" / "gemini_server.py"
            
            with open(gemini_script, 'r', encoding='utf-8') as f:
                content = f.read()
            
            import re
            content = re.sub(
                r'PSID\s*=\s*["\'][^"\']*["\']',
                f'PSID   = "{psid}"',
                content
            )
            content = re.sub(
                r'PSIDTS\s*=\s*["\'][^"\']*["\']',
                f'PSIDTS = "{psidts}"',
                content
            )
            
            with open(gemini_script, 'w', encoding='utf-8') as f:
                f.write(content)
            
            from PyQt6.QtWidgets import QMessageBox
            QMessageBox.information(self, "Success", "✅ Tokens saved successfully!\n\nRestart the Gemini service for changes to take effect.")
            
        except Exception as e:
            from PyQt6.QtWidgets import QMessageBox
            QMessageBox.critical(self, "Error", f"Failed to save tokens: {str(e)}")
    
    def apply_styling(self):
        """Apply premium styling - optimized for performance"""
        self.setStyleSheet("""
            QMainWindow {
                background-color: #ffffff;
            }
            QLabel {
                color: #1f2937;
            }
            QGroupBox {
                font-size: 14px;
                font-weight: bold;
                color: #1f2937;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                margin-top: 12px;
                padding: 16px;
                background-color: #fafafa;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 12px;
                padding: 0 8px;
                color: #1f2937;
            }
            QPushButton {
                background-color: #6366f1;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                font-size: 13px;
                font-weight: 500;
            }
            QPushButton:disabled {
                background-color: #d1d5db;
                color: #9ca3af;
            }
        """)
    
    def connect_signals(self):
        """Connect service manager signals"""
        self.service_manager.service_status_changed.connect(self.on_service_status_changed)
    
    def on_start_all(self):
        """Handle Start All button"""
        self.start_all_btn.setEnabled(False)
        self.service_manager.start_all()
        QTimer.singleShot(2000, lambda: self.start_all_btn.setEnabled(True))
    
    def on_stop_all(self):
        """Handle Stop All button"""
        self.stop_all_btn.setEnabled(False)
        self.service_manager.stop_all()
        QTimer.singleShot(2000, lambda: self.stop_all_btn.setEnabled(True))
    
    def start_service(self, name: str):
        """Start individual service"""
        self.service_manager.start_service(name)
    
    def stop_service(self, name: str):
        """Stop individual service"""
        self.service_manager.stop_service(name)
    
    def on_service_status_changed(self, service: str, status: str, error: str):
        """Handle service status change"""
        indicator = self.findChild(QLabel, f"{service}_indicator")
        status_label = self.findChild(QLabel, f"{service}_status")
        error_label = self.findChild(QLabel, f"{service}_error")
        
        if indicator and status_label:
            if status == "running":
                indicator.setStyleSheet("color: #10b981; font-size: 24px;")
                status_label.setText("Running")
                status_label.setStyleSheet("color: #059669; font-weight: 600;")
            elif status == "starting":
                indicator.setStyleSheet("color: #f59e0b; font-size: 24px;")
                status_label.setText("Starting...")
                status_label.setStyleSheet("color: #d97706; font-weight: 500;")
            elif status == "stopping":
                indicator.setStyleSheet("color: #f59e0b; font-size: 24px;")
                status_label.setText("Stopping...")
                status_label.setStyleSheet("color: #d97706; font-weight: 500;")
            elif status == "error":
                indicator.setStyleSheet("color: #ef4444; font-size: 24px;")
                status_label.setText("Error")
                status_label.setStyleSheet("color: #dc2626; font-weight: 600;")
            else:
                indicator.setStyleSheet("color: #6b7280; font-size: 24px;")
                status_label.setText("Stopped")
                status_label.setStyleSheet("color: #374151; font-weight: 500;")
        
        if error_label:
            if error:
                error_label.setText(f"⚠ {error}")
                error_label.show()
            else:
                error_label.hide()
        
        self.update_status_bar()
    
    def check_health(self):
        """Periodic health check"""
        for service_name in ["gemini", "proxy"]:
            is_healthy = self.service_manager.check_service_health(service_name)
    
    def update_status_bar(self):
        """Update the overall status bar"""
        gemini_status = self.service_manager.get_service_status("gemini")
        proxy_status = self.service_manager.get_service_status("proxy")
        
        if gemini_status.value == "running" and proxy_status.value == "running":
            self.status_bar_label.setText("● All Services Running - API Ready at http://localhost:8000/v1")
            self.status_bar_label.setStyleSheet("color: #059669; padding: 8px; background: #d1fae5; border-radius: 4px; font-weight: 500;")
        elif gemini_status.value == "starting" or proxy_status.value == "starting":
            self.status_bar_label.setText("● Services Starting...")
            self.status_bar_label.setStyleSheet("color: #d97706; padding: 8px; background: #fef3c7; border-radius: 4px; font-weight: 500;")
        elif gemini_status.value == "error" or proxy_status.value == "error":
            self.status_bar_label.setText("● Service Error - Check status below")
            self.status_bar_label.setStyleSheet("color: #dc2626; padding: 8px; background: #fee2e2; border-radius: 4px; font-weight: 500;")
        else:
            self.status_bar_label.setText("● Services Stopped")
            self.status_bar_label.setStyleSheet("color: #6b7280; padding: 8px; background: #f9fafb; border-radius: 4px; font-weight: 500;")
    
    def copy_to_clipboard(self, text: str):
        """Copy text to clipboard"""
        from PyQt6.QtWidgets import QApplication
        clipboard = QApplication.clipboard()
        clipboard.setText(text)
    
    def closeEvent(self, event: QCloseEvent):
        """Handle window close - minimize to tray"""
        event.ignore()
        self.hide()
    
    def restore_geometry(self):
        """Restore window geometry from config"""
        geom = self.config_manager.get_window_geometry()
        self.resize(geom['width'], geom['height'])
        if geom['x'] is not None and geom['y'] is not None:
            self.move(geom['x'], geom['y'])
    
    def save_geometry(self):
        """Save window geometry to config"""
        self.config_manager.set_window_geometry(
            self.width(),
            self.height(),
            self.x(),
            self.y()
        )
