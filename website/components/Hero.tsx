'use client';

import { motion } from 'framer-motion';
import AmbientGrid from './AmbientGrid';
import FlowDiagram from './FlowDiagram';
import RotatingWord from './RotatingWord';
import SectionLabel from './SectionLabel';

const HEADLINE_LINE_1 = ['Your', 'ChatGPT', 'and', 'Gemini,'];
const HEADLINE_LINE_2 = ['now', 'an', 'API.'];

const letter = {
  hidden: { opacity: 0, y: '0.5em' },
  visible: { opacity: 1, y: 0 },
};

const lineContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

export default function Hero() {
  return (
    <section
      id="top"
      className="relative max-w-6xl mx-auto px-6 pt-12 md:pt-20 pb-16 md:pb-24"
    >
      <AmbientGrid />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <SectionLabel number="01" label="Spike · v1.0 · stable" />
      </motion.div>

      {/* Kinetic headline */}
      <h1 className="mt-6 font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-semibold text-gray-900 leading-[1.04] tracking-tight max-w-5xl">
        <motion.span
          variants={lineContainer}
          initial="hidden"
          animate="visible"
          className="block"
        >
          {HEADLINE_LINE_1.map((word, i) => (
            <motion.span
              key={`l1-${i}`}
              variants={letter}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`inline-block mr-3 ${
                word === 'ChatGPT' || word === 'Gemini,'
                  ? 'italic font-normal'
                  : ''
              }`}
            >
              {word === 'Gemini,' ? (
                <>
                  <span className="relative">
                    <span className="relative z-10">Gemini</span>
                    <span
                      aria-hidden
                      className="absolute -bottom-1 left-0 right-0 h-3 bg-accent/20 -z-0 rounded"
                    />
                  </span>
                  ,
                </>
              ) : (
                word
              )}
            </motion.span>
          ))}
        </motion.span>

        <motion.span
          variants={lineContainer}
          initial="hidden"
          animate="visible"
          transition={{ delayChildren: 0.6 }}
          className="block"
        >
          {HEADLINE_LINE_2.map((word, i) => (
            <motion.span
              key={`l2-${i}`}
              variants={letter}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block mr-3"
            >
              {word}
            </motion.span>
          ))}
        </motion.span>
      </h1>

      {/* Subhead with rotating word */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="mt-7 text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl"
      >
        Use the AI subscription you already pay for{' '}
        <RotatingWord
          words={['in your code.', 'in your team.', 'on a hosted app.', 'anywhere.']}
        />
        <br className="hidden md:block" />
        No new keys. No new bills. No vendor to onboard.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.3 }}
        className="mt-9 flex flex-wrap items-center gap-3"
      >
        <a
          href="#install"
          className="magnet-btn inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-base py-3 px-6 rounded-2xl hover:shadow-lg active:scale-[0.98]"
        >
          Download Spike
          <Arrow />
        </a>
        <a
          href="#how"
          className="magnet-btn inline-flex items-center bg-sand-200 hover:bg-sand-300 text-gray-900 font-medium text-base py-3 px-6 rounded-2xl"
        >
          See it work
        </a>
        <a
          href="https://github.com/Punit-Dethe/Spike-AI-Gateway-Manager"
          target="_blank"
          rel="noopener noreferrer"
          className="link-sweep inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 px-2 py-2"
        >
          <GhIcon />
          View source
        </a>
      </motion.div>

      {/* Live flow diagram */}
      <motion.div
        id="how"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="mt-16 md:mt-24"
      >
        <FlowDiagram />
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 2 }}
        className="hidden md:flex items-center justify-center gap-2 mt-12 text-[11px] tracking-[0.3em] uppercase text-gray-500 font-mono"
      >
        <span>Scroll</span>
        <motion.span
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          ↓
        </motion.span>
        <span>The thesis</span>
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
