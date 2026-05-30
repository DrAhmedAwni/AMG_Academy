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

export interface ButtonProps {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const selectedVariant = variantStyles[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
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
        <Text style={[styles.text, selectedVariant.text]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  text: {
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.bold,
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
  },
});

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
