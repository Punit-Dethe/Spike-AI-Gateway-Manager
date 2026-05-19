import type { Metadata } from 'next';
import { Inter, Crimson_Text } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const crimson = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Spike — Turn ChatGPT and Gemini into a real REST API',
  description:
    'Spike converts ChatGPT and Google Gemini into OpenAI-compatible APIs that run locally. Expose them publicly with one click via Cloudflare Tunnel. No API keys, no usage fees.',
  keywords: [
    'spike',
    'ai gateway',
    'chatgpt api',
    'gemini api',
    'openai compatible',
    'cloudflare tunnel',
    'local llm',
  ],
  openGraph: {
    title: 'Spike — AI Gateway Manager',
    description:
      'Run ChatGPT and Gemini as a local REST API. Share it publicly with one click.',
    type: 'website',
    url: 'https://spike-ai.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spike — AI Gateway Manager',
    description:
      'Run ChatGPT and Gemini as a local REST API. Share it publicly with one click.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${crimson.variable}`}>
      <body className="antialiased relative">
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
