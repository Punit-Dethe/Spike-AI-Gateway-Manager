export interface ElectronAPI {
  startService: (serviceName: string) => Promise<{ success: boolean; message: string }>;
  stopService: (serviceName: string) => Promise<{ success: boolean; message: string }>;
  killService: (serviceName: string) => Promise<{ success: boolean; message: string }>;
  getServiceStatus: (serviceName: string) => Promise<string>;
  getAllStatus: () => Promise<{ [key: string]: string }>;
  onServiceStatus: (callback: (data: any) => void) => void;
  onServiceLog: (callback: (data: any) => void) => void;
  removeServiceStatusListener: () => void;
  removeServiceLogListener: () => void;
  saveGeminiTokens: (psid: string, psidts: string) => Promise<{ success: boolean; message: string }>;
  checkGeminiTokens: () => Promise<{
    success: boolean;
    hasTokens: boolean;
    psidLength?: number;
    psidtsLength?: number;
    psidPreview?: string;
    psidtsPreview?: string;
    message?: string;
  }>;
  openTokenWindow: () => Promise<{ success: boolean; message?: string }>;
  getLogs: () => Promise<{ success: boolean; logs?: string; message?: string }>;
  exportLogs: () => Promise<{ success: boolean; path?: string; message?: string }>;
  clearLogs: () => Promise<{ success: boolean; message?: string }>;
  windowMinimize: () => Promise<void>;
  windowMaximize: () => Promise<void>;
  windowClose: () => Promise<void>;
  chatComplete: (payload: {
    url: string;
    body: unknown;
    authHeader?: string;
  }) => Promise<{ success: boolean; status?: number; body?: string; error?: string }>;
  selectFolder: () => Promise<{ success: boolean; path?: string; canceled?: boolean; error?: string }>;
  createLocalGeminiSetup: (config: { projectPath: string; psid: string; psidts: string }) => Promise<{ success: boolean; setupPath?: string; error?: string }>;
  openFolder?: (folderPath: string) => Promise<{ success: boolean; error?: string }>;
  openTerminal?: (folderPath: string) => Promise<{ success: boolean; error?: string }>;
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;

  // Public tunnel (ngrok)
  tunnelInstall: (payload?: { authtoken?: string }) => Promise<{ success: boolean; alreadyInstalled?: boolean; message?: string }>;
  tunnelUninstall: () => Promise<{ success: boolean; message?: string }>;
  tunnelStart: (port?: number) => Promise<{ success: boolean; message?: string; url?: string | null }>;
  tunnelStop: () => Promise<{ success: boolean; message?: string }>;
  tunnelGetStatus: () => Promise<TunnelStatus>;
  tunnelSaveConfig: (cfg: { enabled?: boolean }) => Promise<{ success: boolean }>;
  tunnelGetConfig: () => Promise<{ enabled: boolean; authConfigured: boolean }>;
  onTunnelStatus: (callback: (data: TunnelStatus) => void) => void;
  removeTunnelStatusListener: () => void;
  onTunnelInstallProgress: (callback: (data: TunnelInstallProgress) => void) => void;
  removeTunnelInstallProgressListener: () => void;
}

export type TunnelRunStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';

export interface TunnelStatus {
  status: TunnelRunStatus;
  url: string | null;
  error: string | null;
  /** Convenience: binary present AND authtoken configured. */
  installed: boolean;
  /** ngrok.exe is on disk. */
  binaryPresent: boolean;
  /** Authtoken has been saved. */
  authConfigured: boolean;
  installing: boolean;
  port: number;
}

export interface TunnelInstallProgress {
  phase: 'starting' | 'downloading' | 'complete' | 'error';
  percent?: number;
  downloaded?: number;
  total?: number;
  error?: string;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
