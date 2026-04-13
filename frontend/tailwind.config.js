/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gaming: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#10b981',
          dark: '#0f172a',
          darker: '#020617'
        }
      }
    },
  },
  plugins: [],
}
