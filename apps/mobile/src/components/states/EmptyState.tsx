import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, type ButtonProps } from '../ui/Button';
import { spacing, textStyles } from '../../theme';

export interface EmptyStateProps {
  title: string;
  message: string;
  action?: Pick<ButtonProps, 'label' | 'onPress' | 'accessibilityLabel'>;
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
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
    padding: spacing.xl,
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
