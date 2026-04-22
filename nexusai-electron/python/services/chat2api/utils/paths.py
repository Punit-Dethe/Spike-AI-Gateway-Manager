"""
Path utilities for PyInstaller compatibility.
Handles resource paths for both development and bundled executable modes.
"""
import os
import sys


def get_base_path():
    """
    Get the base path for the application.
    In PyInstaller, this returns sys._MEIPASS (the temp folder where resources are extracted).
    In development, this returns the directory containing the app.py file.
    """
    if getattr(sys, 'frozen', False):
        # Running as compiled executable
        return sys._MEIPASS
    else:
        # Running as script - go up from utils/ to app root
        return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get_data_path():
    """
    Get the data directory path.
    Data files need to be writable, so they go in a user-writable location.
    """
    if getattr(sys, 'frozen', False):
        # In production, use the working directory (set by Electron to AppData)
        return os.path.join(os.getcwd(), 'data')
    else:
        # In development, use data folder relative to app root
        return os.path.join(get_base_path(), 'data')


def get_template_path(template_name):
    """
    Get the full path to a template file.
    Templates are read-only resources bundled with the app.
    """
    return os.path.join(get_base_path(), 'templates', template_name)


def ensure_data_dir():
    """
    Ensure the data directory exists.
    """
    data_dir = get_data_path()
    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)
    return data_dir
