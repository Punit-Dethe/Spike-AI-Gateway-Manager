const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const net = require('net');
const fs = require('fs');

let mainWindow;
let tokenWindow;
let tray;
let services = {};

// Create logs directory and log file
const logsDir = path.join(app.getPath('userData'), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
const logFile = path.join(logsDir, 'spike.log');

// Log function that writes to both console and file
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(logFile, logMessage);
}

log('=== Spike Application Starting ===');
log(`App path: ${app.getAppPath()}`);
log(`User data: ${app.getPath('userData')}`);
log(`Is packaged: ${app.isPackaged}`);

// Service management
const serviceConfig = {
  gemini: {
    name: 'Gemini Bridge',
    command: 'python',
    args: ['python/services/gemini/gemini_server.py'],
    port: 6969,
    process: null,
    status: 'stopped'
  },
  chat2api: {
    name: 'Chat2API',
    command: 'python',
    args: ['app.py'],
    cwd: 'python/services/chat2api',
    port: 5005,
    env: {
      AUTHORIZATION: 'nexusai-default-auth-key',
      // Set cache directory to writable location in AppData
      CACHE_DIR: path.join(app.getPath('userData'), 'chat2api-cache')
    },
    process: null,
    status: 'stopped'
  },
  proxy: {
    name: 'Unified Proxy',
    command: 'python',
    args: ['python/nexusai/core/unified_proxy_standalone.py'],
    port: 8000,
    process: null,
    status: 'stopped'
  }
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#E4E0D5',
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Allow fetch to localhost in development
    },
    frame: false,
    titleBarStyle: 'hidden',
    show: false,
    autoHideMenuBar: true
  });

  // Remove the menu bar completely
  mainWindow.setMenuBarVisibility(false);

  // Load the app
  // In dev mode, load from Vite dev server
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Check for already running services after window is ready
    checkExistingServices();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

// Check if services are already running
async function checkExistingServices() {
  for (const serviceName of Object.keys(serviceConfig)) {
    const service = serviceConfig[serviceName];
    const portInUse = await isPortInUse(service.port);
    if (portInUse) {
      console.log(`Detected ${serviceName} already running on port ${service.port}`);
      service.status = 'running';
      // Send status update to renderer
      if (mainWindow && mainWindow.webContents) {
        sendStatusUpdate(serviceName, 'running');
      }
    } else {
      console.log(`Port ${service.port} (${serviceName}) is free`);
      service.status = 'stopped';
      if (mainWindow && mainWindow.webContents) {
        sendStatusUpdate(serviceName, 'stopped');
      }
    }
  }
}

function createTray() {
  // Try to create tray icon, but don't fail if icon is missing
  const iconPath = path.join(__dirname, '../assets/icon.png');
  const fs = require('fs');
  
  if (!fs.existsSync(iconPath)) {
    console.log('Tray icon not found, skipping tray creation');
    return;
  }
  
  try {
    tray = new Tray(iconPath);
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Spike',
        click: () => {
          mainWindow.show();
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true;
          stopAllServices();
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip('Spike - AI Gateway');
    
    tray.on('click', () => {
      mainWindow.show();
    });
  } catch (error) {
    console.log('Failed to create tray icon:', error.message);
  }
}

// Service management functions

// Check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    
    server.listen(port);
  });
}

// Kill process on a specific port (Windows)
function killProcessOnPort(port) {
  return new Promise((resolve) => {
    console.log(`Attempting to kill process on port ${port}...`);
    
    // Use PowerShell command for more reliable results
    const psCommand = `Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Select-Object -Unique`;
    
    exec(`powershell -Command "${psCommand}"`, (error, stdout) => {
      if (error || !stdout.trim()) {
        console.log(`No process found on port ${port}`);
        resolve(false);
        return;
      }
      
      const pids = stdout.trim().split('\n').map(pid => pid.trim()).filter(pid => pid && pid !== '0');
      
      if (pids.length === 0) {
        console.log(`No valid PIDs found on port ${port}`);
        resolve(false);
        return;
      }
      
      console.log(`Found PIDs on port ${port}:`, pids);
      
      // Kill all PIDs found
      let killPromises = pids.map(pid => {
        return new Promise((killResolve) => {
          console.log(`Executing: taskkill /F /T /PID ${pid}`);
          exec(`taskkill /F /T /PID ${pid}`, (killError, killStdout, killStderr) => {
            if (!killError) {
              console.log(`Successfully killed process ${pid} on port ${port}`);
              console.log(`Output: ${killStdout}`);
              killResolve(true);
            } else {
              console.error(`Failed to kill process ${pid}: ${killError.message}`);
              if (killStderr) console.error(`Stderr: ${killStderr}`);
              killResolve(false);
            }
          });
        });
      });
      
      // Wait for all kill operations to complete
      Promise.all(killPromises).then((results) => {
        const successCount = results.filter(r => r).length;
        console.log(`Killed ${successCount} of ${pids.length} processes on port ${port}`);
        resolve(successCount > 0);
      });
    });
  });
}

async function startService(serviceName) {
  const service = serviceConfig[serviceName];
  if (!service) {
    return { success: false, message: 'Service not found' };
  }

  // Check if port is already in use
  const portInUse = await isPortInUse(service.port);
  if (portInUse) {
    console.log(`Port ${service.port} is already in use. Attempting to kill existing process...`);
    const killed = await killProcessOnPort(service.port);
    
    if (!killed) {
      service.status = 'error';
      sendStatusUpdate(serviceName, 'error', `Port ${service.port} is already in use`);
      return { 
        success: false, 
        message: `Port ${service.port} is already in use. Please stop the existing process manually.` 
      };
    }
    
    // Wait a bit for port to be released
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // If we have a process reference but it's not actually running, clean it up
  if (service.process) {
    try {
      service.process.kill();
    } catch (e) {
      // Process already dead
    }
    service.process = null;
  }

  try {
    service.status = 'starting';
    sendStatusUpdate(serviceName, 'starting');

    // In production (packaged), Python files are in app.asar.unpacked
    // In development, they're relative to the electron directory
    let pythonPath;
    if (app.isPackaged) {
      // In packaged app: resources/app.asar.unpacked
      pythonPath = path.join(process.resourcesPath, 'app.asar.unpacked');
    } else {
      // In development: one level up from electron directory
      pythonPath = path.join(__dirname, '..');
    }
    
    const workingDir = service.cwd ? path.join(pythonPath, service.cwd) : pythonPath;
    
    log(`[${serviceName}] Starting service...`);
    log(`[${serviceName}] Python path: ${pythonPath}`);
    log(`[${serviceName}] Working dir: ${workingDir}`);
    log(`[${serviceName}] Command: ${service.command} ${service.args.join(' ')}`);
    
    // Check if working directory exists
    if (!fs.existsSync(workingDir)) {
      log(`[${serviceName}] ERROR: Working directory does not exist!`);
      service.status = 'error';
      sendStatusUpdate(serviceName, 'error', `Working directory not found: ${workingDir}`);
      return { success: false, message: `Working directory not found: ${workingDir}` };
    }
    
    // Merge service-specific environment variables with process environment
    const serviceEnv = service.env ? { ...process.env, ...service.env } : { ...process.env };
    
    service.process = spawn(service.command, service.args, {
      cwd: workingDir,
      env: serviceEnv
    });

    service.process.stdout.on('data', (data) => {
      const message = data.toString();
      log(`[${serviceName}] ${message}`);
      sendLog(serviceName, message);
      
      // Check if service started successfully
      if (message.includes('Uvicorn running') || message.includes('Started server') || message.includes('Application startup complete')) {
        service.status = 'running';
        sendStatusUpdate(serviceName, 'running');
      }
    });

    service.process.stderr.on('data', (data) => {
      const message = data.toString();
      log(`[${serviceName}] ERROR: ${message}`);
      sendLog(serviceName, `ERROR: ${message}`);
      
      // Check for common Python errors
      if (message.includes('ModuleNotFoundError') || message.includes('No module named')) {
        log(`[${serviceName}] MISSING PYTHON MODULE!`);
        service.status = 'error';
        sendStatusUpdate(serviceName, 'error', 'Missing Python dependencies. Run: pip install -r requirements.txt');
      }
      
      // FastAPI/Uvicorn outputs to stderr, so check there too
      if (message.includes('Uvicorn running') || message.includes('Application startup complete')) {
        service.status = 'running';
        sendStatusUpdate(serviceName, 'running');
      }
    });

    service.process.on('close', (code) => {
      log(`[${serviceName}] Process exited with code ${code}`);
      
      // Log more details about why it closed
      if (code !== 0 && code !== null) {
        log(`[${serviceName}] Process crashed with exit code ${code}`);
        service.status = 'error';
        sendStatusUpdate(serviceName, 'error', `Process exited with code ${code}`);
      } else {
        service.status = 'stopped';
        sendStatusUpdate(serviceName, 'stopped');
      }
      
      service.process = null;
    });

    service.process.on('error', (err) => {
      log(`[${serviceName}] Process error: ${err.message}`);
      service.status = 'error';
      sendStatusUpdate(serviceName, 'error', err.message);
    });

    return { success: true, message: 'Service starting...' };
  } catch (error) {
    service.status = 'error';
    sendStatusUpdate(serviceName, 'error', error.message);
    return { success: false, message: error.message };
  }
}

async function stopService(serviceName) {
  const service = serviceConfig[serviceName];
  if (!service) {
    return { success: false, message: 'Service not found' };
  }

  try {
    service.status = 'stopping';
    sendStatusUpdate(serviceName, 'stopping');
    
    console.log(`[${serviceName}] Stopping service on port ${service.port}`);
    
    // Step 1: Try to kill the process if we have a reference
    if (service.process) {
      try {
        console.log(`[${serviceName}] Killing process with PID ${service.process.pid}`);
        // On Windows, use taskkill to ensure process and children are killed
        if (process.platform === 'win32' && service.process.pid) {
          await new Promise((resolve) => {
            exec(`taskkill /F /T /PID ${service.process.pid}`, (error) => {
              if (error) {
                console.error(`[${serviceName}] Error killing process tree: ${error.message}`);
              } else {
                console.log(`[${serviceName}] Process tree killed successfully`);
              }
              resolve();
            });
          });
        } else {
          service.process.kill('SIGTERM');
        }
      } catch (e) {
        console.error(`[${serviceName}] Error killing process: ${e.message}`);
      }
      service.process = null;
    }
    
    // Step 2: ALWAYS kill by port - this ensures we kill whatever is on the port
    // This is critical for cases where:
    // - Service was started outside the app
    // - Process reference was lost
    // - Service didn't stop properly
    console.log(`[${serviceName}] Force killing any process on port ${service.port}`);
    const killed = await killProcessOnPort(service.port);
    
    if (killed) {
      console.log(`[${serviceName}] Successfully killed process on port ${service.port}`);
    } else {
      console.log(`[${serviceName}] No process found on port ${service.port} (already stopped)`);
    }
    
    // Step 3: Verify port is actually free
    await new Promise(resolve => setTimeout(resolve, 500));
    const stillInUse = await isPortInUse(service.port);
    
    if (stillInUse) {
      console.warn(`[${serviceName}] Port ${service.port} is still in use after kill attempt`);
      // Try one more time with more force
      await killProcessOnPort(service.port);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    service.status = 'stopped';
    sendStatusUpdate(serviceName, 'stopped');
    
    return { success: true, message: 'Service stopped successfully' };
  } catch (error) {
    console.error(`[${serviceName}] Error stopping service:`, error);
    service.status = 'error';
    sendStatusUpdate(serviceName, 'error', error.message);
    return { success: false, message: error.message };
  }
}

function stopAllServices() {
  console.log('Stopping all services...');
  Object.keys(serviceConfig).forEach(serviceName => {
    const service = serviceConfig[serviceName];
    
    // Kill process if we have a reference
    if (service.process) {
      try {
        if (process.platform === 'win32' && service.process.pid) {
          exec(`taskkill /F /T /PID ${service.process.pid}`);
        } else {
          service.process.kill('SIGTERM');
        }
      } catch (e) {
        console.error(`Error killing ${serviceName}:`, e);
      }
      service.process = null;
    }
    
    // Also kill by port as fallback
    killProcessOnPort(service.port);
    service.status = 'stopped';
  });
}

function getServiceStatus(serviceName) {
  const service = serviceConfig[serviceName];
  return service ? service.status : 'unknown';
}

function sendStatusUpdate(serviceName, status, error = null) {
  if (mainWindow) {
    mainWindow.webContents.send('service-status', {
      service: serviceName,
      status,
      error
    });
  }
}

function sendLog(serviceName, message) {
  if (mainWindow) {
    mainWindow.webContents.send('service-log', {
      service: serviceName,
      message,
      timestamp: new Date().toISOString()
    });
  }
}

// IPC Handlers
ipcMain.handle('start-service', async (event, serviceName) => {
  return startService(serviceName);
});

ipcMain.handle('stop-service', async (event, serviceName) => {
  return stopService(serviceName);
});

ipcMain.handle('get-service-status', async (event, serviceName) => {
  return getServiceStatus(serviceName);
});

ipcMain.handle('get-all-status', async () => {
  const statuses = {};
  Object.keys(serviceConfig).forEach(name => {
    statuses[name] = serviceConfig[name].status;
  });
  return statuses;
});

ipcMain.handle('save-gemini-tokens', async (event, psid, psidts) => {
  try {
    const fs = require('fs');
    const geminiServerPath = path.join(__dirname, '../python/services/gemini/gemini_server.py');
    
    // Read the current file
    let content = fs.readFileSync(geminiServerPath, 'utf8');
    
    // Replace the PSID and PSIDTS values
    content = content.replace(
      /PSID\s*=\s*"[^"]*"/,
      `PSID   = "${psid}"`
    );
    content = content.replace(
      /PSIDTS\s*=\s*"[^"]*"/,
      `PSIDTS = "${psidts}"`
    );
    
    // Write back to file
    fs.writeFileSync(geminiServerPath, content, 'utf8');
    
    return { success: true, message: 'Tokens saved successfully' };
  } catch (error) {
    console.error('Error saving tokens:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('check-gemini-tokens', async () => {
  try {
    const fs = require('fs');
    const geminiServerPath = path.join(__dirname, '../python/services/gemini/gemini_server.py');
    
    // Read the current file
    const content = fs.readFileSync(geminiServerPath, 'utf8');
    
    // Extract PSID and PSIDTS values
    const psidMatch = content.match(/PSID\s*=\s*"([^"]*)"/);
    const psidtsMatch = content.match(/PSIDTS\s*=\s*"([^"]*)"/);
    
    const psid = psidMatch ? psidMatch[1] : '';
    const psidts = psidtsMatch ? psidtsMatch[1] : '';
    
    // Check if tokens are set (not empty and not placeholder values)
    const hasValidPsid = psid && psid.length > 10 && psid.startsWith('g.a');
    const hasValidPsidts = psidts && psidts.length > 10 && psidts.startsWith('sidts-');
    
    return {
      success: true,
      hasTokens: hasValidPsid && hasValidPsidts,
      psidLength: psid.length,
      psidtsLength: psidts.length,
      psidPreview: psid ? `${psid.substring(0, 15)}...` : '',
      psidtsPreview: psidts ? `${psidts.substring(0, 15)}...` : ''
    };
  } catch (error) {
    console.error('Error checking tokens:', error);
    return { success: false, hasTokens: false, message: error.message };
  }
});

ipcMain.handle('open-token-window', async () => {
  try {
    // If window already exists, focus it
    if (tokenWindow && !tokenWindow.isDestroyed()) {
      tokenWindow.focus();
      return { success: true };
    }

    // Create new token management window
    tokenWindow = new BrowserWindow({
      width: 900,
      height: 700,
      backgroundColor: '#E4E0D5',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
      },
      frame: false,
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: '#E4E0D5',
        symbolColor: '#374151',
        height: 40
      },
      autoHideMenuBar: true,
      parent: mainWindow,
      modal: false
    });

    // Remove the menu bar completely
    tokenWindow.setMenuBarVisibility(false);

    // Load the token management page
    tokenWindow.loadURL('http://localhost:5005/tokens');

    // Clean up reference when window is closed
    tokenWindow.on('closed', () => {
      tokenWindow = null;
    });

    return { success: true };
  } catch (error) {
    console.error('Error opening token window:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-logs', async () => {
  try {
    const logsContent = fs.readFileSync(logFile, 'utf8');
    return { success: true, logs: logsContent };
  } catch (error) {
    console.error('Error reading logs:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('export-logs', async () => {
  try {
    const { dialog } = require('electron');
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Logs',
      defaultPath: `spike-logs-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}.txt`,
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      const logsContent = fs.readFileSync(logFile, 'utf8');
      fs.writeFileSync(result.filePath, logsContent, 'utf8');
      return { success: true, path: result.filePath };
    }

    return { success: false, message: 'Export cancelled' };
  } catch (error) {
    console.error('Error exporting logs:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('clear-logs', async () => {
  try {
    fs.writeFileSync(logFile, '', 'utf8');
    log('=== Logs cleared by user ===');
    return { success: true };
  } catch (error) {
    console.error('Error clearing logs:', error);
    return { success: false, message: error.message };
  }
});

// Window controls
ipcMain.handle('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window-close', () => {
  if (mainWindow) {
    mainWindow.hide(); // Hide to tray instead of closing
  }
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopAllServices();
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  stopAllServices();
});
