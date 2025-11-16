interface StatusProps {
  connected: boolean;
  message?: string;
}

export default function Status({ connected, message }: StatusProps) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: 12,
        border: `2px solid ${connected ? '#28a745' : '#dc3545'}`,
        borderRadius: 4,
        backgroundColor: connected ? '#d4edda' : '#f8d7da',
        color: connected ? '#155724' : '#721c24'
      }}
      role="status"
      aria-live="polite"
    >
      <strong>{connected ? '✓ Connected' : '✗ Disconnected'}</strong>
      {message && <span style={{ marginLeft: 8 }}>— {message}</span>}
    </div>
  );
}
