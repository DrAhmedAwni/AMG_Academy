import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header, Screen } from '../../src/components/layout';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/states';
import { Badge, Button, GlassCard, TextField } from '../../src/components/ui';
import { useStudyGroupsQuery } from '../../src/features/study-groups/study-groups.hooks';
import type { StudyGroup, StudyGroupFilters, StudyGroupType } from '../../src/features/study-groups/study-groups.api';
import { useQueryState } from '../../src/hooks/useQueryState';
import { colors, layout, spacing, textStyles, typography } from '../../src/theme';

const pageSize = 10;

type TypeFilter = 'all' | StudyGroupType;

function getTypeLabel(type: StudyGroupType): string {
  return type === 'student' ? 'Student-led' : 'Instructor-led';
}

function getJoinModeLabel(mode: string): string {
  return mode === 'open' ? 'Open' : 'Approval required';
}

function GroupCard({ item, onPress }: { item: StudyGroup; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open study group ${item.title}`}
      onPress={onPress}
      style={({ pressed }) => [pressed ? cardStyles.pressed : null]}
    >
      <GlassCard style={cardStyles.card}>
        <View style={cardStyles.headerRow}>
          <View style={cardStyles.titleGroup}>
            <Text numberOfLines={2} style={cardStyles.title}>{item.title}</Text>
            <Text numberOfLines={2} style={cardStyles.description}>{item.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
        </View>
        <View style={cardStyles.metaRow}>
          <Badge label={getTypeLabel(item.type)} />
          <Badge
            label={getJoinModeLabel(item.joinMode)}
            foreground={item.joinMode === 'open' ? colors.status.success : colors.status.warning}
          />
          <View style={cardStyles.memberCount}>
            <Ionicons name="people-outline" size={14} color={colors.text.muted} />
            <Text style={cardStyles.memberText}>{item.memberCount}</Text>
          </View>
        </View>
        {item.courseTitle ? (
          <Text numberOfLines={1} style={cardStyles.course}>Course: {item.courseTitle}</Text>
        ) : null}
      </GlassCard>
    </Pressable>
  );
}

const cardStyles = StyleSheet.create({
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  card: {
    gap: spacing.md,
    borderColor: colors.border.strong,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  titleGroup: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  title: {
    ...textStyles.heading,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
  },
  description: {
    ...textStyles.body,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderRadius: 999,
    backgroundColor: colors.surface.soft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  memberText: {
    ...textStyles.caption,
    color: colors.text.muted,
  },
  course: {
    ...textStyles.caption,
    color: colors.accent.primary,
  },
});

export default function StudyGroupsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  const filters = useMemo<StudyGroupFilters>(
    () => ({
      page,
      limit: pageSize,
      search: search.trim() || undefined,
      type: typeFilter === 'all' ? undefined : typeFilter,
    }),
    [page, search, typeFilter],
  );

  const groupsQuery = useStudyGroupsQuery(filters);
  const state = useQueryState(groupsQuery, {
    isEmpty: (data) => data.data.length === 0,
  });
  const meta = groupsQuery.data?.meta;

  const renderGroup = ({ item }: { item: StudyGroup }) => (
    <GroupCard
      item={item}
      onPress={() => {
        router.push({
          pathname: '/study-groups/[groupId]',
          params: { groupId: item.id },
        } as never);
      }}
    />
  );

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <Header
        title="Study Groups"
        subtitle="Join live peer groups and instructor-led course circles."
        action={
          <Button
            label="Create"
            variant="secondary"
            size="sm"
            onPress={() => router.push('/study-groups/create' as never)}
          />
        }
      />

      <TextField
        label="Search groups"
        value={search}
        onChangeText={setSearch}
        placeholder="Search by title or description"
        returnKeyType="search"
      />

      <View style={styles.filters}>
        <Button
          label="All"
          variant={typeFilter === 'all' ? 'primary' : 'secondary'}
          onPress={() => setTypeFilter('all')}
          size="sm"
          style={styles.filterButton}
        />
        <Button
          label="Student"
          variant={typeFilter === 'student' ? 'primary' : 'secondary'}
          onPress={() => setTypeFilter('student')}
          size="sm"
          style={styles.filterButton}
        />
        <Button
          label="Instructor"
          variant={typeFilter === 'instructor_led' ? 'primary' : 'secondary'}
          onPress={() => setTypeFilter('instructor_led')}
          size="sm"
          style={styles.filterButton}
        />
      </View>

      {state.status === 'loading' ? (
        <LoadingState title="Loading groups" message="Finding active study groups." />
      ) : state.status === 'error' ? (
        <ErrorState
          title={state.error.title}
          message={state.error.message}
          onRetry={() => {
            void groupsQuery.refetch();
          }}
        />
      ) : state.status === 'empty' ? (
        <EmptyState
          icon="people-outline"
          title="No study groups yet"
          message="Create a group or adjust your filters to find student-led and instructor-led circles."
          action={{
            label: 'Create a group',
            onPress: () => router.push('/study-groups/create' as never),
          }}
        />
      ) : (
        <FlatList
          data={state.data.data}
          keyExtractor={(item) => item.id}
          renderItem={renderGroup}
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              tintColor={colors.accent.primary}
              refreshing={state.isRefreshing}
              onRefresh={() => {
                void groupsQuery.refetch();
              }}
            />
          }
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: layout.bottomTabContentPadding + insets.bottom },
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListFooterComponent={
            meta && meta.totalPages > 1 ? (
              <View style={styles.pagination}>
                <Button
                  label="Previous"
                  variant="secondary"
                  disabled={page <= 1}
                  onPress={() => setPage((current) => Math.max(1, current - 1))}
                  style={styles.pageButton}
                />
                <Button
                  label="Next"
                  variant="secondary"
                  disabled={page >= meta.totalPages}
                  onPress={() => setPage((current) => current + 1)}
                  style={styles.pageButton}
                />
              </View>
            ) : null
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: spacing.sm,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  filterButton: {
    flex: 1,
  },
  listContent: {},
  separator: {
    height: spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  pageButton: {
    flex: 1,
  },
});
