import type { Config } from 'tailwindcss';

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FFFFFF',
          action: '#D4AF37',
          secondary: 'rgba(255,255,255,0.60)',
          highlight: 'rgba(255,255,255,0.12)',
        },
        surface: {
          main: '#111111',
          secondary: '#161616',
          DEFAULT: '#111111',
          elevated: '#1D1D1D',
          border: 'rgba(255,255,255,0.08)',
          strong: 'rgba(255,255,255,0.12)',
          card: '#1D1D1D',
          glass: 'rgba(29,29,29,0.88)',
          overlay: 'rgba(0,0,0,0.60)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: 'rgba(255,255,255,0.70)',
          muted: 'rgba(255,255,255,0.48)',
        },
        status: {
          success: '#22C55E',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#38BDF8',
          pending: '#F59E0B',
        },
        accent: {
          DEFAULT: '#D4AF37',
          light: '#E5C76B',
          dark: '#B8960F',
          glow: 'rgba(212,175,55,0.30)',
        },
        success: '#22C55E',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#38BDF8',
        pending: '#F59E0B',
        purple: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E5C76B',
          dark: '#B8960F',
        },
        cyan: {
          DEFAULT: '#D4AF37',
          light: '#E5C76B',
          dark: '#B8960F',
        },
      },
      fontFamily: {
        heading: ['var(--font-manrope)', 'Manrope', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      screens: {
        xs: '420px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 0 32px rgba(212,175,55,0.18)',
        'glow-sm': '0 0 18px rgba(212,175,55,0.12)',
        'glow-lg': '0 0 56px rgba(212,175,55,0.22)',
        glass: '0 12px 40px rgba(0,0,0,0.32)',
        card: '0 8px 24px rgba(0,0,0,0.18)',
        elevated: '0 16px 48px rgba(0,0,0,0.28)',
      },
      backdropBlur: {
        glass: '16px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
};

export default preset;
