import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiRequest } from '../../lib/api';

export interface PushRegistrationResult {
  registered: boolean;
  message: string;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function preparePushRegistration(
  expoPushToken: string,
  metadata: { platform?: string; deviceId?: string } = {},
): Promise<PushRegistrationResult> {
  try {
    await apiRequest('/notifications/push-token', {
      method: 'POST',
      body: { token: expoPushToken, ...metadata },
      authFailureMode: 'ignore',
    });
    return { registered: true, message: 'Notifications are ready.' };
  } catch (error) {
    return {
      registered: false,
      message: `Push token could not be registered: ${errorMessage(error)}`,
    };
  }
}

async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#54D9E8',
  });
}

function getExpoProjectId() {
  return (
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.manifest2?.extra?.eas?.projectId
  );
}

export async function unregisterPushToken(expoPushToken: string): Promise<void> {
  await apiRequest('/notifications/push-token', {
    method: 'DELETE',
    body: { token: expoPushToken },
    authFailureMode: 'ignore',
  }).catch(() => undefined);
}

export async function requestPushPermission(): Promise<{ granted: boolean; token?: string; message?: string }> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return { granted: false, message: 'Push permission was not granted.' };
    }

    await ensureAndroidNotificationChannel();

    const projectId = getExpoProjectId();
    const expoPushTokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return { granted: true, token: expoPushTokenData.data };
  } catch (error) {
    return { granted: false, message: `Push token could not be created: ${errorMessage(error)}` };
  }
}

export async function registerPushTokenForCurrentUser(): Promise<PushRegistrationResult> {
  if (process.env.EXPO_PUBLIC_ENABLE_PUSH_PREP === 'false') {
    return { registered: false, message: 'Push preparation is disabled.' };
  }

  const permission = await requestPushPermission();
  if (!permission.granted || !permission.token) {
    return { registered: false, message: permission.message ?? 'Push permission was not granted.' };
  }

  return preparePushRegistration(permission.token, { platform: Platform.OS });
}

export async function unregisterCurrentPushToken(): Promise<void> {
  try {
    const projectId = getExpoProjectId();
    const expoPushTokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    if (expoPushTokenData.data) {
      await unregisterPushToken(expoPushTokenData.data);
    }
  } catch {
    // Push cleanup is best-effort; session cleanup still owns logout.
  }
}
