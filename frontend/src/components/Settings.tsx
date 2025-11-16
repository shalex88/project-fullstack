interface SettingsProps {
  info: string;
  autofocus: boolean;
  stabilization: boolean;
  onToggleAutofocus: () => void;
  onToggleStabilization: () => void;
}

export default function Settings({ info, autofocus, stabilization, onToggleAutofocus, onToggleStabilization }: SettingsProps) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        border: '1px solid #ddd',
        borderRadius: 4,
        backgroundColor: '#fafafa'
      }}
      role="region"
      aria-label="Camera settings"
    >
      <h3 style={{ marginTop: 0 }}>Camera Settings</h3>

      <div style={{ marginBottom: 12 }}>
        <strong>Camera Info:</strong>
        <div style={{ marginTop: 4, padding: 8, backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: 4, fontFamily: 'monospace', fontSize: '0.9em' }}>
          {info || 'Loading...'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={autofocus}
            onChange={onToggleAutofocus}
            aria-label="Enable autofocus"
            style={{ cursor: 'pointer' }}
          />
          <span>Enable Autofocus</span>
        </label>

        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={stabilization}
            onChange={onToggleStabilization}
            aria-label="Enable stabilization"
            style={{ cursor: 'pointer' }}
          />
          <span>Enable Stabilization</span>
        </label>
      </div>
    </div>
  );
}
