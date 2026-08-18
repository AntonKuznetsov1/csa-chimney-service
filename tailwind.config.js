/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#f97316', /* Placeholder orange, will refine in Phase 2 */
          black: '#111827',
        }
      }
    },
  },
  plugins: [],
}
