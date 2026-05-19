'use client';

import { motion } from 'framer-motion';

const GITHUB = 'https://github.com/Punit-Dethe/Spike-AI-Gateway-Manager';
const RELEASES = `${GITHUB}/releases/latest`;

/**
 * Closing CTA. Sits between the Install section and the Footer so the page
 * has a clear "what now?" beat instead of trailing off.
 */
export default function CtaBanner() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-20 md:pb-28">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl ring-1 ring-inset ring-sand-300/60 bg-sand-200"
      >
        {/* Layered glow */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 18% 50%, #2563EB 0%, transparent 50%), radial-gradient(circle at 82% 50%, #2563EB 0%, transparent 50%)',
          }}
        />

        {/* Soft hedgehog mark watermark */}
        <img
          aria-hidden
          src="/icons8-hedgehog-100.png"
          alt=""
          className="absolute -right-6 -bottom-6 w-44 h-44 opacity-[0.08] pointer-events-none select-none"
        />

        <div className="relative px-8 py-12 md:px-14 md:py-16 text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-semibold text-gray-900 leading-tight max-w-3xl mx-auto">
            Stop paying twice for the same AI.
          </h2>
          <p className="mt-4 text-gray-700 text-lg max-w-2xl mx-auto">
            Use the ChatGPT or Gemini account you already have. Free for
            personal use, MIT licensed, runs entirely on your machine.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={RELEASES}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-base py-3 px-6 rounded-2xl transition-all hover:shadow-md active:scale-[0.98]"
            >
              Download Spike
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
            </a>
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-3"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17.91-.25 1.89-.38 2.86-.38.97 0 1.95.13 2.86.38 2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.05.78 2.12v3.14c0 .31.21.67.8.56C20.71 21.39 24 17.08 24 12c0-6.35-5.15-11.5-12-11.5z" />
              </svg>
              Read the source
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
