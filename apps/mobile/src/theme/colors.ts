export const colors = {
  background: {
    main: '#030712',
    secondary: '#07131F',
    raised: '#0B1628',
    overlay: 'rgba(2, 6, 23, 0.86)',
  },
  surface: {
    base: '#0D1829',
    elevated: '#111D31',
    raised: '#16243A',
    glass: 'rgba(16, 29, 49, 0.86)',
    muted: '#09111F',
    soft: 'rgba(255,255,255,0.045)',
  },
  accent: {
    primary: '#5EEAD4',
    primaryHover: '#99F6E4',
    glow: 'rgba(94, 234, 212, 0.22)',
    gold: '#F8C66D',
    goldMuted: 'rgba(248, 198, 109, 0.16)',
    purple: '#A78BFA',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#B6C2D1',
    muted: '#7B8AA0',
    inverse: '#020617',
  },
  border: {
    default: 'rgba(148, 163, 184, 0.18)',
    strong: 'rgba(184, 203, 225, 0.28)',
    focus: '#5EEAD4',
    highlight: 'rgba(255, 255, 255, 0.12)',
  },
  status: {
    success: '#34D399',
    warning: '#F8C66D',
    error: '#FB7185',
    info: '#38BDF8',
    neutral: '#A8B3C4',
  },
  interactive: {
    pressed: 'rgba(94, 234, 212, 0.14)',
    disabled: 'rgba(148, 163, 184, 0.28)',
  },
} as const;

export type MobileColors = typeof colors;
