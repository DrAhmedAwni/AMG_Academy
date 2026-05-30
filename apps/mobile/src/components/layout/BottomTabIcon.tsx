import React, { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

export type BottomTabIconName = React.ComponentProps<typeof Ionicons>['name'];

export interface BottomTabIconProps {
  icon?: ReactNode;
  name?: BottomTabIconName;
  label: string;
  focused?: boolean;
}

export function BottomTabIcon({ icon, name, label, focused = false }: BottomTabIconProps) {
  const color = focused ? colors.accent.primary : colors.text.muted;

  return (
    <View style={[styles.container, focused ? styles.focused : null]}>
      {icon ?? (
        <Ionicons
          accessibilityLabel={`${label} tab`}
          color={color}
          name={name ?? 'ellipse-outline'}
          size={22}
        />
      )}
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
});
