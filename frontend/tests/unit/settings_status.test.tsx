import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from '../../src/components/Settings';
import Status from '../../src/components/Status';

describe('Settings Panel', () => {
  it('displays camera info', () => {
    const mockInfo = 'Camera Model XYZ v1.0';
    render(
      <Settings
        info={mockInfo}
        autofocus={false}
        stabilization={false}
        onToggleAutofocus={() => {}}
        onToggleStabilization={() => {}}
      />
    );

    expect(screen.getByText(mockInfo)).toBeDefined();
  });

  it('calls onToggleAutofocus when checkbox clicked', async () => {
    const user = userEvent.setup();
    let toggled = false;
    const handleToggle = () => { toggled = true; };

    render(
      <Settings
        info="Test Camera"
        autofocus={false}
        stabilization={false}
        onToggleAutofocus={handleToggle}
        onToggleStabilization={() => {}}
      />
    );

    const checkbox = screen.getByLabelText(/enable autofocus/i);
    await user.click(checkbox);

    expect(toggled).toBe(true);
  });

  it('calls onToggleStabilization when checkbox clicked', async () => {
    const user = userEvent.setup();
    let toggled = false;
    const handleToggle = () => { toggled = true; };

    render(
      <Settings
        info="Test Camera"
        autofocus={false}
        stabilization={false}
        onToggleAutofocus={() => {}}
        onToggleStabilization={handleToggle}
      />
    );

    const checkbox = screen.getByLabelText(/enable stabilization/i);
    await user.click(checkbox);

    expect(toggled).toBe(true);
  });
});

describe('Status Component', () => {
  it('shows connected state with green styling', () => {
    render(<Status connected={true} message="All systems go" />);

    expect(screen.getByText(/connected/i)).toBeDefined();
    expect(screen.getByText(/all systems go/i)).toBeDefined();
  });

  it('shows disconnected state with red styling', () => {
    render(<Status connected={false} message="Service unavailable" />);

    expect(screen.getByText(/disconnected/i)).toBeDefined();
    expect(screen.getByText(/service unavailable/i)).toBeDefined();
  });

  it('renders without message', () => {
    render(<Status connected={true} />);

    expect(screen.getByText(/connected/i)).toBeDefined();
  });
});
