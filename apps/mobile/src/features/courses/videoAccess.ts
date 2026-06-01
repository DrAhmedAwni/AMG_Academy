import { buildApiUrl } from '../../lib/api';
import { getSessionMaterial } from '../../lib/storage';

export interface VideoAccessResult {
  provider: string;
  available: boolean;
}

async function getAuthorizationHeader() {
  const material = await getSessionMaterial();
  return material?.accessToken ? `${material.tokenType ?? 'Bearer'} ${material.accessToken}` : undefined;
}

export async function getLessonVideoStreamUrl(videoId: string): Promise<VideoAccessResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const authorization = await getAuthorizationHeader();
    const response = await fetch(buildApiUrl(`/videos/${encodeURIComponent(videoId)}/stream`), {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'video/*',
        Range: 'bytes=0-0',
        ...(authorization ? { Authorization: authorization } : {}),
      },
      signal: controller.signal,
    });

    return {
      provider: 'vps',
      available: response.ok,
    };
  } catch {
    return {
      provider: 'vps',
      available: false,
    };
  } finally {
    clearTimeout(timeout);
  }
}
