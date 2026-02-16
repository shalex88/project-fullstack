import { useEffect } from 'react';
import {
  Play,
  Square,
  Camera,
  ZoomIn,
  ZoomOut,
  Focus,
  Scan,
  Shield,
  Info,
  Wifi,
  WifiOff,
  MoveRight
} from 'lucide-react';
import { CameraCapabilities } from '../services/api';

interface SidebarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  zoom: number;
  zoomInput: string;
  onZoomInputChange: (value: string) => void;
  onGoToZoom: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onGoToMinZoom: () => void;
  onGoToMaxZoom: () => void;
  focus: number;
  focusInput: string;
  onFocusInputChange: (value: string) => void;
  onGoToFocus: () => void;
  onFocusIn: () => void;
  onFocusOut: () => void;
  autofocus: boolean;
  onToggleAutofocus: () => void;
  cameraStabilization: boolean;
  onToggleCameraStabilization: () => void;
  videoCapabilities: string[];
  videoCapabilityState: Record<string, boolean>;
  onToggleVideoCapability: (capability: string) => void;
  onSnapshot?: () => void;
  connected: boolean;
  cameraInfo: string;
  capabilities: CameraCapabilities;
}

export default function Sidebar({
  isPlaying,
  onTogglePlay,
  zoom,
  zoomInput,
  onZoomInputChange,
  onGoToZoom,
  onZoomIn,
  onZoomOut,
  onGoToMinZoom,
  onGoToMaxZoom,
  focus,
  focusInput,
  onFocusInputChange,
  onGoToFocus,
  onFocusIn,
  onFocusOut,
  autofocus,
  onToggleAutofocus,
  cameraStabilization,
  onToggleCameraStabilization,
  videoCapabilities,
  videoCapabilityState,
  onToggleVideoCapability,
  onSnapshot,
  connected,
  cameraInfo,
  capabilities
}: SidebarProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch(e.key) {
        case ' ':
          e.preventDefault();
          onTogglePlay();
          break;
        case '=':
        case '+':
          if (capabilities.zoom) {
            e.preventDefault();
            onZoomIn();
          }
          break;
        case '-':
        case '_':
          if (capabilities.zoom) {
            e.preventDefault();
            onZoomOut();
          }
          break;
        case 'a':
        case 'A':
          if (capabilities.autofocus) {
            e.preventDefault();
            onToggleAutofocus();
          }
          break;
        case 'f':
        case 'F':
          if (capabilities.focus && (!capabilities.autofocus || !autofocus)) {
            e.preventDefault();
            onFocusIn();
          }
          break;
        case 'd':
        case 'D':
          if (capabilities.focus && (!capabilities.autofocus || !autofocus)) {
            e.preventDefault();
            onFocusOut();
          }
          break;
        case 's':
        case 'S':
          if (isPlaying && onSnapshot) {
            e.preventDefault();
            onSnapshot();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, autofocus, capabilities, onTogglePlay, onZoomIn, onZoomOut, onFocusIn, onFocusOut, onToggleAutofocus, onSnapshot]);

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <Camera size={24} strokeWidth={2.5} />
        <h2>Camera Control</h2>
      </div>

      {/* Status */}
      <div className={`status-badge ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
        <span>{connected ? 'Connected' : 'Disconnected'}</span>
      </div>

      {/* Camera Info */}
      <div className="control-section camera-info">
        <h3>
          <Info size={18} />
          Camera
        </h3>
        <div className="info-box">
          {cameraInfo || 'Loading...'}
        </div>
      </div>

      {/* Stream Control */}
      <div className="control-section">
        <h3>Stream</h3>
        <button
          onClick={onTogglePlay}
          className={`control-button primary ${isPlaying ? 'stop' : 'play'}`}
          aria-label={isPlaying ? 'Stop video stream' : 'Start video stream'}
        >
          {isPlaying ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          <span>{isPlaying ? 'Stop Stream' : 'Start Stream'}</span>
          <kbd>Space</kbd>
        </button>

        {onSnapshot && (
          <button
            onClick={onSnapshot}
            disabled={!isPlaying}
            className="control-button secondary"
            aria-label="Capture snapshot from video"
          >
            <Camera size={20} />
            <span>Snapshot</span>
            <kbd>S</kbd>
          </button>
        )}
      </div>

      {/* Zoom Controls */}
      {capabilities.zoom && (
        <div className="control-section">
          <h3>
            <ZoomIn size={18} />
            Zoom
          </h3>
          <div className="value-input-wrapper">
            <input
              type="number"
              value={zoomInput}
              onChange={(e) => onZoomInputChange(e.target.value)}
              className="value-input"
              aria-label="Zoom value"
            />
            <button
              onClick={onGoToZoom}
              className="control-button secondary goto-button"
              aria-label="Go to zoom value"
            >
              <MoveRight size={18} />
              <span>Go To</span>
            </button>
          </div>
          <div className="button-group">
            <button
              onClick={onZoomOut}
              className="control-button icon-button"
              aria-label="Zoom out"
            >
              <ZoomOut size={20} />
              <kbd>-</kbd>
            </button>
            <button
              onClick={onZoomIn}
              className="control-button icon-button"
              aria-label="Zoom in"
            >
              <ZoomIn size={20} />
              <kbd>+</kbd>
            </button>
          </div>
          <div className="button-group">
            <button
              onClick={onGoToMinZoom}
              className="control-button secondary"
              aria-label="Go to minimum zoom"
            >
              <ZoomOut size={18} />
              <span>Min</span>
            </button>
            <button
              onClick={onGoToMaxZoom}
              className="control-button secondary"
              aria-label="Go to maximum zoom"
            >
              <ZoomIn size={18} />
              <span>Max</span>
            </button>
          </div>
        </div>
      )}

      {/* Focus Controls */}
      {capabilities.focus && (
        <div className="control-section">
          <h3>
            <Focus size={18} />
            Focus
          </h3>
          {capabilities.autofocus && (
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={autofocus}
                onChange={onToggleAutofocus}
                aria-label="Toggle autofocus"
              />
              <span className="slider"></span>
              <span className="toggle-label">
                <Scan size={16} />
                Autofocus
              </span>
              <kbd>A</kbd>
            </label>
          )}

          {(!capabilities.autofocus || !autofocus) && (
            <>
              <div className="value-input-wrapper">
                <input
                  type="number"
                  value={focusInput}
                  onChange={(e) => onFocusInputChange(e.target.value)}
                  className="value-input"
                  aria-label="Focus value"
                />
                <button
                  onClick={onGoToFocus}
                  className="control-button secondary goto-button"
                  aria-label="Go to focus value"
                >
                  <MoveRight size={18} />
                  <span>Go To</span>
                </button>
              </div>
              <div className="button-group">
                <button
                  onClick={onFocusOut}
                  className="control-button icon-button"
                  aria-label="Decrease focus"
                  title="Decrease focus (D key)"
                >
                  <Focus size={20} />
                  <span className="button-minus">−</span>
                  <kbd>D</kbd>
                </button>
                <button
                  onClick={onFocusIn}
                  className="control-button icon-button"
                  aria-label="Increase focus"
                  title="Increase focus (F key)"
                >
                  <Focus size={20} />
                  <span className="button-plus">+</span>
                  <kbd>F</kbd>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Camera Stabilization */}
      {capabilities.stabilization && (
        <div className="control-section">
          <h3>
            <Shield size={18} />
            Camera Processing
          </h3>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={cameraStabilization}
              onChange={onToggleCameraStabilization}
              aria-label="Toggle camera stabilization"
            />
            <span className="slider"></span>
            <span className="toggle-label">
              <Shield size={16} />
              Stabilization
            </span>
          </label>
        </div>
      )}

      {/* Video Processing */}
      {videoCapabilities.length > 0 && (
        <div className="control-section">
          <h3>
            <Shield size={18} />
            Video Processing
          </h3>
          {videoCapabilities.map((capability) => (
            <label className="toggle-switch" key={capability}>
              <input
                type="checkbox"
                checked={!!videoCapabilityState[capability]}
                onChange={() => onToggleVideoCapability(capability)}
                aria-label={`Toggle video ${capability}`}
              />
              <span className="slider"></span>
              <span className="toggle-label">
                <Shield size={16} />
                {capability}
              </span>
            </label>
          ))}
        </div>
      )}
    </aside>
  );
}
