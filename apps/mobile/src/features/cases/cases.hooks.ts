import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CaseFilters, CreateCaseData, AddCommentData } from './cases.api';
import * as casesApi from './cases.api';

export const caseQueryKeys = {
  all: ['cases'] as const,
  lists: () => [...caseQueryKeys.all, 'list'] as const,
  list: (filters: CaseFilters) => [...caseQueryKeys.lists(), filters] as const,
  detail: (caseId: string) => [...caseQueryKeys.all, 'detail', caseId] as const,
  categories: () => [...caseQueryKeys.all, 'categories'] as const,
  comments: (caseId: string) => [...caseQueryKeys.all, 'comments', caseId] as const,
};

export function useCasesQuery(filters: CaseFilters = {}) {
  return useQuery({
    queryKey: caseQueryKeys.list(filters),
    queryFn: () => casesApi.fetchCases(filters),
  });
}

export function useCaseQuery(caseId: string | undefined) {
  return useQuery({
    queryKey: caseQueryKeys.detail(caseId ?? ''),
    queryFn: () => casesApi.fetchCaseById(caseId ?? ''),
    enabled: Boolean(caseId),
  });
}

export function useCaseCategoriesQuery() {
  return useQuery({
    queryKey: caseQueryKeys.categories(),
    queryFn: () => casesApi.fetchCaseCategories(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCaseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCaseData) => casesApi.createCase(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: caseQueryKeys.all });
    },
  });
}

export function useToggleCaseUpvoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (caseId: string) => casesApi.toggleCaseUpvote(caseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: caseQueryKeys.all });
    },
  });
}

export function useToggleCaseBookmarkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (caseId: string) => casesApi.toggleCaseBookmark(caseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: caseQueryKeys.all });
    },
  });
}

export function useAddCaseCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: AddCommentData }) =>
      casesApi.addCaseComment(caseId, data),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: caseQueryKeys.comments(variables.caseId) });
      await queryClient.invalidateQueries({ queryKey: caseQueryKeys.detail(variables.caseId) });
    },
  });
}

export function useReportCaseCommentMutation() {
  return useMutation({
    mutationFn: (commentId: string) => casesApi.reportCaseComment(commentId),
  });
}
