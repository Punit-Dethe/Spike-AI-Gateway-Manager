interface Props {
  number: string; // e.g. "01"
  label: string; // e.g. "What is Spike, really?"
  className?: string;
}

/**
 * Magazine-style section label: "01 ─── What is Spike, really?"
 * Uses mono for the numeral and a fading rule between number and label.
 */
export default function SectionLabel({ number, label, className = '' }: Props) {
  return (
    <div
      className={`flex items-center gap-3 text-[11px] tracking-[0.25em] uppercase text-gray-500 font-mono ${className}`}
    >
      <span className="text-gray-700 font-semibold">{number}</span>
      <span className="h-px w-8 bg-sand-300" />
      <span>{label}</span>
    </div>
  );
}
