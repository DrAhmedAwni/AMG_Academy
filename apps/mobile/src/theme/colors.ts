export const colors = {
  background: {
    main: '#020617',
    secondary: '#071114',
    overlay: 'rgba(2, 6, 23, 0.86)',
  },
  surface: {
    base: '#0F172A',
    elevated: '#111827',
    glass: 'rgba(15, 23, 42, 0.72)',
    muted: '#0B1220',
  },
  accent: {
    primary: '#54D9E8',
    primaryHover: '#67E8F9',
    glow: 'rgba(84, 217, 232, 0.35)',
    purple: '#8B5CF6',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    muted: '#64748B',
    inverse: '#020617',
  },
  border: {
    default: '#1E293B',
    strong: '#334155',
    focus: '#54D9E8',
  },
  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#38BDF8',
    neutral: '#94A3B8',
  },
  interactive: {
    pressed: 'rgba(84, 217, 232, 0.16)',
    disabled: 'rgba(148, 163, 184, 0.28)',
  },
} as const;

export type MobileColors = typeof colors;
