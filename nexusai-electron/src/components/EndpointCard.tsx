import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

const EndpointCard = () => {
  const [copied, setCopied] = useState(false);
  const endpoint = 'http://localhost:8000/v1';

  const handleCopy = () => {
    navigator.clipboard.writeText(endpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          
          <div className="bg-sand-50 rounded-2xl p-4 mb-5">
            <code className="text-gray-900 font-mono text-base">
              {endpoint}
            </code>
          </div>

          <button
            onClick={handleCopy}
            className="bg-accent hover:bg-accent-hover active:bg-accent-hover text-white font-medium text-base py-2.5 px-5 rounded-2xl transition-all duration-150 flex items-center gap-2 hover:shadow-sm active:scale-[0.98]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Endpoint
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EndpointCard;
