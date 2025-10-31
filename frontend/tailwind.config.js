/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'energia-yellow': '#FACC15',
        'energia-dark': '#111827',
        'energia-medium': '#1F2937',
      }
    },
  },
  plugins: [],
}
