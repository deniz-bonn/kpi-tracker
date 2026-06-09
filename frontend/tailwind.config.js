/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0f172a', light: '#1e293b' },
        accent: '#3b82f6',
        won: '#22c55e',
        lost: '#ef4444',
        open: '#f59e0b',
      },
    },
  },
  plugins: [],
};
