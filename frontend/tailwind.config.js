/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#B68D40', // The Gold from the logo
        secondary: '#111111', // Deep near-black
        accent: '#FDFBF7', // Clean off-white/cream
        champagne: '#D4AF37', // Metallic gold for accents
        primaryContainer: '#B68D40', // Alias for brand gold
      },
    },
  },
  plugins: [],
}
