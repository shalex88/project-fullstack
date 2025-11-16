import { render, screen } from '@testing-library/react';
import App from '../../src/App';

describe('frontend smoke', () => {
  it('renders heading', () => {
    render(<App />);
    expect(screen.getByText(/Camera Control Dashboard/i)).toBeInTheDocument();
  });
});
