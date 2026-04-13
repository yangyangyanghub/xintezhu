import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          25: '#fefefb',
          50: '#fdfbf7',
          100: '#f9f5ed',
        },
        indigo: {
          25: '#f5f3ff',
          50: '#eef2ff',
        },
        blue: {
          30: '#eff6ff',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'Satoshi', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-lg': '0 10px 40px -10px rgba(99, 102, 241, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'focus-ring': '0 0 0 3px rgba(99, 102, 241, 0.2), inset 0 0 0 1px rgba(99, 102, 241, 0.1)',
      },
      animation: {
        'float-in': 'floatIn 0.6s ease-out both',
        'stagger-1': 'staggerFade 0.5s ease-out 0.1s both',
        'stagger-2': 'staggerFade 0.5s ease-out 0.15s both',
        'stagger-3': 'staggerFade 0.5s ease-out 0.2s both',
        'stagger-4': 'staggerFade 0.5s ease-out 0.25s both',
        'stagger-5': 'staggerFade 0.5s ease-out 0.3s both',
        'stagger-6': 'staggerFade 0.5s ease-out 0.35s both',
        'stagger-7': 'staggerFade 0.5s ease-out 0.4s both',
        'shake': 'shake 0.5s ease-out',
        'check': 'checkIn 0.2s ease-out',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'pulse-slower': 'pulse 6s ease-in-out infinite',
      },
      keyframes: {
        floatIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        staggerFade: {
          '0%': {
            opacity: '0',
            transform: 'translateY(8px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        checkIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.3)',
          },
          '50%': {
            transform: 'scale(1.1)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;