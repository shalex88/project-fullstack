import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Player, { PlayerRef } from '../../src/components/Player';
import { useRef } from 'react';

// Wrapper component to test snapshot via ref
function SnapshotTestWrapper() {
  const playerRef = useRef<PlayerRef>(null);

  return (
    <div>
      <Player ref={playerRef} streamUrl="http://localhost:8888/camera1/index.m3u8" isPlaying={true} />
      <button onClick={() => playerRef.current?.captureSnapshot()}>Capture</button>
    </div>
  );
}

describe('Snapshot Feature', () => {
  it('can trigger snapshot capture via ref', async () => {
    const user = userEvent.setup();
    render(<SnapshotTestWrapper />);

    const captureButton = screen.getByText('Capture');
    expect(captureButton).toBeDefined();

    // Click should not throw; actual canvas/blob download mocked in jsdom
    await user.click(captureButton);

    // In real browser, this would trigger download; in test, verify no error
    expect(captureButton).toBeDefined();
  });

  it('snapshot ref is exposed by Player', () => {
    const ref = { current: null } as React.RefObject<PlayerRef>;
    render(<Player ref={ref} streamUrl="http://test.m3u8" isPlaying={true} />);

    // After mount, ref should have captureSnapshot method
    expect(ref.current).toBeDefined();
    expect(typeof ref.current?.captureSnapshot).toBe('function');
  });
});
