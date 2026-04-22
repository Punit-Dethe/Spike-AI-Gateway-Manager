import { motion } from 'framer-motion';
import { Play, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface QuickStartProps {
  serviceStatus: {
    [key: string]: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
  };
  onStartServices: (model: string) => void;
}

const QuickStart = ({ serviceStatus, onStartServices }: QuickStartProps) => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  
  // Check if services are starting or running based on the selected model
  const getModelStatus = (modelId: string) => {
    if (modelId === 'gemini') {
      const isStarting = serviceStatus.gemini === 'starting' || serviceStatus.proxy === 'starting';
      const isRunning = serviceStatus.gemini === 'running' && serviceStatus.proxy === 'running';
      return { isStarting, isRunning };
    } else if (modelId === 'chatgpt') {
      const isStarting = serviceStatus.chat2api === 'starting' || serviceStatus.proxy === 'starting';
      const isRunning = serviceStatus.chat2api === 'running' && serviceStatus.proxy === 'running';
      return { isStarting, isRunning };
    }
    return { isStarting: false, isRunning: false };
  };

  const models = [
    {
      id: 'gemini',
      name: 'Gemini',
      description: 'Google Gemini AI models',
      available: true,
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      description: 'OpenAI GPT models',
      available: true,
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      description: 'Perplexity AI models',
      available: false,
    },
  ];

  const handleStart = (modelId: string) => {
    if (!models.find(m => m.id === modelId)?.available) {
      return; // Don't start unavailable models
    }
    
    const { isStarting, isRunning } = getModelStatus(modelId);
    if (isStarting || isRunning) {
      return; // Don't start if already starting or running
    }
    
    setSelectedModel(modelId);
    onStartServices(modelId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-sand-100 rounded-2xl p-8"
    >
      <div>
        <h3 className="text-gray-900 text-xl font-sans font-semibold mb-2">
          Quick Start
        </h3>
        <p className="text-gray-700 text-base mb-6">
          Start services with one click for your preferred AI model
        </p>

        <div className="grid grid-cols-3 gap-4">
          {models.map((model) => {
            const { isStarting, isRunning } = getModelStatus(model.id);
            
            return (
              <button
                key={model.id}
                onClick={() => handleStart(model.id)}
                disabled={!model.available || isStarting || isRunning}
                className={`relative rounded-2xl p-5 text-left transition-all duration-150 border ${
                  model.available
                    ? 'bg-sand-200 border-transparent hover:border-sand-300 active:scale-[0.98] cursor-pointer'
                    : 'bg-sand-50 border-transparent cursor-not-allowed opacity-60'
                } ${
                  isStarting && selectedModel === model.id
                    ? 'border-sand-400'
                    : ''
                } ${
                  isRunning && selectedModel === model.id
                    ? 'border-sand-400'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-base text-gray-900 mb-1">
                      {model.name}
                    </div>
                    <div className="text-sm text-gray-700">
                      {model.description}
                    </div>
                  </div>
                  
                  {model.available && (
                    <div className="ml-3">
                      {isStarting && selectedModel === model.id ? (
                        <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
                      ) : isRunning && selectedModel === model.id ? (
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      ) : (
                        <Play className="w-5 h-5 text-gray-700" />
                      )}
                    </div>
                  )}
                </div>

                {!model.available && (
                  <div className="text-xs text-gray-500 font-medium">
                    Coming Soon
                  </div>
                )}

                {model.available && isRunning && selectedModel === model.id && (
                  <div className="text-xs text-gray-700 font-medium">
                    Running
                  </div>
                )}

                {model.available && isStarting && selectedModel === model.id && (
                  <div className="text-xs text-gray-700 font-medium">
                    Starting...
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default QuickStart;
