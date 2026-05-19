'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

type Lang = 'python' | 'openai' | 'javascript' | 'curl';

const SAMPLES: Record<Lang, string> = {
  python: `import requests

response = requests.post(
    'http://localhost:8000/v1/chat/completions',
    json={
        "model": "gpt-4o",
        "messages": [
            {"role": "user", "content": "Explain quantum computing"}
        ]
    }
)

print(response.json()['choices'][0]['message']['content'])`,
  openai: `from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="not-needed"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}]
)

print(response.choices[0].message.content)`,
  javascript: `const response = await fetch(
  'http://localhost:8000/v1/chat/completions',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemini-2.0-flash',
      messages: [{ role: 'user', content: 'Hello' }]
    })
  }
);

const data = await response.json();
console.log(data.choices[0].message.content);`,
  curl: `curl http://localhost:8000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'`,
};

const TABS: { id: Lang; label: string }[] = [
  { id: 'python', label: 'Python' },
  { id: 'openai', label: 'OpenAI SDK' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'curl', label: 'cURL' },
];

const MODELS = [
  { name: 'gpt-4o', tag: 'ChatGPT' },
  { name: 'gpt-4o-mini', tag: 'ChatGPT' },
  { name: 'gpt-4-turbo', tag: 'ChatGPT' },
  { name: 'o1', tag: 'ChatGPT' },
  { name: 'o1-mini', tag: 'ChatGPT' },
  { name: 'o3-mini', tag: 'ChatGPT' },
  { name: 'gemini-2.0-flash', tag: 'Gemini' },
  { name: 'gemini-3-flash', tag: 'Gemini' },
  { name: 'gemini-3.1-flash', tag: 'Gemini' },
  { name: 'gemini-3.1-pro', tag: 'Gemini' },
];

export default function ApiSection() {
  const [lang, setLang] = useState<Lang>('python');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SAMPLES[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section id="api" className="max-w-6xl mx-auto px-6 py-20 md:py-28">
      <div className="grid md:grid-cols-12 gap-8 md:gap-12">
        {/* Left: copy */}
        <div className="md:col-span-5">
          <span className="text-xs font-semibold tracking-wide uppercase text-accent">
            OpenAI-compatible
          </span>
          <h2 className="mt-2 font-serif text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
            One endpoint. Every model.
          </h2>
          <p className="mt-4 text-gray-700 text-lg leading-relaxed">
            Spike routes by model name automatically. Use{' '}
            <code className="font-mono text-sm bg-sand-200 px-1.5 py-0.5 rounded">
              gpt-*
            </code>{' '}
            for ChatGPT,{' '}
            <code className="font-mono text-sm bg-sand-200 px-1.5 py-0.5 rounded">
              gemini*
            </code>{' '}
            for Gemini. Same endpoint, no provider parameter.
          </p>

          <div className="mt-6 flex flex-wrap gap-1.5">
            {MODELS.map((m) => (
              <span
                key={m.name}
                className={`inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-md ${
                  m.tag === 'Gemini'
                    ? 'bg-sand-200 text-gray-700'
                    : 'bg-accent/10 text-accent'
                }`}
                title={m.tag}
              >
                {m.name}
              </span>
            ))}
          </div>

          <div className="mt-8 text-sm text-gray-600">
            Also compatible with the{' '}
            <span className="font-medium text-gray-900">OpenAI SDK</span>,{' '}
            LangChain, LlamaIndex, and any OpenAI-format client.
          </div>
        </div>

        {/* Right: code panel */}
        <div className="md:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="bg-sand-900 rounded-2xl shadow-xl ring-1 ring-black/10 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-sand-50/10">
              <div className="flex items-center gap-1">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setLang(t.id)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                      lang === t.id
                        ? 'bg-sand-50/10 text-sand-50'
                        : 'text-sand-300/70 hover:text-sand-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCopy}
                className="text-xs font-medium text-sand-300/70 hover:text-sand-50 transition-colors"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-5 overflow-x-auto text-sm leading-relaxed text-sand-50">
              <code>{SAMPLES[lang]}</code>
            </pre>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
