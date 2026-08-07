/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          orange: {
            50:  '#FFF7ED',
            100: '#FFEDD5',
            400: '#FB923C',
            500: '#F97316',
            600: '#EA580C',
            700: '#C2410C',
          },
          blue: {
            50:  '#F0F9FF',
            100: '#E0F2FE',
            500: '#0EA5E9',
            600: '#0284C7',
            700: '#0369A1',
            800: '#075985',
          },
        },
      },
      animation: {
        'pulse-orange': 'pulseOrange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up':      'fadeUp 0.4s ease forwards',
        'fade-in':      'fadeIn 0.3s ease forwards',
        'slide-in-r':   'slideInRight 0.35s ease forwards',
      },
      keyframes: {
        pulseOrange: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(249,115,22,0.5), 0 0 25px rgba(249,115,22,0.4)' },
          '50%':       { boxShadow: '0 0 0 25px rgba(249,115,22,0), 0 0 50px rgba(249,115,22,0.7)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
        'orange-glow': '0 10px 30px -5px rgba(249,115,22,0.3)',
        'blue-glow': '0 10px 30px -5px rgba(2,132,199,0.3)',
        'card': '0 4px 20px -2px rgba(15,23,42,0.06), 0 2px 6px -1px rgba(15,23,42,0.04)',
      },
    },
  },
  plugins: [],
}
