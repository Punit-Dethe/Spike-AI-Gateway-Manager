import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { TunnelStatus, TunnelInstallProgress } from '../electron';

type ServiceRunStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'analyzing' | 'error';

interface GatewayPanelProps {
  proxyStatus: ServiceRunStatus;
  tunnelStatus: TunnelStatus;
  installProgress: TunnelInstallProgress | null;
  onStartProxy: () => void;
  onStopProxy: () => void;
  onKillProxy: () => void;
  onTunnelStart: () => void | Promise<void>;
  onTunnelStop: () => void | Promise<void>;
  /** Sends the user to the tunnel setup card (Dashboard tab). */
  onOpenTunnelSetup?: () => void;
}

/**
 * Services tab — Gateway panel.
 *
 * Combines the two pieces of "how requests reach Spike" infrastructure:
 * the local Unified Proxy and the optional public ngrok tunnel.
 *
 * Visually distinct from the bridge cards below (which need credentials and
 * active management) — this panel is for plumbing, so it gets a darker, more
 * console-like treatment.
 */
const GatewayPanel = ({
  proxyStatus,
  tunnelStatus,
  installProgress,
  onStartProxy,
  onStopProxy,
  onKillProxy,
  onTunnelStart,
  onTunnelStop,
  onOpenTunnelSetup,
}: GatewayPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl"
    >
      {/* Layered background: deeper sand + faint blue accent glow */}
      <div className="absolute inset-0 bg-sand-200" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.10] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 12% 0%, #2563EB 0%, transparent 55%), radial-gradient(circle at 92% 100%, #2563EB 0%, transparent 55%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-sand-300/70 pointer-events-none"
      />

      <div className="relative px-6 pt-5 pb-5">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide uppercase text-accent">
              Gateway
            </span>
            <span className="text-xs text-gray-500">
              How requests reach Spike
            </span>
          </div>
          <span className="text-[11px] text-gray-500 font-mono">
            POST /v1/chat/completions
          </span>
        </div>

        {/* Two-column gateway grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ProxyTile
            status={proxyStatus}
            onStart={onStartProxy}
            onStop={onStopProxy}
            onKill={onKillProxy}
          />
          <TunnelTile
            tunnelStatus={tunnelStatus}
            installProgress={installProgress}
            onStart={onTunnelStart}
            onStop={onTunnelStop}
            onOpenSetup={onOpenTunnelSetup}
          />
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// Proxy tile — local infrastructure
// ============================================================================

interface ProxyTileProps {
  status: ServiceRunStatus;
  onStart: () => void;
  onStop: () => void;
  onKill: () => void;
}

const ProxyTile = ({ status, onStart, onStop, onKill }: ProxyTileProps) => {
  const isRunning = status === 'running';
  const isPending = status === 'starting' || status === 'stopping';
  const url = 'http://localhost:8000/v1';

  return (
    <Tile
      kind="local"
      label="Local"
      title="Unified Proxy"
      port={8000}
      status={status}
      url={url}
      urlMuted={!isRunning}
      action={
        <div className="flex items-center gap-1.5">
          <KillButton onClick={onKill} ariaLabel="Force kill proxy" />
          <PowerButton
            on={isRunning}
            disabled={isPending}
            onClick={isRunning ? onStop : onStart}
            ariaLabel={isRunning ? 'Stop proxy' : 'Start proxy'}
            size="lg"
          />
        </div>
      }
      copyTarget={url}
      footnote="Routes to the right AI backend based on model name"
    />
  );
};

// ============================================================================
// Tunnel tile — public infrastructure
// ============================================================================

interface TunnelTileProps {
  tunnelStatus: TunnelStatus;
  installProgress: TunnelInstallProgress | null;
  onStart: () => void | Promise<void>;
  onStop: () => void | Promise<void>;
  /** Sends the user to the Dashboard tab where the full setup card lives. */
  onOpenSetup?: () => void;
}

const TunnelTile = ({
  tunnelStatus,
  installProgress,
  onStart,
  onStop,
  onOpenSetup,
}: TunnelTileProps) => {
  const showProgress =
    tunnelStatus.installing ||
    (installProgress &&
      installProgress.phase !== 'complete' &&
      installProgress.phase !== 'error');

  // Not yet ready (no authtoken or no binary) — link to Dashboard for full setup
  if (!tunnelStatus.installed && !showProgress) {
    return (
      <TileShell kind="public" label="Public" title="Public Tunnel" status="stopped">
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-600 leading-relaxed">
            {tunnelStatus.authConfigured
              ? 'ngrok binary is missing — finish setup in the Dashboard.'
              : 'Connect a free ngrok account to get a stable public URL.'}
          </p>
          {onOpenSetup ? (
            <button
              onClick={onOpenSetup}
              className="self-start bg-accent hover:bg-accent-hover text-white font-medium text-sm py-2 px-4 rounded-xl transition-all duration-150 hover:shadow-sm active:scale-[0.98]"
            >
              {tunnelStatus.authConfigured ? 'Finish setup' : 'Set up tunnel'}
            </button>
          ) : (
            <span className="self-start text-xs text-gray-500">
              Open the Dashboard tab to complete setup.
            </span>
          )}
        </div>
      </TileShell>
    );
  }

  // Installing — progress bar
  if (showProgress) {
    const percent =
      installProgress?.percent && installProgress.percent >= 0
        ? installProgress.percent
        : null;
    return (
      <TileShell kind="public" label="Public" title="Public Tunnel" status="starting">
        <div>
          <div className="text-xs font-medium text-gray-900 mb-2">
            {installProgress?.phase === 'starting'
              ? 'Preparing download…'
              : percent !== null
                ? `Downloading ngrok… ${percent}%`
                : 'Downloading ngrok…'}
          </div>
          <div className="h-1.5 w-full bg-sand-300 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent"
              animate={{ width: percent !== null ? `${percent}%` : '40%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </TileShell>
    );
  }

  // Install error
  if (installProgress?.phase === 'error') {
    return (
      <TileShell kind="public" label="Public" title="Public Tunnel" status="error">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-rose-700">Setup failed</p>
          <p className="text-[11px] text-rose-600 break-words leading-relaxed">
            {installProgress.error}
          </p>
          {onOpenSetup && (
            <button
              onClick={onOpenSetup}
              className="self-start bg-accent hover:bg-accent-hover text-white font-medium text-xs py-1.5 px-3 rounded-lg transition-all duration-150 active:scale-[0.97]"
            >
              Open setup
            </button>
          )}
        </div>
      </TileShell>
    );
  }

  // Ready — show URL + power button
  const isRunning = tunnelStatus.status === 'running';
  const isPending =
    tunnelStatus.status === 'starting' || tunnelStatus.status === 'stopping';

  const displayUrl =
    isRunning && tunnelStatus.url ? `${tunnelStatus.url}/v1` : 'https://…ngrok-free.app/v1';

  let footnote = 'Stable public URL via ngrok';
  if (tunnelStatus.status === 'error') footnote = tunnelStatus.error || 'Tunnel error';
  else if (tunnelStatus.status === 'starting')
    footnote = 'Establishing the secure tunnel…';
  else if (tunnelStatus.status === 'stopping') footnote = 'Closing tunnel…';
  else if (tunnelStatus.status === 'stopped')
    footnote = 'Currently offline. Tap power to expose.';

  return (
    <Tile
      kind="public"
      label="Public"
      title="Public Tunnel"
      status={tunnelStatus.status}
      url={displayUrl}
      urlMuted={!isRunning}
      action={
        <PowerButton
          on={isRunning}
          disabled={isPending}
          onClick={() => void (isRunning ? onStop() : onStart())}
          ariaLabel={isRunning ? 'Stop tunnel' : 'Start tunnel'}
          size="lg"
        />
      }
      copyTarget={isRunning && tunnelStatus.url ? displayUrl : null}
      footnote={footnote}
    />
  );
};

// ============================================================================
// Shared tile primitives
// ============================================================================

interface TileShellProps {
  kind: 'local' | 'public';
  label: string;
  title: string;
  port?: number;
  status: ServiceRunStatus;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const TileShell = ({ kind, label, title, port, status, children, action }: TileShellProps) => {
  return (
    <div className="bg-sand-100 rounded-xl p-4 ring-1 ring-inset ring-sand-300/40">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <KindBadge kind={kind}>{label}</KindBadge>
            <StatusDot status={status} />
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{title}</h4>
            {port !== undefined && (
              <span className="text-[11px] font-mono text-gray-500">:{port}</span>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};

interface TileProps extends Omit<TileShellProps, 'children'> {
  url: string;
  urlMuted?: boolean;
  copyTarget: string | null;
  footnote: string;
}

const Tile = ({
  kind,
  label,
  title,
  port,
  status,
  url,
  urlMuted,
  action,
  copyTarget,
  footnote,
}: TileProps) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!copyTarget) return;
    navigator.clipboard.writeText(copyTarget);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <TileShell kind={kind} label={label} title={title} port={port} status={status} action={action}>
      <div className="bg-sand-50 rounded-lg px-3 py-2 mb-2 flex items-center justify-between gap-2">
        <code
          className={`font-mono text-xs break-all leading-tight ${
            urlMuted ? 'text-gray-400' : 'text-gray-900'
          }`}
        >
          {url}
        </code>
        {copyTarget && (
          <button
            onClick={handleCopy}
            className="shrink-0 text-[11px] font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
      <p className="text-[11px] text-gray-500 leading-snug">{footnote}</p>
    </TileShell>
  );
};

// ============================================================================
// Mini components
// ============================================================================

const KindBadge = ({
  kind,
  children,
}: {
  kind: 'local' | 'public';
  children: React.ReactNode;
}) => {
  const cls =
    kind === 'local'
      ? 'bg-sand-300 text-gray-900'
      : 'bg-accent/10 text-accent';
  return (
    <span
      className={`text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded ${cls}`}
    >
      {children}
    </span>
  );
};

const StatusDot = ({ status }: { status: ServiceRunStatus }) => {
  const config: Record<ServiceRunStatus, { dot: string; label: string; text: string }> = {
    running: { dot: 'bg-emerald-500', label: 'Live', text: 'text-emerald-700' },
    starting: { dot: 'bg-amber-500 animate-pulse', label: 'Starting', text: 'text-amber-700' },
    stopping: { dot: 'bg-amber-500 animate-pulse', label: 'Stopping', text: 'text-amber-700' },
    analyzing: { dot: 'bg-amber-500 animate-pulse', label: 'Analyzing', text: 'text-amber-700' },
    error: { dot: 'bg-rose-500', label: 'Error', text: 'text-rose-700' },
    stopped: { dot: 'bg-gray-400', label: 'Off', text: 'text-gray-500' },
  };
  const c = config[status];
  return (
    <div className="flex items-center gap-1">
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span className={`text-[10px] font-medium ${c.text}`}>{c.label}</span>
    </div>
  );
};

interface PowerButtonProps {
  on: boolean;
  disabled?: boolean;
  onClick: () => void;
  ariaLabel: string;
  size?: 'sm' | 'lg';
}

const PowerButton = ({ on, disabled, onClick, ariaLabel, size = 'sm' }: PowerButtonProps) => {
  const sizing =
    size === 'lg'
      ? 'text-sm py-2 px-4 min-w-[68px]'
      : 'text-xs py-1.5 px-3 min-w-[58px]';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${sizing} ${
        on
          ? 'bg-accent hover:bg-accent-hover text-white shadow-sm'
          : 'bg-sand-200 hover:bg-sand-300 text-gray-900'
      }`}
    >
      {on ? 'Stop' : 'Start'}
    </button>
  );
};

interface KillButtonProps {
  onClick: () => void;
  ariaLabel: string;
}

const KillButton = ({ onClick, ariaLabel }: KillButtonProps) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    title="Force kill process on this port"
    className="flex items-center justify-center font-medium text-sm py-2 px-4 min-w-[58px] rounded-lg bg-sand-200 hover:bg-sand-300 text-gray-900 transition-all duration-150 active:scale-[0.97]"
  >
    Kill
  </button>
);

// Suppress unused-component warnings (AnimatePresence kept for future state transitions)
void AnimatePresence;

export default GatewayPanel;
