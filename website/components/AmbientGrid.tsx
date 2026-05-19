'use client';

/**
 * Subtle dot-grid background for the hero. Pure CSS, no JS.
 * The radial mask fades the dots out toward the edges so the grid never feels
 * boxy — it just whispers behind the type.
 */
export default function AmbientGrid() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none -z-10"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(28,24,17,0.07) 1px, transparent 0)',
        backgroundSize: '28px 28px',
        maskImage:
          'radial-gradient(ellipse 80% 70% at 50% 30%, black 30%, transparent 90%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 80% 70% at 50% 30%, black 30%, transparent 90%)',
      }}
    />
  );
}
