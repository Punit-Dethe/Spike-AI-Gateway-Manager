const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Service management
  startService: (serviceName) => ipcRenderer.invoke('start-service', serviceName),
  stopService: (serviceName) => ipcRenderer.invoke('stop-service', serviceName),
  killService: (serviceName) => ipcRenderer.invoke('kill-service', serviceName),
  getServiceStatus: (serviceName) => ipcRenderer.invoke('get-service-status', serviceName),
  getAllStatus: () => ipcRenderer.invoke('get-all-status'),
  
  // Token management
  saveGeminiTokens: (psid, psidts) => ipcRenderer.invoke('save-gemini-tokens', psid, psidts),
  checkGeminiTokens: () => ipcRenderer.invoke('check-gemini-tokens'),
  openTokenWindow: () => ipcRenderer.invoke('open-token-window'),
  
  // Logs management
  getLogs: () => ipcRenderer.invoke('get-logs'),
  exportLogs: () => ipcRenderer.invoke('export-logs'),
  clearLogs: () => ipcRenderer.invoke('clear-logs'),
  
  // Window controls
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),

  // Chat-completion forwarder (avoids renderer-side CORS)
  chatComplete: (payload) => ipcRenderer.invoke('chat-complete', payload),
  
  // Local setup
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  createLocalGeminiSetup: (config) => ipcRenderer.invoke('create-local-gemini-setup', config),
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
  openTerminal: (folderPath) => ipcRenderer.invoke('open-terminal', folderPath),

  // Cloudflare tunnel
  tunnelInstall: () => ipcRenderer.invoke('tunnel-install'),
  tunnelUninstall: () => ipcRenderer.invoke('tunnel-uninstall'),
  tunnelStart: (port) => ipcRenderer.invoke('tunnel-start', port),
  tunnelStop: () => ipcRenderer.invoke('tunnel-stop'),
  tunnelGetStatus: () => ipcRenderer.invoke('tunnel-get-status'),
  tunnelSaveConfig: (cfg) => ipcRenderer.invoke('tunnel-save-config', cfg),
  tunnelGetConfig: () => ipcRenderer.invoke('tunnel-get-config'),
  onTunnelStatus: (callback) => {
    ipcRenderer.on('tunnel-status', (event, data) => callback(data));
  },
  removeTunnelStatusListener: () => {
    ipcRenderer.removeAllListeners('tunnel-status');
  },
  onCloudflaredInstallProgress: (callback) => {
    ipcRenderer.on('cloudflared-install-progress', (event, data) => callback(data));
  },
  removeCloudflaredInstallProgressListener: () => {
    ipcRenderer.removeAllListeners('cloudflared-install-progress');
  },
  
  // Event listeners
  onServiceStatus: (callback) => {
    ipcRenderer.on('service-status', (event, data) => callback(data));
  },
  onServiceLog: (callback) => {
    ipcRenderer.on('service-log', (event, data) => callback(data));
  },
  
  // Remove listeners
  removeServiceStatusListener: () => {
    ipcRenderer.removeAllListeners('service-status');
  },
  removeServiceLogListener: () => {
    ipcRenderer.removeAllListeners('service-log');
  }
});
