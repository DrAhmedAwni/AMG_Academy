import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header, Screen } from '../../src/components/layout';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/states';
import { Badge, Button, GlassCard, TextField } from '../../src/components/ui';
import { useCasesQuery, useCaseCategoriesQuery } from '../../src/features/cases/cases.hooks';
import type { CaseFilters, CaseItem } from '../../src/features/cases/cases.api';
import { useQueryState } from '../../src/hooks/useQueryState';
import { useAuth } from '../../src/lib/auth';
import { colors, layout, radius, spacing, textStyles, typography } from '../../src/theme';

const pageSize = 10;
type ViewFilter = 'latest' | 'popular' | 'unanswered' | 'mine';

function CaseCard({ item, onPress }: { item: CaseItem; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open case ${item.title}`}
      onPress={onPress}
      style={({ pressed }) => [pressed ? cardStyles.pressed : null]}
    >
      <GlassCard style={cardStyles.card}>
        <View style={cardStyles.headerRow}>
          <Text numberOfLines={2} style={cardStyles.title}>{item.title}</Text>
          <Badge label={item.category.name} />
        </View>
        <Text numberOfLines={3} style={cardStyles.description}>{item.description}</Text>
        {item.tags.length > 0 ? (
          <View style={cardStyles.tagRow}>
            {item.tags.map((tag) => (
              <View key={tag} style={cardStyles.tag}>
                <Text style={cardStyles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <View style={cardStyles.metaRow}>
          <Text style={cardStyles.author}>by {item.authorName}</Text>
          <View style={cardStyles.stats}>
            <View style={cardStyles.stat}>
              <Ionicons name="arrow-up" size={14} color={item.isUpvoted ? colors.accent.primary : colors.text.muted} />
              <Text style={cardStyles.statText}>{item.upvoteCount}</Text>
            </View>
            <View style={cardStyles.stat}>
              <Ionicons name="chatbubble-outline" size={14} color={colors.text.muted} />
              <Text style={cardStyles.statText}>{item.commentCount}</Text>
            </View>
            <View style={cardStyles.stat}>
              <Ionicons name="bookmark-outline" size={14} color={item.isBookmarked ? colors.accent.primary : colors.text.muted} />
              <Text style={cardStyles.statText}>{item.bookmarkCount}</Text>
            </View>
          </View>
        </View>
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
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    ...textStyles.heading,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
  },
  description: {
    ...textStyles.body,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  tagText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  author: {
    ...textStyles.caption,
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    flexShrink: 0,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  statText: {
    ...textStyles.caption,
    color: colors.text.muted,
  },
});

export default function CasesTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('latest');

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, viewFilter]);

  const filters = useMemo<CaseFilters>(
    () => ({
      page,
      limit: pageSize,
      search: search.trim() || undefined,
      category: selectedCategory,
    }),
    [page, search, selectedCategory],
  );

  const casesQuery = useCasesQuery(filters);
  const categoriesQuery = useCaseCategoriesQuery();
  const state = useQueryState(casesQuery, {
    isEmpty: (data) => data.data.length === 0,
  });
  const meta = casesQuery.data?.meta;
  const categories = categoriesQuery.data ?? [];
  const visibleCases = useMemo(() => {
    const data = casesQuery.data?.data ?? [];

    if (viewFilter === 'popular') {
      return [...data].sort((left, right) => right.upvoteCount - left.upvoteCount);
    }

    if (viewFilter === 'unanswered') {
      return data.filter((item) => item.commentCount === 0);
    }

    if (viewFilter === 'mine') {
      return data.filter((item) => item.authorId === user?.id);
    }

    return data;
  }, [casesQuery.data?.data, user?.id, viewFilter]);

  const renderCase = ({ item }: { item: CaseItem }) => (
    <CaseCard
      item={item}
      onPress={() => {
        router.push({
          pathname: '/cases/[caseId]',
          params: { caseId: item.id },
        } as never);
      }}
    />
  );

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <Header
        title="Case Discussion"
        subtitle="Explore clinical cases and join the conversation."
        action={
          <Button
            label="Submit"
            variant="secondary"
            size="sm"
            onPress={() => router.push('/cases/submit' as never)}
          />
        }
      />

      <TextField
        label="Search cases"
        value={search}
        onChangeText={setSearch}
        placeholder="Search by title, tag, or description"
        returnKeyType="search"
      />

      <View style={styles.filters}>
        {([
          ['latest', 'Latest'],
          ['popular', 'Popular'],
          ['unanswered', 'Unanswered'],
          ['mine', 'My Cases'],
        ] as const).map(([key, label]) => (
          <Button
            key={key}
            label={label}
            variant={viewFilter === key ? 'primary' : 'secondary'}
            onPress={() => setViewFilter(key)}
            size="sm"
            style={styles.filterButton}
          />
        ))}
      </View>

      <View style={styles.filters}>
        <Button
          label="All"
          variant={selectedCategory === undefined ? 'primary' : 'secondary'}
          onPress={() => setSelectedCategory(undefined)}
          size="sm"
          style={styles.filterButton}
        />
        {categories.slice(0, 5).map((cat) => (
          <Button
            key={cat.id}
            label={cat.name}
            variant={selectedCategory === cat.slug ? 'primary' : 'secondary'}
            onPress={() => setSelectedCategory(cat.slug)}
            size="sm"
            style={styles.filterButton}
          />
        ))}
      </View>

      {state.status === 'loading' ? (
        <LoadingState title="Loading cases" message="Fetching the latest case discussions." />
      ) : state.status === 'error' ? (
        <ErrorState
          title={state.error.title}
          message={state.error.message}
          onRetry={() => {
            void casesQuery.refetch();
          }}
        />
      ) : state.status === 'empty' ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="No cases yet"
          message="Approved case discussions will appear here. Submit a case for admin review or adjust your filters."
          action={{
            label: 'Submit a case',
            onPress: () => router.push('/cases/submit' as never),
          }}
        />
      ) : visibleCases.length === 0 ? (
        <EmptyState
          icon="filter-outline"
          title="No cases in this view"
          message="Try another view, category, or search term."
          action={{
            label: 'Submit a case',
            onPress: () => router.push('/cases/submit' as never),
          }}
        />
      ) : (
        <FlatList
          data={visibleCases}
          keyExtractor={(item) => item.id}
          renderItem={renderCase}
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              tintColor={colors.accent.primary}
              refreshing={state.isRefreshing}
              onRefresh={() => {
                void casesQuery.refetch();
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
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  filterButton: {
    flexGrow: 1,
    minWidth: 92,
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
