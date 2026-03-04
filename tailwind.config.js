/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: '#0B1F3B',
        'p-blue': '#1F4E79',
        teal: '#2AA7A1',
        gold: '#C9A227',
        'n-900': '#111827',
        'n-600': '#4B5563',
        'n-200': '#E5E7EB',
        'n-50': '#F8FAFC',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        planned: '#1F4E79',
        actual: '#2AA7A1',
        good: '#16A34A',
        bad: '#DC2626',
      }
    },
  },
  plugins: [],
}
