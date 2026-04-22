"""
PyInstaller runtime hook to enable 'import multipart' compatibility.
This installs the MetaPathFinder that redirects 'multipart' imports to 'python_multipart'.
"""
import sys
import os

# Only run this in frozen (PyInstaller) mode
if getattr(sys, 'frozen', False):
    # Get the directory where the executable extracted files
    base_path = sys._MEIPASS
    
    # Add the loader module to sys.modules if it exists
    loader_path = os.path.join(base_path, '_python_multipart_loader.py')
    
    if os.path.exists(loader_path):
        # Import and execute the loader
        import importlib.util
        spec = importlib.util.spec_from_file_location("_python_multipart_loader", loader_path)
        if spec and spec.loader:
            loader_module = importlib.util.module_from_spec(spec)
            sys.modules["_python_multipart_loader"] = loader_module
            spec.loader.exec_module(loader_module)
