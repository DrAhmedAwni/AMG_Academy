import type { Config } from 'tailwindcss';

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FFFFFF',
          action: '#54D9E8',
          secondary: '#94A3B8',
          highlight: '#D9DEE7',
        },
        surface: {
          main: '#020617',
          secondary: '#071114',
          DEFAULT: '#0F172A',
          elevated: '#111827',
          border: '#1E293B',
          strong: '#334155',
          card: '#0F172A',
          glass: 'rgba(15, 23, 42, 0.72)',
          overlay: '#030712',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
        status: {
          success: '#22C55E',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#38BDF8',
          pending: '#F59E0B',
        },
        accent: {
          DEFAULT: '#54D9E8',
          light: '#67E8F9',
          dark: '#0891B2',
          glow: 'rgba(84, 217, 232, 0.35)',
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
        cyan: {
          DEFAULT: '#54D9E8',
          light: '#67E8F9',
          dark: '#0891B2',
        },
      },
      fontFamily: {
        heading: ['var(--font-hanken-grotesk)', 'Hanken Grotesk', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      screens: {
        xs: '420px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 0 24px rgba(84, 217, 232, 0.22)',
        'glow-sm': '0 0 14px rgba(84, 217, 232, 0.14)',
        'glow-lg': '0 0 48px rgba(84, 217, 232, 0.28)',
        glass: '0 18px 48px rgba(0, 0, 0, 0.36)',
        card: '0 12px 34px rgba(0, 0, 0, 0.24)',
        elevated: '0 24px 60px rgba(0, 0, 0, 0.42)',
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
