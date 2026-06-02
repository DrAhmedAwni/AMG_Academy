import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows, spacing, textStyles } from '../../theme';

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
      <View style={styles.skeletonStack}>
        <View style={styles.skeletonLong} />
        <View style={styles.skeletonShort} />
      </View>
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
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
    padding: spacing.xl,
    ...shadows.soft,
  },
  skeletonStack: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  skeletonLong: {
    width: '72%',
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface.raised,
  },
  skeletonShort: {
    width: '46%',
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface.elevated,
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
