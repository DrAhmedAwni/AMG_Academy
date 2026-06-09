import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-minimum-32-characters',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh-minimum-32-characters',
  jwtResetSecret: process.env.JWT_RESET_SECRET ?? 'change-me-reset-minimum-32-characters',
  accessTokenTtl: process.env.JWT_ACCESS_TTL ?? '30d',
  refreshTokenTtl: process.env.JWT_REFRESH_TTL ?? '365d',
  googleWebClientId: process.env.GOOGLE_OAUTH_WEB_CLIENT_ID,
  googleAndroidClientId: process.env.GOOGLE_OAUTH_ANDROID_CLIENT_ID,
  googleIosClientId: process.env.GOOGLE_OAUTH_IOS_CLIENT_ID,
}));
