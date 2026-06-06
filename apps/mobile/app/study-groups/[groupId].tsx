import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Header, Screen, SectionHeader } from '../../src/components/layout';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/states';
import { Badge, Button, GlassCard, TextField } from '../../src/components/ui';
import {
  useStudyGroupQuery,
  useJoinStudyGroupMutation,
  useStudyGroupMessagesQuery,
  useSendStudyGroupMessageMutation,
  useStudyGroupFilesQuery,
  useStudyGroupSessionsQuery,
} from '../../src/features/study-groups/study-groups.hooks';
import type {
  StudyGroupMessage,
  StudyGroupFile,
  StudyGroupSession,
  StudyGroupType,
} from '../../src/features/study-groups/study-groups.api';
import { mapApiErrorToUi } from '../../src/lib/errors';
import { colors, radius, spacing, textStyles, typography } from '../../src/theme';

function resolveParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getTypeLabel(type: StudyGroupType): string {
  return type === 'STUDENT' ? 'Student-led' : 'Instructor-led';
}

function getJoinModeLabel(mode: string): string {
  return mode === 'OPEN' ? 'Open' : mode === 'INVITE_ONLY' ? 'Invite only' : 'Approval required';
}

function MessageItem({ item }: { item: StudyGroupMessage }) {
  return (
    <GlassCard style={msgStyles.card}>
      <View style={msgStyles.header}>
        <View style={msgStyles.avatar}>
          <Ionicons name="person" size={14} color={colors.accent.primary} />
        </View>
        <View style={msgStyles.meta}>
          <Text style={msgStyles.author}>{item.authorName}</Text>
          <Text style={msgStyles.date}>
            {new Date(item.createdAt).toLocaleDateString('en', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
      <Text style={msgStyles.content}>{item.content}</Text>
    </GlassCard>
  );
}

const msgStyles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.interactive.pressed,
  },
  meta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  author: {
    ...textStyles.label,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
  },
  date: textStyles.caption,
  content: textStyles.body,
});

function FileItem({ item }: { item: StudyGroupFile }) {
  const sizeMb = (item.fileSize / (1024 * 1024)).toFixed(1);
  return (
    <View style={fileStyles.row}>
      <Ionicons name="document-outline" size={20} color={colors.accent.primary} />
      <View style={fileStyles.info}>
        <Text numberOfLines={1} style={fileStyles.name}>{item.fileName}</Text>
        <Text style={fileStyles.meta}>{sizeMb} MB - Uploaded by {item.uploaderName}</Text>
      </View>
    </View>
  );
}

const fileStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  name: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  meta: textStyles.caption,
});

function SessionItem({ item }: { item: StudyGroupSession }) {
  return (
    <View style={sessionStyles.row}>
      <Ionicons name="calendar-outline" size={20} color={colors.accent.primary} />
      <View style={sessionStyles.info}>
        <Text numberOfLines={1} style={sessionStyles.title}>{item.title}</Text>
        <Text style={sessionStyles.date}>
          {new Date(item.startDate).toLocaleDateString('en', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
        {item.location ? <Text style={sessionStyles.location}>{item.location}</Text> : null}
      </View>
    </View>
  );
}

const sessionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  title: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  date: textStyles.caption,
  location: {
    ...textStyles.caption,
    color: colors.accent.primary,
  },
});

export default function StudyGroupDetailScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string | string[] }>();
  const id = resolveParam(groupId);

  const groupQuery = useStudyGroupQuery(id);
  const joinMutation = useJoinStudyGroupMutation();
  const messagesQuery = useStudyGroupMessagesQuery(id);
  const sendMessageMutation = useSendStudyGroupMessageMutation();
  const filesQuery = useStudyGroupFilesQuery(id);
  const sessionsQuery = useStudyGroupSessionsQuery(id);

  const [messageText, setMessageText] = useState('');

  if (!id) {
    return (
      <Screen>
        <ErrorState title="Missing group" message="This study group route is missing an identifier." />
      </Screen>
    );
  }

  if (groupQuery.isLoading) {
    return (
      <Screen>
        <LoadingState title="Loading group" message="Fetching study group details." />
      </Screen>
    );
  }

  if (groupQuery.isError || !groupQuery.data) {
    const error = groupQuery.error ? mapApiErrorToUi(groupQuery.error) : null;
    return (
      <Screen>
        <ErrorState
          title={error?.title ?? 'Group unavailable'}
          message={error?.message ?? 'The study group could not be loaded.'}
          onRetry={() => {
            void groupQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  const group = groupQuery.data;
  const joinError = joinMutation.error ? mapApiErrorToUi(joinMutation.error) : null;
  const messageError = sendMessageMutation.error ? mapApiErrorToUi(sendMessageMutation.error) : null;

  const handleSendMessage = () => {
    const trimmed = messageText.trim();
    if (!trimmed || !id) return;
    sendMessageMutation.mutate(
      { groupId: id, data: { content: trimmed } },
      {
        onSuccess: () => {
          setMessageText('');
        },
      },
    );
  };

  return (
    <Screen>
      <Header
        title="Study Group"
        subtitle={getTypeLabel(group.type)}
        action={<Button label="Back" variant="secondary" size="sm" onPress={() => router.back()} />}
      />

      <GlassCard style={styles.infoCard}>
        <Text style={styles.groupTitle}>{group.title}</Text>
        {group.courseTitle ? (
          <Text style={styles.courseLink}>Course: {group.courseTitle}</Text>
        ) : null}
        <Text style={styles.groupDescription}>{group.description}</Text>
        <View style={styles.metaRow}>
          <Badge label={getTypeLabel(group.type)} />
          <Badge
            label={getJoinModeLabel(group.joinMode)}
            foreground={group.joinMode === 'OPEN' ? colors.status.success : colors.status.warning}
          />
          <View style={styles.memberStat}>
            <Ionicons name="people-outline" size={14} color={colors.text.muted} />
            <Text style={styles.memberText}>{group.memberCount} members</Text>
          </View>
        </View>
        <Button
          label="Join Group"
          variant="primary"
          size="sm"
          loading={joinMutation.isPending}
          onPress={() => {
            void joinMutation.mutateAsync(id).then(() => groupQuery.refetch());
          }}
        />
        {joinError ? (
          <Text style={styles.errorText}>{joinError.message}</Text>
        ) : null}
      </GlassCard>

      <View style={styles.section}>
        <SectionHeader title="Messages" />
        <View style={styles.messageInput}>
          <TextField
            label="Message"
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            error={messageError?.message}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
          />
          <Button
            label="Send"
            variant="primary"
            size="sm"
            loading={sendMessageMutation.isPending}
            disabled={messageText.trim().length === 0}
            onPress={handleSendMessage}
          />
        </View>
      </View>

      {messagesQuery.isLoading ? (
        <LoadingState title="Loading messages" />
      ) : messagesQuery.data && messagesQuery.data.length > 0 ? (
        <FlatList
          scrollEnabled={false}
          data={[...messagesQuery.data].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: StudyGroupMessage }) => <MessageItem item={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <EmptyState title="No messages yet" message="Start the conversation in this study group." />
      )}

      <View style={styles.section}>
        <SectionHeader title="Files" />
      </View>
      {filesQuery.isLoading ? (
        <LoadingState title="Loading files" />
      ) : filesQuery.data && filesQuery.data.length > 0 ? (
        filesQuery.data.map((file) => <FileItem key={file.id} item={file} />)
      ) : (
        <EmptyState title="No files shared" message="Group members haven't uploaded any files yet." />
      )}

      <View style={styles.section}>
        <SectionHeader title="Sessions" />
      </View>
      {sessionsQuery.isLoading ? (
        <LoadingState title="Loading sessions" />
      ) : sessionsQuery.data && sessionsQuery.data.length > 0 ? (
        sessionsQuery.data.map((session) => <SessionItem key={session.id} item={session} />)
      ) : (
        <EmptyState title="No sessions scheduled" message="No study sessions have been created yet." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    gap: spacing.md,
  },
  groupTitle: {
    ...textStyles.heading,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
  },
  courseLink: {
    ...textStyles.label,
    color: colors.accent.primary,
  },
  groupDescription: {
    ...textStyles.body,
    lineHeight: typography.lineHeight.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  memberStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginLeft: 'auto',
  },
  memberText: {
    ...textStyles.caption,
    color: colors.text.muted,
  },
  errorText: {
    ...textStyles.caption,
    color: colors.status.error,
    textAlign: 'center',
  },
  section: {
    gap: spacing.sm,
  },
  messageInput: {
    gap: spacing.sm,
  },
  separator: {
    height: spacing.sm,
  },
});

