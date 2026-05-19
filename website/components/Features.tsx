'use client';

import { motion } from 'framer-motion';

interface Feature {
  eyebrow: string;
  title: string;
  desc: string;
  illustration: React.ReactNode;
  span?: 'wide' | 'normal';
}

const FEATURES: Feature[] = [
  {
    eyebrow: 'Unified Proxy',
    title: 'One endpoint for every model',
    desc: 'Route ChatGPT and Gemini through a single OpenAI-compatible URL. The proxy picks the right backend based on the model name in your request.',
    illustration: <UnifiedProxyArt />,
    span: 'wide',
  },
  {
    eyebrow: 'Cloudflare Tunnel',
    title: 'Public URL in one click',
    desc: 'Install the connector inside Spike. Toggle the switch. Get a public HTTPS URL that forwards to your local API.',
    illustration: <TunnelArt />,
  },
  {
    eyebrow: 'Standalone Setup',
    title: 'Deploy your own server',
    desc: 'Generate a self-contained Gemini server with your tokens baked in. Drop it in your repo, deploy anywhere with Python.',
    illustration: <SetupArt />,
  },
  {
    eyebrow: 'Built-in Chat',
    title: 'Test before you write code',
    desc: 'Pick a model, pick an endpoint, send a message. Verify the whole pipeline works end-to-end without leaving the app.',
    illustration: <ChatArt />,
  },
  {
    eyebrow: 'Privacy first',
    title: 'Everything runs locally',
    desc: 'Your tokens, your traffic, your machine. Nothing reaches the internet unless you turn the public tunnel on yourself.',
    illustration: <PrivacyArt />,
  },
  {
    eyebrow: 'OpenAI-compatible',
    title: 'Drop-in for any client',
    desc: 'Works with the OpenAI SDK, LangChain, LlamaIndex, and anything that speaks the chat-completions format. No code changes.',
    illustration: <CompatibleArt />,
  },
];

export default function Features() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
      <div className="mb-12 max-w-2xl">
        <span className="text-xs font-semibold tracking-wide uppercase text-accent">
          What you get
        </span>
        <h2 className="mt-2 font-serif text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
          A complete gateway, ready to ship.
        </h2>
        <p className="mt-3 text-gray-700 text-lg">
          Five things Spike does so you don't have to wire them yourself.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className={`bg-sand-100 rounded-2xl p-6 ring-1 ring-inset ring-sand-300/40 hover:ring-sand-400/60 transition-all ${
              f.span === 'wide' ? 'md:col-span-2 md:row-span-2' : ''
            }`}
          >
            <div
              className={`mb-4 ${
                f.span === 'wide' ? 'h-48 md:h-64' : 'h-28'
              } overflow-hidden rounded-xl bg-sand-50 ring-1 ring-inset ring-sand-300/40 flex items-center justify-center`}
            >
              {f.illustration}
            </div>
            <span className="text-[11px] font-semibold tracking-wide uppercase text-accent">
              {f.eyebrow}
            </span>
            <h3
              className={`mt-1 font-serif font-semibold text-gray-900 ${
                f.span === 'wide' ? 'text-2xl md:text-3xl' : 'text-xl'
              }`}
            >
              {f.title}
            </h3>
            <p
              className={`mt-2 text-gray-700 leading-relaxed ${
                f.span === 'wide' ? 'text-base' : 'text-sm'
              }`}
            >
              {f.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ----- Illustrations (custom SVG, all on-brand) -----

function UnifiedProxyArt() {
  return (
    <svg viewBox="0 0 400 220" className="w-full h-full">
      {/* Soft accent halo */}
      <defs>
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="110" rx="170" ry="80" fill="url(#halo)" />

      {/* Three input streams */}
      {[60, 110, 160].map((y, i) => (
        <g key={i}>
          <rect
            x={30}
            y={y - 14}
            width={70}
            height={28}
            rx={8}
            fill="#ECEAE1"
            stroke="#9b9384"
            strokeWidth={1}
          />
          <text
            x={65}
            y={y + 4}
            fontSize={10}
            fontWeight={600}
            fill="#374151"
            textAnchor="middle"
            fontFamily="ui-monospace, monospace"
          >
            {['gpt-4o', 'gemini', 'o1-mini'][i]}
          </text>
          <path
            d={`M 100 ${y} C 140 ${y}, 160 110, 200 110`}
            fill="none"
            stroke="#2563eb"
            strokeWidth="1.6"
            strokeDasharray="4 5"
            className="flow-line"
            opacity="0.7"
          />
        </g>
      ))}

      {/* Proxy hub */}
      <circle cx="200" cy="110" r="36" fill="#ECEAE1" stroke="#2563EB" strokeWidth="1.8" />
      <text x="200" y="106" fontSize="11" fontWeight="700" fill="#111827" textAnchor="middle">
        Spike
      </text>
      <text x="200" y="119" fontSize="9" fill="#6b7280" textAnchor="middle">
        :8000
      </text>

      {/* Two output streams */}
      <path d="M 236 110 C 280 110, 290 70, 340 70" fill="none" stroke="#10b981" strokeWidth="1.6" strokeDasharray="4 5" className="flow-line" />
      <path d="M 236 110 C 280 110, 290 150, 340 150" fill="none" stroke="#10b981" strokeWidth="1.6" strokeDasharray="4 5" className="flow-line" />

      {/* Backend cards */}
      <g>
        <rect x={335} y={50} width={45} height={40} rx={6} fill="#ECEAE1" stroke="#9b9384" strokeWidth={1} />
        <text x={357} y={68} fontSize={9} fontWeight={600} fill="#111827" textAnchor="middle">ChatGPT</text>
        <circle cx={357} cy={80} r={2.5} fill="#10b981" />
      </g>
      <g>
        <rect x={335} y={130} width={45} height={40} rx={6} fill="#ECEAE1" stroke="#9b9384" strokeWidth={1} />
        <text x={357} y={148} fontSize={9} fontWeight={600} fill="#111827" textAnchor="middle">Gemini</text>
        <circle cx={357} cy={160} r={2.5} fill="#10b981" />
      </g>
    </svg>
  );
}

function TunnelArt() {
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full p-2">
      {/* Local */}
      <rect x="10" y="36" width="50" height="28" rx="6" fill="#ECEAE1" stroke="#9b9384" strokeWidth="1" />
      <text x="35" y="54" fontSize="9" fontWeight="600" fill="#111827" textAnchor="middle">Local</text>

      {/* Tunnel pipe */}
      <path d="M 60 50 L 140 50" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 5" className="flow-line" />

      {/* Cloud */}
      <g>
        <ellipse cx="170" cy="50" rx="22" ry="14" fill="#ECEAE1" stroke="#2563EB" strokeWidth="1.4" />
        <text x="170" y="54" fontSize="9" fontWeight="700" fill="#2563EB" textAnchor="middle">cloud</text>
      </g>

      {/* Lock badge */}
      <g transform="translate(95, 28)">
        <rect x="0" y="0" width="14" height="14" rx="3" fill="#2563EB" />
        <path d="M 4 6 V 4 a 3 3 0 0 1 6 0 V 6" stroke="white" strokeWidth="1.2" fill="none" />
        <rect x="3" y="6" width="8" height="6" rx="1" fill="white" />
      </g>
    </svg>
  );
}

function SetupArt() {
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full p-2">
      {/* Folder */}
      <g transform="translate(20, 30)">
        <path
          d="M 0 4 a 2 2 0 0 1 2 -2 h 12 l 4 4 h 22 a 2 2 0 0 1 2 2 v 26 a 2 2 0 0 1 -2 2 H 2 a 2 2 0 0 1 -2 -2 Z"
          fill="#ECEAE1"
          stroke="#9b9384"
          strokeWidth="1"
        />
      </g>

      {/* Arrow */}
      <g stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M 75 50 L 110 50" />
        <path d="M 105 45 L 110 50 L 105 55" />
      </g>

      {/* Server stacks */}
      <g transform="translate(125, 28)">
        <rect x="0" y="0" width="50" height="14" rx="3" fill="#ECEAE1" stroke="#9b9384" strokeWidth="1" />
        <rect x="0" y="20" width="50" height="14" rx="3" fill="#ECEAE1" stroke="#9b9384" strokeWidth="1" />
        <rect x="0" y="40" width="50" height="14" rx="3" fill="#ECEAE1" stroke="#9b9384" strokeWidth="1" />
        <circle cx="6" cy="7" r="2" fill="#10b981" />
        <circle cx="6" cy="27" r="2" fill="#10b981" />
        <circle cx="6" cy="47" r="2" fill="#10b981" />
      </g>
    </svg>
  );
}

function ChatArt() {
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full p-2">
      {/* Bubble: user */}
      <rect x="20" y="20" width="80" height="20" rx="10" fill="#D2CDC3" />
      <text x="60" y="34" fontSize="9" fill="#111827" textAnchor="middle">Hello?</text>

      {/* Bubble: assistant */}
      <rect x="100" y="50" width="80" height="20" rx="10" fill="#2563EB" />
      <text x="140" y="64" fontSize="9" fill="white" textAnchor="middle">Hi there!</text>

      {/* Endpoint label */}
      <text x="100" y="90" fontSize="8" fill="#6b7280" textAnchor="middle" fontFamily="ui-monospace, monospace">
        via Local Proxy
      </text>
    </svg>
  );
}

function PrivacyArt() {
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full p-2">
      <rect x="60" y="20" width="80" height="60" rx="10" fill="#ECEAE1" stroke="#9b9384" strokeWidth="1" />
      <g transform="translate(95, 35)">
        <rect x="0" y="6" width="14" height="12" rx="2" fill="#2563EB" />
        <path d="M 3 6 V 3 a 4 4 0 0 1 8 0 V 6" stroke="#2563EB" strokeWidth="1.4" fill="none" />
      </g>
      <text x="100" y="68" fontSize="9" fontWeight="600" fill="#111827" textAnchor="middle">Local-first</text>
    </svg>
  );
}

function CompatibleArt() {
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full p-2">
      {/* Plug shape */}
      <g transform="translate(20, 35)">
        <rect x="0" y="0" width="22" height="30" rx="3" fill="#ECEAE1" stroke="#9b9384" strokeWidth="1" />
        <line x1="6" y1="-4" x2="6" y2="0" stroke="#9b9384" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="-4" x2="16" y2="0" stroke="#9b9384" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="6" y1="30" x2="6" y2="34" stroke="#9b9384" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="30" x2="16" y2="34" stroke="#9b9384" strokeWidth="1.5" strokeLinecap="round" />
        <text x="11" y="19" fontSize="9" fontWeight="700" fill="#111827" textAnchor="middle" fontFamily="ui-monospace, monospace">
          AI
        </text>
      </g>

      {/* Connecting flow */}
      <path
        d="M 50 50 L 90 50"
        stroke="#2563eb"
        strokeWidth="2"
        strokeDasharray="4 5"
        className="flow-line"
      />

      {/* Socket / app cards */}
      <g transform="translate(95, 22)">
        <rect x="0" y="0" width="80" height="14" rx="3" fill="#ECEAE1" stroke="#9b9384" strokeWidth="1" />
        <text x="40" y="10" fontSize="8" fontWeight="600" fill="#111827" textAnchor="middle">OpenAI SDK</text>
      </g>
      <g transform="translate(95, 43)">
        <rect x="0" y="0" width="80" height="14" rx="3" fill="#ECEAE1" stroke="#9b9384" strokeWidth="1" />
        <text x="40" y="10" fontSize="8" fontWeight="600" fill="#111827" textAnchor="middle">LangChain</text>
      </g>
      <g transform="translate(95, 64)">
        <rect x="0" y="0" width="80" height="14" rx="3" fill="#ECEAE1" stroke="#9b9384" strokeWidth="1" />
        <text x="40" y="10" fontSize="8" fontWeight="600" fill="#111827" textAnchor="middle">LlamaIndex</text>
      </g>
    </svg>
  );
}
