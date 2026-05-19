import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: {
          50: 'rgb(241, 237, 225)',
          100: 'rgb(228, 224, 213)',
          200: 'rgb(236, 234, 225)',
          300: 'rgb(210, 205, 195)',
          400: '#B9B2A4',
          500: '#ADA596',
          900: '#2C2820',
        },
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#3B82F6',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Crimson Text', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        'flow-dash': { to: { strokeDashoffset: '-22' } },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'flow-dash': 'flow-dash 0.9s linear infinite',
        'fade-up': 'fade-up 0.6s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
