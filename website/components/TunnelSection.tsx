'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import SectionLabel from './SectionLabel';

const STEPS = [
  {
    label: 'Open Spike',
    detail: 'Dashboard tab',
    state: 'idle',
  },
  {
    label: 'Click Install',
    detail: 'Downloads in seconds',
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
    >      {/* Spotlight panel */}
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
            <SectionLabel number="05" label="Public access" />
            <h2 className="mt-4 font-serif text-4xl md:text-5xl font-semibold text-gray-900 leading-[1.1]">
              From localhost to the internet,{' '}
              <em className="italic font-normal text-gray-600">in one click.</em>
            </h2>
            <p className="mt-4 text-gray-700 text-lg leading-relaxed">
              Click install. Toggle the switch. You&apos;ll have a public HTTPS
              URL that points back to the AI on your machine.
            </p>

            <div className="mt-6 space-y-3">
              <UseCase
                title="Hit your local AI from a hosted project"
                body="Deploy a Vercel or Render app that calls your laptop. Same code, no API key."
              />
              <UseCase
                title="Share access with a teammate"
                body="Send them a URL. They get the same models you have, while your machine stays in control."
              />
              <UseCase
                title="Test webhook integrations"
                body="Point Discord, Slack, or any incoming webhook at your AI without deploying anything."
              />
            </div>
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

function UseCase({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-sand-50/80 rounded-xl p-4 ring-1 ring-inset ring-sand-300/40">
      <div className="flex items-start gap-3">
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
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <p className="mt-1 text-sm text-gray-600 leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
}
