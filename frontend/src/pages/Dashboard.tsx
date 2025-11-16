import { useEffect, useState, useRef } from 'react';
import Player, { PlayerRef } from '../components/Player';
import Controls from '../components/Controls';
import Settings from '../components/Settings';
import Status from '../components/Status';
import { getStreamUrl, getZoom, setZoom, getFocus, setFocus, setAutofocus, getCameraInfo, setStabilization } from '../services/api';

export default function Dashboard() {
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoomState] = useState(0);
  const [focus, setFocusState] = useState(0);
  const [autofocus, setAutofocusState] = useState(true); // default per simulator behavior
  const [stabilization, setStabilizationState] = useState(false);
  const [cameraInfo, setCameraInfo] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const [url, currentZoom, info] = await Promise.all([
          getStreamUrl(),
          getZoom(),
          getCameraInfo()
        ]);
        setStreamUrl(url);
        setZoomState(currentZoom);
        setCameraInfo(info);
        setConnected(true);
        setStatusMessage('Camera ready');
      } catch (err) {
        console.error('Init failed:', err);
        setConnected(false);
        setStatusMessage('Failed to connect to camera service');
      }
    };

    initCamera();
    // Focus GET may fail while autofocus is on; ignore initial errors
    getFocus().then(setFocusState).catch(() => {});
  }, []);

  const handleTogglePlay = () => setIsPlaying((prev) => !prev);

  const handleSnapshot = () => {
    playerRef.current?.captureSnapshot();
  };

  const handleZoomIn = async () => {
    try {
      const newZoom = await setZoom(zoom + 5);
      setZoomState(newZoom);
    } catch (err) {
      console.error('Zoom failed:', err);
    }
  };

  const handleZoomOut = async () => {
    try {
      const newZoom = await setZoom(Math.max(0, zoom - 5));
      setZoomState(newZoom);
    } catch (err) {
      console.error('Zoom failed:', err);
    }
  };

  const handleToggleAutofocus = async () => {
    try {
      const enabled = !autofocus;
      await setAutofocus(enabled);
      setAutofocusState(enabled);
      if (!enabled) {
        // When disabling autofocus, fetch current manual focus
        const current = await getFocus();
        setFocusState(current);
      }
      setConnected(true);
    } catch (err) {
      console.error('Autofocus toggle failed:', err);
      setConnected(false);
      setStatusMessage('Failed to toggle autofocus');
    }
  };

  const handleToggleStabilization = async () => {
    try {
      const enabled = !stabilization;
      await setStabilization(enabled);
      setStabilizationState(enabled);
      setConnected(true);
    } catch (err) {
      console.error('Stabilization toggle failed:', err);
      setConnected(false);
      setStatusMessage('Failed to toggle stabilization');
    }
  };

  const handleFocusIn = async () => {
    try {
      const newFocus = await setFocus(focus + 5);
      setFocusState(newFocus);
    } catch (err) {
      console.error('Focus failed:', err);
    }
  };

  const handleFocusOut = async () => {
    try {
      const newFocus = await setFocus(Math.max(0, focus - 5));
      setFocusState(newFocus);
    } catch (err) {
      console.error('Focus failed:', err);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1>Camera Control Dashboard</h1>

      <Status connected={connected} message={statusMessage} />

      <Player ref={playerRef} streamUrl={streamUrl} isPlaying={isPlaying} />

      <Controls
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onSnapshot={handleSnapshot}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        focus={focus}
        onFocusIn={handleFocusIn}
        onFocusOut={handleFocusOut}
        autofocus={autofocus}
        onToggleAutofocus={handleToggleAutofocus}
      />

      <Settings
        info={cameraInfo}
        autofocus={autofocus}
        stabilization={stabilization}
        onToggleAutofocus={handleToggleAutofocus}
        onToggleStabilization={handleToggleStabilization}
      />
    </div>
  );
}
