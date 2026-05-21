import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ServiceCard from './components/ServiceCard';
import EndpointCard from './components/EndpointCard';
import ServicesOverview from './components/ServicesOverview';
import ApiExamples from './components/ApiExamples';
import ChatInterface from './components/ChatInterface';
import LogsViewer from './components/LogsViewer';
import TitleBar from './components/TitleBar';
import LocalSetupWizard from './components/LocalSetupWizard';
import TunnelCard from './components/TunnelCard';
import StandaloneSetupCard from './components/StandaloneSetupCard';
import GatewayPanel from './components/GatewayPanel';
import type { TunnelStatus, TunnelInstallProgress } from './electron';

interface ServiceStatus {
  [key: string]: 'stopped' | 'starting' | 'running' | 'stopping' | 'analyzing' | 'error';
}

type Tab = 'chat' | 'dashboard' | 'services' | 'logs';

const INITIAL_TUNNEL_STATUS: TunnelStatus = {
  status: 'stopped',
  url: null,
  error: null,
  installed: false,
  binaryPresent: false,
  authConfigured: false,
  installing: false,
  port: 8000,
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    gemini: 'stopped',
    chat2api: 'stopped',
    proxy: 'stopped',
  });
  
  // Chat state lifted to App level for persistence
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatStarted, setChatStarted] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash');
  const [selectedEndpoint, setSelectedEndpoint] = useState<'local' | 'public' | 'gemini' | 'chatgpt'>('local');
  const [showLocalSetup, setShowLocalSetup] = useState(false);

  // Tunnel state, lifted so both the overview and the tunnel card stay in sync.
  const [tunnelStatus, setTunnelStatus] = useState<TunnelStatus>(INITIAL_TUNNEL_STATUS);
  const [installProgress, setInstallProgress] =
    useState<TunnelInstallProgress | null>(null);

  const handleNewChat = () => {
    setChatMessages([]);
    setChatStarted(false);
  };

  // --- Service control helpers (used by ServicesOverview) ---
  const handleStartService = (name: string) => {
    window.electron.startService(name);
  };
  const handleStopService = (name: string) => {
    window.electron.stopService(name);
  };

  // --- Tunnel control helpers ---
  const handleTunnelInstall = async (authtoken?: string) => {
    setInstallProgress({ phase: 'starting', percent: 0 });
    const result = await window.electron.tunnelInstall(
      authtoken ? { authtoken } : undefined,
    );
    if (!result.success) {
      setInstallProgress({
        phase: 'error',
        error: result.message || 'Setup failed',
      });
    }
    return result;
  };
  const handleTunnelStart = async () => {
    await window.electron.tunnelSaveConfig({ enabled: true });
    await window.electron.tunnelStart(tunnelStatus.port || 8000);
  };
  const handleTunnelStop = async () => {
    await window.electron.tunnelSaveConfig({ enabled: false });
    await window.electron.tunnelStop();
  };

  useEffect(() => {
    // Load initial status
    window.electron.getAllStatus().then((statuses) => {
      setServiceStatus(statuses as ServiceStatus);
    });

    // Listen for status updates
    window.electron.onServiceStatus((data: any) => {
      setServiceStatus(prev => ({
        ...prev,
        [data.service]: data.status
      }));
    });

    // Tunnel: initial status + push updates
    window.electron.tunnelGetStatus().then((s) => setTunnelStatus(s));
    window.electron.onTunnelStatus((data) => {
      setTunnelStatus(data);
      // Once the binary is installed and not installing, clear lingering progress
      if (!data.installing) {
        setInstallProgress((prev) =>
          prev && prev.phase !== 'complete' && prev.phase !== 'error' ? null : prev,
        );
      }
    });

    // Tunnel install progress
    window.electron.onTunnelInstallProgress((data) => {
      setInstallProgress(data);
      if (data.phase === 'complete') {
        setTimeout(() => setInstallProgress(null), 600);
      }
    });

    return () => {
      window.electron.removeServiceStatusListener();
      window.electron.removeTunnelStatusListener();
      window.electron.removeTunnelInstallProgressListener();
    };
  }, []);

  return (
    <div className="flex h-screen bg-sand-50">
      {/* Custom Title Bar */}
      <TitleBar />
      
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onNewChat={handleNewChat}
        chatStarted={chatStarted}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ marginTop: '32px' }}>
        {/* Header */}
        <Header activeTab={activeTab} />

        {/* Content Area - Wrapper with overflow */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <main className={`h-full ${activeTab === 'chat' ? 'px-12 py-12' : 'px-12 py-8'}`}>
            {activeTab === 'chat' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {/* Chat Interface - Full tab with persistent state */}
                <ChatInterface 
                  messages={chatMessages}
                  setMessages={setChatMessages}
                  chatStarted={chatStarted}
                  setChatStarted={setChatStarted}
                  selectedProvider={selectedProvider}
                  setSelectedProvider={setSelectedProvider}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  selectedEndpoint={selectedEndpoint}
                  setSelectedEndpoint={setSelectedEndpoint}
                  tunnelUrl={tunnelStatus.status === 'running' ? tunnelStatus.url : null}
                  geminiRunning={serviceStatus.gemini === 'running'}
                  chatgptRunning={serviceStatus.chat2api === 'running'}
                  proxyRunning={serviceStatus.proxy === 'running'}
                />
              </motion.div>
            )}

            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* System flow diagram */}
                <ServicesOverview
                  serviceStatus={serviceStatus}
                  tunnelStatus={tunnelStatus}
                  onStartService={handleStartService}
                  onStopService={handleStopService}
                  onTunnelStart={handleTunnelStart}
                  onTunnelStop={handleTunnelStop}
                />

                {/* Local API endpoint */}
                <EndpointCard proxyStatus={serviceStatus.proxy} />

                {/* Public Cloudflare tunnel */}
                <TunnelCard
                  tunnelStatus={tunnelStatus}
                  installProgress={installProgress}
                  proxyRunning={serviceStatus.proxy === 'running'}
                  onInstall={handleTunnelInstall}
                  onStart={handleTunnelStart}
                  onStop={handleTunnelStop}
                />

                {/* API examples */}
                <ApiExamples />

                {/* Standalone project setup - spotlight card */}
                <StandaloneSetupCard onOpen={() => setShowLocalSetup(true)} />

                {/* Bottom breathing room so the card doesn't touch the viewport edge */}
                <div className="h-12" aria-hidden="true" />
              </motion.div>
            )}

            {activeTab === 'services' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Gateway — proxy + public tunnel together (infrastructure) */}
                <GatewayPanel
                  proxyStatus={serviceStatus.proxy}
                  tunnelStatus={tunnelStatus}
                  installProgress={installProgress}
                  onStartProxy={() => handleStartService('proxy')}
                  onStopProxy={() => handleStopService('proxy')}
                  onKillProxy={() => window.electron.killService('proxy')}
                  onTunnelStart={handleTunnelStart}
                  onTunnelStop={handleTunnelStop}
                  onOpenTunnelSetup={() => setActiveTab('dashboard')}
                />

                {/* Divider */}
                <div className="my-8 border-t border-sand-300" />

                {/* Bridges — kept exactly as before, unchanged */}
                <div className="mb-3 px-1">
                  <h3 className="text-sm font-semibold text-gray-900">Bridges</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Per-provider adapters that need your session tokens
                  </p>
                </div>
                <div className="space-y-4">
                  <ServiceCard
                    name="Gemini"
                    serviceName="gemini"
                    port={6969}
                    status={serviceStatus.gemini}
                    description="Google Gemini API bridge with browser session authentication"
                  />

                  <ServiceCard
                    name="ChatGPT"
                    serviceName="chat2api"
                    port={5005}
                    status={serviceStatus.chat2api}
                    description="ChatGPT API bridge with token-based authentication"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'logs' && (
              <LogsViewer />
            )}
          </main>
        </div>
      </div>

      {/* Local Setup Wizard Modal */}
      <AnimatePresence>
        {showLocalSetup && (
          <LocalSetupWizard onClose={() => setShowLocalSetup(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
