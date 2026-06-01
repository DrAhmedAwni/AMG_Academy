import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, textStyles } from '../../theme';

export interface LoadingStateProps {
  title?: string;
  message?: string;
}

export function LoadingState({
  title = 'Loading',
  message = 'Please wait while AMG Academy gets this ready.',
}: LoadingStateProps) {
  return (
    <View accessibilityRole="progressbar" style={styles.container}>
      <ActivityIndicator color={colors.accent.primary} size="large" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
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
