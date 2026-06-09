import { apiRequest } from '../../lib/api';
import type { PaginationMeta } from '../../types/api';

export interface ApiPage<T> {
  data: T[];
  meta: PaginationMeta;
}

export type StudyGroupType = 'STUDENT' | 'INSTRUCTOR_LED';
export type JoinMode = 'OPEN' | 'REQUEST' | 'INVITE_ONLY';

export interface StudyGroup {
  id: string;
  title: string;
  description: string;
  type: StudyGroupType;
  joinMode: JoinMode;
  status: 'PENDING_REVIEW' | 'ACTIVE' | 'REJECTED' | 'ARCHIVED';
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

function normalizeMessage(raw: any): StudyGroupMessage {
  return {
    id: raw.id,
    groupId: raw.groupId,
    authorId: raw.authorId,
    authorName: raw.authorName ?? raw.author?.name ?? 'Member',
    authorAvatarUrl: raw.authorAvatarUrl ?? raw.author?.avatarUrl ?? null,
    content: raw.content ?? raw.body ?? '',
    createdAt: raw.createdAt,
  };
}

function normalizeFile(raw: any): StudyGroupFile {
  return {
    id: raw.id,
    groupId: raw.groupId,
    uploaderId: raw.uploaderId ?? raw.uploadedById,
    uploaderName: raw.uploaderName ?? raw.uploadedBy?.name ?? 'Member',
    fileName: raw.fileName,
    fileSize: raw.fileSize ?? raw.sizeBytes ?? 0,
    mimeType: raw.mimeType,
    createdAt: raw.createdAt,
  };
}

function normalizeSession(raw: any): StudyGroupSession {
  return {
    id: raw.id,
    groupId: raw.groupId,
    title: raw.title,
    description: raw.description ?? raw.onlineUrlNote ?? '',
    startDate: raw.startDate ?? raw.startsAt,
    endDate: raw.endDate ?? raw.endsAt ?? raw.startsAt,
    location: raw.location ?? null,
    createdAt: raw.createdAt,
  };
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
    body: {
      ...data,
      courseId: data.courseId?.trim() || undefined,
    },
  });
}

export async function fetchStudyGroupById(id: string): Promise<StudyGroup> {
  return apiRequest<StudyGroup>(`/study-groups/${encodeURIComponent(id)}`, {
    method: 'GET',
  });
}

export async function joinStudyGroup(id: string): Promise<{ membershipId: string; status: 'PENDING' | 'ACTIVE' }> {
  return apiRequest<{ membershipId: string; status: 'PENDING' | 'ACTIVE' }>(`/study-groups/${encodeURIComponent(id)}/join`, {
    method: 'POST',
  });
}

export async function fetchStudyGroupMessages(id: string): Promise<StudyGroupMessage[]> {
  const response = await apiRequest<ApiPage<any>>(`/study-groups/${encodeURIComponent(id)}/messages`, {
    method: 'GET',
  });
  return response.data.map(normalizeMessage);
}

export async function sendStudyGroupMessage(groupId: string, data: SendMessageData): Promise<StudyGroupMessage> {
  const response = await apiRequest<any>(`/study-groups/${encodeURIComponent(groupId)}/messages`, {
    method: 'POST',
    body: { body: data.content },
  });
  return normalizeMessage(response);
}

export async function fetchStudyGroupFiles(id: string): Promise<StudyGroupFile[]> {
  const response = await apiRequest<any[]>(`/study-groups/${encodeURIComponent(id)}/files`, {
    method: 'GET',
  });
  return response.map(normalizeFile);
}

export async function fetchStudyGroupSessions(id: string): Promise<StudyGroupSession[]> {
  const response = await apiRequest<any[]>(`/study-groups/${encodeURIComponent(id)}/sessions`, {
    method: 'GET',
  });
  return response.map(normalizeSession);
}

export async function createStudyGroupSession(groupId: string, data: CreateSessionData): Promise<StudyGroupSession> {
  const response = await apiRequest<any>(`/study-groups/${encodeURIComponent(groupId)}/sessions`, {
    method: 'POST',
    body: {
      title: data.title,
      startsAt: data.startDate,
      endsAt: data.endDate,
      location: data.location,
      onlineUrlNote: data.description,
    },
  });
  return normalizeSession(response);
}
