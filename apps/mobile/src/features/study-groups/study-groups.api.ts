import { apiRequest } from '../../lib/api';
import type { PaginationMeta } from '../../types/api';

export interface ApiPage<T> {
  data: T[];
  meta: PaginationMeta;
}

export type StudyGroupType = 'student' | 'instructor_led';
export type JoinMode = 'open' | 'approval';

export interface StudyGroup {
  id: string;
  title: string;
  description: string;
  type: StudyGroupType;
  joinMode: JoinMode;
  courseId: string | null;
  courseTitle: string | null;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGroupMessage {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  content: string;
  createdAt: string;
}

export interface StudyGroupFile {
  id: string;
  groupId: string;
  uploaderId: string;
  uploaderName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface StudyGroupSession {
  id: string;
  groupId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string | null;
  createdAt: string;
}

export interface StudyGroupFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: StudyGroupType;
  joinMode?: JoinMode;
}

export interface CreateStudyGroupData {
  title: string;
  description: string;
  type: StudyGroupType;
  joinMode: JoinMode;
  courseId?: string;
}

export interface SendMessageData {
  content: string;
}

export interface CreateSessionData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
}

export async function fetchStudyGroups(filters: StudyGroupFilters = {}): Promise<ApiPage<StudyGroup>> {
  return apiRequest<ApiPage<StudyGroup>>('/study-groups', {
    method: 'GET',
    query: filters as Record<string, string | number | boolean | null | undefined>,
  });
}

export async function createStudyGroup(data: CreateStudyGroupData): Promise<StudyGroup> {
  return apiRequest<StudyGroup>('/study-groups', {
    method: 'POST',
    body: data,
  });
}

export async function fetchStudyGroupById(id: string): Promise<StudyGroup> {
  return apiRequest<StudyGroup>(`/study-groups/${encodeURIComponent(id)}`, {
    method: 'GET',
  });
}

export async function joinStudyGroup(id: string): Promise<{ joined: boolean }> {
  return apiRequest<{ joined: boolean }>(`/study-groups/${encodeURIComponent(id)}/join`, {
    method: 'POST',
  });
}

export async function fetchStudyGroupMessages(id: string): Promise<StudyGroupMessage[]> {
  return apiRequest<StudyGroupMessage[]>(`/study-groups/${encodeURIComponent(id)}/messages`, {
    method: 'GET',
  });
}

export async function sendStudyGroupMessage(groupId: string, data: SendMessageData): Promise<StudyGroupMessage> {
  return apiRequest<StudyGroupMessage>(`/study-groups/${encodeURIComponent(groupId)}/messages`, {
    method: 'POST',
    body: data,
  });
}

export async function fetchStudyGroupFiles(id: string): Promise<StudyGroupFile[]> {
  return apiRequest<StudyGroupFile[]>(`/study-groups/${encodeURIComponent(id)}/files`, {
    method: 'GET',
  });
}

export async function fetchStudyGroupSessions(id: string): Promise<StudyGroupSession[]> {
  return apiRequest<StudyGroupSession[]>(`/study-groups/${encodeURIComponent(id)}/sessions`, {
    method: 'GET',
  });
}

export async function createStudyGroupSession(groupId: string, data: CreateSessionData): Promise<StudyGroupSession> {
  return apiRequest<StudyGroupSession>(`/study-groups/${encodeURIComponent(groupId)}/sessions`, {
    method: 'POST',
    body: data,
  });
}
