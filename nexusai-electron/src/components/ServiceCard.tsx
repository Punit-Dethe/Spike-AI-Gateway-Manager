import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Settings } from 'lucide-react';
import { useState } from 'react';
import startIcon from '../assets/start.png';
import stopIcon from '../assets/stop.png';

interface ServiceCardProps {
  name: string;
  serviceName: string;
  port: number;
  status: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
  description: string;
  primary?: boolean;
  errorMessage?: string;
}

const ServiceCard = ({ name, serviceName, port, status, description, primary = false, errorMessage }: ServiceCardProps) => {
  const [showTokenConfig, setShowTokenConfig] = useState(false);
  const [psid, setPsid] = useState('');
  const [psidts, setPsidts] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<{
    hasTokens: boolean;
    psidPreview?: string;
    psidtsPreview?: string;
  }>({ hasTokens: false });

  const isGemini = serviceName === 'gemini';
  const isChat2API = serviceName === 'chat2api';

  // Check token status when config is opened (for Gemini)
  const handleConfigToggle = async () => {
    const newState = !showTokenConfig;
    setShowTokenConfig(newState);
    
    if (newState && isGemini) {
      try {
        const result = await window.electron.checkGeminiTokens();
        if (result.success) {
          setTokenStatus({
            hasTokens: result.hasTokens,
            psidPreview: result.psidPreview,
            psidtsPreview: result.psidtsPreview
          });
        }
      } catch (error) {
        console.error('Error checking tokens:', error);
      }
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleStart = () => {
    window.electron.startService(serviceName);
  };

  const handleStop = () => {
    window.electron.stopService(serviceName);
  };

  const handleRestart = async () => {
    // Stop first
    await window.electron.stopService(serviceName);
    // Wait a bit for the service to fully stop
    setTimeout(() => {
      // Then start
      window.electron.startService(serviceName);
    }, 1500);
  };

  const handleSaveTokens = async () => {
    if (!psid.trim() || !psidts.trim()) {
      setSaveMessage('Both tokens are required');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    try {
      await window.electron.saveGeminiTokens(psid.trim(), psidts.trim());
      setSaveMessage('Tokens saved successfully! Restart the service to apply changes.');
      
      // Update token status
      const result = await window.electron.checkGeminiTokens();
      if (result.success) {
        setTokenStatus({
          hasTokens: result.hasTokens,
          psidPreview: result.psidPreview,
          psidtsPreview: result.psidtsPreview
        });
      }
      
      // Clear input fields
      setPsid('');
      setPsidts('');
      
      setTimeout(() => {
        setSaveMessage('');
      }, 4000);
    } catch (error) {
      setSaveMessage('Failed to save tokens');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'running':
        return {
          dot: 'bg-emerald-500',
          text: 'Running',
          textColor: 'text-emerald-700',
        };
      case 'starting':
        return {
          dot: 'bg-amber-500 animate-pulse',
          text: 'Starting...',
          textColor: 'text-amber-700',
        };
      case 'stopping':
        return {
          dot: 'bg-amber-500 animate-pulse',
          text: 'Stopping...',
          textColor: 'text-amber-700',
        };
      case 'error':
        return {
          dot: 'bg-rose-500',
          text: 'Error',
          textColor: 'text-rose-700',
        };
      default:
        return {
          dot: 'bg-gray-400',
          text: 'Stopped',
          textColor: 'text-gray-600',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const isRunning = status === 'running';
  const isTransitioning = status === 'starting' || status === 'stopping';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-6 transition-all duration-150 ${
        primary 
          ? 'bg-transparent' 
          : 'bg-sand-100 border border-transparent hover:border-sand-300'
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Left side - Service info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className={`font-serif font-bold text-gray-900 ${primary ? 'text-3xl' : 'text-lg'}`}>
              {name}
            </h3>
            <span className={`font-medium text-gray-600 bg-sand-100 px-3 py-1 rounded-xl ${primary ? 'text-base' : 'text-sm'}`}>
              :{port}
            </span>
            <div className="flex items-center gap-2">
              <div className={`rounded-full ${statusConfig.dot} ${primary ? 'w-2 h-2' : 'w-1.5 h-1.5'}`} />
              <span className={`font-medium ${statusConfig.textColor} ${primary ? 'text-base' : 'text-sm'}`}>
                {statusConfig.text}
              </span>
            </div>
          </div>
          
          <p className={`text-gray-700 leading-relaxed ${primary ? 'text-base' : 'text-base'}`}>
            {description}
          </p>
          
          {status === 'error' && (
            <div className="mt-2 text-sm text-rose-700 bg-rose-50 px-3 py-2 rounded-xl">
              {errorMessage || 'Service error. Check console for details (Ctrl+Shift+I).'}
            </div>
          )}
        </div>

        {/* Right side - Controls */}
        <div className="flex gap-2 ml-4">
          {(isGemini || isChat2API) && (
            <button
              onClick={handleConfigToggle}
              className="flex items-center justify-center bg-transparent text-gray-700 hover:text-accent font-medium text-base p-2.5 rounded-2xl transition-colors duration-200"
              title="Configure"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={handleStart}
            disabled={isRunning || isTransitioning}
            className={`flex items-center gap-2 bg-sand-300 hover:bg-sand-400 active:bg-sand-400 disabled:bg-sand-200 disabled:cursor-not-allowed text-gray-900 disabled:text-gray-500 font-medium rounded-2xl transition-all duration-150 hover:shadow-sm active:scale-[0.98] ${
              primary ? 'text-lg py-3 px-6' : 'text-base py-2 px-4'
            }`}
          >
            {isTransitioning && status === 'starting' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                <span>Starting</span>
              </>
            ) : (
              <>
                <img src={startIcon} alt="Start" className="w-4 h-4 flex-shrink-0" />
                <span>Start</span>
              </>
            )}
          </button>

          <button
            onClick={handleStop}
            disabled={isTransitioning && status === 'stopping'}
            className={`flex items-center gap-2 bg-sand-300 hover:bg-sand-400 active:bg-sand-400 disabled:bg-sand-200 disabled:cursor-not-allowed text-gray-900 disabled:text-gray-500 font-medium rounded-2xl transition-all duration-150 hover:shadow-sm active:scale-[0.98] ${
              primary ? 'text-lg py-3 px-6' : 'text-base py-2 px-4'
            }`}
          >
            {isTransitioning && status === 'stopping' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                <span>Stopping</span>
              </>
            ) : (
              <>
                <img src={stopIcon} alt="Stop" className="w-4 h-4 flex-shrink-0" />
                <span>Stop</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Token Configuration Section - For Gemini and Chat2API */}
      <AnimatePresence>
        {(isGemini || isChat2API) && showTokenConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="mt-4 pt-4 border-t border-sand-200 overflow-hidden"
          >
            {isGemini && (
              <>
                <h4 className="text-base font-semibold text-gray-900 mb-3">Configure Gemini Tokens</h4>
                
                {/* Token Status Display */}
                <div className={`mb-4 p-3 rounded-xl ${
                  tokenStatus.hasTokens 
                    ? 'bg-sand-300' 
                    : 'bg-sand-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${
                      tokenStatus.hasTokens ? 'bg-emerald-600' : 'bg-amber-600'
                    }`} />
                    <span className={`text-sm font-semibold ${
                      tokenStatus.hasTokens ? 'text-gray-900' : 'text-gray-800'
                    }`}>
                      {tokenStatus.hasTokens ? 'Tokens Configured' : 'No Tokens Configured'}
                    </span>
                  </div>
                  {tokenStatus.hasTokens ? (
                    <div className="text-xs text-gray-700 ml-4 space-y-0.5">
                      <div>PSID: {tokenStatus.psidPreview}</div>
                      <div>PSIDTS: {tokenStatus.psidtsPreview}</div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-700 ml-4">
                      Please add your tokens below to use Gemini Bridge
                    </p>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Enter your Google Gemini session tokens (PSID and PSIDTS) to authenticate with the Gemini API.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      PSID Token
                    </label>
                    <input
                      type="text"
                      value={psid}
                      onChange={(e) => setPsid(e.target.value)}
                      placeholder="g.a000..."
                      className="w-full bg-sand-50 text-gray-900 text-sm px-4 py-2.5 rounded-xl border-2 border-transparent focus:border-accent focus:outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      PSIDTS Token
                    </label>
                    <input
                      type="text"
                      value={psidts}
                      onChange={(e) => setPsidts(e.target.value)}
                      placeholder="sidts-..."
                      className="w-full bg-sand-50 text-gray-900 text-sm px-4 py-2.5 rounded-xl border-2 border-transparent focus:border-accent focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {isChat2API && (
              <>
                <h4 className="text-base font-semibold text-gray-900 mb-3">Configure Chat2API Token</h4>
                
                <p className="text-sm text-gray-600 mb-4">
                  Follow these two simple steps to add your ChatGPT token:
                </p>
                
                <div className="space-y-3">
                  <div className="bg-sand-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sand-300 text-gray-900 flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 mb-1">Get Your Token</h5>
                        <p className="text-sm text-gray-600 mb-2">
                          Copy this URL and open it in your browser to find your access token
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value="https://chatgpt.com/api/auth/session"
                            readOnly
                            className="flex-1 bg-white text-gray-700 text-sm px-3 py-2 rounded-lg border border-sand-300 font-mono"
                          />
                          <button
                            onClick={() => handleCopyUrl('https://chatgpt.com/api/auth/session')}
                            className="bg-sand-300 hover:bg-sand-400 active:bg-sand-400 text-gray-900 text-sm font-medium py-2 px-4 rounded-xl transition-all duration-150 hover:shadow-sm active:scale-[0.98] whitespace-nowrap"
                          >
                            {copiedUrl ? 'Copied!' : 'Copy URL'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-sand-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sand-300 text-gray-900 flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 mb-1">Add Token to Chat2API</h5>
                        <p className="text-sm text-gray-600 mb-2">
                          Paste your token in the Chat2API token management page
                        </p>
                        <button
                          onClick={() => window.electron.openTokenWindow()}
                          className="bg-sand-300 hover:bg-sand-400 active:bg-sand-400 text-gray-900 text-sm font-medium py-2 px-4 rounded-xl transition-all duration-150 hover:shadow-sm active:scale-[0.98]"
                        >
                          Open Token Management
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-sand-50 rounded-xl p-3 mt-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-700">
                        <strong>Note:</strong> After adding your token, restart the Chat2API service for changes to take effect.
                      </p>
                      <button
                        onClick={handleRestart}
                        disabled={isTransitioning}
                        className="flex-shrink-0 bg-sand-300 hover:bg-sand-400 active:bg-sand-400 disabled:bg-sand-200 disabled:cursor-not-allowed text-gray-900 disabled:text-gray-500 text-sm font-medium py-1.5 px-3 rounded-lg transition-all duration-150 hover:shadow-sm active:scale-[0.98] whitespace-nowrap"
                      >
                        {isTransitioning ? 'Restarting...' : 'Restart'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {isGemini && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSaveTokens}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 bg-sand-300 hover:bg-sand-400 active:bg-sand-400 disabled:bg-sand-200 disabled:cursor-not-allowed text-gray-900 font-medium text-sm py-2 px-4 rounded-xl transition-all duration-150 hover:shadow-sm active:scale-[0.98]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Tokens</span>
                  )}
                </button>
                
                {saveMessage && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-sm font-medium ${
                      saveMessage.includes('success') ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {saveMessage}
                  </motion.span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ServiceCard;
