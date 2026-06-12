/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      colors: {
        ink: '#1a1208',
        paper: '#faf6ef',
        amber: {
          DEFAULT: '#d97706',
          light: '#fef3c7',
        },
        ember: '#c2410c',
      },
    },
  },
  plugins: [],
}
