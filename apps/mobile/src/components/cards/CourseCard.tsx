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
        <View style={styles.mediaFrame}>
        {course.thumbnailUrl ? (
          <Image
            source={{ uri: course.thumbnailUrl }}
            resizeMode="cover"
            style={styles.thumbnail}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{course.title[0]}</Text>
            <Text style={styles.placeholderLabel}>AMG Course</Text>
          </View>
        )}
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>
              {course.isFree ? 'Free' : `${course.price.toLocaleString()} ${course.currency}`}
            </Text>
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.titleGroup}>
              <Text style={styles.kicker}>{course.category.name}</Text>
              <Text numberOfLines={2} style={styles.title}>{course.title}</Text>
            </View>
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
            <View style={styles.metaPill}>
              <Text numberOfLines={1} style={styles.lessons}>
                {course.lessonCount} lessons
              </Text>
            </View>
            <View style={styles.metaPill}>
              <Text numberOfLines={1} style={styles.lessons}>
                {Math.round(course.totalDuration / 60)}h
              </Text>
            </View>
            {course.isEnrolled ? (
              <View style={styles.enrolledBadge}>
                <Text style={styles.enrolledText}>Continue</Text>
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
    overflow: 'hidden',
    padding: 0,
    borderColor: colors.border.strong,
  },
  mediaFrame: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.surface.elevated,
  },
  thumbnail: {
    width: '100%',
    height: 156,
    backgroundColor: colors.surface.elevated,
  },
  placeholder: {
    width: '100%',
    height: 156,
    backgroundColor: colors.background.raised,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    gap: spacing.xs,
  },
  placeholderText: {
    width: 64,
    height: 64,
    borderRadius: 32,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: colors.accent.goldMuted,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.accent.gold,
  },
  placeholderLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  pricePill: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    minHeight: 34,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.highlight,
    backgroundColor: colors.background.overlay,
    paddingHorizontal: spacing.md,
  },
  priceText: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  content: {
    gap: spacing.md,
    padding: spacing.lg,
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
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaPill: {
    minHeight: 32,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface.soft,
    paddingHorizontal: spacing.sm,
  },
  lessons: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  enrolledBadge: {
    minHeight: 32,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.md,
  },
  enrolledText: {
    color: colors.text.inverse,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
});
