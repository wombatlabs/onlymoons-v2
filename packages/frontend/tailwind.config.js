import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green: colors.emerald,
        yellow: colors.amber,
        purple: colors.violet,
        gray: colors.neutral,
        primary: colors.blue,
        secondary: colors.indigo,
      },
      keyframes: {
        shimmer: {
          '0%': {
            opacity: 0,
          },
          '80%': {
            opacity: 1,
          },
          '100%': {
            transform: 'translateX(100%)',
            opacity: 0.5,
          },
        },
      },
      animation: {
        shimmer: 'shimmer 2s ease-out infinite',
      },
    },
  },
  plugins: [],
}
