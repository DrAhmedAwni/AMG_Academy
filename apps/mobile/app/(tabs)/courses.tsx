import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CourseCard } from '../../src/components/cards/CourseCard';
import { Header, Screen, SectionHeader } from '../../src/components/layout';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/states';
import { Button, GlassCard, TextField } from '../../src/components/ui';
import { useCoursesQuery, useEnrollmentsQuery } from '../../src/features/courses/courses.hooks';
import type { CourseFilters, MobileCourse } from '../../src/features/courses/courses.api';
import { useQueryState } from '../../src/hooks/useQueryState';
import { colors, layout, radius, spacing, textStyles, typography } from '../../src/theme';

type FreeFilter = 'all' | 'free' | 'paid';

const pageSize = 10;

export default function CoursesTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [freeFilter, setFreeFilter] = useState<FreeFilter>('all');
  const enrollmentsQuery = useEnrollmentsQuery();

  useEffect(() => {
    setPage(1);
  }, [freeFilter, search]);

  const filters = useMemo<CourseFilters>(
    () => ({
      page,
      limit: pageSize,
      search: search.trim() || undefined,
      isFree:
        freeFilter === 'all' ? undefined : freeFilter === 'free',
    }),
    [freeFilter, page, search],
  );

  const coursesQuery = useCoursesQuery(filters);
  const state = useQueryState(coursesQuery, {
    isEmpty: (data) => data.data.length === 0,
  });
  const meta = coursesQuery.data?.meta;
  const firstEnrollment = enrollmentsQuery.data?.data?.[0];

  const renderCourse = ({ item }: { item: MobileCourse }) => (
    <CourseCard
      course={item}
      onPress={() => {
        router.push({
          pathname: '/courses/[courseId]',
          params: { courseId: item.slug },
        } as never);
      }}
    />
  );

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <Header
        title="Courses"
        subtitle="Explore dental courses, workshops, and clinical learning programs."
        action={
          <Button
            label="My Courses"
            variant="secondary"
            size="sm"
            onPress={() => router.push('/courses/my-courses' as never)}
          />
        }
      />

      {firstEnrollment ? (
        <View style={styles.continueSection}>
          <SectionHeader title="Continue learning" />
          <GlassCard style={styles.continueCard}>
            <View style={styles.continueCopy}>
              <Text numberOfLines={1} style={styles.continueKicker}>In progress</Text>
              <Text numberOfLines={2} style={styles.continueTitle}>{firstEnrollment.course.title}</Text>
              <Text style={styles.continueMeta}>
                {firstEnrollment.course.lessonCount} lessons · {firstEnrollment.progressPercent}% complete
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, Math.max(0, firstEnrollment.progressPercent))}%` },
                  ]}
                />
              </View>
            </View>
            <Button
              label="Continue"
              size="sm"
              onPress={() => {
                router.push({
                  pathname: '/courses/[courseId]',
                  params: { courseId: firstEnrollment.course.slug },
                } as never);
              }}
            />
          </GlassCard>
        </View>
      ) : null}

      <SectionHeader title="All Courses" subtitle="Find courses by topic, price, or clinical focus." />

      <TextField
        label="Search courses"
        value={search}
        onChangeText={setSearch}
        placeholder="Search by title or topic"
        returnKeyType="search"
      />

      <View style={styles.filters}>
        {(['all', 'free', 'paid'] as const).map((opt) => (
          <Button
            key={opt}
            label={opt === 'all' ? 'All' : opt === 'free' ? 'Free' : 'Paid'}
            variant={freeFilter === opt ? 'primary' : 'secondary'}
            onPress={() => setFreeFilter(opt)}
            size="sm"
            style={styles.filterButton}
          />
        ))}
      </View>

      {state.status === 'loading' ? (
        <LoadingState title="Loading courses" message="Opening the AMG Academy course catalog." />
      ) : state.status === 'error' ? (
        <ErrorState
          title={state.error.title}
          message={state.error.message}
          onRetry={() => coursesQuery.refetch()}
        />
      ) : state.status === 'empty' ? (
        <EmptyState
          icon="school-outline"
          title="No courses found"
          message="Try another search or filter. New courses will appear here when they are available."
        />
      ) : (
        <FlatList
          data={state.data.data}
          keyExtractor={(item) => item.id}
          renderItem={renderCourse}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: layout.bottomTabContentPadding + insets.bottom },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={state.isRefreshing}
              onRefresh={() => coursesQuery.refetch()}
              tintColor={colors.accent.primary}
            />
          }
          onEndReached={() => {
            if (meta && page < meta.totalPages) {
              setPage((p) => p + 1);
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: spacing.md,
  },
  continueSection: {
    gap: spacing.sm,
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderColor: 'rgba(248, 198, 109, 0.26)',
    backgroundColor: 'rgba(31, 32, 43, 0.92)',
  },
  continueCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  continueKicker: {
    ...textStyles.caption,
    color: colors.accent.gold,
    textTransform: 'uppercase',
  },
  continueTitle: {
    color: colors.text.primary,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.bold,
  },
  continueMeta: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  progressBar: {
    height: 7,
    overflow: 'hidden',
    borderRadius: radius.pill,
    backgroundColor: colors.surface.raised,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent.gold,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  filterButton: {
    flexGrow: 1,
    minWidth: 84,
  },
  list: {
    gap: spacing.md,
  },
});
