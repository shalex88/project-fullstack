import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

interface PlayerProps {
  streamUrl: string;
  isPlaying: boolean;
}

export interface PlayerRef {
  captureSnapshot: () => void;
}

async function connectWhep(peerConnection: RTCPeerConnection, baseUrl: string): Promise<void> {
  // Ensure URL doesn't have trailing slash for WHEP
  const url = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const whepUrl = `${url}/whep`;

  console.log('WHEP connecting to:', whepUrl);

  // Add transceivers for video and audio (required for WHEP)
  peerConnection.addTransceiver('video', { direction: 'sendrecv' });
  peerConnection.addTransceiver('audio', { direction: 'sendrecv' });

  // Get ICE servers via OPTIONS
  try {
    const optionsRes = await fetch(whepUrl, { method: 'OPTIONS' });
    console.log('OPTIONS response:', optionsRes.status);
  } catch (err) {
    console.warn('OPTIONS request failed (non-critical):', err);
  }

  // Create and send offer
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  console.log('Offer SDP:', offer.sdp);
  console.log('Offer SDP length:', offer.sdp?.length);

  const postRes = await fetch(whepUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sdp',
    },
    body: offer.sdp,
  });

  console.log('POST response status:', postRes.status);
  console.log('POST response headers:', {
    location: postRes.headers.get('location'),
    contentType: postRes.headers.get('content-type'),
  });

  if (postRes.status !== 201) {
    const errorText = await postRes.text();
    console.error('WHEP error response:', errorText);
    throw new Error(`WHEP connection failed: ${postRes.status} ${postRes.statusText} - ${errorText}`);
  }

  // Get session URL from Location header
  const sessionUrl = postRes.headers.get('location');
  if (!sessionUrl) {
    throw new Error('WHEP server did not return session URL');
  }

  console.log('Session URL:', sessionUrl);

  // Get answer SDP
  const answerSdp = await postRes.text();
  console.log('Answer SDP:', answerSdp);
  console.log('Answer SDP length:', answerSdp?.length);

  if (!answerSdp) {
    throw new Error('WHEP server returned empty answer');
  }

  const answer = new RTCSessionDescription({ type: 'answer', sdp: answerSdp });
  await peerConnection.setRemoteDescription(answer);

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('Sending ICE candidate');
      const candidateSdp = `a=ice-ufrag:${event.candidate.usernameFragment || ''}\r\na=${event.candidate.candidate}`;
      fetch(sessionUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/trickle-ice-sdpfrag',
          'If-Match': '*',
        },
        body: candidateSdp,
      }).catch(err => console.warn('Failed to send candidate:', err));
    }
  };
}

const Player = forwardRef<PlayerRef, PlayerProps>(({ streamUrl, isPlaying }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

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

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
    });

    peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        video.srcObject = event.streams[0];
      }
    };

    peerConnection.onerror = () => {
      setError('WebRTC connection error');
    };

    peerConnectionRef.current = peerConnection;

    connectWhep(peerConnection, streamUrl)
      .catch((err) => {
        setError(`Failed to connect: ${err.message}`);
      });

    return () => {
      peerConnection.close();
      peerConnectionRef.current = null;
    };
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
