/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@ionic/react/**/*.js'
  ],
  theme: {
    extend: {
      // Buraya özel renk, font, spacing eklenebilir
    },
  },
  plugins: [],
};

