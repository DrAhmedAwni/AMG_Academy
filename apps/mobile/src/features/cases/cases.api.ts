import { apiRequest } from '../../lib/api';
import type { PaginationMeta } from '../../types/api';

export interface ApiPage<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface CaseCategory {
  id: string;
  name: string;
  slug: string;
}

export interface CaseComment {
  id: string;
  caseId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  isReported: boolean;
}

export interface CaseItem {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  category: CaseCategory;
  tags: string[];
  images: string[];
  upvoteCount: number;
  commentCount: number;
  bookmarkCount: number;
  isUpvoted: boolean;
  isBookmarked: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
}

export interface CreateCaseData {
  title: string;
  description: string;
  categoryId: string;
  tags: string[];
}

export interface AddCommentData {
  content: string;
}

export interface CreateCaseCategoryData {
  name: string;
}

export async function fetchCases(filters: CaseFilters = {}): Promise<ApiPage<CaseItem>> {
  return apiRequest<ApiPage<CaseItem>>('/cases', {
    method: 'GET',
    query: filters as Record<string, string | number | boolean | null | undefined>,
  });
}

export async function fetchCaseById(id: string): Promise<CaseItem> {
  return apiRequest<CaseItem>(`/cases/${encodeURIComponent(id)}`, {
    method: 'GET',
  });
}

export async function createCase(data: CreateCaseData): Promise<CaseItem> {
  return apiRequest<CaseItem>('/cases', {
    method: 'POST',
    body: data,
  });
}

export async function fetchCaseCategories(): Promise<CaseCategory[]> {
  const response = await apiRequest<ApiPage<CaseCategory>>('/case-categories', {
    method: 'GET',
  });
  return response.data;
}

export async function createCaseCategory(data: CreateCaseCategoryData): Promise<CaseCategory> {
  return apiRequest<CaseCategory>('/case-categories', {
    method: 'POST',
    body: data,
  });
}

export async function toggleCaseUpvote(id: string): Promise<{ upvoted: boolean; upvoteCount: number }> {
  return apiRequest<{ upvoted: boolean; upvoteCount: number }>(`/cases/${encodeURIComponent(id)}/upvote`, {
    method: 'POST',
  });
}

export async function toggleCaseBookmark(id: string): Promise<{ bookmarked: boolean; bookmarkCount: number }> {
  return apiRequest<{ bookmarked: boolean; bookmarkCount: number }>(`/cases/${encodeURIComponent(id)}/bookmark`, {
    method: 'POST',
  });
}

export async function addCaseComment(caseId: string, data: AddCommentData): Promise<CaseComment> {
  return apiRequest<CaseComment>(`/cases/${encodeURIComponent(caseId)}/comments`, {
    method: 'POST',
    body: data,
  });
}

export async function reportCaseComment(commentId: string): Promise<void> {
  await apiRequest<void>(`/case-comments/${encodeURIComponent(commentId)}/report`, {
    method: 'POST',
  });
}
