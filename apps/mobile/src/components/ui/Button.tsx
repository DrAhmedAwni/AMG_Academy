import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  size = 'md',
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const selectedVariant = variantStyles[variant];
  const selectedSize = sizeStyles[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selectedSize.container,
        selectedVariant.container,
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.text.inverse : colors.accent.primary}
          size="small"
        />
      ) : (
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.84}
          numberOfLines={1}
          style={[styles.text, selectedSize.text, selectedVariant.text]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
  },
  md: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sm: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
  mdText: {
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
  },
  smText: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
  },
  primary: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
    ...shadows.glow,
  },
  primaryText: {
    color: colors.text.inverse,
  },
  secondary: {
    backgroundColor: colors.surface.elevated,
    borderColor: colors.border.strong,
  },
  secondaryText: {
    color: colors.text.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.border.default,
  },
  ghostText: {
    color: colors.accent.primary,
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    borderColor: 'rgba(239, 68, 68, 0.44)',
  },
  dangerText: {
    color: colors.status.error,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.48,
    backgroundColor: colors.surface.muted,
    borderColor: colors.border.default,
  },
});

const sizeStyles = {
  md: {
    container: styles.md,
    text: styles.mdText,
  },
  sm: {
    container: styles.sm,
    text: styles.smText,
  },
} as const;

const variantStyles = {
  primary: {
    container: styles.primary,
    text: styles.primaryText,
  },
  secondary: {
    container: styles.secondary,
    text: styles.secondaryText,
  },
  ghost: {
    container: styles.ghost,
    text: styles.ghostText,
  },
  danger: {
    container: styles.danger,
    text: styles.dangerText,
  },
} as const;
