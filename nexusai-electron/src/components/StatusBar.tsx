import { motion } from 'framer-motion';

interface StatusBarProps {
  serviceStatus: {
    [key: string]: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
  };
}

const StatusBar = ({ serviceStatus }: StatusBarProps) => {
  const runningServices = Object.entries(serviceStatus).filter(
    ([key]) => key !== 'proxy' && serviceStatus[key] === 'running'
  );

  const proxyStatus = serviceStatus.proxy || 'stopped';
  const proxyIsRunning = proxyStatus === 'running';

  return (
    <>
      <div className="text-sm font-medium text-gray-700 mb-2">
        Active Services
      </div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-sand-100 rounded-2xl p-4 mb-6"
      >
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Running services or empty state */}
        <div className="flex items-center gap-3 flex-1">
          {runningServices.length === 0 ? (
            <div className="text-sm text-gray-600">
              No services running
            </div>
          ) : (
            <>
              {runningServices.map(([serviceName]) => (
                <motion.div
                  key={serviceName}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-sand-200 rounded-xl px-4 py-2 flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                  <span className="text-sm font-medium text-gray-900">
                    {serviceName === 'gemini' ? 'Gemini Bridge' : serviceName}
                  </span>
                </motion.div>
              ))}
            </>
          )}
        </div>

        {/* Right side - Unified Proxy status (circular, wider card) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-full px-5 py-2 flex items-center gap-2 ${
            proxyIsRunning ? 'bg-sand-300' : 'bg-sand-200'
          }`}
        >
          <div 
            className={`w-2 h-2 rounded-full ${
              proxyIsRunning ? 'bg-emerald-500' : 'bg-gray-400'
            }`}
          />
          <span className={`text-sm font-medium ${
            proxyIsRunning ? 'text-gray-900' : 'text-gray-600'
          }`}>
            Unified Proxy
          </span>
        </motion.div>
      </div>
    </motion.div>
    </>
  );
};

export default StatusBar;
