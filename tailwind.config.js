/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5F8AFA',
        teal: '#17D9D4',
        nm: {
          bgTop: '#F6F6F6',
          bgBottom: '#EEEEEE',
          header: '#F8F9FA',
          text: '#1A1A1A',
          textSecondary: '#4A4A4A',
          border: '#E1E5E9',
          card: '#FFFFFF',
          accent: '#F0F4F8',
          cta: '#5F8AFA',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          logo: {
            grad: 'linear-gradient(135deg, #5F8AFA 0%, #17D9D4 100%)',
          }
        }
      },
      spacing: {
        '13': '3.25rem',
        '18': '4.5rem',
      },
      height: {
        '13': '3.25rem',
        '18': '4.5rem',
      },
      maxWidth: {
        'content': '1200px',
      },
      borderRadius: {
        'nm': '16px',
        'nm-sm': '8px',
        'nm-lg': '24px',
      },
      boxShadow: {
        'nm': '0px 4px 24px rgba(0, 0, 0, 0.08)',
        'nm-hover': '0px 8px 32px rgba(0, 0, 0, 0.12)',
        'nm-button': '0px 2px 8px rgba(95, 138, 250, 0.24)',
      },
      backgroundImage: {
        'nm-logo-grad': 'linear-gradient(135deg, #5F8AFA 0%, #17D9D4 100%)',
        'nm-card-grad': 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
      },
      fontFamily: {
        'sf': ['SF Pro', 'system-ui', 'sans-serif'],
      },
      lineHeight: {
        '12': '3rem',
      }
    },
  },
  plugins: [],
}
