/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        slideUpIn: {
          '0%': { transform: 'translateY(50%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideLeftIn: {
          '0%': { transform: 'translateX(50%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        slideDownOut: {
          '0%': { transform: 'translateY(0)', opacity: 1 },
          '100%': { transform: 'translateY(50%)', opacity: 0 },
        },
        slideRightOut: {
          '0%': { transform: 'translateX(0)', opacity: 1 },
          '100%': { transform: 'translateX(50%)', opacity: 0 },
        },
      },
      animation: {
        fadeIn: 'fadeIn 150ms ease-in-out forwards',
        fadeOut: 'fadeOut 150ms ease-in-out forwards',
        slideUpIn: 'slideUpIn 150ms ease-in-out forwards',
        slideLeftIn: 'slideLeftIn 150ms ease-in-out forwards',
        slideDownOut: 'slideDownOut 150ms ease-in-out forwards',
        slideRightOut: 'slideRightOut 150ms ease-in-out forwards',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}