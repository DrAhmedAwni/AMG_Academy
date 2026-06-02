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
  const color = focused ? colors.text.inverse : colors.text.muted;

  return (
    <View style={[styles.container, focused ? styles.focused : null]}>
      {icon ?? (
        <Ionicons
          accessibilityLabel={`${label} tab`}
          color={color}
          name={name ?? 'ellipse-outline'}
          size={focused ? 21 : 20}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 38,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    padding: spacing.xs,
  },
  focused: {
    backgroundColor: colors.accent.primary,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
});
