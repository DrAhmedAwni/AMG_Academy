import React from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import type { LessonSummary } from './courses.api';
import { colors, radius, spacing, textStyles } from '../../theme';

export interface LessonRowProps {
  lesson: LessonSummary;
  isLocked: boolean;
  isCompleted: boolean;
  onPress?: (event: GestureResponderEvent) => void;
}

export function LessonRow({ lesson, isLocked, isCompleted, onPress }: LessonRowProps) {
  const durationMinutes = Math.round(lesson.duration / 60);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${isLocked ? 'Locked: ' : ''}${lesson.title}`}
      disabled={isLocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        isLocked && styles.lockedContainer,
        pressed && !isLocked ? styles.pressed : null,
      ]}
    >
      <View style={styles.iconContainer}>
        <Text style={[
          styles.iconText,
          isCompleted && { color: colors.status.success },
          isLocked && { color: colors.text.muted },
          !isCompleted && !isLocked && { color: colors.accent.primary },
        ]}>
          {isCompleted ? '✓' : isLocked ? '🔒' : '▶'}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, isLocked && styles.lockedText]}
            numberOfLines={1}
          >
            {lesson.title}
          </Text>
          <Text style={styles.duration}>{durationMinutes} min</Text>
        </View>
        {lesson.description ? (
          <Text style={[styles.description, isLocked && styles.lockedText]} numberOfLines={1}>
            {lesson.description}
          </Text>
        ) : null}
      </View>

      <View style={styles.orderBadge}>
        <Text style={styles.orderText}>{lesson.orderIndex}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface.base + '80',
    borderWidth: 1,
    borderColor: colors.border.default + '50',
  },
  lockedContainer: {
    opacity: 0.55,
  },
  pressed: {
    backgroundColor: colors.surface.elevated + 'CC',
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...textStyles.label,
    color: colors.text.primary,
    flex: 1,
  },
  lockedText: {
    color: colors.text.muted,
  },
  duration: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  description: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  orderBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.surface.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.muted,
  },
  iconText: {
    fontSize: 22,
  },
});
