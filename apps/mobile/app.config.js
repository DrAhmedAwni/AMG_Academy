const defaultApiUrl = 'http://localhost:4000/api/v1';
const defaultWebUrl = 'http://localhost:3000';

module.exports = ({ config }) => {
  const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? 'local';
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl;
  const webUrl = process.env.EXPO_PUBLIC_WEB_URL ?? defaultWebUrl;
  const allowLocalHttp =
    appEnv !== 'production' && apiUrl.toLowerCase().startsWith('http://');

  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []),
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
