import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CourseCard } from '../../src/components/cards/CourseCard';
import { Header, Screen } from '../../src/components/layout';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/states';
import { Button, TextField } from '../../src/components/ui';
import { useCoursesQuery } from '../../src/features/courses/courses.hooks';
import type { CourseFilters, MobileCourse } from '../../src/features/courses/courses.api';
import { useQueryState } from '../../src/hooks/useQueryState';
import { colors, spacing } from '../../src/theme';

type FreeFilter = 'all' | 'free' | 'paid';

const pageSize = 10;

export default function CoursesTab() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [freeFilter, setFreeFilter] = useState<FreeFilter>('all');

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
        subtitle="Browse courses using backend catalog state."
        action={
          <Button
            label="My Courses"
            variant="secondary"
            onPress={() => router.push('/courses/my-courses' as never)}
          />
        }
      />

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
          />
        ))}
      </View>

      {state.status === 'loading' ? (
        <LoadingState title="Loading courses" message="Fetching course catalog from AMG Academy." />
      ) : state.status === 'error' ? (
        <ErrorState
          title={state.error.title}
          message={state.error.message}
          onRetry={() => coursesQuery.refetch()}
        />
      ) : state.status === 'empty' ? (
        <EmptyState title="No courses" message="No courses match your current filters." />
      ) : (
        <FlatList
          data={state.data.data}
          keyExtractor={(item) => item.id}
          renderItem={renderCourse}
          contentContainerStyle={styles.list}
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
    gap: spacing.md,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
});
