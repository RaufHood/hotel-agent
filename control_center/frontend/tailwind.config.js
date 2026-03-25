/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: '#f9f9fb',
        border: '#e8e8ef',
        accent: {
          DEFAULT: '#6366f1',
          light: '#ede9fe',
          hover: '#4f46e5',
        },
        text: {
          primary: '#0f0f13',
          secondary: '#6b6b80',
          muted: '#a0a0b0',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08)',
      },
      keyframes: {
        ripple: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
        },
      },
      animation: {
        ripple: 'ripple 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
