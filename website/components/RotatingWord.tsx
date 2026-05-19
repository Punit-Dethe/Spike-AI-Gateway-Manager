'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  words: string[];
  interval?: number;
  className?: string;
}

/**
 * Cycles through a list of words with a soft up-out / up-in animation.
 * Used in the hero subhead: "...in your code | in your team | anywhere".
 */
export default function RotatingWord({
  words,
  interval = 2400,
  className = '',
}: Props) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [interval, words.length]);

  // Reserve width using the longest word so layout doesn't jiggle
  const longest = words.reduce((a, b) => (a.length >= b.length ? a : b));

  return (
    <span className={`relative inline-flex align-baseline ${className}`}>
      {/* Invisible width-reserver */}
      <span aria-hidden className="invisible whitespace-nowrap">
        {longest}
      </span>
      <span className="absolute inset-0 overflow-hidden whitespace-nowrap">
        <AnimatePresence mode="wait">
          <motion.span
            key={words[i]}
            initial={{ y: '0.6em', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-0.6em', opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block italic text-accent font-serif"
          >
            {words[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
