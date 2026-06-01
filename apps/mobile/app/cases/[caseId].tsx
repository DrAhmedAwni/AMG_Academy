import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Header, Screen, SectionHeader } from '../../src/components/layout';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/states';
import { Badge, Button, GlassCard, TextField } from '../../src/components/ui';
import {
  useCaseQuery,
  useToggleCaseUpvoteMutation,
  useToggleCaseBookmarkMutation,
  useAddCaseCommentMutation,
  useReportCaseCommentMutation,
} from '../../src/features/cases/cases.hooks';
import type { CaseComment } from '../../src/features/cases/cases.api';
import { mapApiErrorToUi } from '../../src/lib/errors';
import { colors, radius, spacing, textStyles, typography } from '../../src/theme';

function resolveParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function CommentItem({
  comment,
  onReport,
}: {
  comment: CaseComment;
  onReport: (id: string) => void;
}) {
  return (
    <GlassCard style={commentStyles.card}>
      <View style={commentStyles.header}>
        <View style={commentStyles.avatar}>
          <Ionicons name="person" size={16} color={colors.accent.primary} />
        </View>
        <View style={commentStyles.authorGroup}>
          <Text style={commentStyles.author}>{comment.authorName}</Text>
          <Text style={commentStyles.date}>
            {new Date(comment.createdAt).toLocaleDateString('en', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
      <Text style={commentStyles.content}>{comment.content}</Text>
      <View style={commentStyles.actions}>
        <Button
          label="Report"
          variant="ghost"
          size="sm"
          onPress={() => onReport(comment.id)}
        />
      </View>
    </GlassCard>
  );
}

const commentStyles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.interactive.pressed,
  },
  authorGroup: {
    flex: 1,
    gap: spacing.xxs,
  },
  author: {
    ...textStyles.label,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
  },
  date: textStyles.caption,
  content: textStyles.body,
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default function CaseDetailScreen() {
  const router = useRouter();
  const { caseId } = useLocalSearchParams<{ caseId?: string | string[] }>();
  const id = resolveParam(caseId);

  const caseQuery = useCaseQuery(id);
  const upvoteMutation = useToggleCaseUpvoteMutation();
  const bookmarkMutation = useToggleCaseBookmarkMutation();
  const commentMutation = useAddCaseCommentMutation();
  const reportMutation = useReportCaseCommentMutation();

  const [commentText, setCommentText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!id) {
    return (
      <Screen>
        <ErrorState title="Missing case" message="This case route is missing an identifier." />
      </Screen>
    );
  }

  if (caseQuery.isLoading) {
    return (
      <Screen>
        <LoadingState title="Loading case" message="Fetching case details." />
      </Screen>
    );
  }

  if (caseQuery.isError || !caseQuery.data) {
    const error = caseQuery.error ? mapApiErrorToUi(caseQuery.error) : null;
    return (
      <Screen>
        <ErrorState
          title={error?.title ?? 'Case unavailable'}
          message={error?.message ?? 'The case could not be loaded.'}
          onRetry={() => {
            void caseQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  const caseItem = caseQuery.data;
  const commentError = commentMutation.error ? mapApiErrorToUi(commentMutation.error) : null;

  const handleSubmitComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    commentMutation.mutate(
      { caseId: id, data: { content: trimmed } },
      {
        onSuccess: () => {
          setCommentText('');
          setSubmitted(true);
          void caseQuery.refetch();
        },
      },
    );
  };

  return (
    <Screen>
      <Header
        title="Case Discussion"
        subtitle={caseItem.category.name}
        action={<Button label="Back" variant="secondary" size="sm" onPress={() => router.back()} />}
      />

      <GlassCard style={styles.detailCard}>
        {caseItem.images.length > 0 ? (
          <Image source={{ uri: caseItem.images[0] }} resizeMode="cover" style={styles.image} />
        ) : null}
        <Text style={styles.title}>{caseItem.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.author}>By {caseItem.authorName}</Text>
          <Text style={styles.date}>
            {new Date(caseItem.createdAt).toLocaleDateString('en', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
        <Text style={styles.description}>{caseItem.description}</Text>
        {caseItem.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {caseItem.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <View style={styles.actionRow}>
          <Button
            label={`Upvote (${caseItem.upvoteCount})`}
            variant={caseItem.isUpvoted ? 'primary' : 'secondary'}
            size="sm"
            loading={upvoteMutation.isPending}
            onPress={() => {
              void upvoteMutation.mutateAsync(id).then(() => caseQuery.refetch());
            }}
          />
          <Button
            label={`Bookmark (${caseItem.bookmarkCount})`}
            variant={caseItem.isBookmarked ? 'primary' : 'secondary'}
            size="sm"
            loading={bookmarkMutation.isPending}
            onPress={() => {
              void bookmarkMutation.mutateAsync(id).then(() => caseQuery.refetch());
            }}
          />
        </View>
      </GlassCard>

      <View style={styles.section}>
        <SectionHeader title="Comments" subtitle={`${caseItem.commentCount} total`} />
        <View style={styles.commentForm}>
          <TextField
            label="Add a comment"
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Share your thoughts on this case..."
            multiline
            numberOfLines={3}
            error={commentError?.message}
          />
          <Button
            label="Send"
            variant="primary"
            size="sm"
            loading={commentMutation.isPending}
            disabled={commentText.trim().length === 0}
            onPress={handleSubmitComment}
          />
        </View>
        {submitted && !commentError ? (
          <View style={styles.submittedBanner}>
            <Ionicons name="checkmark-circle" size={16} color={colors.status.success} />
            <Text style={styles.submittedText}>Comment posted</Text>
          </View>
        ) : null}
      </View>

      {caseItem.commentCount === 0 ? (
        <EmptyState
          title="No comments yet"
          message="Be the first to share your perspective on this case."
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  detailCard: {
    gap: spacing.md,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
    backgroundColor: colors.surface.elevated,
  },
  title: {
    ...textStyles.heading,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  author: textStyles.label,
  date: textStyles.caption,
  description: {
    ...textStyles.body,
    lineHeight: typography.lineHeight.lg,
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
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  commentForm: {
    gap: spacing.sm,
  },
  submittedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  submittedText: {
    ...textStyles.caption,
    color: colors.status.success,
  },
});
