import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../ui/Button';
import { colors, spacing, textStyles } from '../../theme';

export interface SessionExpiredStateProps {
  onSignIn?: () => void;
}

export function SessionExpiredState({ onSignIn }: SessionExpiredStateProps) {
  return (
    <View accessibilityRole="alert" style={styles.container}>
      <Text style={styles.kicker}>Session expired</Text>
      <Text style={styles.title}>Sign in again</Text>
      <Text style={styles.message}>
        Your secure AMG Academy session ended. Please sign in again to continue.
      </Text>
      {onSignIn ? <Button label="Sign in" onPress={onSignIn} /> : null}
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
    color: colors.accent.primary,
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
