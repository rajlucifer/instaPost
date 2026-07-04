/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
      },
      width: {
        '[72px]':  '72px',
        '[260px]': '260px',
      },
      marginLeft: {
        '[72px]':  '72px',
        '[260px]': '260px',
      },
      columns: {
        '1': '1',
        '2': '2',
        '3': '3',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'blob': 'blob 8s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.2s ease-in-out',
        'spin-slow': 'spin-slow 8s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%':       { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%':  { transform: 'scale(1.3)' },
          '28%':  { transform: 'scale(1)' },
          '42%':  { transform: 'scale(1.2)' },
          '70%':  { transform: 'scale(1)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
      },
    },
  },
  plugins: [],
}