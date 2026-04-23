/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stellar: {
          blue: '#08B5E5',
          dark: '#000000',
          gray: '#F8F9FA',
        }
      },
      backgroundImage: {
        'stellar-gradient': 'linear-gradient(135deg, #08B5E5 0%, #1A237E 100%)',
      }
    },
  },
  plugins: [],
}
