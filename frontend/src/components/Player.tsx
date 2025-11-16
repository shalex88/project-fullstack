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
      <div style={{ width: '100%', height: 400, background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        Stream stopped
      </div>
    );
  }

  return (
    <div>
      <video ref={videoRef} controls autoPlay style={{ width: '100%', maxHeight: 500, background: '#000' }} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
});

Player.displayName = 'Player';

export default Player;
