import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ServiceCard from './components/ServiceCard';
import EndpointCard from './components/EndpointCard';
import StatusBar from './components/StatusBar';
import QuickStart from './components/QuickStart';
import ChatInterface from './components/ChatInterface';
import LogsViewer from './components/LogsViewer';
import TitleBar from './components/TitleBar';

interface ServiceStatus {
  [key: string]: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
}

type Tab = 'chat' | 'dashboard' | 'services' | 'logs';

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

  const handleNewChat = () => {
    setChatMessages([]);
    setChatStarted(false);
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

    return () => {
      window.electron.removeServiceStatusListener();
    };
  }, []);

  const handleStartServices = async (model: string) => {
    if (model === 'gemini') {
      // Start Gemini service first
      await window.electron.startService('gemini');
      
      // Wait a bit for Gemini to initialize, then start proxy
      setTimeout(async () => {
        await window.electron.startService('proxy');
      }, 2000); // 2 second delay to ensure Gemini starts properly
    } else if (model === 'chatgpt') {
      // Start Chat2API service first
      await window.electron.startService('chat2api');
      
      // Wait a bit for Chat2API to initialize, then start proxy
      setTimeout(async () => {
        await window.electron.startService('proxy');
      }, 2000); // 2 second delay to ensure Chat2API starts properly
    }
  };

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
                />
              </motion.div>
            )}

            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Status Bar - Scrolls with content */}
                <StatusBar serviceStatus={serviceStatus} />

                {/* API Endpoint Card */}
                <EndpointCard />

                {/* Quick Start */}
                <QuickStart 
                  serviceStatus={serviceStatus}
                  onStartServices={handleStartServices}
                />
              </motion.div>
            )}

            {activeTab === 'services' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Primary Service - Unified Proxy (No Card Background) */}
                <ServiceCard
                  name="Unified Proxy"
                  serviceName="proxy"
                  port={8000}
                  status={serviceStatus.proxy}
                  description="Routes to appropriate AI backend"
                  primary={true}
                />

                {/* Divider */}
                <div className="my-8 border-t border-sand-300" />

                {/* Secondary Services */}
                <div className="space-y-4">
                  <ServiceCard
                    name="Gemini Bridge"
                    serviceName="gemini"
                    port={6969}
                    status={serviceStatus.gemini}
                    description="Google Gemini API bridge with browser session authentication"
                  />
                  
                  <ServiceCard
                    name="Chat2API"
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
    </div>
  );
}

export default App;
