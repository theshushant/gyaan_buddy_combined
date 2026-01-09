/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand color - Deep Navy Blue
        primary: {
          DEFAULT: '#00167a',
          50: '#e6e8f4',
          100: '#ccd1e9',
          200: '#99a3d3',
          300: '#6675bc',
          400: '#3347a6',
          500: '#00167a',
          600: '#001262',
          700: '#000e4a',
          800: '#000931',
          900: '#000519',
        },
        // Secondary brand color - Royal Purple
        secondary: {
          DEFAULT: '#1e3a8a',
          50: '#e8ebf4',
          100: '#d1d7e9',
          200: '#a3afd3',
          300: '#7587bc',
          400: '#475fa6',
          500: '#1e3a8a',
          600: '#182e6e',
          700: '#122353',
          800: '#0c1737',
          900: '#060c1c',
        },
        // Accent color - Vibrant Cyan
        accent: {
          DEFAULT: '#1fb7eb',
          50: '#e8f7fc',
          100: '#d1eff9',
          200: '#a3dff3',
          300: '#75cfed',
          400: '#47bfe7',
          500: '#1fb7eb',
          600: '#1992bc',
          700: '#136e8d',
          800: '#0c495e',
          900: '#06252f',
        },
        // Gradient colors
        gradient: {
          start: '#5de0e6',
          end: '#00167a',
        },
      },
    },
  },
  plugins: [],
}
