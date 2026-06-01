import React, { type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

export interface IconButtonProps {
  icon?: ReactNode;
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({ icon, label, onPress, disabled = false, style }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      {icon ?? <Text style={styles.fallbackIcon}>{label.slice(0, 1).toUpperCase()}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
    padding: spacing.xs,
  },
  fallbackIcon: {
    color: colors.accent.primary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
  pressed: {
    backgroundColor: colors.interactive.pressed,
  },
  disabled: {
    opacity: 0.48,
  },
});
