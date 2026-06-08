import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PaymentStatus } from '@amg/shared';
import { Header, Screen } from '../../src/components/layout';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/states';
import { Badge, Button, GlassCard, StatusBadge } from '../../src/components/ui';
import { ZoomableImage } from '../../src/components/media';
import { useEnrollmentsQuery } from '../../src/features/courses/courses.hooks';
import type { CourseEnrollmentSummary } from '../../src/features/courses/courses.api';
import { useQueryState } from '../../src/hooks/useQueryState';
import { colors, spacing, textStyles, typography } from '../../src/theme';

export default function MyCoursesScreen() {
  const router = useRouter();
  const enrollmentsQuery = useEnrollmentsQuery();
  const state = useQueryState(enrollmentsQuery, {
    isEmpty: (data) => data.data.length === 0,
  });

  const renderEnrollment = ({ item }: { item: CourseEnrollmentSummary }) => (
    <GlassCard style={styles.card}>
      <View style={styles.cardRow}>
        {item.course.thumbnailUrl ? (
          <ZoomableImage uri={item.course.thumbnailUrl} title={item.course.title} resizeMode="contain" style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{item.course.title[0]}</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <Badge
            label={item.course.category.name}
            foreground={colors.accent.primary}
            background="rgba(84, 217, 232, 0.14)"
            border="rgba(84, 217, 232, 0.34)"
          />
          <Text style={styles.courseTitle}>{item.course.title}</Text>
          <Text style={styles.meta}>
            {item.course.lessonCount} lessons ·{' '}
            {Math.round(item.course.totalDuration / 60)}h
          </Text>
          <View style={styles.badges}>
            <StatusBadge domain="enrollment" status={item.status as any} />
            <StatusBadge domain="payment" status={item.paymentStatus as any} />
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{item.progressPercent}% complete</Text>

          {item.paymentStatus === PaymentStatus.Pending && item.paymentId ? (
            <Button
              label="Pay Now"
              variant="primary"
              onPress={() => {
                router.push({
                  pathname: '/payments/[paymentId]',
                  params: { paymentId: item.paymentId },
                } as never);
              }}
            />
          ) : (
            <Button
              label="Continue"
              variant="secondary"
              onPress={() => {
                router.push({
                  pathname: '/courses/[courseId]',
                  params: { courseId: item.course.slug },
                } as never);
              }}
            />
          )}
        </View>
      </View>
    </GlassCard>
  );

  return (
    <Screen>
      <Header
        title="My Courses"
        subtitle="Continue courses you joined and track your progress."
        action={<Button label="Back" variant="secondary" onPress={() => router.back()} />}
      />

      {state.status === 'loading' ? (
        <LoadingState title="Loading enrollments" message="Fetching your enrolled courses." />
      ) : state.status === 'error' ? (
        <ErrorState
          title={state.error.title}
          message={state.error.message}
          onRetry={() => enrollmentsQuery.refetch()}
        />
      ) : state.status === 'empty' ? (
        <EmptyState
          icon="school-outline"
          title="No enrollments"
          message="Browse the course catalog and enroll in a course to get started."
        />
      ) : (
        <FlatList
          data={state.data.data}
          keyExtractor={(item) => item.id}
          renderItem={renderEnrollment}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={state.isRefreshing}
              onRefresh={() => enrollmentsQuery.refetch()}
              tintColor={colors.accent.primary}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.surface.elevated,
  },
  placeholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.surface.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.muted,
  },
  cardContent: {
    flex: 1,
    gap: spacing.xs,
  },
  courseTitle: {
    ...textStyles.heading,
    fontSize: typography.size.md,
  },
  meta: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface.elevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.accent.primary,
  },
  progressText: {
    ...textStyles.caption,
    color: colors.text.muted,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
});
