'use client';

import { motion } from 'framer-motion';

/**
 * Plain-language explainer that answers "what is Spike, really?"
 * Sits between the hero and the features section so the value prop
 * lands before any specs.
 */
export default function Explainer() {
  return (
    <section className="relative max-w-6xl mx-auto px-6 py-20 md:py-24 border-t border-sand-300/40">
      <div className="max-w-3xl mb-12">
        <span className="text-xs font-semibold tracking-wide uppercase text-accent">
          What is Spike, really?
        </span>
        <h2 className="mt-2 font-serif text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
          You're already paying for the AI. Use it everywhere.
        </h2>
        <p className="mt-4 text-gray-700 text-lg leading-relaxed">
          You probably already have ChatGPT Plus open in a tab, or use Gemini in
          your browser every day. The hard part isn&apos;t getting answers from
          them. It&apos;s getting those answers inside the code you write.
        </p>
        <p className="mt-3 text-gray-700 text-lg leading-relaxed">
          Spike runs on your machine, sends your prompts to the same AI you&apos;d
          use anyway, and hands the answer back as a clean API response. Same
          models, same quality, same subscription you already pay for.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <Comparison
          variant="muted"
          eyebrow="The old way"
          title="Pay twice. Manage twice."
          points={[
            'Sign up for the OpenAI or Google AI API',
            'Add a payment method, set spending limits',
            'Generate keys, rotate them, watch usage',
            'Pay per token, separate from your ChatGPT Plus',
          ]}
        />
        <Comparison
          variant="primary"
          eyebrow="With Spike"
          title="Use what you already have."
          points={[
            'Use the ChatGPT or Gemini account you have',
            'No new signups, no new billing',
            'No API keys to manage or rotate',
            'Test all you want — your subscription covers it',
          ]}
        />
      </div>
    </section>
  );
}

function Comparison({
  variant,
  eyebrow,
  title,
  points,
}: {
  variant: 'muted' | 'primary';
  eyebrow: string;
  title: string;
  points: string[];
}) {
  const isPrimary = variant === 'primary';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-2xl ring-1 ring-inset p-6 md:p-7 ${
        isPrimary
          ? 'bg-sand-200 ring-sand-300/60'
          : 'bg-sand-100/70 ring-sand-300/30'
      }`}
    >
      {isPrimary && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.10] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 88% 12%, #2563EB 0%, transparent 55%)',
          }}
        />
      )}
      <div className="relative">
        <span
          className={`text-[11px] font-semibold tracking-wide uppercase ${
            isPrimary ? 'text-accent' : 'text-gray-500'
          }`}
        >
          {eyebrow}
        </span>
        <h3
          className={`mt-1.5 font-serif text-2xl font-semibold ${
            isPrimary ? 'text-gray-900' : 'text-gray-700'
          }`}
        >
          {title}
        </h3>
        <ul className="mt-4 space-y-2.5">
          {points.map((p) => (
            <li
              key={p}
              className={`flex items-start gap-2.5 text-sm ${
                isPrimary ? 'text-gray-700' : 'text-gray-500'
              }`}
            >
              <Bullet positive={isPrimary} />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function Bullet({ positive }: { positive: boolean }) {
  if (positive) {
    return (
      <svg
        viewBox="0 0 14 14"
        width="14"
        height="14"
        className="mt-0.5 shrink-0"
        fill="none"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 7.5 L5.5 10.5 L11.5 4" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 14 14"
      width="14"
      height="14"
      className="mt-0.5 shrink-0"
      fill="none"
      stroke="#9b9384"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <line x1="3" y1="7" x2="11" y2="7" />
    </svg>
  );
}
