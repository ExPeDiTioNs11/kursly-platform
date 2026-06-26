'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  /** Playback URL — either an HLS (.m3u8) manifest or a progressive MP4. */
  src: string;
  poster?: string;
  className?: string;
  onProgress?: (positionSeconds: number) => void;
}

/**
 * Lightweight HLS-capable player.
 *
 * Uses native HLS where the browser supports it (Safari) and falls back to
 * HLS.js elsewhere. Non-HLS sources are played directly by the <video> tag.
 * Video.js is also a project dependency for richer skins; this component keeps
 * the hot path dependency-free for performance.
 */
export function VideoPlayer({ src, poster, className, onProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const isHls = src.endsWith('.m3u8');
    let hls: Hls | undefined;

    if (isHls && !video.canPlayType('application/vnd.apple.mpegurl') && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }

    const handleTimeUpdate = () => onProgress?.(Math.floor(video.currentTime));
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      hls?.destroy();
    };
  }, [src, onProgress]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      controls
      playsInline
      className={className ?? 'aspect-video w-full rounded-lg bg-black'}
    />
  );
}
