import type { TextStyle, ViewStyle } from 'react-native';
import { colors } from './colors';

export const typography = {
  fontFamily: {
    heading: 'Inter',
    body: 'Inter',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const shadows = {
  glow: {
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 8,
  } satisfies ViewStyle,
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 6,
  } satisfies ViewStyle,
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 3,
  } satisfies ViewStyle,
} as const;

export const textStyles = {
  title: {
    color: colors.text.primary,
    fontSize: typography.size.xxl,
    lineHeight: typography.lineHeight.xxl,
    fontWeight: typography.weight.bold,
  } satisfies TextStyle,
  heading: {
    color: colors.text.primary,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.weight.bold,
  } satisfies TextStyle,
  body: {
    color: colors.text.secondary,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.regular,
  } satisfies TextStyle,
  label: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semibold,
  } satisfies TextStyle,
  caption: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.medium,
  } satisfies TextStyle,
} as const;

export const layout = {
  screenPadding: spacing.md,
  minTapTarget: 44,
  maxContentWidth: 720,
} as const;

export const tokens = {
  typography,
  spacing,
  radius,
  shadows,
  textStyles,
  layout,
} as const;

export type MobileTokens = typeof tokens;
