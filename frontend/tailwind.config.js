/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00150f',
        primaryContainer: '#022c22',
        secondary: '#665d53',
      },
    },
  },
  plugins: [],
}
