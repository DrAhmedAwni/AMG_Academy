import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-minimum-32-characters',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh-minimum-32-characters',
  jwtResetSecret: process.env.JWT_RESET_SECRET ?? 'change-me-reset-minimum-32-characters',
  accessTokenTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  refreshTokenTtl: process.env.JWT_REFRESH_TTL ?? '7d',
}));
