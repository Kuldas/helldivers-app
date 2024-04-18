const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./*.html', './*.js'],
  theme: {
    fontFamily: {
      sans: [
      // Use a custom sans serif font for this site by changing 'Gaultier' to the
      // font name you want and uncommenting the following line.
      'Changa',
      ...defaultTheme.fontFamily.sans,
      ],
    },
    // The font weights available for this site.
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700,
  },
    container: {
      center: true,
      padding: {
        DEFAULT: '2rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],

  // DaisyUI config
  daisyui: {
    themes: [
      {
        stratHell: {
          "primary": "#F6E10C",
          "neutral": "#2a282d",
          "base-300": "#3a3f4b",
          "base-content": "#fff"
        },
        stratHellTerminids: {
          "primary": "#d09b29",
        },
        stratHellAutomatons: {
          "primary": "#8c1e1e",
        },
      }
    ],
    darkTheme: "stratHell"
  }
};
