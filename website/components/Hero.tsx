'use client';

import { motion } from 'framer-motion';
import FlowDiagram from './FlowDiagram';

export default function Hero() {
  return (
    <section
      id="top"
      className="relative max-w-6xl mx-auto px-6 pt-12 md:pt-20 pb-16 md:pb-20"
    >
      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2 mb-6"
      >
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Spike 1.0 · stable
        </span>
        <span className="text-xs text-gray-500">Windows desktop app</span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="font-serif text-5xl md:text-7xl font-semibold text-gray-900 leading-[1.05] tracking-tight max-w-4xl"
      >
        Your{' '}
        <span className="relative inline-block">
          <span className="relative z-10">ChatGPT and Gemini</span>
          <span className="absolute -bottom-1 left-0 right-0 h-3 bg-accent/15 -z-0 rounded" />
        </span>
        , now an API.
      </motion.h1>

      {/* Subhead */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className="mt-6 text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl"
      >
        Spike turns the AI chat tools you already pay for into a real REST API
        — the same one OpenAI charges for. Use it in your code, share it with
        your team, no new keys or fees.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
        className="mt-8 flex flex-wrap items-center gap-3"
      >
        <a
          href="#install"
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-base py-3 px-6 rounded-2xl transition-all hover:shadow-md active:scale-[0.98]"
        >
          Download Spike
          <Arrow />
        </a>
        <a
          href="#how"
          className="inline-flex items-center bg-sand-200 hover:bg-sand-300 text-gray-900 font-medium text-base py-3 px-6 rounded-2xl transition-all"
        >
          How does it work?
        </a>
        <a
          href="https://github.com/Punit-Dethe/Spike-AI-Gateway-Manager"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2"
        >
          <GhIcon />
          View on GitHub
        </a>
      </motion.div>

      {/* Browser-like preview frame with the live flow diagram */}
      <motion.div
        id="how"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="mt-14 md:mt-20"
      >
        <FlowDiagram />
      </motion.div>
    </section>
  );
}

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

const GhIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17.91-.25 1.89-.38 2.86-.38.97 0 1.95.13 2.86.38 2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.05.78 2.12v3.14c0 .31.21.67.8.56C20.71 21.39 24 17.08 24 12c0-6.35-5.15-11.5-12-11.5z" />
  </svg>
);
