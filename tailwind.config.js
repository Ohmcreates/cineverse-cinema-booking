/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0C',
        charcoal: '#141418',
        surface: '#1A1A22',
        surfaceLight: '#24242F',
        crimson: '#E11D48',
        crimsonHover: '#BE123C',
        cream: '#F4F1EA',
        creamMuted: '#D8D4CA',
        emeraldAccent: '#10B981',
        emeraldLight: '#6EE7B7',
        plum: '#5B3748',
        hallwayWall: '#111916',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Cabinet Grotesk', 'Syne', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-crimson': '0 0 25px -5px rgba(225, 29, 72, 0.4)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.45)',
        'glow-screen': '0 0 50px 10px rgba(255, 255, 255, 0.15)',
      }
    },
  },
  plugins: [],
}
