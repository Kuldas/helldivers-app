/** @type {import('tailwindcss').Config} */
export default {
  content: ['./*.html', './*.js'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
};
