import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../ui/Button';
import { colors, radius, shadows, spacing, textStyles } from '../../theme';

export interface SessionExpiredStateProps {
  onSignIn?: () => void;
}

export function SessionExpiredState({ onSignIn }: SessionExpiredStateProps) {
  return (
    <View accessibilityRole="alert" style={styles.container}>
      <Text style={styles.kicker}>Session expired</Text>
      <Text style={styles.title}>Session expired</Text>
      <Text style={styles.message}>
        Your session expired for security reasons. Please sign in again.
      </Text>
      {onSignIn ? <Button label="Sign in again" onPress={onSignIn} /> : null}
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
