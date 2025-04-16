/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'press-start': ['Press Start 2P', 'monospace'],
      },
      colors: {
        'royal': '#001F2D',
        'royal-blue': '#0A2472',
        'royal-blue-light': '#1E3A8A',
        'royal-blue-dark': '#0A2472',
        'banana': '#FFD700',
        'banana-light': '#FFDF33',
        'banana-dark': '#CCAC00',
        'bg-dark': '#0F172A',
        'bg-darker': '#070E1B',
      },
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '24px 24px',
      },
    },
  },
  plugins: [],
} 