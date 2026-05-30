import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

type RequestConfigWithAuthControls = NonNullable<AxiosError['config']> & { _retry?: boolean };

const baseURL = '/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

let refreshRequest: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: { message?: string } }>) => {
    const message =
      error.response?.data?.error?.message ??
      error.message ??
      'Something went wrong while communicating with the API.';
    const originalRequest = error.config as RequestConfigWithAuthControls | undefined;
    const skipAuthRedirect = originalRequest?.headers?.['x-skip-auth-redirect'] === '1';

    if (typeof window !== 'undefined') {
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !skipAuthRedirect &&
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/refresh')
      ) {
        originalRequest._retry = true;
        refreshRequest ??= api
          .post('/auth/refresh')
          .then(() => undefined)
          .finally(() => {
            refreshRequest = null;
          });

        try {
          await refreshRequest;
          return api(originalRequest);
        } catch {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          return Promise.reject(error);
        }
      }

      if (error.response?.status === 401) {
        if (skipAuthRedirect) {
          return Promise.reject(error);
        }
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/login')) {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      } else if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error(message);
      }
    }

    return Promise.reject(error);
  },
);
