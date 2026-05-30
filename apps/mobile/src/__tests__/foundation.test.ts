import { PaymentStatus, QRTicketStatus, RegistrationStatus } from '@amg/shared';
import { ApiClientError, parseApiEnvelope } from '../lib/api';
import {
  clearSessionStorage,
  getSessionMaterial,
  resolveStorageKey,
  saveSessionMaterial,
} from '../lib/storage';
import {
  getStatusBadgeConfig,
  paymentStatusMap,
  qrTicketStatusMap,
  registrationStatusMap,
} from '../theme/status';

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();

  return {
    __store: store,
    getItemAsync: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    setItemAsync: jest.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
  };
});

const secureStoreMock = jest.requireMock('expo-secure-store') as {
  __store: Map<string, string>;
};

describe('mobile foundation', () => {
  beforeEach(() => {
    secureStoreMock.__store.clear();
  });

  it('namespaces secure storage keys and clears session material', async () => {
    expect(resolveStorageKey('accessToken')).toBe('amg.mobile.v2.auth.accessToken');

    await saveSessionMaterial({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresInSeconds: 900,
      refreshExpiresInSeconds: 604800,
    });

    await expect(getSessionMaterial()).resolves.toMatchObject({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
    });

    await clearSessionStorage();

    await expect(getSessionMaterial()).resolves.toBeNull();
  });

  it('parses successful API envelopes', () => {
    expect(
      parseApiEnvelope<{ id: string }>({
        success: true,
        data: { id: 'payment-1' },
      }),
    ).toEqual({ id: 'payment-1' });
  });

  it('normalizes error API envelopes', () => {
    expect(() =>
      parseApiEnvelope({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Permission required',
        },
      }, 403),
    ).toThrow(ApiClientError);
  });

  it('maps critical backend statuses to text badges', () => {
    expect(registrationStatusMap[RegistrationStatus.Pending].label).toBe('Pending approval');
    expect(paymentStatusMap[PaymentStatus.Successful].label).toBe('Paid');
    expect(qrTicketStatusMap[QRTicketStatus.Active].label).toBe('Active QR');

    expect(getStatusBadgeConfig('payment', PaymentStatus.Pending)).toMatchObject({
      label: 'Payment pending',
      tone: 'warning',
    });
  });
});
