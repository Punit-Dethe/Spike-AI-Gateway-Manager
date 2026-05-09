import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FolderOpen, Check, AlertCircle, Loader2, Terminal } from 'lucide-react';

interface LocalSetupWizardProps {
  onClose: () => void;
}

type Step = 'intro' | 'folder' | 'tokens' | 'creating' | 'complete' | 'error';

const LocalSetupWizard = ({ onClose }: LocalSetupWizardProps) => {
  const [step, setStep] = useState<Step>('intro');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [psid, setPsid] = useState<string>('');
  const [psidts, setPsidts] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [setupPath, setSetupPath] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText('python setup.py');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectFolder = async () => {
    try {
      const result = await window.electron.selectFolder();
      if (result.success && result.path) {
        setSelectedFolder(result.path);
        setStep('tokens');
      }
    } catch (error) {
      setErrorMessage('Failed to select folder');
      setStep('error');
    }
  };

  const handleCreateSetup = async () => {
    if (!psid.trim() || !psidts.trim()) {
      setErrorMessage('Both tokens are required');
      return;
    }

    setStep('creating');
    
    try {
      const result = await window.electron.createLocalGeminiSetup({
        projectPath: selectedFolder,
        psid: psid.trim(),
        psidts: psidts.trim()
      });

      if (result.success) {
        setSetupPath(result.setupPath || '');
        setStep('complete');
      } else {
        setErrorMessage(result.error || 'Failed to create setup');
        setStep('error');
      }
    } catch (error) {
      setErrorMessage('Failed to create local setup');
      setStep('error');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return (
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Set Up Gemini Locally
            </h3>
            <p className="text-gray-700 mb-6">
              This wizard will help you set up a standalone Gemini API server in your project folder.
              Perfect for integrating AI into your local or hosted applications.
            </p>
            <div className="bg-sand-200 rounded-2xl p-4 mb-6 text-left">
              <h4 className="font-semibold text-gray-900 mb-2">What you'll get:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Standalone Python server file</li>
                <li>• Configuration with your tokens</li>
                <li>• Requirements.txt for dependencies</li>
                <li>• Complete setup instructions</li>
                <li>• Ready to run locally or deploy</li>
              </ul>
            </div>
            <button
              onClick={() => setStep('folder')}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-2xl font-medium transition-colors"
            >
              Get Started
            </button>
          </div>
        );

      case 'folder':
        return (
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Select Project Folder
            </h3>
            <p className="text-gray-700 mb-6">
              Choose where you want to create the Gemini setup. A new folder called "gemini-api" will be created inside.
            </p>
            
            {selectedFolder && (
              <div className="bg-sand-200 rounded-2xl p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Selected folder:</p>
                <p className="text-sm font-mono text-gray-900 break-all">{selectedFolder}</p>
              </div>
            )}

            <button
              onClick={handleSelectFolder}
              className="w-full bg-sand-200 hover:bg-sand-300 text-gray-900 px-6 py-3 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FolderOpen className="w-5 h-5" />
              {selectedFolder ? 'Change Folder' : 'Select Folder'}
            </button>
          </div>
        );

      case 'tokens':
        return (
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Configure Gemini Tokens
            </h3>
            <p className="text-gray-700 mb-6">
              Enter your Gemini tokens. These will be securely stored in your local setup.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  __Secure-1PSID
                </label>
                <input
                  type="password"
                  value={psid}
                  onChange={(e) => setPsid(e.target.value)}
                  placeholder="Enter your PSID token"
                  className="w-full bg-sand-100 border border-sand-400 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  __Secure-1PSIDTS
                </label>
                <input
                  type="password"
                  value={psidts}
                  onChange={(e) => setPsidts(e.target.value)}
                  placeholder="Enter your PSIDTS token"
                  className="w-full bg-sand-100 border border-sand-400 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('folder')}
                className="flex-1 bg-sand-200 hover:bg-sand-300 text-gray-900 px-6 py-3 rounded-2xl font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreateSetup}
                disabled={!psid.trim() || !psidts.trim()}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-2xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Setup
              </button>
            </div>
          </div>
        );

      case 'creating':
        return (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-gray-900 animate-spin mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Creating Setup...
            </h3>
            <p className="text-gray-700">
              Setting up your local Gemini API server
            </p>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Setup Complete
            </h3>

            <div className="bg-sand-200 rounded-2xl p-6 mb-6">
              <div className="space-y-3">
                {/* Step 1: Open Terminal */}
                <button
                  onClick={() => window.electron.openTerminal?.(setupPath)}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-xl transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-white text-gray-900 rounded-full flex items-center justify-center font-semibold text-sm">
                    1
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Open Terminal</p>
                  </div>
                  <Terminal className="w-5 h-5" />
                </button>

                {/* Step 2: Run Setup Script */}
                <div className="w-full bg-sand-100 text-gray-900 px-4 py-3 rounded-xl border border-sand-400">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold mb-2">Run Setup Script</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-sand-300 px-2 py-1.5 rounded-lg font-mono text-xs">
                          python setup.py
                        </code>
                        <button
                          onClick={handleCopyCommand}
                          className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap"
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-2xl font-medium transition-colors"
            >
              Done
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Setup Failed
            </h3>
            <p className="text-gray-700 mb-6">
              {errorMessage}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('intro')}
                className="flex-1 bg-sand-200 hover:bg-sand-300 text-gray-900 px-6 py-3 rounded-2xl font-medium transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-2xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-sand-50 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default LocalSetupWizard;
