import { Appearance } from 'react-native';

export const lightColors = {
  background: {
    main: '#050505',
    secondary: '#0B0B0B',
    raised: '#111111',
    overlay: 'rgba(0, 0, 0, 0.78)',
  },
  surface: {
    base: '#111111',
    elevated: '#1B1B1B',
    raised: '#171717',
    glass: '#111111',
    muted: '#242424',
    soft: '#191919',
  },
  accent: {
    primary: '#D4AF37',
    primaryHover: '#F1CF67',
    glow: 'rgba(212, 175, 55, 0.22)',
    gold: '#D4AF37',
    goldMuted: 'rgba(212, 175, 55, 0.14)',
    purple: '#0B3A53',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#D1D5DB',
    muted: '#8F949D',
    inverse: '#050505',
  },
  border: {
    default: '#2B2B2B',
    strong: '#3B3B3B',
    focus: '#D4AF37',
    highlight: 'rgba(212, 175, 55, 0.28)',
  },
  status: {
    success: '#5ED38A',
    warning: '#D4AF37',
    error: '#FF6B7A',
    info: '#79B8D8',
    neutral: '#D1D5DB',
  },
  interactive: {
    pressed: 'rgba(212, 175, 55, 0.16)',
    disabled: 'rgba(143, 148, 157, 0.24)',
  },
} as const;

export const darkColors = {
  background: {
    main: '#050505',
    secondary: '#0B0B0B',
    raised: '#111111',
    overlay: 'rgba(0, 0, 0, 0.78)',
  },
  surface: {
    base: '#111111',
    elevated: '#1B1B1B',
    raised: '#171717',
    glass: '#111111',
    muted: '#242424',
    soft: '#191919',
  },
  accent: {
    primary: '#D4AF37',
    primaryHover: '#F1CF67',
    glow: 'rgba(212, 175, 55, 0.22)',
    gold: '#D4AF37',
    goldMuted: 'rgba(212, 175, 55, 0.14)',
    purple: '#0B3A53',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#D1D5DB',
    muted: '#8F949D',
    inverse: '#050505',
  },
  border: {
    default: '#2B2B2B',
    strong: '#3B3B3B',
    focus: '#D4AF37',
    highlight: 'rgba(212, 175, 55, 0.28)',
  },
  status: {
    success: '#5ED38A',
    warning: '#D4AF37',
    error: '#FF6B7A',
    info: '#79B8D8',
    neutral: '#D1D5DB',
  },
  interactive: {
    pressed: 'rgba(212, 175, 55, 0.16)',
    disabled: 'rgba(143, 148, 157, 0.24)',
  },
} as const;

export const colors = Appearance.getColorScheme() === 'dark' ? darkColors : lightColors;

export type MobileColors = typeof colors;
