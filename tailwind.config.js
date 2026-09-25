/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom branding colors matching the REF dashboard palette
        ref: {
          blue: '#1E1E2F',
          gold: '#C08421',
          green: '#008751',
        },
      },
    },
  },
  plugins: [],
};