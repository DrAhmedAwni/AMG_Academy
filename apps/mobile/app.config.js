const fs = require('fs');
const path = require('path');

const defaultApiUrl = 'http://localhost:4000/api/v1';
const defaultWebUrl = 'http://localhost:3000';

module.exports = ({ config }) => {
  const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? 'local';
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl;
  const webUrl = process.env.EXPO_PUBLIC_WEB_URL ?? defaultWebUrl;
  const googleServicesFile =
    process.env.GOOGLE_SERVICES_JSON ??
    process.env.GOOGLE_SERVICES_FILE ??
    './google-services.json';
  const googleServicesPath = path.resolve(__dirname, googleServicesFile);
  const hasGoogleServicesFile = fs.existsSync(googleServicesPath);
  const allowLocalHttp =
    appEnv !== 'production' && apiUrl.toLowerCase().startsWith('http://');

  return {
    ...config,
    android: {
      ...config.android,
       versionCode: 5,
      ...(hasGoogleServicesFile ? { googleServicesFile } : {}),
    },
    plugins: [
  ...(config.plugins ?? []),

  'expo-font',
  'expo-video',

  [
    'expo-splash-screen',
    {
      backgroundColor: '#050505',
      dark: {
        backgroundColor: '#050505',
      },
    },
  ],
  ['./plugins/withAndroidCleartextTraffic', { enabled: allowLocalHttp }],
],
    extra: {
      ...config.extra,
      appEnv,
      apiUrl,
      webUrl,
      router: config.extra?.router ?? {},
      eas: config.extra?.eas,
    },
  };
};
