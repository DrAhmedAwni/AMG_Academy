import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
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

function canUseWebStorage() {
  return Platform.OS === 'web' && typeof window !== 'undefined' && Boolean(window.localStorage);
}

export async function getSecureItem(key: StorageKey | string) {
  const resolvedKey = resolveStorageKey(key);
  if (canUseWebStorage()) {
    return window.localStorage.getItem(resolvedKey);
  }

  return SecureStore.getItemAsync(resolvedKey, secureStoreOptions);
}

export async function setSecureItem(key: StorageKey | string, value: string) {
  const resolvedKey = resolveStorageKey(key);
  if (canUseWebStorage()) {
    window.localStorage.setItem(resolvedKey, value);
    return;
  }

  await SecureStore.setItemAsync(resolvedKey, value, secureStoreOptions);
}

export async function deleteSecureItem(key: StorageKey | string) {
  const resolvedKey = resolveStorageKey(key);
  if (canUseWebStorage()) {
    window.localStorage.removeItem(resolvedKey);
    return;
  }

  await SecureStore.deleteItemAsync(resolvedKey, secureStoreOptions);
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

  if (!accessToken && !refreshToken) {
    return null;
  }

  if (!accessToken || (expiresAt && Date.parse(expiresAt) <= Date.now())) {
    return refreshToken
      ? {
          accessToken: accessToken ?? '',
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
