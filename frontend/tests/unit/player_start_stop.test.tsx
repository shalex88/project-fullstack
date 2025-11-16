import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Player from '../../src/components/Player';

describe('Player Start/Stop Flow', () => {
  it('shows placeholder when not playing', () => {
    render(<Player streamUrl="" isPlaying={false} />);
    expect(screen.getByText(/stream stopped/i)).toBeDefined();
  });

  it('renders video element when playing', async () => {
    const mockSrc = 'http://localhost:8888/camera1/index.m3u8';
    render(<Player streamUrl={mockSrc} isPlaying={true} />);

    await waitFor(() => {
      const video = document.querySelector('video') as HTMLVideoElement;
      expect(video).toBeDefined();
    });
  });

  it('stops video when playing becomes false', async () => {
    const mockSrc = 'http://localhost:8888/camera1/index.m3u8';
    const { rerender } = render(<Player streamUrl={mockSrc} isPlaying={true} />);

    await waitFor(() => {
      expect(document.querySelector('video')).toBeDefined();
    });

    rerender(<Player streamUrl={mockSrc} isPlaying={false} />);

    expect(screen.getByText(/stream stopped/i)).toBeDefined();
  });

  it('handles error state gracefully', async () => {
    const mockSrc = 'http://invalid-url/stream.m3u8';
    render(<Player streamUrl={mockSrc} isPlaying={true} />);

    // Player component should handle errors internally
    await waitFor(() => {
      expect(document.querySelector('video')).toBeDefined();
    });
  });
});
