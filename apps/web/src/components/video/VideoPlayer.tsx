'use client';

import { useRef, useEffect, useMemo, useState } from 'react';

interface VideoPlayerProps {
  videoId: string;
  onEnded?: () => void;
}

export function VideoPlayer({ videoId, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const streamUrl = useMemo(
    () => `/api/v1/videos/${encodeURIComponent(videoId)}/stream`,
    [videoId],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function checkStreamAccess() {
      setStatus('checking');
      setErrorMessage(null);

      try {
        const response = await fetch(streamUrl, {
          credentials: 'include',
          headers: {
            Accept: 'video/*',
            Range: 'bytes=0-0',
          },
          signal: controller.signal,
        });

        if (response.ok) {
          setStatus('ready');
          return;
        }

        let message = 'This lesson video could not be loaded.';
        try {
          const payload = await response.json();
          if (typeof payload?.error?.message === 'string') {
            message = payload.error.message;
          }
        } catch {
          // The response may not be JSON for upstream media errors.
        }

        setErrorMessage(message);
        setStatus('error');
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage((error as Error).message || 'This lesson video could not be loaded.');
          setStatus('error');
        }
      }
    }

    void checkStreamAccess();

    return () => controller.abort();
  }, [streamUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      onEnded?.();
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [onEnded]);

  if (status === 'checking') {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-black text-sm text-text-muted">
        Checking video access...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-status-error/30 bg-status-error/10 p-6 text-center">
        <p className="font-medium text-status-error">Playback unavailable</p>
        <p className="max-w-xl text-sm text-text-secondary">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-xl bg-black"
      onContextMenu={(e) => e.preventDefault()}
    >
      <video
        ref={videoRef}
        src={streamUrl}
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        className="h-full w-full"
        onError={() => {
          setErrorMessage('The media player could not decode or load this video stream.');
          setStatus('error');
        }}
        playsInline
      >
        Your browser does not support the video tag.
      </video>
      <div className="pointer-events-none absolute inset-0 z-10" />
    </div>
  );
}
