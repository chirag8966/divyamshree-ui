import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook providing an interactive 3D hover/tilt effect.
 * When a user hovers over any part of the element (desktop or mobile touch),
 * the card dynamically tilts and reacts in 3D perspective to the cursor position.
 * When the pointer leaves, it smoothly springs back to neutral.
 */
export function use3DPress(ref, options = {}) {
  const {
    maxAngle = 4.2,
    scale = 1.01,
    translateZ = 0,
    baseBoxShadow = '',
    pressedBoxShadow = null,
    mobileHoldMs = 1100,
  } = options;

  const [transform3d, setTransform3d] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)');
  const [transition, setTransition] = useState('transform 0.45s cubic-bezier(0.25, 1.6, 0.45, 1), box-shadow 0.45s ease-out');
  const [boxShadow, setBoxShadow] = useState(baseBoxShadow);
  const [isHovered, setIsHovered] = useState(false);

  const rafRef = useRef(null);
  const mobileTimerRef = useRef(null);

  const getPointerCoords = (e) => {
    if (e.clientX !== undefined && e.clientY !== undefined) {
      return { x: e.clientX, y: e.clientY };
    }
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return null;
  };

  const resetToNeutral = useCallback((isSmooth = true) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (mobileTimerRef.current) clearTimeout(mobileTimerRef.current);
    setIsHovered(false);
    setTransition(isSmooth ? 'transform 0.6s cubic-bezier(0.25, 1.6, 0.45, 1), box-shadow 0.6s ease-out' : 'none');
    setTransform3d('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)');
    setBoxShadow(baseBoxShadow);
  }, [baseBoxShadow]);

  const updateTilt = useCallback((coords) => {
    if (!ref.current || !coords) return;
    const rect = ref.current.getBoundingClientRect();
    const clickX = coords.x - rect.left;
    const clickY = coords.y - rect.top;

    // Relative to center: -1 to +1
    const normX = (clickX - rect.width / 2) / (rect.width / 2);
    const normY = (clickY - rect.height / 2) / (rect.height / 2);

    const clampedX = Math.max(-1, Math.min(1, normX));
    const clampedY = Math.max(-1, Math.min(1, normY));

    // Dynamic 3D tilt: hovering/tapping on left tilts left side inward (rotY < 0),
    // hovering/tapping on right tilts right side inward (rotY > 0),
    // hovering/tapping top/bottom tilts top/bottom inward.
    const rotY = clampedX * maxAngle;
    const rotX = -clampedY * (maxAngle * 0.85);

    setIsHovered(true);
    setTransition('transform 0.1s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.1s ease-out');
    setTransform3d(
      `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(${translateZ}px) scale3d(${scale}, ${scale}, ${scale})`
    );

    if (pressedBoxShadow) {
      setBoxShadow(pressedBoxShadow(clampedX, clampedY));
    }
  }, [ref, maxAngle, scale, translateZ, pressedBoxShadow]);

  const handlePointerMove = useCallback((e) => {
    const coords = getPointerCoords(e);
    if (!coords) return;

    if (mobileTimerRef.current) clearTimeout(mobileTimerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      updateTilt(coords);
    });
  }, [updateTilt]);

  const handlePointerEnter = useCallback((e) => {
    if (e.pointerType === 'touch') return;
    const coords = getPointerCoords(e);
    if (coords) {
      updateTilt(coords);
    }
  }, [updateTilt]);

  const handlePointerDown = useCallback((e) => {
    if (mobileTimerRef.current) clearTimeout(mobileTimerRef.current);
    const coords = getPointerCoords(e);
    if (coords) {
      updateTilt(coords);
    }
  }, [updateTilt]);

  const handlePointerUp = useCallback((e) => {
    if (e.pointerType === 'touch') {
      // Hold tilt smoothly on mobile tap then animate back
      if (mobileTimerRef.current) clearTimeout(mobileTimerRef.current);
      mobileTimerRef.current = setTimeout(() => {
        resetToNeutral(true);
      }, mobileHoldMs);
    } else {
      resetToNeutral(true);
    }
  }, [resetToNeutral, mobileHoldMs]);

  const handlePointerLeave = useCallback((e) => {
    if (e && e.pointerType === 'touch') {
      return;
    }
    resetToNeutral(true);
  }, [resetToNeutral]);

  const handlePointerCancel = useCallback(() => {
    resetToNeutral(true);
  }, [resetToNeutral]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (mobileTimerRef.current) clearTimeout(mobileTimerRef.current);
    };
  }, []);

  return {
    transform3d,
    transition,
    boxShadow,
    isHovered,
    reset: resetToNeutral,
    className: isHovered ? 'is-hovered is-tapped' : '',
    style: {
      transform: transform3d,
      transition,
      ...(boxShadow ? { boxShadow } : {}),
      transformStyle: 'preserve-3d',
      willChange: 'transform, box-shadow',
    },
    pressProps: {
      onPointerEnter: handlePointerEnter,
      onPointerMove: handlePointerMove,
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
      onPointerCancel: handlePointerCancel,
    },
  };
}
