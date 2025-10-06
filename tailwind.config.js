/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./app/*.{js,jsx,ts,tsx}*,",  
    "./props/**/*.{js,jsx,ts,tsx}",   "./*.{js,jsx,ts,tsx}",   
],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
    theme: {
      extend: {
        colors: {
          'primary-light': '#FF6B35',
          'primary-dark': '#FF7847',
          'secondary-light': '#FFD166',
          'secondary-dark': '#FFDC8F',
          'background-light': '#FFFDF9',
          'background-dark': '#1B1B1F',
          'surface-light': '#FFFFFF',
          'surface-dark': '#2A2A2E',
          'text-primary-light': '#1A1A1A',
          'text-primary-dark': '#FFFFFF',
          'text-secondary-light': '#555555',
          'text-secondary-dark': '#CCCCCC',
          'border-light': '#E2E2E2',
          'border-dark': '#3A3A3A',
          'success-light': '#3BB273',
          'success-dark': '#4CCB89',
          'warning-light': '#FF9F1C',
          'warning-dark': '#FFB627',
          'error-light': '#EF476F',
          'error-dark': '#FF6F91',
        },
      },
    },
  variants: {
    extend: {
      borderRadius: ['sm', 'md', 'lg'], // habilitar variantes responsivas
    },
  },
  plugins: [],
  screens: {
    sm: '320px',
    md: '768px',
    lg: '1024px',
  },
}