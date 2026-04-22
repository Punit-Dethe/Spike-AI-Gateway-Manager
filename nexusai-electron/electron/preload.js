const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Service management
  startService: (serviceName) => ipcRenderer.invoke('start-service', serviceName),
  stopService: (serviceName) => ipcRenderer.invoke('stop-service', serviceName),
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
