/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'border-red-500', 
  ],
  theme: {
    fontFamily:{
      "sans": ['Poppins', 'sans-serif']
    },
    extend: {
      backgroundImage: {
        "home": "url('/assets/bg.jpg')"
      }
    },
  },
  plugins: [],
}

