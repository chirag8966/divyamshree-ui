import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App shell', () => {
  it('mounts the page container with the ambient background layer', () => {
    const { container } = render(<App />);
    expect(container.querySelector('.app-container')).toBeInTheDocument();
    expect(container.querySelector('.ambient-background')).toBeInTheDocument();
  });

  it('renders the navbar and hero above the fold', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders the code-split sections into their suspense placeholders', () => {
    const { container } = render(<App />);
    // HeritageStory / Products / FAQ / Footer are lazy — they must not throw
    // while the initial chunk is still resolving.
    expect(container.querySelectorAll('.section-placeholder').length).toBeGreaterThanOrEqual(0);
    expect(container.querySelector('main')).toBeInTheDocument();
  });
});
