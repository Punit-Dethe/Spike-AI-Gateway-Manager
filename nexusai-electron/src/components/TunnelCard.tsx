import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { TunnelStatus, TunnelInstallProgress } from '../electron';

interface TunnelCardProps {
  tunnelStatus: TunnelStatus;
  installProgress: TunnelInstallProgress | null;
  proxyRunning?: boolean;
  /** Pass an authtoken string to configure ngrok for the first time, or no
   *  argument to retry/refresh setup with the previously stored token. */
  onInstall: (authtoken?: string) => Promise<{ success: boolean; message?: string } | void>;
  onStart: () => void | Promise<void>;
  onStop: () => void | Promise<void>;
}

// ─── Phase derivation ───────────────────────────────────────────────────────

type Phase =
  | 'needs-auth'      // no authtoken stored yet — show signup + paste form
  | 'installing'      // downloading ngrok binary
  | 'install-error'
  | 'stopped'         // ready to use, currently offline
  | 'starting'
  | 'running'
  | 'stopping'
  | 'error';

function derivePhase(
  status: TunnelStatus,
  progress: TunnelInstallProgress | null,
): Phase {
  if (!status.installed) {
    if (status.installing) return 'installing';
    if (progress && progress.phase !== 'complete' && progress.phase !== 'error')
      return 'installing';
    if (progress?.phase === 'error') return 'install-error';
    return 'needs-auth';
  }
  if (status.status === 'starting') return 'starting';
  if (status.status === 'stopping') return 'stopping';
  if (status.status === 'running') return 'running';
  if (status.status === 'error') return 'error';
  return 'stopped';
}

// ─── Globe ───────────────────────────────────────────────────────────────────

type GlobeState = 'idle' | 'installing' | 'connecting' | 'live' | 'error';

const Globe = ({ phase }: { phase: Phase }) => {
  const state: GlobeState =
    phase === 'running'                                ? 'live'
    : phase === 'installing'                           ? 'installing'
    : phase === 'starting' || phase === 'stopping'     ? 'connecting'
    : phase === 'error'    || phase === 'install-error' ? 'error'
    : 'idle';

  const isLive   = state === 'live';
  const isActive = state === 'installing' || state === 'connecting';
  const isError  = state === 'error';

  const stroke    = isLive ? '#10b981' : isActive ? '#2563EB' : isError ? '#f43f5e' : 'rgba(0,0,0,0.18)';
  const fillOcean = isLive ? 'rgba(16,185,129,0.06)' : isActive ? 'rgba(37,99,235,0.05)' : 'rgba(0,0,0,0.03)';
  const glowColor = isLive ? 'rgba(16,185,129,0.10)' : isActive ? 'rgba(37,99,235,0.08)' : 'transparent';
  const dur       = isLive ? '6s' : isActive ? '8s' : '20s';

  const S = 210, CX = S / 2, CY = S / 2, R = 82;

  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      {(isLive || isActive) && <circle cx={CX} cy={CY} r={R + 10} fill={glowColor} />}
      <circle cx={CX} cy={CY} r={R} fill={fillOcean} stroke={stroke} strokeWidth="1.4" />
      <g>
        <ellipse cx={CX} cy={CY} rx={R} ry={R * 0.36} stroke={stroke} strokeWidth="1.1" fill="none" opacity="0.65" />
        <ellipse cx={CX} cy={CY} rx={R * 0.40} ry={R} stroke={stroke} strokeWidth="1.1" fill="none" opacity="0.50" />
        <ellipse cx={CX} cy={CY} rx={R * 0.40} ry={R} stroke={stroke} strokeWidth="1.1" fill="none" opacity="0.28" transform={`rotate(60 ${CX} ${CY})`} />
        <ellipse cx={CX} cy={CY - R * 0.44} rx={R * 0.90} ry={R * 0.19} stroke={stroke} strokeWidth="0.8" fill="none" opacity="0.38" />
        <ellipse cx={CX} cy={CY + R * 0.44} rx={R * 0.90} ry={R * 0.19} stroke={stroke} strokeWidth="0.8" fill="none" opacity="0.38" />
        {!isError && (
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`}
            dur={dur} repeatCount="indefinite" />
        )}
      </g>
      {isError && (
        <path d={`M ${CX - 12} ${CY - 18} L ${CX - 4} ${CY - 3} L ${CX + 5} ${CY + 4} L ${CX + 12} ${CY + 18}`}
          stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
      )}
    </svg>
  );
};

// ─── Layout ─────────────────────────────────────────────────────────────────

const Row = ({ phase, children }: { phase: Phase; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-6">
    <div className="flex-1 min-w-0">{children}</div>
    <div style={{ marginTop: '-70px' }}>
      <Globe phase={phase} />
    </div>
  </div>
);

const NGROK_SIGNUP_URL = 'https://dashboard.ngrok.com/signup';
const NGROK_AUTHTOKEN_URL = 'https://dashboard.ngrok.com/get-started/your-authtoken';

// ─── Auth form ──────────────────────────────────────────────────────────────

const AuthForm = ({
  onSubmit,
  busy,
}: {
  onSubmit: (token: string) => Promise<void>;
  busy: boolean;
}) => {
  const [token, setToken] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = token.trim();
    if (trimmed.length < 20) {
      setLocalError('That doesn\'t look like a valid authtoken. Copy it from your ngrok dashboard.');
      return;
    }
    setLocalError(null);
    await onSubmit(trimmed);
  };

  return (
    <>
      <div className="flex gap-2 mb-2">
        <input
          type="password"
          value={token}
          onChange={(e) => { setToken(e.target.value); if (localError) setLocalError(null); }}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          placeholder="Paste your ngrok authtoken here"
          autoComplete="off"
          spellCheck={false}
          disabled={busy}
          className="flex-1 min-w-0 text-sm font-mono px-3 py-2.5 rounded-xl border-2 border-transparent focus:outline-none focus:border-accent transition-colors disabled:opacity-60"
          style={{ background: 'rgb(236,234,225)' }}
        />
        <button
          onClick={submit}
          disabled={busy || !token.trim()}
          className="inline-flex items-center bg-accent hover:bg-accent-hover text-white font-semibold text-sm rounded-xl transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          style={{ padding: '10px 20px' }}
        >
          {busy ? 'Connecting…' : 'Connect'}
        </button>
      </div>
      {localError && (
        <p className="text-xs text-rose-600 leading-relaxed mt-1">{localError}</p>
      )}
    </>
  );
};

// ─── Main ───────────────────────────────────────────────────────────────────

const TunnelCard = ({
  tunnelStatus: status,
  installProgress,
  proxyRunning = false,
  onInstall,
  onStart,
  onStop,
}: TunnelCardProps) => {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  // Allows the user to return to the setup screen from the stopped state.
  const [showSetup, setShowSetup] = useState(false);

  const derivedPhase = derivePhase(status, installProgress);
  // Override to setup screen when user explicitly requests it, but only when
  // the tunnel isn't actively running or transitioning.
  const phase: Phase =
    showSetup && derivedPhase === 'stopped' ? 'needs-auth' : derivedPhase;

  const percent = installProgress?.percent != null && installProgress.percent >= 0
    ? installProgress.percent : null;

  const handleAuthSubmit = async (token: string) => {
    setBusy(true);
    try {
      const result = await onInstall(token);
      // On success, leave the setup screen
      if (result && result.success) setShowSetup(false);
    } finally {
      setBusy(false);
    }
  };

  const handleRetry = async () => {
    setBusy(true);
    try { await onInstall(); } finally { setBusy(false); }
  };

  const handleToggle = async () => {
    if (phase === 'running' || phase === 'stopping') {
      setBusy(true); try { await onStop(); } finally { setBusy(false); }
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
            ngrok
          </p>
          <h3 className="text-gray-900 text-xl font-sans font-semibold leading-tight">
            Public API Endpoint
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 pb-8 pt-5">
        <AnimatePresence mode="wait">

          {phase === 'needs-auth' && (
            <motion.div key="needs-auth" {...fadeSlide}>
              {/* No Row/Globe wrapper — the setup screen is full-width, no globe needed */}
              <div>
                {/* Back link — only shown when user navigated here from stopped state */}
                {showSetup && (
                  <button
                    onClick={() => setShowSetup(false)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors mb-5"
                  >
                    ← Back
                  </button>
                )}

                {/* ngrok wordmark */}
                <div className="flex items-center gap-2 mb-5">
                  <svg width="72" height="20" viewBox="0 0 72 20" fill="none" aria-label="ngrok" role="img">
                    <text x="0" y="16" fontFamily="Inter, system-ui, sans-serif" fontSize="17" fontWeight="700" fill="#1F1F1F" letterSpacing="-0.5">ngrok</text>
                  </svg>
                  <span className="text-xs text-gray-400 font-medium">free tier</span>
                </div>

                <p className="text-sm text-gray-700 mb-5 leading-relaxed">
                  Connect a free ngrok account to get a <span className="font-semibold text-gray-900">stable public URL</span> — same address every session, works from anywhere, no cold starts.
                </p>

                <div className="rounded-xl mb-5 overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.07)' }}>
                  {[
                    {
                      n: '1',
                      label: 'Create a free account',
                      detail: 'No credit card. Takes 30 seconds.',
                      href: NGROK_SIGNUP_URL,
                      linkText: 'ngrok.com/signup ↗',
                    },
                    {
                      n: '2',
                      label: 'Copy your authtoken',
                      detail: 'From the "Your Authtoken" page in the dashboard.',
                      href: NGROK_AUTHTOKEN_URL,
                      linkText: 'dashboard.ngrok.com ↗',
                    },
                    {
                      n: '3',
                      label: 'Paste it below',
                      detail: 'Stored locally on your machine. Never sent anywhere else.',
                      href: null,
                      linkText: null,
                    },
                  ].map(({ n, label, detail, href, linkText }, i, arr) => (
                    <div
                      key={n}
                      className="flex items-start gap-4 px-4 py-3"
                      style={{
                        background: i % 2 === 0 ? 'rgb(236,234,225)' : 'rgb(228,226,217)',
                        borderBottom: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.05)' : undefined,
                      }}
                    >
                      <span
                        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                        style={{ background: '#2563EB' }}
                      >
                        {n}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
                        {href && linkText && (
                          <button
                            onClick={() => window.electron.openExternal(href)}
                            className="text-xs font-medium text-accent hover:underline mt-1 inline-block text-left"
                          >
                            {linkText}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <AuthForm onSubmit={handleAuthSubmit} busy={busy} />
              </div>
            </motion.div>
          )}

          {phase === 'installing' && (
            <motion.div key="installing" {...fadeSlide}>
              <Row phase={phase}>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {percent !== null ? `Downloading ngrok… ${percent}%` : 'Preparing download…'}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Fetching the official ngrok release (~10 MB)
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
                <p className="text-sm font-semibold text-rose-700 mb-1">Setup failed</p>
                {installProgress?.error && (
                  <p className="text-xs text-rose-600 mb-4 leading-relaxed break-words">
                    {installProgress.error}
                  </p>
                )}
                <button onClick={handleRetry} disabled={busy}
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
                <ul className="mb-5 space-y-2">
                  {[
                    ['Stable URL', 'Same address every session — safe to hardcode'],
                    ['Forwards to', `localhost:${status.port} on this machine`],
                    ['Encrypted', 'TLS end-to-end through ngrok\'s edge'],
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
                <div className="flex items-center gap-4">
                  <button onClick={handleToggle} disabled={busy}
                    className="inline-flex items-center gap-2 font-medium text-sm rounded-xl transition-all duration-150 active:scale-[0.97] disabled:opacity-50"
                    style={{ background: 'rgb(210,205,195)', color: 'rgb(55,48,40)', padding: '10px 20px', border: '1px solid rgba(0,0,0,0.07)' }}
                  >
                    Start tunnel
                  </button>
                  <button
                    onClick={() => setShowSetup(true)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Change account
                  </button>
                </div>
              </Row>
            </motion.div>
          )}

          {phase === 'starting' && (
            <motion.div key="starting" {...fadeSlide}>
              <Row phase={phase}>
                <p className="text-sm font-medium text-gray-900 mb-1">Connecting…</p>
                <p className="text-xs text-gray-500">
                  Establishing the secure tunnel through ngrok
                </p>
              </Row>
            </motion.div>
          )}

          {phase === 'running' && (
            <motion.div key="running" {...fadeSlide}>
              <Row phase={phase}>
                {!proxyRunning && (
                  <div
                    className="flex items-center gap-2 rounded-xl px-3 py-2 mb-4 text-xs font-medium"
                    style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', color: '#92400e' }}
                  >
                    <span>⚠</span>
                    <span>Unified Proxy is not running — requests will fail. Start it in the Services tab.</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">Live</span>
                  <span className="text-xs text-gray-400">· stable URL</span>
                </div>
                {status.url && (
                  <div
                    className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 mb-4"
                    style={{ background: 'rgb(236,234,225)', border: '1px solid rgba(0,0,0,0.07)', maxWidth: '420px' }}
                  >
                    <code className="font-mono text-sm text-gray-900 leading-snug min-w-0 overflow-hidden whitespace-nowrap text-ellipsis">
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
                <span
                  onClick={handleToggle}
                  className="text-xs font-medium text-gray-500 cursor-pointer select-none"
                >
                  Stop tunnel
                </span>
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

const fadeSlide = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
  transition: { duration: 0.2 },
};

export default TunnelCard;
