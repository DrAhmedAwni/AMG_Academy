import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, type ButtonProps } from '../ui/Button';
import { colors, spacing, textStyles } from '../../theme';

export interface SuccessStateProps {
  title: string;
  message: string;
  action?: Pick<ButtonProps, 'label' | 'onPress' | 'accessibilityLabel'>;
}

export function SuccessState({ title, message, action }: SuccessStateProps) {
  return (
    <View accessibilityRole="summary" style={styles.container}>
      <Text style={styles.kicker}>Success</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action ? <Button {...action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  kicker: {
    ...textStyles.caption,
    color: colors.status.success,
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
