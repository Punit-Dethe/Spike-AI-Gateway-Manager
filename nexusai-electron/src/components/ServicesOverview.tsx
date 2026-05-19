import type { TunnelStatus } from '../electron';

type ServiceRunStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';

interface ServiceStatusMap {
  [key: string]: ServiceRunStatus;
}

interface ServicesOverviewProps {
  serviceStatus: ServiceStatusMap;
  tunnelStatus: TunnelStatus;
  onStartService: (serviceName: string) => void;
  onStopService: (serviceName: string) => void;
  onTunnelInstall: () => void | Promise<void>;
  onTunnelStart: () => void | Promise<void>;
  onTunnelStop: () => void | Promise<void>;
}

// Color tokens kept inline so SVG fill values stay literal (avoids CSS-var/Tailwind quirks inside SVG).
const STATUS_FILL: Record<ServiceRunStatus, string> = {
  running: '#10b981',  // emerald-500
  starting: '#f59e0b', // amber-500
  stopping: '#f59e0b', // amber-500
  error: '#f43f5e',    // rose-500
  stopped: '#9ca3af',  // gray-400
};

const STATUS_LABEL: Record<ServiceRunStatus, string> = {
  running: 'on',
  starting: 'starting',
  stopping: 'stopping',
  error: 'error',
  stopped: 'off',
};

// --- SVG helpers ------------------------------------------------------------

interface NodeProps {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  meta: string;
  status: ServiceRunStatus;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  dashed?: boolean;
  ariaLabel: string;
}

const Node = ({
  x, y, w, h, label, meta, status, onClick, disabled, primary, dashed, ariaLabel,
}: NodeProps) => {
  const cx = x + w - 14;
  const cy = y + h / 2;
  const dot = STATUS_FILL[status];
  const pulsing = status === 'starting' || status === 'stopping';

  return (
    <g
      role="button"
      aria-label={ariaLabel}
      tabIndex={0}
      onClick={() => { if (!disabled) onClick(); }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`node-group ${disabled ? '' : 'node-clickable'}`}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        fill={primary ? '#ECEAE1' : '#E4E0D5'}
        stroke={dashed ? '#9ca3af' : (primary ? '#D2CDC3' : 'transparent')}
        strokeWidth={1.5}
        strokeDasharray={dashed ? '5 4' : undefined}
        className="node-rect"
      />
      <text
        x={x + 16}
        y={cy - 4}
        fontSize={13}
        fontWeight={600}
        fill="#111827"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {label}
      </text>
      <text
        x={x + 16}
        y={cy + 12}
        fontSize={10.5}
        fill="#6b7280"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {meta}
      </text>
      <circle cx={cx} cy={cy} r={4.5} fill={dot}>
        {pulsing && (
          <animate
            attributeName="opacity"
            values="0.35;1;0.35"
            dur="1s"
            repeatCount="indefinite"
          />
        )}
      </circle>
    </g>
  );
};

interface LineProps {
  d: string;
  live: boolean;
}

const Line = ({ d, live }: LineProps) => (
  <path
    d={d}
    fill="none"
    stroke={live ? '#2563eb' : '#cdc6b9'}
    strokeWidth={live ? 2 : 1.4}
    strokeLinecap="round"
    strokeDasharray={live ? '5 6' : undefined}
    className={live ? 'flow-line' : undefined}
  />
);

// --- Component --------------------------------------------------------------

const ServicesOverview = ({
  serviceStatus,
  tunnelStatus,
  onStartService,
  onStopService,
  onTunnelInstall,
  onTunnelStart,
  onTunnelStop,
}: ServicesOverviewProps) => {
  const proxy = serviceStatus.proxy || 'stopped';
  const gemini = serviceStatus.gemini || 'stopped';
  const chat = serviceStatus.chat2api || 'stopped';

  // Translate tunnel meta-state into a single ServiceRunStatus for the dot
  const tunnelDotState: ServiceRunStatus = tunnelStatus.installing
    ? 'starting'
    : tunnelStatus.status;
  const tunnelInstalled = tunnelStatus.installed;
  const tunnelTransitioning =
    tunnelStatus.installing ||
    tunnelStatus.status === 'starting' ||
    tunnelStatus.status === 'stopping';

  const toggleLocal = (name: string, s: ServiceRunStatus) => {
    if (s === 'starting' || s === 'stopping') return;
    if (s === 'running') onStopService(name);
    else onStartService(name);
  };

  const toggleTunnel = () => {
    if (tunnelTransitioning) return;
    if (!tunnelInstalled) return void onTunnelInstall();
    if (tunnelStatus.status === 'running') return void onTunnelStop();
    return void onTunnelStart();
  };

  // Lines glow only when both endpoints could carry traffic
  const lineGeminiLive = gemini === 'running' && proxy === 'running';
  const lineChatLive = chat === 'running' && proxy === 'running';
  const lineTunnelLive = proxy === 'running' && tunnelStatus.status === 'running';

  // Tunnel meta line under the node
  let tunnelMeta = 'public';
  if (!tunnelInstalled) tunnelMeta = 'tap to install';
  else if (tunnelStatus.installing) tunnelMeta = 'installing…';
  else if (tunnelStatus.status === 'starting') tunnelMeta = 'starting…';
  else if (tunnelStatus.status === 'error') tunnelMeta = 'error';

  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between mb-2 px-1">
        <h3 className="text-sm font-semibold text-gray-900">System</h3>
        <span className="text-xs text-gray-500">Tap any node to toggle</span>
      </div>

      <div className="bg-sand-100 rounded-2xl p-3">
        <svg
          viewBox="0 0 800 200"
          className="w-full h-[150px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Connecting lines (drawn first so nodes overlap them cleanly) */}
          <Line d="M 165 50 C 250 50, 270 100, 335 100" live={lineGeminiLive} />
          <Line d="M 165 150 C 250 150, 270 100, 335 100" live={lineChatLive} />
          <Line d="M 495 100 L 595 100" live={lineTunnelLive} />

          {/* Backends, left column */}
          <Node
            x={20} y={25} w={145} h={50}
            label="Gemini"
            meta={`:6969 · ${STATUS_LABEL[gemini]}`}
            status={gemini}
            onClick={() => toggleLocal('gemini', gemini)}
            ariaLabel={`Gemini, ${STATUS_LABEL[gemini]}`}
          />
          <Node
            x={20} y={125} w={145} h={50}
            label="ChatGPT"
            meta={`:5005 · ${STATUS_LABEL[chat]}`}
            status={chat}
            onClick={() => toggleLocal('chat2api', chat)}
            ariaLabel={`ChatGPT, ${STATUS_LABEL[chat]}`}
          />

          {/* Proxy, center */}
          <Node
            x={335} y={75} w={160} h={50}
            label="Unified Proxy"
            meta={`:8000 · ${STATUS_LABEL[proxy]}`}
            status={proxy}
            onClick={() => toggleLocal('proxy', proxy)}
            primary
            ariaLabel={`Unified Proxy, ${STATUS_LABEL[proxy]}`}
          />

          {/* Tunnel, right */}
          <Node
            x={595} y={75} w={185} h={50}
            label="Public Tunnel"
            meta={tunnelMeta}
            status={tunnelDotState}
            onClick={toggleTunnel}
            dashed={!tunnelInstalled}
            ariaLabel={`Public Tunnel, ${tunnelMeta}`}
          />
        </svg>
      </div>
    </div>
  );
};

export default ServicesOverview;
