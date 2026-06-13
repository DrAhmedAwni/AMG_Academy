import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, type ButtonProps } from '../ui/Button';
import { colors, radius, shadows, spacing, textStyles } from '../../theme';

export interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  action?: Pick<ButtonProps, 'label' | 'onPress' | 'accessibilityLabel'>;
}

export function EmptyState({ title, message, icon = 'sparkles-outline', action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconFrame}>
        <Ionicons name={icon} size={24} color={colors.accent.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action ? <Button variant="secondary" {...action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
    padding: spacing.xl,
    ...shadows.soft,
  },
  iconFrame: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.36)',
    backgroundColor: colors.interactive.pressed,
  },
  title: {
    ...textStyles.heading,
    textAlign: 'center',
  },
  message: {
    ...textStyles.body,
    textAlign: 'center',
  },
});
