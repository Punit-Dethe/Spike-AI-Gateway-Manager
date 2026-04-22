; Custom NSIS installer script for NexusAI Gateway
; This script handles Python installation and dependency setup

!macro customInstall
  DetailPrint "Checking Python installation..."
  
  ; Check if Python is installed
  nsExec::ExecToStack 'python --version'
  Pop $0
  Pop $1
  
  ${If} $0 != 0
    MessageBox MB_YESNO|MB_ICONQUESTION "Python 3.8+ is required but not found. Would you like to download Python now?" IDYES downloadPython IDNO skipPython
    
    downloadPython:
      ExecShell "open" "https://www.python.org/downloads/"
      MessageBox MB_OK "Please install Python 3.8 or higher, then run this installer again."
      Abort
    
    skipPython:
      MessageBox MB_OK "NexusAI Gateway requires Python 3.8+. Please install Python and run this installer again."
      Abort
  ${EndIf}
  
  DetailPrint "Python found: $1"
  DetailPrint "Installing Python dependencies..."
  
  ; Install Python dependencies
  nsExec::ExecToLog 'python -m pip install --upgrade pip'
  nsExec::ExecToLog 'python -m pip install -r "$INSTDIR\resources\requirements.txt"'
  
  DetailPrint "Python dependencies installed successfully"
!macroend

!macro customUnInstall
  DetailPrint "Uninstalling NexusAI Gateway..."
  ; Custom uninstall steps if needed
!macroend
