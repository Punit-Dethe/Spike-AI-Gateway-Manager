import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { TunnelStatus, CloudflaredInstallProgress } from '../electron';

interface TunnelCardProps {
  tunnelStatus: TunnelStatus;
  installProgress: CloudflaredInstallProgress | null;
  onInstall: () => void | Promise<void>;
  onStart: () => void | Promise<void>;
  onStop: () => void | Promise<void>;
}

const TunnelCard = ({
  tunnelStatus: status,
  installProgress,
  onInstall,
  onStart,
  onStop,
}: TunnelCardProps) => {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleInstall = async () => {
    setBusy(true);
    try {
      await onInstall();
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = async (next: boolean) => {
    setBusy(true);
    try {
      if (next) await onStart();
      else await onStop();
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = () => {
    if (!status.url) return;
    navigator.clipboard.writeText(`${status.url}/v1`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOn = status.status === 'running' || status.status === 'starting';
  const showProgress =
    status.installing ||
    (installProgress &&
      installProgress.phase !== 'complete' &&
      installProgress.phase !== 'error');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="bg-sand-100 rounded-2xl p-8 mb-6"
    >
      <div className="flex items-start justify-between gap-6 mb-2">
        <div>
          <h3 className="text-gray-900 text-xl font-sans font-semibold">
            Public API Endpoint
          </h3>
          <p className="text-gray-700 text-base">
            Expose the Unified Proxy via a Cloudflare tunnel
          </p>
        </div>

        {/* Toggle - only visible when installed */}
        {status.installed && (
          <button
            onClick={() => handleToggle(!isOn)}
            disabled={busy || status.status === 'starting' || status.status === 'stopping'}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50 ${
              isOn ? 'bg-accent' : 'bg-sand-300'
            }`}
            aria-label="Toggle tunnel"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                isOn ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        )}
      </div>

      {/* === Not installed === */}
      {!status.installed && !showProgress && (
        <div className="mt-5">
          <div className="bg-sand-50 rounded-2xl p-4 mb-5">
            <p className="text-sm text-gray-700">
              Install the Cloudflare connector once to get a public URL anyone can call.
              The download is about 22 MB and installs inside Spike. Nothing leaves the app.
            </p>
          </div>
          <button
            onClick={handleInstall}
            disabled={busy}
            className="bg-accent hover:bg-accent-hover text-white font-medium text-base py-2.5 px-5 rounded-2xl transition-all duration-150 hover:shadow-sm active:scale-[0.98] disabled:opacity-60"
          >
            Install Cloudflare Tunnel
          </button>
        </div>
      )}

      {/* === Installing / downloading === */}
      <AnimatePresence>
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5"
          >
            <div className="bg-sand-50 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="w-4 h-4 text-accent animate-spin" />
                <span className="text-sm font-medium text-gray-900">
                  {installProgress?.phase === 'starting' && 'Preparing download...'}
                  {installProgress?.phase === 'downloading' &&
                    (installProgress.percent && installProgress.percent >= 0
                      ? `Downloading cloudflared... ${installProgress.percent}%`
                      : 'Downloading cloudflared...')}
                  {!installProgress && 'Installing...'}
                </span>
              </div>
              <div className="h-2 w-full bg-sand-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      installProgress?.percent && installProgress.percent >= 0
                        ? `${installProgress.percent}%`
                        : '40%',
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Install error === */}
      {installProgress?.phase === 'error' && !showProgress && (
        <div className="mt-5 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900 mb-1">Install failed</p>
            <p className="text-xs text-red-700">{installProgress.error}</p>
            <button
              onClick={handleInstall}
              className="text-xs font-medium text-red-700 underline mt-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* === Installed: tunnel state === */}
      {status.installed && !showProgress && (
        <div className="mt-5">
          {/* Stopped */}
          {status.status === 'stopped' && (
            <div className="bg-sand-50 rounded-2xl p-4">
              <p className="text-sm text-gray-700">
                Tunnel is off. Toggle it on to get a public{' '}
                <code className="bg-sand-200 px-1.5 py-0.5 rounded font-mono text-xs">
                  trycloudflare.com
                </code>{' '}
                URL that forwards to{' '}
                <code className="bg-sand-200 px-1.5 py-0.5 rounded font-mono text-xs">
                  http://localhost:{status.port}
                </code>
                .
              </p>
            </div>
          )}

          {/* Starting */}
          {status.status === 'starting' && (
            <div className="bg-sand-50 rounded-2xl p-4 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-accent animate-spin" />
              <span className="text-sm text-gray-700">
                Starting tunnel and waiting for a public URL...
              </span>
            </div>
          )}

          {/* Running with URL */}
          {status.status === 'running' && status.url && (
            <div>
              <div className="bg-sand-50 rounded-2xl p-4 mb-4 flex items-center justify-between gap-3">
                <code className="text-gray-900 font-mono text-base break-all">
                  {status.url}/v1
                </code>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-gray-700">Live</span>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className="bg-accent hover:bg-accent-hover text-white font-medium text-base py-2.5 px-5 rounded-2xl transition-all duration-150 hover:shadow-sm active:scale-[0.98]"
              >
                {copied ? 'Copied!' : 'Copy Public Endpoint'}
              </button>
            </div>
          )}

          {/* Stopping */}
          {status.status === 'stopping' && (
            <div className="bg-sand-50 rounded-2xl p-4 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
              <span className="text-sm text-gray-700">Stopping tunnel...</span>
            </div>
          )}

          {/* Error */}
          {status.status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900 mb-1">Tunnel error</p>
                <p className="text-xs text-red-700">
                  {status.error || 'Unknown error'}
                </p>
                <button
                  onClick={() => handleToggle(true)}
                  className="text-xs font-medium text-red-700 underline mt-2"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TunnelCard;
