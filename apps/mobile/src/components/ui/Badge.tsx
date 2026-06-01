import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

export interface BadgeProps {
  label: string;
  foreground?: string;
  background?: string;
  border?: string;
  style?: StyleProp<ViewStyle>;
}

export function Badge({
  label,
  foreground = colors.text.secondary,
  background = 'rgba(148, 163, 184, 0.14)',
  border = 'rgba(148, 163, 184, 0.3)',
  style,
}: BadgeProps) {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label}
      style={[
        styles.badge,
        { backgroundColor: background, borderColor: border },
        style,
      ]}
    >
      <Text style={[styles.label, { color: foreground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 28,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  label: {
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.bold,
  },
});
