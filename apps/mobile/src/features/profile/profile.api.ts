import { apiRequest } from '../../lib/api';

export interface MobileProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  specialty: string | null;
  clinic: string | null;
  city: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  role: string;
  createdAt: string;
}

export interface ProfileUpdateInput {
  name?: string;
  phone?: string;
  specialty?: string;
  clinic?: string;
  city?: string;
  avatarUrl?: string;
}

export function normalizeProfile(raw: MobileProfile): MobileProfile {
  return raw;
}

export async function getProfile(): Promise<MobileProfile> {
  const response = await apiRequest<MobileProfile>('/users/profile');
  return normalizeProfile(response);
}

export async function updateProfile(input: ProfileUpdateInput): Promise<MobileProfile> {
  const response = await apiRequest<MobileProfile>('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
  });
  return normalizeProfile(response);
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiRequest('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
    headers: { 'Content-Type': 'application/json' },
  });
}
