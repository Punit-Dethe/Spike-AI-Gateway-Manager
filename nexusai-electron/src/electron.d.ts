export interface ElectronAPI {
  startService: (serviceName: string) => Promise<{ success: boolean; message: string }>;
  stopService: (serviceName: string) => Promise<{ success: boolean; message: string }>;
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
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
