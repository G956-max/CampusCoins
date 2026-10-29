/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        campus: {
          bg: '#F7FAF7',
          surface: '#FFFFFF',
          primary: '#168451',
          'primary-dark': '#116B42',
          soft: '#EAF6EE',
          text: '#17211B',
          muted: '#647168',
          border: '#E1E9E2',
          success: '#168451',
          warning: '#B7791F',
          danger: '#C43D3D',
          50: '#F7FAF7',
          100: '#EAF6EE',
          200: '#CBE7D4',
          300: '#8DD0A7',
          400: '#3EAA70',
          500: '#168451', // Primary green
          600: '#116B42', // Dark green hover
          700: '#0E5535',
          800: '#0B422A',
          900: '#072E1D',
        },
        coin: {
          400: '#D99B26',
          500: '#B7791F', // Warning / Gold coin accent
          600: '#975F12',
        },
        dark: {
          50: '#F7FAF7',
          100: '#EAF6EE',
          800: '#2A362F',
          900: '#17211B',
          950: '#0E1612',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'indigo-glow': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
