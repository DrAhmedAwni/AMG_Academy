import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { Badge, GlassCard, StatusBadge } from '../ui';
import type { MobileCourse } from '../../features/courses/courses.api';
import { colors, radius, spacing, textStyles, typography } from '../../theme';

export interface CourseCardProps {
  course: MobileCourse;
  onPress?: (event: GestureResponderEvent) => void;
}

export function CourseCard({ course, onPress }: CourseCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${course.title}`}
      onPress={onPress}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      <GlassCard style={styles.card}>
        {course.thumbnailUrl ? (
          <Image
            source={{ uri: course.thumbnailUrl }}
            resizeMode="cover"
            style={styles.thumbnail}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{course.title[0]}</Text>
          </View>
        )}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.titleGroup}>
              <Text style={styles.kicker}>{course.category.name}</Text>
              <Text numberOfLines={2} style={styles.title}>{course.title}</Text>
            </View>
            <Text numberOfLines={2} style={styles.price}>
              {course.isFree ? 'Free' : `${course.price.toLocaleString()} ${course.currency}`}
            </Text>
          </View>

          <Text numberOfLines={1} style={styles.instructor}>By {course.instructor.name}</Text>
          <Text numberOfLines={3} style={styles.description}>
            {course.description}
          </Text>

          <View style={styles.badges}>
            <StatusBadge domain="course" status={course.status} />
            <Badge
              label={course.isFree ? 'Free' : 'Paid'}
              foreground={course.isFree ? colors.status.success : colors.accent.primary}
              background={course.isFree ? 'rgba(34, 197, 94, 0.14)' : 'rgba(84, 217, 232, 0.14)'}
              border={course.isFree ? 'rgba(34, 197, 94, 0.34)' : 'rgba(84, 217, 232, 0.34)'}
            />
            {course.isEnrolled ? (
              <Badge
                label="Enrolled"
                foreground={colors.accent.primary}
                background="rgba(84, 217, 232, 0.14)"
                border="rgba(84, 217, 232, 0.34)"
              />
            ) : null}
            {course.paymentStatus ? (
              <StatusBadge domain="payment" status={course.paymentStatus} />
            ) : null}
          </View>

          <View style={styles.footerRow}>
            <Text numberOfLines={1} style={styles.lessons}>
              {course.lessonCount} lessons · {Math.round(course.totalDuration / 60)}h
            </Text>
            {course.isEnrolled ? (
              <View style={styles.enrolledBadge}>
                <Text style={styles.enrolledText}>Enrolled</Text>
              </View>
            ) : null}
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  card: {
    gap: spacing.md,
    overflow: 'hidden',
    padding: 0,
  },
  thumbnail: {
    width: '100%',
    height: 136,
    backgroundColor: colors.surface.elevated,
  },
  placeholder: {
    width: '100%',
    height: 136,
    backgroundColor: colors.surface.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  placeholderText: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.muted,
  },
  content: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleGroup: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  kicker: {
    ...textStyles.caption,
    color: colors.accent.primary,
    textTransform: 'uppercase',
  },
  title: {
    ...textStyles.heading,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
  },
  price: {
    ...textStyles.label,
    maxWidth: 96,
    color: colors.text.primary,
    textAlign: 'right',
  },
  instructor: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  description: textStyles.body,
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  footerRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  lessons: {
    ...textStyles.caption,
    flex: 1,
  },
  enrolledBadge: {
    minHeight: 28,
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.accent.primary + '22',
    paddingHorizontal: spacing.sm,
  },
  enrolledText: {
    color: colors.accent.primary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
});
