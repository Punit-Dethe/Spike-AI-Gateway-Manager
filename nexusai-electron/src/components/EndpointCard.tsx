import { motion } from 'framer-motion';
import { useState } from 'react';

type ServiceRunStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';

interface EndpointCardProps {
  proxyStatus?: ServiceRunStatus;
}

const EndpointCard = ({ proxyStatus = 'stopped' }: EndpointCardProps) => {
  const [copied, setCopied] = useState(false);
  const endpoint = 'http://localhost:8000/v1';

  const handleCopy = () => {
    navigator.clipboard.writeText(endpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLive = proxyStatus === 'running';
  const isPending = proxyStatus === 'starting' || proxyStatus === 'stopping';

  const dotClass = isLive
    ? 'bg-emerald-500'
    : isPending
      ? 'bg-amber-500 animate-pulse'
      : 'bg-gray-400';

  const label = isLive
    ? 'Live'
    : proxyStatus === 'starting'
      ? 'Starting'
      : proxyStatus === 'stopping'
        ? 'Stopping'
        : proxyStatus === 'error'
          ? 'Error'
          : 'Offline';

  const labelColor = isLive
    ? 'text-emerald-700'
    : isPending
      ? 'text-amber-700'
      : proxyStatus === 'error'
        ? 'text-rose-700'
        : 'text-gray-600';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-sand-100 rounded-2xl p-8 mb-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-gray-900 text-xl font-sans font-semibold mb-2">
            Unified API Endpoint
          </h3>
          <p className="text-gray-700 text-base mb-5">
            Use this endpoint for all AI model requests
          </p>

          <div className="bg-sand-50 rounded-2xl p-4 mb-5 flex items-center justify-between gap-4">
            <code className="text-gray-900 font-mono text-base break-all">
              {endpoint}
            </code>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
              <span className={`text-xs font-medium ${labelColor}`}>{label}</span>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="bg-accent hover:bg-accent-hover active:bg-accent-hover text-white font-medium text-base py-2.5 px-5 rounded-2xl transition-all duration-150 hover:shadow-sm active:scale-[0.98]"
          >
            {copied ? 'Copied!' : 'Copy Endpoint'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EndpointCard;
