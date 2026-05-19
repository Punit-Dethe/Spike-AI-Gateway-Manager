'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Live flow diagram — a small replica of the dashboard's system view.
 * Cycles through three states (Idle → Local-only → Public) every few seconds
 * so visitors immediately understand what Spike does at a glance.
 */
export default function FlowDiagram() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % 3), 3000);
    return () => clearInterval(t);
  }, []);

  // Phase 0: only bridges live. Phase 1: bridges + proxy. Phase 2: + tunnel.
  const geminiOn = phase >= 0;
  const chatOn = phase >= 0;
  const proxyOn = phase >= 1;
  const tunnelOn = phase >= 2;

  return (
    <div className="relative bg-sand-100 rounded-2xl ring-1 ring-inset ring-sand-300/60 p-4 md:p-6 overflow-hidden">
      {/* Soft accent glow in the corners */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.10] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 8% 0%, #2563EB 0%, transparent 50%), radial-gradient(circle at 95% 100%, #2563EB 0%, transparent 50%)',
        }}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold tracking-wide uppercase text-accent">
            Gateway · live
          </span>
          <span className="text-[11px] text-gray-500 font-mono">
            POST /v1/chat/completions
          </span>
        </div>

        <svg
          viewBox="0 0 800 200"
          className="w-full h-[180px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Lines first so nodes stack on top */}
          <Line d="M 165 50 C 250 50, 270 100, 335 100" live={geminiOn && proxyOn} />
          <Line d="M 165 150 C 250 150, 270 100, 335 100" live={chatOn && proxyOn} />
          <Line d="M 495 100 L 595 100" live={proxyOn && tunnelOn} />

          <Node x={20} y={25} w={145} h={50} label="Gemini" meta=":6969" on={geminiOn} />
          <Node x={20} y={125} w={145} h={50} label="ChatGPT" meta=":5005" on={chatOn} />
          <Node
            x={335}
            y={75}
            w={160}
            h={50}
            label="Unified Proxy"
            meta={proxyOn ? ':8000 · live' : ':8000'}
            on={proxyOn}
            primary
          />
          <Node
            x={595}
            y={75}
            w={185}
            h={50}
            label="Public Tunnel"
            meta={tunnelOn ? 'trycloudflare.com' : 'off'}
            on={tunnelOn}
            dashed={!tunnelOn}
          />
        </svg>

        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-gray-500">
          <span>Auto-routes by model name</span>
          <span>One-click public URL</span>
        </div>
      </div>
    </div>
  );
}

function Line({ d, live }: { d: string; live: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={live ? '#2563eb' : '#cdc6b9'}
      strokeWidth={live ? 2 : 1.4}
      strokeLinecap="round"
      strokeDasharray={live ? '5 6' : undefined}
      className={live ? 'flow-line' : undefined}
      style={{ transition: 'stroke 400ms ease' }}
    />
  );
}

function Node({
  x,
  y,
  w,
  h,
  label,
  meta,
  on,
  primary,
  dashed,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  meta: string;
  on: boolean;
  primary?: boolean;
  dashed?: boolean;
}) {
  const cy = y + h / 2;
  return (
    <g>
      <motion.rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        fill={primary ? '#ECEAE1' : '#E4E0D5'}
        stroke={dashed ? '#9ca3af' : primary ? '#D2CDC3' : 'transparent'}
        strokeWidth={1.5}
        strokeDasharray={dashed ? '5 4' : undefined}
        animate={{ opacity: on ? 1 : 0.7 }}
      />
      <text
        x={x + 16}
        y={cy - 4}
        fontSize={13}
        fontWeight={600}
        fill="#111827"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {label}
      </text>
      <text x={x + 16} y={cy + 12} fontSize={10.5} fill="#6b7280">
        {meta}
      </text>
      <motion.circle
        cx={x + w - 14}
        cy={cy}
        r={4.5}
        fill={on ? '#10b981' : '#9ca3af'}
        animate={{ scale: on ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 1.2, repeat: on ? Infinity : 0 }}
      />
    </g>
  );
}
