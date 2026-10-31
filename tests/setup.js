import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// jsdom has no canvas backend, so HeroScrollStory's getContext() calls surface as
// "Not implemented" notices on every render. They are environmental noise, not
// failures — drop only those lines and let everything else through.
const realConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Not implemented: HTMLCanvasElement')) return;
  realConsoleError(...args);
};

// jsdom has no canvas backend; its getContext() logs a "Not implemented" notice on
// every HeroScrollStory render. jsdom's own fallback also yields null, so returning
// null directly is behaviourally identical and keeps the test output readable.
HTMLCanvasElement.prototype.getContext = () => null;

afterEach(() => {
  cleanup();
});

// jsdom implements neither of these; the 3D-press hook and scroll story rely on them.
if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
}

Element.prototype.getBoundingClientRect = function () {
  return {
    width: 300,
    height: 400,
    top: 0,
    left: 0,
    right: 300,
    bottom: 400,
    x: 0,
    y: 0,
    toJSON: () => {},
  };
};

globalThis.matchMedia = globalThis.matchMedia || ((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

globalThis.IntersectionObserver = globalThis.IntersectionObserver || class {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};

globalThis.ResizeObserver = globalThis.ResizeObserver || class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
