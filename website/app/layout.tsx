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
  title: 'Spike — Use ChatGPT and Gemini as a real API',
  description:
    'Spike turns the AI chat tools you already pay for into an OpenAI-compatible REST API. No new keys, no usage fees, no extra subscriptions. Run it locally or share it publicly with one click.',
  keywords: [
    'spike',
    'ai gateway',
    'chatgpt api',
    'gemini api',
    'openai compatible',
    'cloudflare tunnel',
    'local llm',
    'ai for developers',
  ],
  openGraph: {
    title: 'Spike — Your ChatGPT and Gemini, now an API',
    description:
      'Use the AI chat tools you already pay for as a real REST API. No new keys or fees.',
    type: 'website',
    url: 'https://spike-ai.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spike — Your ChatGPT and Gemini, now an API',
    description:
      'Use the AI chat tools you already pay for as a real REST API. No new keys or fees.',
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
