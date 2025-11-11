/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#e6f3f7',
          100: '#b3dce8',
          200: '#80c5d9',
          300: '#4daeca',
          400: '#1a97bb',
          500: '#0077a3',
          600: '#005d7f',
          700: '#00445b',
          800: '#002a37',
          900: '#001113',
        },
      },
    },
  },
  plugins: [],
}
