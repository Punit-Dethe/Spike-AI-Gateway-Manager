'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const STEPS = [
  {
    label: 'Open Spike',
    detail: 'Dashboard tab',
    state: 'idle',
  },
  {
    label: 'Click Install',
    detail: 'Downloads ~22 MB',
    state: 'install',
  },
  {
    label: 'Toggle on',
    detail: 'Tunnel goes live',
    state: 'live',
  },
  {
    label: 'Copy your URL',
    detail: 'Use it anywhere',
    state: 'copy',
  },
];

export default function TunnelSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      id="tunnel"
      className="relative max-w-6xl mx-auto px-6 py-20 md:py-28"
    >
      {/* Spotlight panel */}
      <div className="relative overflow-hidden rounded-3xl ring-1 ring-inset ring-sand-300/60">
        {/* Layered background */}
        <div className="absolute inset-0 bg-sand-200" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 12% 0%, #2563EB 0%, transparent 55%), radial-gradient(circle at 95% 100%, #2563EB 0%, transparent 55%)',
          }}
        />

        <div className="relative grid md:grid-cols-2 gap-8 md:gap-12 p-8 md:p-14">
          {/* Left: copy */}
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-accent">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Cloudflare Tunnel
            </span>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
              From localhost to the internet, in one click.
            </h2>
            <p className="mt-4 text-gray-700 text-lg leading-relaxed">
              Spike installs the Cloudflare connector on demand and gives you a
              public <code className="font-mono text-sm bg-sand-100 px-1.5 py-0.5 rounded">trycloudflare.com</code> URL
              that forwards to your local Unified Proxy. No account, no DNS,
              no port forwarding.
            </p>

            <ul className="mt-6 space-y-2.5">
              {[
                'Installs inside the app — no admin, no PATH changes',
                'Toggle on/off from the Dashboard or Services tab',
                'URL persists across app restarts when enabled',
                'Quick tunnels only — no named tunnels, no credentials',
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-accent shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: animated terminal/url panel */}
          <div className="relative">
            <div className="bg-sand-900 rounded-2xl p-5 shadow-xl ring-1 ring-black/10 font-mono text-sm">
              <div className="flex items-center gap-1.5 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-3 text-xs text-sand-300/70">spike · public tunnel</span>
              </div>

              <div className="space-y-2">
                {STEPS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    animate={{ opacity: i <= active ? 1 : 0.3 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-baseline gap-3"
                  >
                    <span className="text-accent">$</span>
                    <span className="text-sand-50">{s.label}</span>
                    <span className="text-sand-400 text-xs">{s.detail}</span>
                    {i === active && (
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.9, repeat: Infinity }}
                        className="text-accent"
                      >
                        ▌
                      </motion.span>
                    )}
                  </motion.div>
                ))}

                <motion.div
                  animate={{ opacity: active >= 2 ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-4 pt-4 border-t border-sand-300/20 text-emerald-400"
                >
                  ✓ Live: https://your-name.trycloudflare.com/v1
                </motion.div>
              </div>
            </div>

            {/* Floating curl card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: active >= 3 ? 1 : 0,
                y: active >= 3 ? 0 : 10,
              }}
              transition={{ duration: 0.4 }}
              className="absolute -bottom-6 -left-4 md:-left-8 max-w-[260px] bg-sand-50 rounded-xl shadow-lg ring-1 ring-sand-300 p-3 text-xs font-mono"
            >
              <div className="text-[10px] font-semibold tracking-wide uppercase text-gray-500 mb-1.5 font-sans">
                Anywhere on the internet
              </div>
              <div className="text-gray-900 leading-relaxed">
                curl https://your-name<br />
                .trycloudflare.com/v1/<br />
                chat/completions...
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
