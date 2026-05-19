'use client';

import { motion } from 'framer-motion';

const GITHUB = 'https://github.com/Punit-Dethe/Spike-AI-Gateway-Manager';

export default function Nav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-sand-50/70 border-b border-sand-300/40"
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 group">
          <SpikeMark />
          <span className="font-sans font-semibold text-lg text-gray-900">
            Spike
          </span>
        </a>        <div className="hidden md:flex items-center gap-8 text-sm text-gray-700">
          <a href="#how" className="hover:text-gray-900 transition-colors">
            How it works
          </a>
          <a href="#tunnel" className="hover:text-gray-900 transition-colors">
            Public tunnel
          </a>
          <a href="#api" className="hover:text-gray-900 transition-colors">
            API
          </a>
          <a href="#install" className="hover:text-gray-900 transition-colors">
            Install
          </a>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-sand-200 transition-colors"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17.91-.25 1.89-.38 2.86-.38.97 0 1.95.13 2.86.38 2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.05.78 2.12v3.14c0 .31.21.67.8.56C20.71 21.39 24 17.08 24 12c0-6.35-5.15-11.5-12-11.5z" />
            </svg>
            GitHub
          </a>
          <a
            href="#install"
            className="inline-flex items-center bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-xl transition-all hover:shadow-sm active:scale-[0.98]"
          >
            Download
          </a>
        </div>
      </div>
    </motion.nav>
  );
}

const SpikeMark = () => (
  <img
    src="/icons8-hedgehog-100.png"
    alt="Spike"
    width={32}
    height={32}
    className="w-8 h-8"
  />
);
