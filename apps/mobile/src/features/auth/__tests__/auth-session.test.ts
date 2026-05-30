import { login, logout, currentUser, buildMobileLoginPayload } from '../auth.api';
import { apiRequest } from '../../../lib/api';

jest.mock('../../../lib/api', () => ({
  apiRequest: jest.fn(),
}));

const apiRequestMock = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe('auth API helpers', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('adds the mobile client marker to login payloads', () => {
    expect(
      buildMobileLoginPayload({
        email: 'student@example.com',
        password: 'Password1',
      }),
    ).toEqual({
      email: 'student@example.com',
      password: 'Password1',
      client: 'mobile',
    });
  });

  it('logs in through the backend auth endpoint without local auth rules', async () => {
    apiRequestMock.mockResolvedValueOnce({
      user: {
        id: 'user-1',
        email: 'student@example.com',
        name: 'Student',
        role: 'user',
        avatarUrl: null,
        emailVerified: true,
        permissions: [],
      },
      tokens: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        tokenType: 'Bearer',
      },
    });

    await login({
      email: 'student@example.com',
      password: 'Password1',
    });

    expect(apiRequestMock).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: {
        email: 'student@example.com',
        password: 'Password1',
        client: 'mobile',
      },
      authFailureMode: 'ignore',
    });
  });

  it('uses backend current user and logout endpoints', async () => {
    apiRequestMock.mockResolvedValueOnce({
      id: 'user-1',
      email: 'student@example.com',
      name: 'Student',
      role: 'user',
      avatarUrl: null,
      emailVerified: true,
      permissions: [],
    });
    await currentUser();
    expect(apiRequestMock).toHaveBeenLastCalledWith('/auth/me', { method: 'GET' });

    apiRequestMock.mockResolvedValueOnce(null);
    await logout();
    expect(apiRequestMock).toHaveBeenLastCalledWith('/auth/logout', {
      method: 'POST',
      authFailureMode: 'ignore',
    });
  });
});
