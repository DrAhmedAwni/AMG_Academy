const { AndroidConfig, withAndroidManifest } = require('expo/config-plugins');

const { getMainApplicationOrThrow } = AndroidConfig.Manifest;

module.exports = function withAndroidCleartextTraffic(config, props = {}) {
  return withAndroidManifest(config, (nextConfig) => {
    const mainApplication = getMainApplicationOrThrow(nextConfig.modResults);

    if (props.enabled === true) {
      mainApplication.$['android:usesCleartextTraffic'] = 'true';
    } else {
      delete mainApplication.$['android:usesCleartextTraffic'];
    }

    return nextConfig;
  });
};
