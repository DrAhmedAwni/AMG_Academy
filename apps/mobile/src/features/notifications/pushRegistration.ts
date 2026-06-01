import { apiRequest } from '../../lib/api';

export interface PushRegistrationResult {
  registered: boolean;
  message: string;
}

export async function preparePushRegistration(
  expoPushToken: string,
  metadata: { platform?: string; deviceId?: string } = {},
): Promise<PushRegistrationResult> {
  try {
    await apiRequest('/notifications/push-token', {
      method: 'POST',
      body: { token: expoPushToken, ...metadata },
    });
    return { registered: true, message: 'Push token registered with backend.' };
  } catch {
    return {
      registered: false,
      message: 'Push registration endpoint not yet available. Preparation only.',
    };
  }
}

export async function unregisterPushToken(expoPushToken: string): Promise<void> {
  await apiRequest('/notifications/push-token', {
    method: 'DELETE',
    body: { token: expoPushToken },
    authFailureMode: 'ignore',
  }).catch(() => undefined);
}

export async function requestPushPermission(): Promise<{ granted: boolean; token?: string }> {
  try {
    const { Notifications } = require('expo-notifications');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return { granted: false };
    }

    const expoPushTokenData = await Notifications.getExpoPushTokenAsync();
    return { granted: true, token: expoPushTokenData.data };
  } catch {
    return { granted: false };
  }
}

export async function registerPushTokenForCurrentUser(): Promise<PushRegistrationResult> {
  if (process.env.EXPO_PUBLIC_ENABLE_PUSH_PREP === 'false') {
    return { registered: false, message: 'Push preparation is disabled.' };
  }

  const permission = await requestPushPermission();
  if (!permission.granted || !permission.token) {
    return { registered: false, message: 'Push permission was not granted.' };
  }

  return preparePushRegistration(permission.token);
}

export async function unregisterCurrentPushToken(): Promise<void> {
  try {
    const { Notifications } = require('expo-notifications');
    const expoPushTokenData = await Notifications.getExpoPushTokenAsync();
    if (expoPushTokenData.data) {
      await unregisterPushToken(expoPushTokenData.data);
    }
  } catch {
    // Push cleanup is best-effort; SecureStore cleanup still owns logout.
  }
}
