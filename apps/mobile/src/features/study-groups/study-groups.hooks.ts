import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  StudyGroupFilters,
  CreateStudyGroupData,
  SendMessageData,
  CreateSessionData,
} from './study-groups.api';
import * as studyGroupsApi from './study-groups.api';

export const studyGroupQueryKeys = {
  all: ['study-groups'] as const,
  lists: () => [...studyGroupQueryKeys.all, 'list'] as const,
  list: (filters: StudyGroupFilters) => [...studyGroupQueryKeys.lists(), filters] as const,
  detail: (groupId: string) => [...studyGroupQueryKeys.all, 'detail', groupId] as const,
  messages: (groupId: string) => [...studyGroupQueryKeys.all, 'messages', groupId] as const,
  files: (groupId: string) => [...studyGroupQueryKeys.all, 'files', groupId] as const,
  sessions: (groupId: string) => [...studyGroupQueryKeys.all, 'sessions', groupId] as const,
};

export function useStudyGroupsQuery(filters: StudyGroupFilters = {}) {
  return useQuery({
    queryKey: studyGroupQueryKeys.list(filters),
    queryFn: () => studyGroupsApi.fetchStudyGroups(filters),
  });
}

export function useStudyGroupQuery(groupId: string | undefined) {
  return useQuery({
    queryKey: studyGroupQueryKeys.detail(groupId ?? ''),
    queryFn: () => studyGroupsApi.fetchStudyGroupById(groupId ?? ''),
    enabled: Boolean(groupId),
  });
}

export function useCreateStudyGroupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStudyGroupData) => studyGroupsApi.createStudyGroup(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studyGroupQueryKeys.all });
    },
  });
}

export function useJoinStudyGroupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => studyGroupsApi.joinStudyGroup(groupId),
    onSuccess: async (_data, groupId) => {
      await queryClient.invalidateQueries({ queryKey: studyGroupQueryKeys.detail(groupId) });
      await queryClient.invalidateQueries({ queryKey: studyGroupQueryKeys.lists() });
    },
  });
}

export function useStudyGroupMessagesQuery(groupId: string | undefined) {
  return useQuery({
    queryKey: studyGroupQueryKeys.messages(groupId ?? ''),
    queryFn: () => studyGroupsApi.fetchStudyGroupMessages(groupId ?? ''),
    enabled: Boolean(groupId),
  });
}

export function useSendStudyGroupMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: SendMessageData }) =>
      studyGroupsApi.sendStudyGroupMessage(groupId, data),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: studyGroupQueryKeys.messages(variables.groupId) });
    },
  });
}

export function useStudyGroupFilesQuery(groupId: string | undefined) {
  return useQuery({
    queryKey: studyGroupQueryKeys.files(groupId ?? ''),
    queryFn: () => studyGroupsApi.fetchStudyGroupFiles(groupId ?? ''),
    enabled: Boolean(groupId),
  });
}

export function useStudyGroupSessionsQuery(groupId: string | undefined) {
  return useQuery({
    queryKey: studyGroupQueryKeys.sessions(groupId ?? ''),
    queryFn: () => studyGroupsApi.fetchStudyGroupSessions(groupId ?? ''),
    enabled: Boolean(groupId),
  });
}

export function useCreateStudyGroupSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: CreateSessionData }) =>
      studyGroupsApi.createStudyGroupSession(groupId, data),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: studyGroupQueryKeys.sessions(variables.groupId) });
    },
  });
}
