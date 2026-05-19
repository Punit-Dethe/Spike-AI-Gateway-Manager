import { motion } from 'framer-motion';

interface StandaloneSetupCardProps {
  onOpen: () => void;
}

/**
 * Spotlight card for the standalone Gemini setup wizard.
 *
 * Visual goals:
 *  - More presence than the surrounding sand-100 cards (deeper bg, soft glow)
 *  - Tells the user *why* they'd want this in three quick beats
 *  - Compact: same approximate footprint as a normal dashboard card
 */
const StandaloneSetupCard = ({ onOpen }: StandaloneSetupCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="relative mt-6 overflow-hidden rounded-2xl"
    >
      {/* Layered backgrounds: deep sand base + radial accent glow */}
      <div className="absolute inset-0 bg-sand-300" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.18] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 88% 12%, #2563EB 0%, transparent 55%)',
        }}
      />
      {/* Subtle inner border for definition */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-sand-400/50 pointer-events-none"
      />

      {/* Content */}
      <div className="relative px-7 py-6 flex items-center gap-6">
        {/* Illustration column */}
        <div className="hidden md:block shrink-0">
          <SetupGlyph />
        </div>

        {/* Copy column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold tracking-wide uppercase text-accent">
              Build &amp; deploy
            </span>
            <span className="h-px flex-1 bg-sand-400/60" />
          </div>

          <h3 className="text-gray-900 text-xl font-serif font-semibold mb-1.5">
            Run Spike inside your own project
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-3 max-w-xl">
            Generate a self-contained Gemini API server with your tokens baked in. Drop
            it into your repo, deploy it anywhere, no Spike app required at runtime.
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1.5 mb-4">
            <Bullet>Standalone Python server</Bullet>
            <Bullet>OpenAI-compatible endpoint</Bullet>
            <Bullet>Deploy to any host</Bullet>
          </ul>

          <button
            onClick={onOpen}
            className="group inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 active:bg-gray-800 text-white font-medium text-sm py-2.5 px-5 rounded-xl transition-all duration-150 hover:shadow-md active:scale-[0.98]"
          >
            <span>Open setup wizard</span>
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path d="M3 8h10" />
              <path d="M9 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Bullet -----------------------------------------------------------------

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-center gap-2 text-xs text-gray-700">
    <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
    <span className="truncate">{children}</span>
  </li>
);

// --- Glyph: little folder + arrow + server illustration ---------------------

const SetupGlyph = () => (
  <svg
    width="92"
    height="92"
    viewBox="0 0 92 92"
    fill="none"
    aria-hidden="true"
    className="drop-shadow-sm"
  >
    {/* Soft halo behind the glyph */}
    <circle cx="46" cy="46" r="40" fill="#F1EDE1" opacity="0.6" />

    {/* Folder (your project) */}
    <g transform="translate(8, 28)">
      <path
        d="M2 4 a2 2 0 0 1 2-2 h8 l3 3 h13 a2 2 0 0 1 2 2 v17 a2 2 0 0 1 -2 2 H4 a2 2 0 0 1 -2 -2 Z"
        fill="#ECEAE1"
        stroke="#9b9384"
        strokeWidth="1.2"
      />
      <line x1="6" y1="14" x2="26" y2="14" stroke="#9b9384" strokeWidth="1" strokeLinecap="round" />
      <line x1="6" y1="18" x2="22" y2="18" stroke="#9b9384" strokeWidth="1" strokeLinecap="round" />
    </g>

    {/* Arrow */}
    <g stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M40 46 L52 46" />
      <path d="M48 42 L52 46 L48 50" />
    </g>

    {/* Server (deployable) */}
    <g transform="translate(56, 28)">
      <rect x="0" y="0" width="30" height="11" rx="2" fill="#ECEAE1" stroke="#9b9384" strokeWidth="1.2" />
      <rect x="0" y="14" width="30" height="11" rx="2" fill="#ECEAE1" stroke="#9b9384" strokeWidth="1.2" />
      {/* Status dots — both green to imply "running anywhere" */}
      <circle cx="5" cy="5.5" r="1.5" fill="#10b981" />
      <circle cx="5" cy="19.5" r="1.5" fill="#10b981" />
      {/* Detail lines */}
      <line x1="11" y1="5.5" x2="25" y2="5.5" stroke="#9b9384" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="11" y1="19.5" x2="25" y2="19.5" stroke="#9b9384" strokeWidth="0.9" strokeLinecap="round" />
    </g>
  </svg>
);

export default StandaloneSetupCard;
