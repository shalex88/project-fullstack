import { useEffect, useState, useRef } from 'react';
import Player, { PlayerRef } from '../components/Player';
import Sidebar from '../components/Sidebar';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { getStreamUrl, getZoom, setZoom, getFocus, setFocus, setAutofocus, getCameraInfo, setCameraStabilization, setVideoStabilization, detectCameraCapabilities, CameraCapabilities, isServerReachable } from '../services/api';

export default function Dashboard() {
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoomState] = useState(0);
  const [zoomInput, setZoomInput] = useState<string>('0');
  const [focus, setFocusState] = useState(0);
  const [focusInput, setFocusInput] = useState<string>('0');
  const [autofocus, setAutofocusState] = useState(true); // default per simulator behavior
  const [cameraStabilization, setCameraStabilizationState] = useState(false);
  const [videoStabilization, setVideoStabilizationState] = useState(false);
  const [cameraInfo, setCameraInfo] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [capabilities, setCapabilities] = useState<CameraCapabilities>({
    zoom: true,
    focus: true,
    autofocus: true,
    stabilization: true,
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const playerRef = useRef<PlayerRef>(null);

  const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    const initCamera = async () => {
      try {
        // First detect what features are available
        const caps = await detectCameraCapabilities();
        setCapabilities(caps);
        console.log('Available capabilities:', {
          zoom: caps.zoom,
          focus: caps.focus,
          autofocus: caps.autofocus,
          stabilization: caps.stabilization,
        });

        const url = await getStreamUrl();
        setStreamUrl(url);

        const currentZoom = caps.zoom ? await getZoom() : 0;
        setZoomState(currentZoom);
        setZoomInput(currentZoom.toString());

        const info = await getCameraInfo();
        setCameraInfo(info);
        setConnected(true);

        showToast(`Camera connected. Available: ${[
          caps.zoom ? 'Zoom' : null,
          caps.focus ? 'Focus' : null,
          caps.autofocus ? 'Autofocus' : null,
          caps.stabilization ? 'Stabilization' : null,
        ].filter(Boolean).join(', ')}`, 'info');
      } catch (err) {
        console.error('Init failed:', err);
        const reachable = await isServerReachable();
        setConnected(reachable);
        if (reachable) {
          showToast('Camera connected but failed to load capabilities', 'warning');
        }
      }
    };

    initCamera();
    // Focus GET may fail while autofocus is on; ignore initial errors
    getFocus().then((f) => {
      setFocusState(f);
      setFocusInput(f.toString());
    }).catch(() => {});
  }, []);

  const handleTogglePlay = () => setIsPlaying((prev) => !prev);

  const handleSnapshot = () => {
    playerRef.current?.captureSnapshot();
  };

  const handleZoomIn = async () => {
    try {
      const newZoom = await setZoom(zoom + 5);
      setZoomState(newZoom);
      setZoomInput(newZoom.toString());
    } catch (err) {
      console.error('Zoom failed:', err);
      const reachable = await isServerReachable();
      if (!reachable) setConnected(false);
    }
  };

  const handleZoomOut = async () => {
    try {
      const newZoom = await setZoom(Math.max(0, zoom - 5));
      setZoomState(newZoom);
      setZoomInput(newZoom.toString());
    } catch (err) {
      console.error('Zoom failed:', err);
      const reachable = await isServerReachable();
      if (!reachable) setConnected(false);
    }
  };

  const handleZoomInputChange = (value: string) => {
    setZoomInput(value);
  };

  const handleGoToZoom = async () => {
    try {
      const targetZoom = parseInt(zoomInput, 10);
      if (isNaN(targetZoom)) {
        showToast('Invalid zoom value', 'error');
        return;
      }
      if (targetZoom < 0 || targetZoom > 100) {
        showToast('Zoom value must be between 0 and 100', 'warning');
        return;
      }
      const newZoom = await setZoom(targetZoom);
      setZoomState(newZoom);
      setZoomInput(newZoom.toString());
    } catch (err) {
      console.error('Go to zoom failed:', err);
      showToast('Failed to set zoom', 'error');
      const reachable = await isServerReachable();
      if (!reachable) setConnected(false);
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
        setFocusInput(current.toString());
      }
    } catch (err) {
      console.error('Autofocus toggle failed:', err);
      showToast('Failed to toggle autofocus', 'error');
      const reachable = await isServerReachable();
      if (!reachable) setConnected(false);
    }
  };

  const handleToggleCameraStabilization = async () => {
    try {
      const enabled = !cameraStabilization;
      await setCameraStabilization(enabled);
      setCameraStabilizationState(enabled);
    } catch (err) {
      console.error('Camera stabilization toggle failed:', err);
      showToast('Failed to toggle camera stabilization', 'error');
      const reachable = await isServerReachable();
      if (!reachable) setConnected(false);
    }
  };

  const handleToggleVideoStabilization = async () => {
    try {
      const enabled = !videoStabilization;
      await setVideoStabilization(enabled);
      setVideoStabilizationState(enabled);
    } catch (err) {
      console.error('Video stabilization toggle failed:', err);
      showToast('Failed to toggle video stabilization', 'error');
      const reachable = await isServerReachable();
      if (!reachable) setConnected(false);
    }
  };

  const handleFocusIn = async () => {
    try {
      const newFocus = await setFocus(focus + 5);
      setFocusState(newFocus);
      setFocusInput(newFocus.toString());
    } catch (err) {
      console.error('Focus failed:', err);
      const reachable = await isServerReachable();
      if (!reachable) setConnected(false);
    }
  };

  const handleFocusOut = async () => {
    try {
      const newFocus = await setFocus(Math.max(0, focus - 5));
      setFocusState(newFocus);
      setFocusInput(newFocus.toString());
    } catch (err) {
      console.error('Focus failed:', err);
      const reachable = await isServerReachable();
      if (!reachable) setConnected(false);
    }
  };

  const handleFocusInputChange = (value: string) => {
    setFocusInput(value);
  };

  const handleGoToFocus = async () => {
    try {
      const targetFocus = parseInt(focusInput, 10);
      if (isNaN(targetFocus)) {
        showToast('Invalid focus value', 'error');
        return;
      }
      if (targetFocus < 0 || targetFocus > 100) {
        showToast('Focus value must be between 0 and 100', 'warning');
        return;
      }
      const newFocus = await setFocus(targetFocus);
      setFocusState(newFocus);
      setFocusInput(newFocus.toString());
    } catch (err) {
      console.error('Go to focus failed:', err);
      showToast('Failed to set focus', 'error');
      const reachable = await isServerReachable();
      if (!reachable) setConnected(false);
    }
  };

  return (
    <div className="dashboard">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Sidebar
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onSnapshot={handleSnapshot}
        zoom={zoom}
        zoomInput={zoomInput}
        onZoomInputChange={handleZoomInputChange}
        onGoToZoom={handleGoToZoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        focus={focus}
        focusInput={focusInput}
        onFocusInputChange={handleFocusInputChange}
        onGoToFocus={handleGoToFocus}
        onFocusIn={handleFocusIn}
        onFocusOut={handleFocusOut}
        autofocus={autofocus}
        onToggleAutofocus={handleToggleAutofocus}
        cameraStabilization={cameraStabilization}
        onToggleCameraStabilization={handleToggleCameraStabilization}
        videoStabilization={videoStabilization}
        onToggleVideoStabilization={handleToggleVideoStabilization}
        connected={connected}
        cameraInfo={cameraInfo}
        capabilities={capabilities}
      />

      <main className="main-content">
        <div className="video-container">
          <Player ref={playerRef} streamUrl={streamUrl} isPlaying={isPlaying} />
        </div>
      </main>
    </div>
  );
}
