/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {

      boxShadow: {
        'bottom': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      keyframes: {
        slideInLeft: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      },
      animation: {
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
      }
    
  },
},
  plugins: [],
}