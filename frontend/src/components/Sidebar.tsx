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
  WifiOff
} from 'lucide-react';
import { CameraCapabilities } from '../services/api';

interface SidebarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  focus: number;
  onFocusIn: () => void;
  onFocusOut: () => void;
  autofocus: boolean;
  onToggleAutofocus: () => void;
  stabilization: boolean;
  onToggleStabilization: () => void;
  onSnapshot?: () => void;
  connected: boolean;
  statusMessage: string;
  cameraInfo: string;
  capabilities: CameraCapabilities;
}

export default function Sidebar({
  isPlaying,
  onTogglePlay,
  zoom,
  onZoomIn,
  onZoomOut,
  focus,
  onFocusIn,
  onFocusOut,
  autofocus,
  onToggleAutofocus,
  stabilization,
  onToggleStabilization,
  onSnapshot,
  connected,
  statusMessage,
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
      {statusMessage && (
        <div className="status-message">{statusMessage}</div>
      )}

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
          <div className="value-display">
            <span className="value">{zoom}</span>
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
              <div className="value-display">
                <span className="value">{focus}</span>
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

      {/* Settings */}
      {capabilities.stabilization && (
        <div className="control-section">
          <h3>
            <Shield size={18} />
            Advanced
          </h3>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={stabilization}
              onChange={onToggleStabilization}
              aria-label="Toggle stabilization"
            />
            <span className="slider"></span>
            <span className="toggle-label">
              <Shield size={16} />
              Stabilization
            </span>
          </label>
        </div>
      )}
    </aside>
  );
}
