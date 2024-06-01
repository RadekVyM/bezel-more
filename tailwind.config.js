const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      current: colors.current,
      transparent: colors.transparent,
      white: colors.white,
      black: colors.black,
      gray: colors.gray,
      inherit: colors.inherit,

      primary: 'var(--primary)',
      'on-primary': 'var(--on-primary)',
      secondary: 'var(--secondary)',
      'on-secondary': 'var(--on-secondary)',
      'secondary-dim': 'var(--secondary-dim)',
      'on-secondary-dim': 'var(--on-secondary-dim)',

      surface: 'var(--surface)',
      'on-surface': 'var(--on-surface)',
      'on-surface-muted': 'var(--on-surface-muted)',

      'surface-dim': 'var(--surface-dim)',
      'on-surface-dim': 'var(--on-surface-dim)',
      'on-surface-dim-muted': 'var(--on-surface-dim-muted)',

      'surface-container': 'var(--surface-container)',
      'on-surface-container': 'var(--on-surface-container)',
      'on-surface-container-muted': 'var(--on-surface-container-muted)',

      'surface-dim-container': 'var(--surface-dim-container)',
      'on-surface-dim-container': 'var(--on-surface-dim-container)',
      'on-surface-dim-container-muted': 'var(--on-surface-dim-container-muted)',

      outline: 'var(--outline)',
      'outline-variant': 'var(--outline-variant)',

      danger: 'var(--danger)',
      'on-danger': 'var(--on-danger)',
      'danger-dim': 'var(--danger-dim)',
      'on-danger-dim': 'var(--on-danger-dim)',

      backdrop: 'var(--backdrop)',
    },
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