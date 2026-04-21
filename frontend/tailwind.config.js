/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        court: {
          900: '#0d1f16',
          800: '#1a3a2a',
          700: '#235038',
          600: '#2d6647',
          500: '#3a7d57',
        },
        lime: {
          400: '#d4f55c',
          500: '#c8f135',
          600: '#aad420',
          700: '#8ab818',
        },
      },
      fontFamily: {
        heading: ['Barlow Condensed', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
