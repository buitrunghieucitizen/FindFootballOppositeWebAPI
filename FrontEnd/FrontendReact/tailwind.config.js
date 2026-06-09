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
        primary: '#D4AF37',
        'primary-dark': '#B8960C',
        'primary-light': '#FFF3C4',
        secondary: '#8B1538',
        danger: '#E63946',
        warning: '#F59E0B',
        'wc-navy': {
          50: '#E8EAF0',
          100: '#C5CAD9',
          200: '#9DA5BF',
          300: '#7580A5',
          400: '#576491',
          500: '#38487E',
          600: '#324176',
          700: '#2B386B',
          800: '#232F61',
          900: '#161F4E',
          950: '#0A0E1A',
        },
        'wc-gold': {
          50: '#FFF9E6',
          100: '#FFF3C4',
          200: '#FFEA9E',
          300: '#FFE178',
          400: '#FFD85C',
          500: '#D4AF37',
          600: '#B8960C',
          700: '#9A7D0A',
          800: '#7C6408',
          900: '#5E4B06',
        },
        'wc-red': {
          50: '#FDE8EA',
          100: '#FAC5CB',
          200: '#F49DA8',
          300: '#EE7585',
          400: '#E9586B',
          500: '#E63946',
          600: '#D32F3B',
          700: '#B82530',
          800: '#9D1C26',
          900: '#8B1538',
        },
        'wc-teal': {
          400: '#22D3EE',
          500: '#00B4D8',
          600: '#0096B4',
        },
        'wc-green': {
          400: '#40916C',
          500: '#2D6A4F',
          600: '#1B4332',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'stadium-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        'golden-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'trophy-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'glow-ring': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(212, 175, 55, 0.6)' },
        },
      },
      animation: {
        'stadium-pulse': 'stadium-pulse 4s ease-in-out infinite',
        'golden-shimmer': 'golden-shimmer 3s ease-in-out infinite',
        'trophy-float': 'trophy-float 3s ease-in-out infinite',
        'glow-ring': 'glow-ring 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
