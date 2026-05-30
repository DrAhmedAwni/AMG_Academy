'use client';

import { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  videoId: string;
  onEnded?: () => void;
}

export function VideoPlayer({ videoId, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      onEnded?.();
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [onEnded]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        src={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/videos/${videoId}/stream`}
        controls
        controlsList="nodownload"
        className="h-full w-full"
        playsInline
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
