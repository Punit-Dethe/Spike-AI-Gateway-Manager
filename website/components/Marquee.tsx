'use client';

const MODELS = [
  'gpt-4o',
  'gemini-3-pro',
  'o1',
  'gpt-4-turbo',
  'gemini-2.0-flash',
  'o3-mini',
  'gpt-4o-mini',
  'gemini-3.1-flash',
  'o1-pro',
  'gpt-3.5-turbo',
  'gemini-3-flash',
  'gpt-4',
  'o1-mini',
  'gemini-3.1-pro',
];

/**
 * Editorial marquee — every supported model in italic serif, scrolling
 * forever like a fashion-magazine ticker. Soft fade masks at both ends.
 */
export default function Marquee() {
  // Repeat content twice for a seamless loop
  const repeated = [...MODELS, ...MODELS];

  return (
    <section
      aria-label="Supported models"
      className="relative w-full overflow-hidden border-y border-sand-300/40 bg-sand-50/60 py-6 md:py-8"
    >
      {/* Edge fade masks */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-32 z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, rgb(241,237,225) 0%, transparent 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-32 z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(to left, rgb(241,237,225) 0%, transparent 100%)',
        }}
      />

      <div className="flex whitespace-nowrap will-change-transform animate-marquee">
        {repeated.map((m, i) => (
          <span
            key={`${m}-${i}`}
            className="font-serif italic text-3xl md:text-5xl text-gray-900/70 mx-6 md:mx-10 select-none"
          >
            {m}
            <span aria-hidden className="ml-6 md:ml-10 text-accent/40 not-italic font-sans">
              ✦
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
