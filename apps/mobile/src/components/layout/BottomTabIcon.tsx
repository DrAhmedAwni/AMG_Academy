import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

export interface BottomTabIconProps {
  icon?: ReactNode;
  label: string;
  focused?: boolean;
}

export function BottomTabIcon({ icon, label, focused = false }: BottomTabIconProps) {
  return (
    <View style={[styles.container, focused ? styles.focused : null]}>
      {icon ?? <Text style={[styles.fallback, focused ? styles.fallbackFocused : null]}>{label[0]}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    padding: spacing.xs,
  },
  focused: {
    backgroundColor: colors.interactive.pressed,
  },
  fallback: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  fallbackFocused: {
    color: colors.accent.primary,
  },
});
