/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts,scss}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
              colors: {
                'brand-primary': '#1a1a1a',
                'brand-secondary': '#2d2d2d',
                'brand-accent': '#FFFFFF',
                'brand-background': '#000000',
                'brand-text': '#FFFFFF'
              },
      fontFamily: {
        heading: ['ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['ui-sans-serif', 'system-ui', 'sans-serif']
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      },
      animation: {
        'fade-in': 'fadeIn 600ms cubic-bezier(.16,.84,.32,1) both',
        float: 'float 6s ease-in-out infinite'
      },
      boxShadow: {
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)',
        '4xl': '0 45px 80px -12px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(255, 215, 0, 0.3)',
        'glow-lg': '0 0 30px rgba(255, 215, 0, 0.4)'
      }
    }
  },
  plugins: []
}

