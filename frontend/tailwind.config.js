/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#1a1a1a',
          100: '#2d2d2d',
          200: '#404040',
          300: '#525252',
          400: '#737373',
          500: '#a3a3a3',
          600: '#d4d4d4',
          700: '#e5e5e5',
          800: '#f5f5f5',
          900: '#ffffff',
        },
        accent: {
          50: '#0f0f23',
          100: '#1a1a3e',
          200: '#262658',
          300: '#323373',
          400: '#4e4e8f',
          500: '#6b6bab',
          600: '#8888c7',
          700: '#a5a5e3',
          800: '#c2c2ff',
          900: '#e0e0ff',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
