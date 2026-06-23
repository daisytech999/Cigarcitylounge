import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047',
          400: '#facc15', 500: '#B8860B', 600: '#a0720a', 700: '#8a5e08',
          800: '#713e05', 900: '#5a2e03',
        },
        charcoal: {
          50: '#f6f6f6', 100: '#e7e7e7', 200: '#d1d1d1', 300: '#b0b0b0',
          400: '#888888', 500: '#6d6d6d', 600: '#5d5d5d', 700: '#4f4f4f',
          800: '#454545', 900: '#3d3d3d', 950: '#1a1a1a',
        },
        leather: {
          100: '#f5e6d3', 200: '#e8c9a0', 300: '#d4a96a', 400: '#c4874a',
          500: '#8B4513', 600: '#7a3b10', 700: '#65300d',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #B8860B 0%, #DAA520 50%, #B8860B 100%)',
      },
    },
  },
  plugins: [],
}

export default config
