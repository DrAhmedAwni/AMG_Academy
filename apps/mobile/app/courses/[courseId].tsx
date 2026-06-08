import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PaymentStatus } from '@amg/shared';
import { Header, Screen, SectionHeader } from '../../src/components/layout';
import { ErrorState, LoadingState } from '../../src/components/states';
import { Badge, Button, GlassCard, StatusBadge } from '../../src/components/ui';
import { LessonRow } from '../../src/features/courses/LessonRow';
import { LockedLesson } from '../../src/features/courses/LockedLesson';
import {
  getEnrollmentPaymentRedirect,
  isLessonLocked,
  useCourseQuery,
  useEnrollInCourseMutation,
  useUpdateProgressMutation,
} from '../../src/features/courses/courses.hooks';
import type { LessonSummary } from '../../src/features/courses/courses.api';
import { mapApiErrorToUi } from '../../src/lib/errors';
import { colors, radius, spacing, textStyles, typography } from '../../src/theme';

function resolveParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function CourseDetailScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId?: string | string[] }>();
  const courseSlug = resolveParam(courseId);
  const courseQuery = useCourseQuery(courseSlug);
  const enrollMutation = useEnrollInCourseMutation();
  const progressMutation = useUpdateProgressMutation();
  const enrollmentError = enrollMutation.error ? mapApiErrorToUi(enrollMutation.error) : null;

  if (!courseSlug) {
    return (
      <Screen>
        <ErrorState title="Missing course" message="This course route is missing an identifier." />
      </Screen>
    );
  }

  if (courseQuery.isLoading) {
    return (
      <Screen>
        <LoadingState title="Loading course" message="Fetching course details from AMG Academy." />
      </Screen>
    );
  }

  if (courseQuery.isError || !courseQuery.data) {
    const error = courseQuery.error ? mapApiErrorToUi(courseQuery.error) : null;
    return (
      <Screen>
        <ErrorState
          title={error?.title ?? 'Course unavailable'}
          message={error?.message ?? 'The course could not be loaded.'}
          onRetry={() => { void courseQuery.refetch(); }}
        />
      </Screen>
    );
  }

  const course = courseQuery.data;
  const lessonsLocked = isLessonLocked(course);
  const firstLessonId = course.lessons[0]?.id;

  const renderLesson = ({ item: lesson }: { item: LessonSummary }) => {
    const isCompleted = false;
    const isPreviewLesson = lesson.id === firstLessonId;
    const isLocked = lessonsLocked && !isPreviewLesson;
    return (
      <LessonRow
        lesson={lesson}
        isLocked={isLocked}
        isCompleted={isCompleted}
        onPress={() => {
          if (!isLocked && lesson.videoId) {
            router.push({
              pathname: '/courses/lesson/[lessonId]',
              params: { lessonId: lesson.videoId },
            } as never);
          }
        }}
      />
    );
  };

  return (
    <Screen>
      <Header
        title="Course"
        subtitle="Review lessons, enrollment, and course access."
        action={<Button label="Back" variant="secondary" onPress={() => router.back()} />}
      />

      {enrollmentError ? (
        <GlassCard style={styles.errorCard}>
          <Text style={styles.errorTitle}>{enrollmentError.title}</Text>
          <Text style={styles.errorMessage}>{enrollmentError.message}</Text>
        </GlassCard>
      ) : null}

      {course.thumbnailUrl ? (
        <Image source={{ uri: course.thumbnailUrl }} resizeMode="contain" style={styles.hero} />
      ) : (
        <View style={styles.heroPlaceholder}>
          <Text style={styles.heroPlaceholderText}>{course.title.slice(0, 1).toUpperCase()}</Text>
        </View>
      )}

      <GlassCard style={styles.card}>
        <View style={styles.titleRow}>
          <View style={styles.titleGroup}>
            <Badge
              label={course.category.name}
              foreground={colors.accent.primary}
              background="rgba(84, 217, 232, 0.14)"
              border="rgba(84, 217, 232, 0.34)"
            />
            <Text style={styles.title}>{course.title}</Text>
          </View>
          <Text style={styles.price}>
            {course.isFree ? 'Free' : `${course.price.toLocaleString()} ${course.currency}`}
          </Text>
        </View>

        <Text style={styles.instructor}>By {course.instructor.name}</Text>
        <Text style={styles.body}>{course.description}</Text>

        <View style={styles.metaRow}>
          <StatusBadge domain="course" status={course.status as any} />
          {course.paymentStatus ? (
            <StatusBadge domain="payment" status={course.paymentStatus as any} />
          ) : null}
          {course.isEnrolled ? (
            <StatusBadge domain="enrollment" status="active" />
          ) : null}
        </View>

        {course.isEnrolled && course.paymentStatus === PaymentStatus.Pending ? (
          <Button
            label="Continue to Payment"
            variant="primary"
            onPress={() => {
              if (course.paymentId) {
                router.push({
                  pathname: '/payments/[paymentId]',
                  params: { paymentId: course.paymentId },
                } as never);
              }
            }}
          />
        ) : course.isEnrolled ? null : (
          <Button
            label={course.isFree ? 'Enroll for Free' : 'Enroll Now'}
            variant="primary"
            loading={enrollMutation.isPending}
            onPress={() => {
              void enrollMutation.mutateAsync(course.id).then((enrollment) => {
                const redirect = getEnrollmentPaymentRedirect(enrollment);
                if (redirect) {
                  router.push({
                    pathname: redirect.pathname,
                    params: { paymentId: redirect.paymentId },
                  } as never);
                  return;
                }
                void courseQuery.refetch();
              }).catch(() => {});
            }}
          />
        )}
      </GlassCard>

      <SectionHeader
        title={`Course Content (${course.lessonCount} lessons)`}
        subtitle={lessonsLocked ? 'The first lesson is available as a preview. Enroll to unlock the full course.' : undefined}
      />

      {lessonsLocked ? (
        <LockedLesson
          lessonCount={course.lessonCount}
          message="The first lesson is open to preview. Enroll or complete payment to unlock the remaining lessons."
        />
      ) : null}
      <FlatList
        data={course.lessons}
        keyExtractor={(item) => item.id}
        renderItem={renderLesson}
        contentContainerStyle={styles.list}
        scrollEnabled={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...textStyles.heading,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
  },
  price: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  instructor: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  body: textStyles.body,
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  errorCard: {
    gap: spacing.xs,
  },
  errorTitle: textStyles.label,
  errorMessage: textStyles.body,
  hero: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
  },
  heroPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.surface.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  heroPlaceholderText: {
    ...textStyles.title,
    color: colors.accent.primary,
    fontSize: 48,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
