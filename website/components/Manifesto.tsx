'use client';

import { motion } from 'framer-motion';

/**
 * The page's emotional center — a single bold typographic statement.
 * Sits between the explainer and the features grid.
 */
export default function Manifesto() {
  return (
    <section className="relative">
      {/* Full-bleed deeper sand panel */}
      <div className="bg-sand-200/60 border-y border-sand-300/50 relative overflow-hidden">
        {/* Soft blue corner glow */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 15% 50%, #2563EB 0%, transparent 50%), radial-gradient(circle at 85% 50%, #2563EB 0%, transparent 50%)',
          }}
        />

        {/* Decorative section number */}
        <div className="max-w-6xl mx-auto px-6 pt-16 md:pt-24">
          <div className="flex items-center gap-3 text-[11px] tracking-[0.3em] uppercase text-gray-500 font-mono">
            <span>03</span>
            <span className="h-px flex-1 bg-sand-300/70 max-w-[80px]" />
            <span>The thesis</span>
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-28">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] font-semibold text-gray-900 leading-[1.04] tracking-tight max-w-5xl"
          >
            The AI you already use,
            <br />
            <em className="italic font-normal text-gray-700">in the shape of</em>{' '}
            <span className="relative inline-block">
              an API.
              <span
                aria-hidden
                className="absolute -bottom-2 left-0 right-0 h-3 bg-accent/20 -z-0 rounded"
              />
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 md:mt-12 text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed"
          >
            We don&apos;t think you should pay for AI twice. So we built the
            wire that connects what you already have to the code you&apos;re
            already writing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-12 md:mt-16 origin-left"
          >
            <div className="h-px bg-gradient-to-r from-sand-400/60 via-sand-300/40 to-transparent max-w-2xl" />
            <div className="mt-4 flex items-center gap-3 text-xs text-gray-500 font-mono">
              <SignatureMark />
              <span className="tracking-wider uppercase">
                Made for the AI community · MIT
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const SignatureMark = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
    <path
      d="M5 18 L10 6 L15 18 L10 14 Z"
      fill="#2563EB"
      stroke="#1D4ED8"
      strokeWidth="0.5"
      strokeLinejoin="round"
    />
  </svg>
);
