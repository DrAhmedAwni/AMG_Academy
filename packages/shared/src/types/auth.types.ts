export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  permissions: string[];
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tokenVersion: number;
  permissions: string[];
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken?: string;
  tokenType: 'Bearer';
  expiresInSeconds?: number;
  refreshExpiresInSeconds?: number;
}

export interface LoginResponse {
  user: AuthUser;
  tokens?: AuthTokenPair;
}

export interface RefreshResponse {
  tokens?: AuthTokenPair;
}
