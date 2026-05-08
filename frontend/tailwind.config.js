/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#84624D', // The Warm Brown from the new logo
        secondary: '#4A3728', // Deeper brown for contrast
        accent: '#F1E4D1', // The elegant cream background from the image
        champagne: '#A67B5B', // Lighter bronze for accents
        primaryContainer: '#84624D',
        secondaryContainer: '#F1E4D1', // Light cream for secondary sections
        accentContainer: '#FAF3E0', // Even lighter cream for subtle backgrounds
      },
    },
  },
  plugins: [],
}
