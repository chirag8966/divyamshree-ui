import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { use3DPress } from '../src/use3DPress';

// tests/setup.js pins Element.prototype.getBoundingClientRect to a 300x400 box
// anchored at the origin, so the maths below is deterministic.
const NEUTRAL = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)';

function mount(options) {
  const ref = { current: document.createElement('div') };
  const hook = renderHook(() => use3DPress(ref, options));
  return { ref, ...hook };
}

function mouseEvent(x, y, pointerType = 'mouse') {
  return { clientX: x, clientY: y, pointerType };
}

describe('use3DPress', () => {
  it('starts neutral and unhovered', () => {
    const { result } = mount();
    expect(result.current.transform3d).toBe(NEUTRAL);
    expect(result.current.isHovered).toBe(false);
    expect(result.current.className).toBe('');
  });

  it('tilts right-hand-side hover to a positive rotateY', () => {
    const { result } = mount({ maxAngle: 4.2 });
    act(() => {
      result.current.pressProps.onPointerEnter(mouseEvent(300, 200));
    });
    // normX = (300 - 150) / 150 = 1 -> rotY = 4.20deg; y is centred so rotX stays 0
    expect(result.current.transform3d).toContain('rotateY(4.20deg)');
    expect(result.current.transform3d).toContain('rotateX(0.00deg)');
    expect(result.current.isHovered).toBe(true);
    expect(result.current.className).toBe('is-hovered is-tapped');
  });

  it('tilts top-edge hover to a positive rotateX at 85% of maxAngle', () => {
    const { result } = mount({ maxAngle: 4.2 });
    act(() => {
      result.current.pressProps.onPointerEnter(mouseEvent(150, 0));
    });
    // normY = (0 - 200) / 200 = -1 -> rotX = -(-1) * 4.2 * 0.85 = 3.57deg
    expect(result.current.transform3d).toContain('rotateX(3.57deg)');
    expect(result.current.transform3d).toContain('rotateY(0.00deg)');
  });

  it('clamps pointer coordinates that fall outside the element', () => {
    const { result } = mount({ maxAngle: 4.2 });
    act(() => {
      result.current.pressProps.onPointerEnter(mouseEvent(9999, 200));
    });
    expect(result.current.transform3d).toContain('rotateY(4.20deg)');
  });

  it('applies the configured scale and translateZ', () => {
    const { result } = mount({ scale: 1.01, translateZ: 12 });
    act(() => {
      result.current.pressProps.onPointerEnter(mouseEvent(150, 200));
    });
    expect(result.current.transform3d).toContain('translateZ(12px)');
    expect(result.current.transform3d).toContain('scale3d(1.01, 1.01, 1.01)');
  });

  it('uses the pressedBoxShadow callback with clamped coordinates', () => {
    const seen = [];
    const { result } = mount({
      pressedBoxShadow: (x, y) => {
        seen.push([x, y]);
        return `0 0 0 ${x}`;
      },
    });
    act(() => {
      result.current.pressProps.onPointerEnter(mouseEvent(300, 200));
    });
    expect(seen).toEqual([[1, 0]]);
    expect(result.current.boxShadow).toBe('0 0 0 1');
  });

  it('ignores touch on pointer-enter so mobile taps do not jump the tilt', () => {
    const { result } = mount();
    act(() => {
      result.current.pressProps.onPointerEnter(mouseEvent(300, 200, 'touch'));
    });
    expect(result.current.transform3d).toBe(NEUTRAL);
    expect(result.current.isHovered).toBe(false);
  });

  it('springs back to neutral when the pointer leaves', () => {
    const { result } = mount();
    act(() => {
      result.current.pressProps.onPointerEnter(mouseEvent(300, 200));
    });
    act(() => {
      result.current.pressProps.onPointerLeave(mouseEvent(300, 200, 'mouse'));
    });
    expect(result.current.transform3d).toBe(NEUTRAL);
    expect(result.current.isHovered).toBe(false);
  });

  it('keeps the tilt held when a touch pointer leaves', () => {
    const { result } = mount();
    act(() => {
      result.current.pressProps.onPointerDown(mouseEvent(300, 200, 'touch'));
    });
    act(() => {
      result.current.pressProps.onPointerLeave(mouseEvent(300, 200, 'touch'));
    });
    expect(result.current.isHovered).toBe(true);
    expect(result.current.transform3d).toContain('rotateY(4.20deg)');
  });

  it('resets via the exposed reset()', () => {
    const { result } = mount();
    act(() => {
      result.current.pressProps.onPointerEnter(mouseEvent(300, 200));
    });
    act(() => {
      result.current.reset(false);
    });
    expect(result.current.transform3d).toBe(NEUTRAL);
    expect(result.current.transition).toBe('none');
  });

  it('does nothing when the ref is not attached', () => {
    const hook = renderHook(() => use3DPress({ current: null }));
    act(() => {
      hook.result.current.pressProps.onPointerEnter(mouseEvent(300, 200));
    });
    expect(hook.result.current.transform3d).toBe(NEUTRAL);
  });
});
