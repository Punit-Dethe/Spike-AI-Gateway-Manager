import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { TunnelStatus, CloudflaredInstallProgress } from '../electron';

interface TunnelCardProps {
  tunnelStatus: TunnelStatus;
  installProgress: CloudflaredInstallProgress | null;
  onInstall: () => void | Promise<void>;
  onStart: () => void | Promise<void>;
  onStop: () => void | Promise<void>;
}

// ─── helpers ────────────────────────────────────────────────────────────────

type Phase =
  | 'not-installed'
  | 'installing'
  | 'install-error'
  | 'stopped'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'error';

function derivePhase(
  status: TunnelStatus,
  progress: CloudflaredInstallProgress | null,
): Phase {
  if (!status.installed) {
    if (status.installing) return 'installing';
    if (progress && progress.phase !== 'complete' && progress.phase !== 'error')
      return 'installing';
    if (progress?.phase === 'error') return 'install-error';
    return 'not-installed';
  }
  if (status.status === 'starting') return 'starting';
  if (status.status === 'stopping') return 'stopping';
  if (status.status === 'running') return 'running';
  if (status.status === 'error') return 'error';
  return 'stopped';
}

// ─── Status label ────────────────────────────────────────────────────────────

const StatusLabel = ({ phase }: { phase: Phase }) => {
  const isLive    = phase === 'running';
  const isError   = phase === 'error' || phase === 'install-error';
  const isPending = phase === 'starting' || phase === 'stopping' || phase === 'installing';

  const label = isLive ? 'Online' : isError ? 'Error' : isPending ? 'Connecting' : 'Offline';
  const color = isLive ? '#10b981' : isError ? '#f43f5e' : isPending ? '#f59e0b' : '#9ca3af';

  return (
    <span className="text-xs font-semibold tracking-wide" style={{ color }}>
      {label}
    </span>
  );
};

// ─── Globe ───────────────────────────────────────────────────────────────────

type GlobeState = 'idle' | 'installing' | 'connecting' | 'live' | 'error';

const Globe = ({ phase }: { phase: Phase }) => {
  const state: GlobeState =
    phase === 'running'                              ? 'live'
    : phase === 'installing'                         ? 'installing'
    : phase === 'starting' || phase === 'stopping'   ? 'connecting'
    : phase === 'error'    || phase === 'install-error' ? 'error'
    : 'idle';

  const isLive   = state === 'live';
  const isActive = state === 'installing' || state === 'connecting';
  const isError  = state === 'error';

  const stroke    = isLive ? '#10b981' : isActive ? '#2563EB' : isError ? '#f43f5e' : 'rgba(0,0,0,0.18)';
  const fillOcean = isLive ? 'rgba(16,185,129,0.06)' : isActive ? 'rgba(37,99,235,0.05)' : 'rgba(0,0,0,0.03)';
  const glowColor = isLive ? 'rgba(16,185,129,0.10)' : isActive ? 'rgba(37,99,235,0.08)' : 'transparent';
  const dur       = isLive ? '6s' : isActive ? '8s' : '20s';

  const S  = 180;
  const CX = S / 2;
  const CY = S / 2;
  const R  = 70;

  return (
    <svg
      width={S} height={S}
      viewBox={`0 0 ${S} ${S}`}
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {(isLive || isActive) && (
        <circle cx={CX} cy={CY} r={R + 10} fill={glowColor} />
      )}
      <circle cx={CX} cy={CY} r={R} fill={fillOcean} stroke={stroke} strokeWidth="1.4" />
      <g>
        <ellipse cx={CX} cy={CY} rx={R} ry={R * 0.36}
          stroke={stroke} strokeWidth="1.1" fill="none" opacity="0.65" />
        <ellipse cx={CX} cy={CY} rx={R * 0.40} ry={R}
          stroke={stroke} strokeWidth="1.1" fill="none" opacity="0.50" />
        <ellipse cx={CX} cy={CY} rx={R * 0.40} ry={R}
          stroke={stroke} strokeWidth="1.1" fill="none" opacity="0.28"
          transform={`rotate(60 ${CX} ${CY})`} />
        <ellipse cx={CX} cy={CY - R * 0.44} rx={R * 0.90} ry={R * 0.19}
          stroke={stroke} strokeWidth="0.8" fill="none" opacity="0.38" />
        <ellipse cx={CX} cy={CY + R * 0.44} rx={R * 0.90} ry={R * 0.19}
          stroke={stroke} strokeWidth="0.8" fill="none" opacity="0.38" />
        {!isError && (
          <animateTransform
            attributeName="transform" type="rotate"
            from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`}
            dur={dur} repeatCount="indefinite"
          />
        )}
      </g>
      {isError && (
        <path
          d={`M ${CX - 12} ${CY - 18} L ${CX - 4} ${CY - 3} L ${CX + 5} ${CY + 4} L ${CX + 12} ${CY + 18}`}
          stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.75"
        />
      )}
      {isLive && (
        <circle cx={CX} cy={CY - R + 4} r="3" fill="#10b981">
          <animate attributeName="opacity" values="1;0.25;1" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
};

// ─── Row wrapper — text left, globe right ────────────────────────────────────

const Row = ({ phase, children }: { phase: Phase; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-6">
    <div className="flex-1 min-w-0">{children}</div>
    <div style={{ marginTop: '-40px' }}>
      <Globe phase={phase} />
    </div>
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────

const TunnelCard = ({
  tunnelStatus: status,
  installProgress,
  onInstall,
  onStart,
  onStop,
}: TunnelCardProps) => {
  const [copied, setCopied] = useState(false);
  const [busy,   setBusy]   = useState(false);

  const phase   = derivePhase(status, installProgress);
  const percent = installProgress?.percent != null && installProgress.percent >= 0
    ? installProgress.percent : null;

  const handleInstall = async () => { setBusy(true); try { await onInstall(); } finally { setBusy(false); } };
  const handleToggle  = async () => {
    if (phase === 'running' || phase === 'stopping') {
      setBusy(true); try { await onStop();  } finally { setBusy(false); }
    } else if (phase === 'stopped' || phase === 'error') {
      setBusy(true); try { await onStart(); } finally { setBusy(false); }
    }
  };
  const handleCopy = () => {
    if (!status.url) return;
    navigator.clipboard.writeText(`${status.url}/v1`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="bg-sand-100 rounded-2xl mb-6 overflow-hidden"
    >
      {/* Header */}
      <div className="px-8 pt-8 pb-0 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.10em] uppercase text-accent mb-1">
            Public
          </p>
          <h3 className="text-gray-900 text-xl font-sans font-semibold leading-tight">
            Public API Endpoint
          </h3>
          <p className="text-gray-500 text-sm mt-0.5">
            Cloudflare tunnel · trycloudflare.com
          </p>
        </div>
        <StatusLabel phase={phase} />
      </div>

      {/* Body */}
      <div className="px-8 pb-8 pt-5">
        <AnimatePresence mode="wait">

          {phase === 'not-installed' && (
            <motion.div key="not-installed" {...fadeSlide}>
              <Row phase={phase}>
                <p className="text-sm font-medium text-gray-800 mb-4">
                  Install the Cloudflare connector once to expose your local proxy publicly.
                </p>
                <ul className="mb-5 space-y-2">
                  {[
                    ['One-time download',   '~22 MB, installs inside Spike'],
                    ['No account needed',   'Works out of the box with trycloudflare.com'],
                    ['Encrypted in transit','All traffic goes through Cloudflare\'s edge'],
                  ].map(([label, detail]) => (
                    <li key={label} className="flex items-baseline gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0 mt-[6px]" />
                      <span className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">{label}</span>
                        <span className="text-gray-500"> — {detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <button onClick={handleInstall} disabled={busy}
                  className="inline-flex items-center bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-xl transition-all duration-150 hover:shadow-sm active:scale-[0.97] disabled:opacity-60"
                  style={{ padding: '10px 20px' }}
                >
                  Install Cloudflare connector
                </button>
              </Row>
            </motion.div>
          )}

          {phase === 'installing' && (
            <motion.div key="installing" {...fadeSlide}>
              <Row phase={phase}>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {percent !== null ? `Downloading… ${percent}%` : 'Preparing download…'}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Fetching cloudflared from the official Cloudflare release
                </p>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgb(210,205,195)' }}>
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    animate={{ width: percent !== null ? `${percent}%` : '35%' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </Row>
            </motion.div>
          )}

          {phase === 'install-error' && (
            <motion.div key="install-error" {...fadeSlide}>
              <Row phase={phase}>
                <p className="text-sm font-semibold text-rose-700 mb-1">Install failed</p>
                {installProgress?.error && (
                  <p className="text-xs text-rose-600 mb-4 leading-relaxed break-words">
                    {installProgress.error}
                  </p>
                )}
                <button onClick={handleInstall} disabled={busy}
                  className="text-sm font-medium text-accent hover:text-accent-hover transition-colors disabled:opacity-50"
                >
                  Try again →
                </button>
              </Row>
            </motion.div>
          )}

          {phase === 'stopped' && (
            <motion.div key="stopped" {...fadeSlide}>
              <Row phase={phase}>
                <p className="text-sm font-medium text-gray-800 mb-4">
                  Tunnel is offline. Start it to get a live public URL.
                </p>
                <ul className="mb-5 space-y-2">
                  {[
                    ['Public URL',         'A trycloudflare.com address, ready in seconds'],
                    ['Forwards to',        `localhost:${status.port} on this machine`],
                    ['Temporary',          'URL regenerates each session for privacy'],
                  ].map(([label, detail]) => (
                    <li key={label} className="flex items-baseline gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0 mt-[6px]" />
                      <span className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">{label}</span>
                        <span className="text-gray-500"> — {detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <button onClick={handleToggle} disabled={busy}
                  className="inline-flex items-center gap-2 font-medium text-sm rounded-xl transition-all duration-150 active:scale-[0.97] disabled:opacity-50"
                  style={{ background: 'rgb(210,205,195)', color: 'rgb(55,48,40)', padding: '10px 20px', border: '1px solid rgba(0,0,0,0.07)' }}
                >
                  Start tunnel
                </button>
              </Row>
            </motion.div>
          )}

          {phase === 'starting' && (
            <motion.div key="starting" {...fadeSlide}>
              <Row phase={phase}>
                <p className="text-sm font-medium text-gray-900 mb-1">Connecting…</p>
                <p className="text-xs text-gray-500">
                  Waiting for Cloudflare to assign a public URL
                </p>
              </Row>
            </motion.div>
          )}

          {phase === 'running' && (
            <motion.div key="running" {...fadeSlide}>
              <Row phase={phase}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">Live</span>
                  <span className="text-xs text-gray-400">· regenerates each session</span>
                </div>
                {status.url && (
                  <div
                    className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 mb-4"
                    style={{ background: 'rgb(236,234,225)', border: '1px solid rgba(0,0,0,0.07)' }}
                  >
                    <code className="font-mono text-sm text-gray-900 break-all leading-snug">
                      {status.url}/v1
                    </code>
                    <button onClick={handleCopy}
                      className="shrink-0 text-xs font-semibold transition-colors"
                      style={{ color: copied ? '#10b981' : '#2563EB' }}
                    >
                      {copied ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                )}
                <button onClick={handleToggle} disabled={busy}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-40"
                >
                  Stop tunnel
                </button>
              </Row>
            </motion.div>
          )}

          {phase === 'stopping' && (
            <motion.div key="stopping" {...fadeSlide}>
              <Row phase={phase}>
                <p className="text-sm font-medium text-gray-900 mb-1">Closing tunnel…</p>
                <p className="text-xs text-gray-500">Releasing the public URL</p>
              </Row>
            </motion.div>
          )}

          {phase === 'error' && (
            <motion.div key="error" {...fadeSlide}>
              <Row phase={phase}>
                <p className="text-sm font-semibold text-rose-700 mb-1">Tunnel error</p>
                {status.error && (
                  <p className="text-xs text-rose-600 mb-4 leading-relaxed">
                    {status.error}
                  </p>
                )}
                <button onClick={handleToggle} disabled={busy}
                  className="text-sm font-medium text-accent hover:text-accent-hover transition-colors disabled:opacity-50"
                >
                  Reconnect →
                </button>
              </Row>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── Small reusables ─────────────────────────────────────────────────────────

const fadeSlide = {
  initial:    { opacity: 0, y: 6 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -6 },
  transition: { duration: 0.2 },
};

export default TunnelCard;
