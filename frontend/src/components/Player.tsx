import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';

interface PlayerProps {
  streamUrl: string;
  isPlaying: boolean;
}

export interface PlayerRef {
  captureSnapshot: () => void;
}

const Player = forwardRef<PlayerRef, PlayerProps>(({ streamUrl, isPlaying }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    captureSnapshot: () => {
      const video = videoRef.current;
      if (!video) return;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `camera-snapshot-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    }
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    setError(null);

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError(`HLS error: ${data.type}`);
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else {
      setError('HLS not supported in this browser');
    }
  }, [streamUrl, isPlaying]);

  if (!isPlaying) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        aspectRatio: '16/9',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        borderRadius: '12px',
        border: '1px solid #2a2a2a',
        gap: '12px'
      }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span style={{ fontSize: '16px', fontWeight: '500' }}>Stream Stopped</span>
        <span style={{ fontSize: '14px', color: '#444' }}>Press Space or click Start Stream to begin</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '1200px', position: 'relative' }}>
      <video
        ref={videoRef}
        controls
        autoPlay
        style={{
          width: '100%',
          borderRadius: '12px',
          background: '#000',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}
      />
      {error && (
        <div style={{
          marginTop: '12px',
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#ef4444',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
});

Player.displayName = 'Player';

export default Player;
