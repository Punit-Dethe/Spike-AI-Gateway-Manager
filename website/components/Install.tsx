'use client';

import { motion } from 'framer-motion';

const GITHUB = 'https://github.com/Punit-Dethe/Spike-AI-Gateway-Manager';
const RELEASES = `${GITHUB}/releases/latest`;

export default function Install() {
  return (
    <section
      id="install"
      className="max-w-6xl mx-auto px-6 py-20 md:py-28"
    >
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-semibold tracking-wide uppercase text-accent">
          Get started
        </span>
        <h2 className="mt-2 font-serif text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
          Two products. Pick what you need.
        </h2>
        <p className="mt-3 text-gray-700 text-lg">
          Both run as standalone Windows apps. No Python or Node to install.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Spike full app */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl ring-1 ring-inset ring-sand-300/60 bg-sand-100"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.10] pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 90% 10%, #2563EB 0%, transparent 55%)',
            }}
          />
          <div className="relative p-7">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold tracking-wide uppercase text-accent">
                Spike
              </span>
              <span className="text-xs text-gray-500">v1.0.0 · stable</span>
            </div>
            <h3 className="font-serif text-3xl font-semibold text-gray-900">
              Full desktop app
            </h3>
            <p className="mt-2 text-gray-700 text-sm leading-relaxed">
              ChatGPT, Gemini, Unified Proxy, public tunnel, built-in chat.
              Everything in one Electron app.
            </p>

            <ul className="mt-5 space-y-1.5 text-sm text-gray-700">
              <Bullet>Multi-provider routing</Bullet>
              <Bullet>One-click public tunnel</Bullet>
              <Bullet>Standalone setup wizard</Bullet>
              <Bullet>Live chat with endpoint switcher</Bullet>
            </ul>

            <div className="mt-7 flex items-center gap-2">
              <a
                href={RELEASES}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm py-2.5 px-5 rounded-xl transition-all hover:shadow-md active:scale-[0.98]"
              >
                Download Spike
                <Arrow />
              </a>
              <span className="text-xs text-gray-500">Windows · free</span>
            </div>
          </div>
        </motion.div>

        {/* Spike Lite */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-2xl bg-sand-100 ring-1 ring-inset ring-sand-300/40 p-7"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold tracking-wide uppercase text-gray-700">
              Spike Lite
            </span>
            <span className="text-xs text-gray-500">v1.0.0 · stable</span>
          </div>
          <h3 className="font-serif text-3xl font-semibold text-gray-900">
            Just Gemini, in your tray
          </h3>
          <p className="mt-2 text-gray-700 text-sm leading-relaxed">
            Single-binary OpenAI-compatible Gemini gateway. Runs from the system
            tray with a web dashboard for tokens.
          </p>

          <ul className="mt-5 space-y-1.5 text-sm text-gray-700">
            <Bullet>OpenAI-compatible API on :6969</Bullet>
            <Bullet>System tray + web dashboard</Bullet>
            <Bullet>Privacy mode by default</Bullet>
            <Bullet>Lightweight, runs in the background</Bullet>
          </ul>

          <div className="mt-7 flex items-center gap-2">
            <a
              href={RELEASES}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-sand-300 hover:bg-sand-400 text-gray-900 font-medium text-sm py-2.5 px-5 rounded-xl transition-all hover:shadow-sm active:scale-[0.98]"
            >
              Download Spike Lite
              <Arrow />
            </a>
            <span className="text-xs text-gray-500">Windows · free</span>
          </div>
        </motion.div>
      </div>

      {/* Token setup quick steps */}
      <div className="mt-10 bg-sand-100 rounded-2xl ring-1 ring-inset ring-sand-300/40 p-7">
        <span className="text-xs font-semibold tracking-wide uppercase text-accent">
          After install
        </span>
        <h3 className="mt-2 font-serif text-2xl font-semibold text-gray-900">
          Wire up your tokens in two minutes.
        </h3>

        <div className="mt-5 grid md:grid-cols-2 gap-3">
          <Step
            n={1}
            title="ChatGPT"
            body={
              <>
                Visit{' '}
                <code className="font-mono text-xs bg-sand-200 px-1.5 py-0.5 rounded">
                  chatgpt.com/api/auth/session
                </code>{' '}
                in your browser, copy the <span className="font-medium">accessToken</span>{' '}
                value, paste it into Spike.
              </>
            }
          />
          <Step
            n={2}
            title="Gemini"
            body={
              <>
                Open DevTools on{' '}
                <code className="font-mono text-xs bg-sand-200 px-1.5 py-0.5 rounded">
                  gemini.google.com
                </code>
                . Copy the{' '}
                <span className="font-medium">__Secure-1PSID</span> and{' '}
                <span className="font-medium">__Secure-1PSIDTS</span> cookies into Spike.
              </>
            }
          />
        </div>
      </div>
    </section>
  );
}

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2.5">
    <svg
      viewBox="0 0 14 14"
      width="14"
      height="14"
      className="mt-1 shrink-0"
      fill="none"
      stroke="#2563EB"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 7.5 L5.5 10.5 L11.5 4" />
    </svg>
    <span>{children}</span>
  </li>
);

const Step = ({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: React.ReactNode;
}) => (
  <div className="bg-sand-50 rounded-xl p-5 ring-1 ring-inset ring-sand-300/40">
    <div className="flex items-center gap-3 mb-2">
      <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-900 text-white text-sm font-semibold font-mono">
        {n}
      </span>
      <h4 className="text-base font-semibold text-gray-900">{title}</h4>
    </div>
    <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
  </div>
);

const Arrow = () => (
  <svg
    viewBox="0 0 16 16"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 8h10" />
    <path d="M9 4l4 4-4 4" />
  </svg>
);
