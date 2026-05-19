'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A soft blue glow that follows the cursor.
 * - Desktop only (touch devices have no cursor)
 * - Respects prefers-reduced-motion
 * - mix-blend-mode lets it tint the warm sand background without harshness
 */
export default function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect reduced motion + skip on touch
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (reduced || isTouch) return;

    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) setVisible(true);
    };

    const animate = () => {
      // ease toward target for buttery follow
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      el.style.transform = `translate3d(${currentX - 250}px, ${currentY - 250}px, 0)`;
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    window.addEventListener('mousemove', onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
    };
  }, [visible]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none fixed top-0 left-0 z-0 hidden md:block transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        width: 500,
        height: 500,
        background:
          'radial-gradient(circle, rgba(37,99,235,0.10) 0%, rgba(37,99,235,0.03) 30%, transparent 65%)',
        willChange: 'transform',
      }}
    />
  );
}
