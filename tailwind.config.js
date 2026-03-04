/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        planned: '#6366f1',
        actual: '#10b981',
        good: '#10b981',
        warning: '#f59e0b',
        bad: '#ef4444',
      }
    },
  },
  plugins: [],
}
