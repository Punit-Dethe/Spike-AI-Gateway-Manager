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
function log(message, level = 'INFO', service = 'SYSTEM') {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const serviceUpper = service.toUpperCase().padEnd(15);
  const levelUpper = level.toUpperCase().padEnd(8);
  
  let logMessage;
  
  if (level === 'SEPARATOR') {
    logMessage = '\n' + '━'.repeat(80) + '\n';
  } else if (level === 'HEADER') {
    logMessage = '\n' + '━'.repeat(80) + '\n';
    logMessage += `[${timestamp}] ${serviceUpper} | ${message}\n`;
    logMessage += '━'.repeat(80) + '\n';
  } else {
    const symbol = level === 'ERROR' ? '✗' : level === 'SUCCESS' ? '✓' : level === 'WARNING' ? '⚠' : '→';
    logMessage = `[${timestamp}] ${serviceUpper} | ${levelUpper} ${symbol} ${message}\n`;
  }
  
  console.log(logMessage.trim());
  fs.appendFileSync(logFile, logMessage);
}

function logDetail(key, value, indent = 2) {
  const spaces = ' '.repeat(indent);
  const logMessage = `${spaces}→ ${key}: ${value}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(logFile, logMessage);
}

function logSuccess(message, service = 'SYSTEM') {
  log(message, 'SUCCESS', service);
}

function logError(message, service = 'SYSTEM', error = null) {
  log(message, 'ERROR', service);
  if (error) {
    logDetail('Error Type', error.name || 'Unknown', 2);
    logDetail('Error Message', error.message || 'No details', 2);
    if (error.stack) {
      const stackLines = error.stack.split('\n').slice(0, 3);
      fs.appendFileSync(logFile, '\n  Stack Trace:\n');
      stackLines.forEach(line => {
        fs.appendFileSync(logFile, `    ${line.trim()}\n`);
      });
    }
  }
}

function logWarning(message, service = 'SYSTEM') {
  log(message, 'WARNING', service);
}

log('Spike Application Starting', 'HEADER', 'SYSTEM');
logDetail('App Path', app.getAppPath());
logDetail('User Data', app.getPath('userData'));
logDetail('Is Packaged', app.isPackaged);
logDetail('Platform', process.platform);
logDetail('Node Version', process.version);

// Service management
const serviceConfig = {
  gemini: {
    name: 'Gemini Bridge',
    command: app.isPackaged ? 'gemini_server.exe' : 'python',
    args: app.isPackaged ? [] : ['python/services/gemini/gemini_server.py'],
    port: 6969,
    process: null,
    status: 'stopped'
  },
  chat2api: {
    name: 'Chat2API',
    command: app.isPackaged ? 'chat2api.exe' : 'python',
    args: app.isPackaged ? [] : ['app.py'],
    cwd: app.isPackaged ? null : 'python/services/chat2api',
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
    command: app.isPackaged ? 'unified_proxy.exe' : 'python',
    args: app.isPackaged ? [] : ['python/nexusai/core/unified_proxy_standalone.py'],
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
  log('Checking for existing services', 'HEADER', 'SYSTEM');
  
  for (const serviceName of Object.keys(serviceConfig)) {
    const service = serviceConfig[serviceName];
    const portInUse = await isPortInUse(service.port);
    if (portInUse) {
      logWarning(`Detected ${service.name} already running on port ${service.port}`, serviceName);
      service.status = 'running';
      // Send status update to renderer
      if (mainWindow && mainWindow.webContents) {
        sendStatusUpdate(serviceName, 'running');
      }
    } else {
      log(`Port ${service.port} is available`, 'INFO', serviceName);
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
    logWarning('Tray icon not found, skipping tray creation', 'SYSTEM');
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
    
    logSuccess('System tray created successfully', 'SYSTEM');
  } catch (error) {
    logError('Failed to create tray icon', 'SYSTEM', error);
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
    log(`Attempting to kill process on port ${port}`, 'INFO', 'SYSTEM');
    
    // Use PowerShell command for more reliable results
    const psCommand = `Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Select-Object -Unique`;
    
    exec(`powershell -Command "${psCommand}"`, (error, stdout) => {
      if (error || !stdout.trim()) {
        log(`No process found on port ${port}`, 'INFO', 'SYSTEM');
        resolve(false);
        return;
      }
      
      const pids = stdout.trim().split('\n').map(pid => pid.trim()).filter(pid => pid && pid !== '0');
      
      if (pids.length === 0) {
        log(`No valid PIDs found on port ${port}`, 'INFO', 'SYSTEM');
        resolve(false);
        return;
      }
      
      log(`Found PIDs on port ${port}: ${pids.join(', ')}`, 'INFO', 'SYSTEM');
      
      // Kill all PIDs found
      let killPromises = pids.map(pid => {
        return new Promise((killResolve) => {
          log(`Executing: taskkill /F /T /PID ${pid}`, 'INFO', 'SYSTEM');
          exec(`taskkill /F /T /PID ${pid}`, (killError, killStdout, killStderr) => {
            if (!killError) {
              logSuccess(`Killed process ${pid} on port ${port}`, 'SYSTEM');
              killResolve(true);
            } else {
              logError(`Failed to kill process ${pid}`, 'SYSTEM', killError);
              if (killStderr) {
                logDetail('Stderr', killStderr.trim());
              }
              killResolve(false);
            }
          });
        });
      });
      
      // Wait for all kill operations to complete
      Promise.all(killPromises).then((results) => {
        const successCount = results.filter(r => r).length;
        log(`Killed ${successCount} of ${pids.length} processes on port ${port}`, 'INFO', 'SYSTEM');
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
    logWarning(`Port ${service.port} is already in use. Attempting to kill existing process...`, serviceName);
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

    // Determine working directory and command path
    let workingDir;
    let commandPath;
    
    if (app.isPackaged) {
      // In packaged app: executables are in resources/bin
      const binPath = path.join(process.resourcesPath, 'bin');
      commandPath = path.join(binPath, service.command);
      workingDir = binPath;
      
      // For chat2api, set working directory to AppData for writable data files
      // Templates are bundled in the executable via PyInstaller
      if (serviceName === 'chat2api') {
        const appDataChat2api = path.join(app.getPath('userData'), 'chat2api');
        if (!fs.existsSync(appDataChat2api)) {
          fs.mkdirSync(appDataChat2api, { recursive: true });
        }
        
        workingDir = appDataChat2api;
      }
    } else {
      // In development: Python files are relative to electron directory
      const pythonPath = path.join(__dirname, '..');
      workingDir = service.cwd ? path.join(pythonPath, service.cwd) : pythonPath;
      commandPath = service.command;
    }
    
    log(`Starting ${service.name}`, 'HEADER', serviceName);
    logDetail('Port', service.port);
    logDetail('Working Directory', workingDir);
    logDetail('Command', `${commandPath} ${service.args.join(' ')}`);
    
    // Check if working directory exists
    if (!fs.existsSync(workingDir)) {
      logError(`Working directory does not exist`, serviceName);
      logDetail('Path', workingDir);
      service.status = 'error';
      sendStatusUpdate(serviceName, 'error', `Working directory not found: ${workingDir}`);
      return { success: false, message: `Working directory not found: ${workingDir}` };
    }
    
    // Check if executable exists (in packaged mode)
    if (app.isPackaged && !fs.existsSync(commandPath)) {
      logError(`Executable not found`, serviceName);
      logDetail('Path', commandPath);
      logDetail('Solution', 'Rebuild the application with: npm run build:standalone');
      service.status = 'error';
      sendStatusUpdate(serviceName, 'error', `Executable not found: ${commandPath}`);
      return { success: false, message: `Executable not found: ${commandPath}` };
    }
    
    // Merge service-specific environment variables with process environment
    const serviceEnv = service.env ? { ...process.env, ...service.env } : { ...process.env };
    
    service.process = spawn(commandPath, service.args, {
      cwd: workingDir,
      env: serviceEnv
    });

    service.process.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (!output) return;
      
      // Split multi-line output and process each line
      const lines = output.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Skip empty lines
        if (!trimmedLine) return;
        
        // Check for startup success indicators
        if (trimmedLine.includes('Uvicorn running') || trimmedLine.includes('Application startup complete')) {
          service.status = 'running';
          logSuccess('Server started successfully', serviceName);
          logDetail('Endpoint', `http://localhost:${service.port}`);
          sendStatusUpdate(serviceName, 'running');
          return;
        }
        
        // Check for other important messages
        if (trimmedLine.includes('Started server process')) {
          log('Server process started', 'INFO', serviceName);
          return;
        }
        
        if (trimmedLine.includes('Waiting for application startup')) {
          log('Initializing application...', 'INFO', serviceName);
          return;
        }
        
        // Log everything else
        log(trimmedLine, 'INFO', serviceName);
      });
    });

    service.process.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (!output) return;
      
      // Split multi-line output and process each line
      const lines = output.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Skip empty lines
        if (!trimmedLine) return;
        
        // Check for critical errors first
        if (trimmedLine.includes('ModuleNotFoundError') || trimmedLine.includes('No module named')) {
          logError('Missing Python module detected', serviceName);
          logDetail('Solution', 'Run: pip install -r requirements.txt');
          service.status = 'error';
          sendStatusUpdate(serviceName, 'error', 'Missing Python dependencies');
          return;
        }
        
        // Check for startup success (FastAPI/Uvicorn outputs to stderr)
        if (trimmedLine.includes('Uvicorn running') || trimmedLine.includes('Application startup complete')) {
          service.status = 'running';
          logSuccess('Server started successfully', serviceName);
          logDetail('Endpoint', `http://localhost:${service.port}`);
          sendStatusUpdate(serviceName, 'running');
          return;
        }
        
        // Filter out verbose Python warnings but keep important ones
        if (trimmedLine.includes('DeprecationWarning') || 
            trimmedLine.includes('UserWarning: `secure` changed to True') ||
            trimmedLine.includes('RuntimeWarning') ||
            trimmedLine.includes('site-packages') ||
            trimmedLine.includes('self._cookies.set') ||
            trimmedLine.includes('jar.set(') ||
            trimmedLine.includes('asyncio.set_event_loop_policy') ||
            trimmedLine.includes('Proactor event loop') ||
            trimmedLine.includes('add_reader') ||
            trimmedLine.includes('Read more about it')) {
          // Skip verbose warnings - don't log to file
          return;
        }
        
        // Check for important warnings from the service itself
        if (trimmedLine.includes('WARNING') && trimmedLine.includes('gemini_webapi')) {
          // Extract just the warning message
          const warningMatch = trimmedLine.match(/WARNING\s+\|\s+(.+)/);
          if (warningMatch) {
            logWarning(warningMatch[1], serviceName);
          } else {
            logWarning(trimmedLine, serviceName);
          }
          return;
        }
        
        // Check for success messages from the service
        if (trimmedLine.includes('SUCCESS') && trimmedLine.includes('gemini_webapi')) {
          const successMatch = trimmedLine.match(/SUCCESS\s+\|\s+(.+)/);
          if (successMatch) {
            logSuccess(successMatch[1], serviceName);
          } else {
            logSuccess(trimmedLine, serviceName);
          }
          return;
        }
        
        // Check for actual errors (not warnings)
        if (trimmedLine.includes('ERROR') || trimmedLine.includes('Error:') || trimmedLine.includes('Traceback')) {
          logError(trimmedLine, serviceName);
          return;
        }
        
        // Check for informational messages
        if (trimmedLine.includes('Started server process') || 
            trimmedLine.includes('Waiting for application startup')) {
          log(trimmedLine.replace('INFO:', '').trim(), 'INFO', serviceName);
          return;
        }
        
        // For everything else that's meaningful, log it
        if (trimmedLine.length > 5) {
          log(trimmedLine, 'INFO', serviceName);
        }
      });
    });

    service.process.on('close', (code) => {
      log(`Process exited with code ${code}`, code === 0 ? 'INFO' : 'ERROR', serviceName);
      
      // Log more details about why it closed
      if (code !== 0 && code !== null) {
        logError(`Process crashed unexpectedly`, serviceName);
        logDetail('Exit Code', code);
        logDetail('Solution', 'Check logs above for error details');
        service.status = 'error';
        sendStatusUpdate(serviceName, 'error', `Process exited with code ${code}`);
      } else {
        service.status = 'stopped';
        sendStatusUpdate(serviceName, 'stopped');
      }
      
      service.process = null;
    });

    service.process.on('error', (err) => {
      logError('Process error occurred', serviceName, err);
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
    
    log(`Stopping ${service.name}`, 'HEADER', serviceName);
    logDetail('Port', service.port);
    
    // Step 1: Try to kill the process if we have a reference
    if (service.process) {
      try {
        log(`Terminating process (PID: ${service.process.pid})`, 'INFO', serviceName);
        // On Windows, use taskkill to ensure process and children are killed
        if (process.platform === 'win32' && service.process.pid) {
          await new Promise((resolve) => {
            exec(`taskkill /F /T /PID ${service.process.pid}`, (error) => {
              if (error) {
                logWarning(`Error killing process tree: ${error.message}`, serviceName);
              } else {
                logSuccess('Process tree terminated', serviceName);
              }
              resolve();
            });
          });
        } else {
          service.process.kill('SIGTERM');
        }
      } catch (e) {
        logWarning(`Error killing process: ${e.message}`, serviceName);
      }
      service.process = null;
    }
    
    // Step 2: ALWAYS kill by port
    log(`Killing any process on port ${service.port}`, 'INFO', serviceName);
    const killed = await killProcessOnPort(service.port);
    
    if (killed) {
      logSuccess(`Port ${service.port} freed`, serviceName);
    } else {
      log(`No process found on port ${service.port}`, 'INFO', serviceName);
    }
    
    // Step 3: Verify port is actually free
    await new Promise(resolve => setTimeout(resolve, 500));
    const stillInUse = await isPortInUse(service.port);
    
    if (stillInUse) {
      logWarning(`Port ${service.port} still in use after kill attempt`, serviceName);
      // Try one more time with more force
      await killProcessOnPort(service.port);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    service.status = 'stopped';
    logSuccess('Service stopped successfully', serviceName);
    sendStatusUpdate(serviceName, 'stopped');
    
    return { success: true, message: 'Service stopped successfully' };
  } catch (error) {
    logError('Error stopping service', serviceName, error);
    service.status = 'error';
    sendStatusUpdate(serviceName, 'error', error.message);
    return { success: false, message: error.message };
  }
}

function stopAllServices() {
  log('Stopping all services', 'HEADER', 'SYSTEM');
  
  Object.keys(serviceConfig).forEach(serviceName => {
    const service = serviceConfig[serviceName];
    
    // Kill process if we have a reference
    if (service.process) {
      try {
        if (process.platform === 'win32' && service.process.pid) {
          log(`Killing ${service.name} (PID: ${service.process.pid})`, 'INFO', serviceName);
          exec(`taskkill /F /T /PID ${service.process.pid}`);
        } else {
          service.process.kill('SIGTERM');
        }
      } catch (e) {
        logError(`Error killing ${service.name}`, serviceName, e);
      }
      service.process = null;
    }
    
    // Also kill by port as fallback
    killProcessOnPort(service.port);
    service.status = 'stopped';
  });
  
  logSuccess('All services stopped', 'SYSTEM');
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
    
    logSuccess('Gemini tokens saved successfully', 'GEMINI');
    return { success: true, message: 'Tokens saved successfully' };
  } catch (error) {
    logError('Error saving Gemini tokens', 'GEMINI', error);
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
    logError('Error checking Gemini tokens', 'GEMINI', error);
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

    logSuccess('Token management window opened', 'SYSTEM');
    return { success: true };
  } catch (error) {
    logError('Error opening token window', 'SYSTEM', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-logs', async () => {
  try {
    const logsContent = fs.readFileSync(logFile, 'utf8');
    return { success: true, logs: logsContent };
  } catch (error) {
    logError('Error reading logs', 'SYSTEM', error);
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
      logSuccess(`Logs exported to ${result.filePath}`, 'SYSTEM');
      return { success: true, path: result.filePath };
    }

    return { success: false, message: 'Export cancelled' };
  } catch (error) {
    logError('Error exporting logs', 'SYSTEM', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('clear-logs', async () => {
  try {
    fs.writeFileSync(logFile, '', 'utf8');
    log('Logs cleared by user', 'HEADER', 'SYSTEM');
    return { success: true };
  } catch (error) {
    logError('Error clearing logs', 'SYSTEM', error);
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
