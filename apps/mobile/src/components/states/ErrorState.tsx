import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../ui/Button';
import { colors, spacing, textStyles } from '../../theme';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again.',
  retryLabel = 'Try again',
  onRetry,
}: ErrorStateProps) {
  return (
    <View accessibilityRole="alert" style={styles.container}>
      <Text style={styles.kicker}>Error</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Button label={retryLabel} variant="secondary" onPress={onRetry} /> : null}
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
    color: colors.status.error,
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
