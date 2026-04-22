/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact RGB values provided
        sand: {
          50: 'rgb(241, 237, 225)',   // Background
          100: 'rgb(228, 224, 213)',  // Cards
          200: 'rgb(236, 234, 225)',  // Sidebar
          300: 'rgb(210, 205, 195)',  // Darker beige for buttons
          400: '#B9B2A4',             // Even darker
          500: '#ADA596',             // Darkest beige
        },
        // Vibrant blue accent - reserved for primary actions only
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#3B82F6',
        },
      },
      fontFamily: {
        serif: ['Crimson Text', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',      // 16px
        '2xl': '1.25rem',  // 20px - consistent premium radius
        '3xl': '1.5rem',   // 24px
      },
      fontSize: {
        'base': '0.9375rem',  // 15px - slightly larger base
        'sm': '0.875rem',     // 14px
        'xs': '0.8125rem',    // 13px
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'rgb(23, 23, 23)',
            a: {
              color: '#2563EB',
              '&:hover': {
                color: '#1D4ED8',
              },
            },
            code: {
              backgroundColor: 'rgb(236, 234, 225)',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
