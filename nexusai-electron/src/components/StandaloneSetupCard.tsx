import { motion } from 'framer-motion';

interface StandaloneSetupCardProps {
  onOpen: () => void;
}

const StandaloneSetupCard = ({ onOpen }: StandaloneSetupCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative mt-6 overflow-hidden rounded-2xl"
      style={{ background: 'rgb(228, 224, 213)' }}
    >
      {/* Soft blue glow — top right */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top: '-80px',
          right: '-80px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 65%)',
        }}
      />
      {/* Hairline border */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)' }}
      />

      <div className="relative px-10 py-10">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-7">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-accent">
            Deploy
          </span>
          <span className="flex-1 h-px bg-sand-300/70" />
        </div>

        {/* Main layout */}
        <div className="flex items-center justify-between gap-10">

          {/* Left: copy + CTA */}
          <div className="flex-1 min-w-0">
            <h3
              className="font-serif font-semibold text-gray-900 leading-tight mb-4"
              style={{ fontSize: '1.75rem', letterSpacing: '-0.01em' }}
            >
              Run Spike inside<br />your own project
            </h3>

            <p className="text-sm leading-relaxed text-gray-600 mb-8" style={{ maxWidth: '360px' }}>
              Generate a self-contained Gemini API server and drop it straight
              into your repo. It lives alongside your code — no Spike app
              required at runtime.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['Standalone Python server', 'OpenAI-compatible', 'Deploy anywhere'].map((label) => (
                <span
                  key={label}
                  className="text-xs font-medium px-3 py-1.5 rounded-full text-gray-700"
                  style={{
                    background: 'rgb(210, 205, 195)',
                    border: '1px solid rgba(0,0,0,0.07)',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={onOpen}
              className="group inline-flex items-center gap-2.5 bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-xl transition-all duration-200 active:scale-[0.97] hover:shadow-sm"
              style={{ padding: '11px 22px' }}
            >
              Open setup wizard
              <svg
                viewBox="0 0 16 16"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                <path d="M3 8h10" />
                <path d="M9 4l4 4-4 4" />
              </svg>
            </button>
          </div>

          {/* Right: file tree illustration */}
          <div className="hidden lg:block shrink-0">
            <FileTreeIllustration />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── File tree illustration ───────────────────────────────────────────────────
// Shows a project folder with Spike's server file living inside it.

const FILE_BG       = 'rgb(236,234,225)';
const FILE_BORDER   = 'rgba(0,0,0,0.08)';
const TEXT_DIM      = 'rgb(140,130,118)';
const TEXT_NORMAL   = 'rgb(55,48,40)';
const INDENT        = 20;
const ROW_H         = 28;
const FONT          = "Inter, system-ui, sans-serif";

interface FileRowProps {
  y: number;
  indent: number;
  icon: 'folder' | 'py' | 'txt' | 'json' | 'spike';
  name: string;
  dim?: boolean;
  highlight?: boolean;
}

// Renders a single row of the file tree as SVG elements
const FileRow = ({ y, indent, icon, name, dim, highlight }: FileRowProps) => {
  const x = 16 + indent;
  const cy = y + ROW_H / 2;
  const textColor = dim ? TEXT_DIM : highlight ? 'rgb(37,99,235)' : TEXT_NORMAL;
  const fontWeight = highlight ? '600' : '400';

  // Highlight pill behind the spike row
  const pillEl = highlight ? (
    <rect
      x={8} y={y + 3}
      width={220} height={ROW_H - 6}
      rx={6}
      fill="rgba(37,99,235,0.08)"
      stroke="rgba(37,99,235,0.18)"
      strokeWidth="1"
    />
  ) : null;

  // Icon
  let iconEl: React.ReactNode = null;
  if (icon === 'folder') {
    iconEl = (
      <path
        d={`M${x} ${cy - 5} a2 2 0 0 1 2-2 h4 l2 2 h7 a2 2 0 0 1 2 2 v6 a2 2 0 0 1 -2 2 H${x + 2} a2 2 0 0 1 -2 -2z`}
        fill="rgba(0,0,0,0.18)"
      />
    );
  } else if (icon === 'spike') {
    // Small "S" badge
    iconEl = (
      <>
        <rect x={x} y={cy - 6} width={14} height={12} rx={3}
          fill="rgba(37,99,235,0.18)" stroke="rgba(37,99,235,0.35)" strokeWidth="0.8"
        />
        <text x={x + 7} y={cy + 4} textAnchor="middle"
          fontSize="7.5" fill="rgb(37,99,235)"
          fontFamily={FONT} fontWeight="700"
        >S</text>
      </>
    );
  } else {
    // Generic file — small rectangle with a folded corner
    const fw = 12; const fh = 14;
    const fold = 4;
    iconEl = (
      <path
        d={`M${x} ${cy - fh / 2} h${fw - fold} l${fold} ${fold} v${fh - fold} H${x}z`}
        fill={dim ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.13)'}
      />
    );
  }

  // Extension badge color
  let extColor = TEXT_DIM;
  if (icon === 'py')   extColor = 'rgb(59,130,246)';
  if (icon === 'json') extColor = 'rgb(180,130,60)';
  if (icon === 'spike') extColor = 'rgb(37,99,235)';

  // Split name into base + extension for coloring
  const dotIdx = name.lastIndexOf('.');
  const base = dotIdx > -1 ? name.slice(0, dotIdx) : name;
  const ext  = dotIdx > -1 ? name.slice(dotIdx) : '';

  return (
    <g>
      {pillEl}
      {iconEl}
      {/* base name */}
      <text
        x={x + 20} y={cy + 4.5}
        fontSize="11.5"
        fill={textColor}
        fontFamily={FONT}
        fontWeight={fontWeight}
      >
        {base}
      </text>
      {/* extension — slightly different color */}
      {ext && (
        <text
          x={x + 20 + base.length * 6.7}
          y={cy + 4.5}
          fontSize="11.5"
          fill={highlight ? extColor : dim ? TEXT_DIM : TEXT_DIM}
          fontFamily={FONT}
          fontWeight={fontWeight}
        >
          {ext}
        </text>
      )}
    </g>
  );
};

const FileTreeIllustration = () => {
  // Row definitions — y positions are computed from index
  const rows: Omit<FileRowProps, 'y'>[] = [
    { indent: 0,          icon: 'folder', name: 'my-project',       dim: false },
    { indent: INDENT,     icon: 'folder', name: 'src',               dim: true  },
    { indent: INDENT * 2, icon: 'py',     name: 'main.py',           dim: true  },
    { indent: INDENT * 2, icon: 'py',     name: 'routes.py',         dim: true  },
    { indent: INDENT,     icon: 'folder', name: 'spike',             dim: false, highlight: false },
    { indent: INDENT * 2, icon: 'spike',  name: 'gemini_server.py',  dim: false, highlight: true  },
    { indent: INDENT * 2, icon: 'txt',    name: 'requirements.txt',  dim: false, highlight: false },
    { indent: INDENT,     icon: 'json',   name: 'package.json',      dim: true  },
  ];

  const PAD_TOP = 16;
  const totalH = PAD_TOP + rows.length * ROW_H + PAD_TOP;

  return (
    <svg
      width="240"
      height={totalH}
      viewBox={`0 0 240 ${totalH}`}
      fill="none"
      aria-hidden="true"
    >
      {/* Card background */}
      <rect x="0" y="0" width="240" height={totalH} rx="12"
        fill={FILE_BG} stroke={FILE_BORDER} strokeWidth="1"
      />

      {/* Window chrome dots */}
      <circle cx="16" cy="12" r="3.5" fill="rgba(0,0,0,0.12)" />
      <circle cx="28" cy="12" r="3.5" fill="rgba(0,0,0,0.12)" />
      <circle cx="40" cy="12" r="3.5" fill="rgba(0,0,0,0.12)" />

      {/* Separator under chrome */}
      <line x1="0" y1="22" x2="240" y2="22"
        stroke="rgba(0,0,0,0.06)" strokeWidth="1"
      />

      {/* Tree connector lines */}
      {rows.map((row, i) => {
        if (row.indent === 0) return null;
        const y = PAD_TOP + i * ROW_H;
        const cy = y + ROW_H / 2;
        const parentX = 16 + row.indent - INDENT + 7;
        return (
          <g key={i}>
            {/* vertical stem */}
            <line
              x1={parentX} y1={y}
              x2={parentX} y2={cy}
              stroke="rgba(0,0,0,0.10)" strokeWidth="1"
            />
            {/* horizontal branch */}
            <line
              x1={parentX} y1={cy}
              x2={16 + row.indent} y2={cy}
              stroke="rgba(0,0,0,0.10)" strokeWidth="1"
            />
          </g>
        );
      })}

      {/* File rows */}
      {rows.map((row, i) => (
        <FileRow
          key={i}
          y={PAD_TOP + i * ROW_H}
          {...row}
        />
      ))}
    </svg>
  );
};

export default StandaloneSetupCard;
