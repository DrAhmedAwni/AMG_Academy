import { jwtVerify } from 'jose';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export interface SessionUser {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
}

const encoder = new TextEncoder();

export async function verifyAccessToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'Missing or insecure JWT_SECRET environment variable. Must be at least 32 characters.',
    );
  }
  const { payload } = await jwtVerify(token, encoder.encode(secret));
  return payload as unknown as SessionUser;
}

export function hasPermission(user: { permissions?: string[] } | null, permission: string) {
  if (!user) {
    return false;
  }

  return Boolean(user.permissions?.includes('*:*') || user.permissions?.includes(permission));
}
