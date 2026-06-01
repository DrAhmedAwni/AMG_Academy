import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, textStyles, typography } from '../../theme';

export interface LockedLessonProps {
  lessonCount: number;
  message?: string;
}

export function LockedLesson({ lessonCount, message }: LockedLessonProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.lockIcon}>🔒</Text>
      </View>
      <Text style={styles.title}>Lessons Locked</Text>
      <Text style={styles.message}>
        {message ??
          `Complete payment to unlock all ${lessonCount} lessons. Backend payment state controls access.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: 16,
    backgroundColor: colors.surface.base + '60',
    borderWidth: 1,
    borderColor: colors.border.default + '40',
    borderStyle: 'dashed',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...textStyles.heading,
    fontSize: typography.size.lg,
    color: colors.text.secondary,
  },
  message: {
    ...textStyles.body,
    color: colors.text.muted,
    textAlign: 'center',
  },
  lockIcon: {
    fontSize: 28,
  },
});
