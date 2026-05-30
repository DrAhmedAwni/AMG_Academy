import { apiRequest } from '../../lib/api';

export interface PushRegistrationResult {
  registered: boolean;
  message: string;
}

export async function preparePushRegistration(
  expoPushToken: string,
): Promise<PushRegistrationResult> {
  try {
    await apiRequest('/notifications/push-token', {
      method: 'POST',
      body: JSON.stringify({ token: expoPushToken }),
      headers: { 'Content-Type': 'application/json' },
    });
    return { registered: true, message: 'Push token registered with backend.' };
  } catch {
    return {
      registered: false,
      message: 'Push registration endpoint not yet available. Preparation only.',
    };
  }
}

export async function requestPushPermission(): Promise<{ granted: boolean }> {
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
    return { granted: true };
  } catch {
    return { granted: false };
  }
}
