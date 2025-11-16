import { useEffect } from 'react';

interface ControlsProps {
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
  onSnapshot?: () => void;
}

export default function Controls({ isPlaying, onTogglePlay, zoom, onZoomIn, onZoomOut, focus, onFocusIn, onFocusOut, autofocus, onToggleAutofocus, onSnapshot }: ControlsProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch(e.key) {
        case ' ':
          e.preventDefault();
          onTogglePlay();
          break;
        case '=':
        case '+':
          e.preventDefault();
          onZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          onZoomOut();
          break;
        case 'a':
        case 'A':
          e.preventDefault();
          onToggleAutofocus();
          break;
        case 'f':
        case 'F':
          if (!autofocus) {
            e.preventDefault();
            onFocusIn();
          }
          break;
        case 'd':
        case 'D':
          if (!autofocus) {
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
  }, [isPlaying, autofocus, onTogglePlay, onZoomIn, onZoomOut, onFocusIn, onFocusOut, onToggleAutofocus, onSnapshot]);

  return (
    <div
      role="toolbar"
      aria-label="Camera controls"
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        padding: 16,
        border: '1px solid #ccc',
        borderRadius: 4,
        backgroundColor: '#f9f9f9'
      }}
    >
      <button
        onClick={onTogglePlay}
        aria-label={isPlaying ? 'Stop video stream' : 'Start video stream'}
        style={{
          padding: '8px 16px',
          cursor: 'pointer',
          border: '1px solid #333',
          borderRadius: 4,
          backgroundColor: isPlaying ? '#dc3545' : '#28a745',
          color: 'white',
          fontWeight: 'bold'
        }}
        onFocus={(e) => e.currentTarget.style.outline = '3px solid #007bff'}
        onBlur={(e) => e.currentTarget.style.outline = 'none'}
      >
        {isPlaying ? 'Stop Stream' : 'Start Stream'} <span aria-hidden="true">(Space)</span>
      </button>

      {onSnapshot && (
        <button
          onClick={onSnapshot}
          disabled={!isPlaying}
          aria-label="Capture snapshot from video"
          style={{
            padding: '8px 16px',
            cursor: isPlaying ? 'pointer' : 'not-allowed',
            opacity: isPlaying ? 1 : 0.5,
            border: '1px solid #333',
            borderRadius: 4,
            backgroundColor: '#007bff',
            color: 'white',
            fontWeight: 'bold'
          }}
          onFocus={(e) => isPlaying && (e.currentTarget.style.outline = '3px solid #007bff')}
          onBlur={(e) => e.currentTarget.style.outline = 'none'}
        >
          📸 Snapshot <span aria-hidden="true">(S)</span>
        </button>
      )}

      <div style={{ borderLeft: '1px solid #ccc', paddingLeft: 16 }} role="group" aria-label="Zoom controls">
        <span style={{ marginRight: 8 }} aria-live="polite">Zoom: {zoom}</span>
        <button
          onClick={onZoomOut}
          aria-label="Zoom out"
          style={{
            padding: '4px 12px',
            marginRight: 4,
            cursor: 'pointer',
            border: '1px solid #333',
            borderRadius: 4
          }}
          onFocus={(e) => e.currentTarget.style.outline = '3px solid #007bff'}
          onBlur={(e) => e.currentTarget.style.outline = 'none'}
        >
          - <span aria-hidden="true">(Minus)</span>
        </button>
        <button
          onClick={onZoomIn}
          aria-label="Zoom in"
          style={{
            padding: '4px 12px',
            cursor: 'pointer',
            border: '1px solid #333',
            borderRadius: 4
          }}
          onFocus={(e) => e.currentTarget.style.outline = '3px solid #007bff'}
          onBlur={(e) => e.currentTarget.style.outline = 'none'}
        >
          + <span aria-hidden="true">(Plus)</span>
        </button>
      </div>

      <div style={{ borderLeft: '1px solid #ccc', paddingLeft: 16 }} role="group" aria-label="Focus controls">
        <label style={{ marginRight: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autofocus}
            onChange={onToggleAutofocus}
            aria-label="Toggle autofocus"
            style={{ cursor: 'pointer' }}
          /> Autofocus <span aria-hidden="true">(A)</span>
        </label>
        <span style={{ marginRight: 8 }} aria-live="polite">Focus: {focus}</span>
        <button
          onClick={onFocusOut}
          disabled={autofocus}
          aria-label="Decrease focus"
          title={autofocus ? 'Disable autofocus to adjust focus' : 'Decrease focus (D key)'}
          style={{
            padding: '4px 12px',
            marginRight: 4,
            cursor: autofocus ? 'not-allowed' : 'pointer',
            opacity: autofocus ? 0.5 : 1,
            border: '1px solid #333',
            borderRadius: 4
          }}
          onFocus={(e) => !autofocus && (e.currentTarget.style.outline = '3px solid #007bff')}
          onBlur={(e) => e.currentTarget.style.outline = 'none'}
        >
          - <span aria-hidden="true">(D)</span>
        </button>
        <button
          onClick={onFocusIn}
          disabled={autofocus}
          aria-label="Increase focus"
          title={autofocus ? 'Disable autofocus to adjust focus' : 'Increase focus (F key)'}
          style={{
            padding: '4px 12px',
            cursor: autofocus ? 'not-allowed' : 'pointer',
            opacity: autofocus ? 0.5 : 1,
            border: '1px solid #333',
            borderRadius: 4
          }}
          onFocus={(e) => !autofocus && (e.currentTarget.style.outline = '3px solid #007bff')}
          onBlur={(e) => e.currentTarget.style.outline = 'none'}
        >
          + <span aria-hidden="true">(F)</span>
        </button>
        {autofocus && (
          <span style={{ marginLeft: 8, fontSize: '0.9em', color: '#666' }} aria-live="polite">
            (Disable autofocus to adjust focus manually)
          </span>
        )}
      </div>
    </div>
  );
}
