import * as SecureStore from 'expo-secure-store';
import type { MobileAuthTokens } from '../types/api';

const namespace = 'amg.mobile.v2';

export const storageKeys = {
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
  tokenType: 'auth.tokenType',
  expiresAt: 'auth.expiresAt',
  refreshExpiresAt: 'auth.refreshExpiresAt',
} as const;

type StorageKey = keyof typeof storageKeys;

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainService: 'amg-academy-mobile-v2',
};

export function resolveStorageKey(key: StorageKey | string) {
  const rawKey = key in storageKeys ? storageKeys[key as StorageKey] : key;
  return `${namespace}.${rawKey}`;
}

export async function getSecureItem(key: StorageKey | string) {
  return SecureStore.getItemAsync(resolveStorageKey(key), secureStoreOptions);
}

export async function setSecureItem(key: StorageKey | string, value: string) {
  await SecureStore.setItemAsync(resolveStorageKey(key), value, secureStoreOptions);
}

export async function deleteSecureItem(key: StorageKey | string) {
  await SecureStore.deleteItemAsync(resolveStorageKey(key), secureStoreOptions);
}

export function secondsFromNowToIso(seconds: number | undefined) {
  if (!seconds || !Number.isFinite(seconds)) {
    return undefined;
  }

  return new Date(Date.now() + seconds * 1000).toISOString();
}

export async function saveSessionMaterial(tokens: MobileAuthTokens) {
  const entries: Array<[StorageKey, string | undefined]> = [
    ['accessToken', tokens.accessToken],
    ['refreshToken', tokens.refreshToken],
    ['tokenType', tokens.tokenType],
    ['expiresAt', secondsFromNowToIso(tokens.expiresInSeconds)],
    ['refreshExpiresAt', secondsFromNowToIso(tokens.refreshExpiresInSeconds)],
  ];

  await Promise.all(
    entries.map(([key, value]) =>
      value ? setSecureItem(key, value) : deleteSecureItem(key),
    ),
  );
}

export async function getSessionMaterial(): Promise<MobileAuthTokens | null> {
  const [accessToken, refreshToken, tokenType, expiresAt, refreshExpiresAt] = await Promise.all([
    getSecureItem('accessToken'),
    getSecureItem('refreshToken'),
    getSecureItem('tokenType'),
    getSecureItem('expiresAt'),
    getSecureItem('refreshExpiresAt'),
  ]);

  if (!accessToken) {
    return null;
  }

  if (expiresAt && Date.parse(expiresAt) <= Date.now()) {
    return refreshToken
      ? {
          accessToken,
          refreshToken,
          tokenType: 'Bearer',
          refreshExpiresInSeconds: refreshExpiresAt
            ? Math.max(0, Math.floor((Date.parse(refreshExpiresAt) - Date.now()) / 1000))
            : undefined,
        }
      : null;
  }

  return {
    accessToken,
    refreshToken: refreshToken ?? undefined,
    tokenType: tokenType === 'Bearer' ? 'Bearer' : 'Bearer',
  };
}

export async function clearSessionStorage() {
  await Promise.all(
    (Object.keys(storageKeys) as StorageKey[]).map((key) => deleteSecureItem(key)),
  );
}
