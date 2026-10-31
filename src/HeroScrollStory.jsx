import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, ShieldCheck, Flame, ChevronDown, ShoppingBag } from 'lucide-react';

const TOTAL_FRAMES = 30;

// Cache-busting token for the frame images.
//
// The frames have STABLE filenames (frame_001.webp never changes name), so both
// the browser HTTP cache and the CloudFront edge will happily serve a stale copy
// for as long as their max-age allows. Appending a version query string makes
// each deploy a brand-new URL, which sidesteps every cache layer at once.
//
// BUMP THIS whenever the frame images change. It must match the value used in
// index.html's <link rel="preload"> for frame_001.webp.
const FRAME_CACHE_BUST = 'v4';

// Sample 30 frames evenly across the 62 available video frame assets for lightweight mobile performance
const getFrameUrl = (index) => {
  const actualFrameNumber = Math.min(62, Math.round(index * (61 / (TOTAL_FRAMES - 1))) + 1);
  const frameNum = String(actualFrameNumber).padStart(3, '0');
  return `/frames/frame_${frameNum}.webp?${FRAME_CACHE_BUST}`;
};

// Handcrafted botanical vector icons for the masala ingredient display
const CardamomIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E5A93C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8 6 6 11 6 15a6 6 0 0 0 12 0c0-4-2-9-6-13z" fill="rgba(229,169,60,0.18)" />
    <path d="M12 4v16" strokeDasharray="2 2" stroke="rgba(229,169,60,0.7)" />
    <path d="M9 11c1.5 1.5 4.5 1.5 6 0" />
    <path d="M8.5 15.5c2 1.8 5 1.8 7 0" />
    <path d="M12 2c0-1.2.8-2 2-2" />
  </svg>
);

const CinnamonIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E5A93C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="6" cy="18" rx="3.5" ry="2.5" fill="rgba(229,169,60,0.18)" />
    <path d="M6 15.5c-1 0-1.8.8-1.8 1.8 0 .8.6 1.4 1.4 1.4.6 0 1.1-.4 1.1-1" />
    <path d="M9.5 18L19.5 5.5" />
    <path d="M2.5 18L12.5 5.5" />
    <ellipse cx="16" cy="4.2" rx="3.5" ry="2" transform="rotate(-35 16 4.2)" fill="rgba(229,169,60,0.18)" />
  </svg>
);

const GingerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E5A93C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 16c-1.8-1-2.5-3-2-5 .4-1.6 1.8-2.6 3.5-2.6.8 0 1.5-.7 1.5-1.5 0-1.4 1-2.4 2.4-2.4 1.5 0 2.6 1 2.6 2.5 0 .7.5 1.4 1.2 1.6 2.5.7 2.8 2.5 2.5 4.2-.4 2.2-2.2 4.2-4.5 4.2-1.2 0-2-.8-3-.8s-2.2.8-4.2-.2z" fill="rgba(229,169,60,0.18)" />
    <path d="M9 11c1 .4 2 .4 3 0" />
    <path d="M12 8c.7.4 1.4.4 2 0" />
    <path d="M8.5 14c1 .5 2.2.5 3.2 0" />
  </svg>
);

const CloveIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E5A93C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="6.5" r="3.2" fill="rgba(229,169,60,0.25)" />
    <path d="M8 8.5c1-1 2.8-1.5 4-1.5s3 .5 4 1.5" />
    <path d="M9.2 9.5l-1.8-1.5" />
    <path d="M14.8 9.5l1.8-1.5" />
    <path d="M10.2 10.5L9.5 21h5l-.7-10.5" fill="rgba(229,169,60,0.15)" />
    <path d="M10 14h4" />
    <path d="M10.5 17h3" />
  </svg>
);

const PepperIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E5A93C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8.5" r="3" fill="rgba(229,169,60,0.2)" />
    <circle cx="16" cy="7.5" r="2.8" fill="rgba(229,169,60,0.18)" />
    <circle cx="12" cy="14" r="3.4" fill="rgba(229,169,60,0.25)" />
    <circle cx="17.5" cy="16" r="2.5" fill="rgba(229,169,60,0.18)" />
    <circle cx="6.5" cy="15.5" r="2.5" fill="rgba(229,169,60,0.18)" />
    <path d="M12 2.5c-.8 2.5-1.5 5-1.5 8" strokeDasharray="1.5 1.5" stroke="rgba(229,169,60,0.6)" />
  </svg>
);

const NutmegIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E5A93C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="12" rx="7" ry="8.5" fill="rgba(229,169,60,0.18)" />
    <path d="M12 4c-2 2.5-3 5.2-3 8s1 5.5 3 8" />
    <path d="M12 4c2 2.5 3 5.2 3 8s-1 5.5-3 8" />
    <path d="M6 10c2 .5 4 1 6 1s4-.5 6-1" />
    <path d="M6.5 14.5c2 .5 3.5.8 5.5.8s3.5-.3 5.5-.8" />
  </svg>
);

const StarAniseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E5A93C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2.2" fill="rgba(229,169,60,0.35)" />
    <path d="M12 2.5l1.6 4.5h4.4l-3.5 2.5 1.4 4.5-3.9-2.7-3.9 2.7 1.4-4.5-3.5-2.5h4.4z" fill="rgba(229,169,60,0.2)" />
    <circle cx="12" cy="5.5" r="0.9" fill="#E5A93C" />
    <circle cx="17.2" cy="9.2" r="0.9" fill="#E5A93C" />
    <circle cx="15.5" cy="15.2" r="0.9" fill="#E5A93C" />
    <circle cx="8.5" cy="15.2" r="0.9" fill="#E5A93C" />
    <circle cx="6.8" cy="9.2" r="0.9" fill="#E5A93C" />
  </svg>
);

const masalaIngredients = [
  { id: 'jeera', name: 'Jeera', Icon: CardamomIcon },
  { id: 'saunf', name: 'Saunf', Icon: CinnamonIcon },
  { id: 'dhaniya', name: 'Dhaniya', Icon: GingerIcon },
  { id: 'ajwain', name: 'Ajwain', Icon: CloveIcon },
  { id: 'tejpatta', name: 'Tejpatta', Icon: PepperIcon },
  { id: 'kala-namak', name: 'Kala Namak', Icon: NutmegIcon },
  { id: 'amchur', name: 'Amchur Powder', Icon: StarAniseIcon, isFeatured: true }
];

const HeroScrollStory = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const progressLineRef = useRef(null);
  const indicatorThumbRef = useRef(null);
  const indicatorPctRef = useRef(null);
  const bottomTransitionRef = useRef(null);
  const progressIndicatorRef = useRef(null);
  const imagesRef = useRef(new Array(TOTAL_FRAMES));
  const currentFrameRef = useRef(-1);
  const rafIdRef = useRef(null);
  const metricsRef = useRef({ storyTop: 0, totalDistance: 0 });
  const lastProgressRef = useRef(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Draw a specific frame onto canvas with object-fit: cover math
  const drawFrame = useCallback((frameIndex, force = false) => {
    if (!force && currentFrameRef.current === frameIndex) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;
    if (window.innerWidth < 768) {
      ctx.imageSmoothingQuality = 'low';
    }

    // Retrieve requested frame, or fallback to closest loaded frame to prevent any blank flicker
    let img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let f = frameIndex; f >= 0; f--) {
        if (imagesRef.current[f] && imagesRef.current[f].complete && imagesRef.current[f].naturalWidth > 0) {
          img = imagesRef.current[f];
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    currentFrameRef.current = frameIndex;
    const width = canvas.width;
    const height = canvas.height;

    // Cover math preserving aspect ratio
    const hRatio = width / img.naturalWidth;
    const vRatio = height / img.naturalHeight;
    const ratio = Math.max(hRatio, vRatio);
    const centerShiftX = (width - img.naturalWidth * ratio) / 2;
    const centerShiftY = (height - img.naturalHeight * ratio) / 2;

    ctx.drawImage(
      img,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
      centerShiftX,
      centerShiftY,
      img.naturalWidth * ratio,
      img.naturalHeight * ratio
    );
  }, []);

  // Progressive Priority Loading: Frame 0 (LCP) -> Buffer (1-10) -> Idle Stream (11-61)
  useEffect(() => {
    let isMounted = true;
    let loaded = 0;
    const images = imagesRef.current;

    const loadSingleImage = (index, isCritical = false) => {
      return new Promise((resolve) => {
        const img = new Image();
        if (isCritical) {
          img.fetchPriority = 'high';
        }
        img.src = getFrameUrl(index);

        const onComplete = () => {
          if (!isMounted) return;
          images[index] = img;
          loaded++;
          setLoadedCount(loaded);
          if (index === 0) {
            drawFrame(0, true);
          }
          resolve(img);
        };

        if (img.complete && img.naturalWidth > 0) {
          onComplete();
        } else {
          img.onload = onComplete;
          img.onerror = () => resolve(null);
        }
      });
    };

    // Step 1: Immediately fetch and render Frame 0 (Eliminates LCP Resource Load Delay)
    loadSingleImage(0, true).then(() => {
      if (!isMounted) return;

      // Step 2: Load immediate scroll buffer (Frames 1-10)
      const bufferPromises = [];
      for (let i = 1; i <= Math.min(10, TOTAL_FRAMES - 1); i++) {
        bufferPromises.push(loadSingleImage(i));
      }

      Promise.all(bufferPromises).then(() => {
        if (!isMounted) return;

        // Step 3: Stream remaining frames in idle slices without blocking main thread
        let nextIndex = 11;
        const loadNextChunk = () => {
          if (!isMounted || nextIndex >= TOTAL_FRAMES) return;
          const chunkSize = 4;
          const end = Math.min(nextIndex + chunkSize, TOTAL_FRAMES);
          for (let i = nextIndex; i < end; i++) {
            loadSingleImage(i);
          }
          nextIndex = end;

          if (nextIndex < TOTAL_FRAMES) {
            if ('requestIdleCallback' in window) {
              window.requestIdleCallback(() => loadNextChunk(), { timeout: 200 });
            } else {
              setTimeout(loadNextChunk, 40);
            }
          }
        };

        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() => loadNextChunk(), { timeout: 200 });
        } else {
          setTimeout(loadNextChunk, 40);
        }
      });
    });

    return () => {
      isMounted = false;
    };
  }, [drawFrame]);

  // Resize canvas and cache layout metrics to eliminate scroll layout thrashing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const isMobile = window.innerWidth < 768;
        const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        drawFrame(currentFrameRef.current >= 0 ? currentFrameRef.current : 0, true);
      }

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        metricsRef.current = {
          storyTop: rect.top + window.scrollY,
          totalDistance: containerRef.current.offsetHeight - window.innerHeight
        };
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [drawFrame]);

  // Scroll handler bound to container height with decoupled 60FPS DOM updates
  useEffect(() => {
    const updateScroll = () => {
      const { storyTop, totalDistance } = metricsRef.current;
      if (totalDistance <= 0) return;

      const scrollY = window.scrollY;
      const progress = Math.min(Math.max((scrollY - storyTop) / totalDistance, 0), 1);

      // Fast-path visual updates directly via DOM refs (zero React re-render overhead!)
      if (progressLineRef.current) {
        progressLineRef.current.style.transform = `scaleX(${progress})`;
      }
      if (indicatorThumbRef.current) {
        indicatorThumbRef.current.style.height = `${Math.round(progress * 100)}%`;
      }
      if (indicatorPctRef.current) {
        indicatorPctRef.current.textContent = `${Math.round(progress * 100)}%`;
      }
      if (bottomTransitionRef.current) {
        // Smoothly fade bottom transition into pure warm ivory, reaching 100% by 0.96
        const transOpacity = Math.max(0, Math.min(1, (progress - 0.78) / 0.18));
        bottomTransitionRef.current.style.opacity = String(transOpacity);
      }
      if (progressIndicatorRef.current) {
        // Gently fade out scroll indicator as the story concludes into heritage
        const indOpacity = progress > 0.93 ? Math.max(0, 1 - (progress - 0.93) / 0.05) : 1;
        progressIndicatorRef.current.style.opacity = String(indOpacity);
      }

      // Map progress to frame index
      const frameIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1)))
      );
      drawFrame(frameIndex);

      // Only update React state when crossing threshold to minimize component re-renders
      const threshold = window.innerWidth < 768 ? 0.012 : 0.006;
      if (
        Math.abs(progress - lastProgressRef.current) > threshold ||
        progress === 0 ||
        progress === 1
      ) {
        lastProgressRef.current = progress;
        setScrollProgress(progress);
      }
    };

    const handleScroll = () => {
      if (rafIdRef.current) return;
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        updateScroll();
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [drawFrame]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Opacity helper for scroll stages
  const getStageOpacity = (start, end, fadeBuffer = 0.05) => {
    if (scrollProgress < start - fadeBuffer || scrollProgress > end + fadeBuffer) {
      return 0;
    }
    if (scrollProgress >= start && scrollProgress <= end) {
      return 1;
    }
    if (scrollProgress < start) {
      return (scrollProgress - (start - fadeBuffer)) / fadeBuffer;
    }
    return ((end + fadeBuffer) - scrollProgress) / fadeBuffer;
  };

  // Frame timeline (30 sampled frames across 62 assets):
  //   frames 1-10  -> tea / intro      (progress 0.000 - 0.138)
  //   frames 11-26 -> coffee card      (progress 0.172 - 0.414)
  //   frames 27-43 -> jeerawan masala  (progress 0.448 - 0.724)
  //   frames 44-62 -> all 3 products   (progress 0.759 - 1.000) -> NO card shown
  const stage0Opacity = getStageOpacity(0.0, 0.14, 0.04);
  const stage2Opacity = getStageOpacity(0.45, 0.70, 0.04);
  const stage3Opacity = getStageOpacity(0.17, 0.40, 0.04);

  // Tap & click interaction matching product card animation
  const [tappedStageIdx, setTappedStageIdx] = useState(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.stage-card')) {
        setTappedStageIdx(null);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="hero-scroll-wrapper" id="story">
      <div className="hero-sticky-stage">
        <img
          className="hero-poster"
          src={`/frames/frame_001.webp?${FRAME_CACHE_BUST}`}
          alt=""
          width="1280"
          height="720"
          fetchPriority="high"
          decoding="async"
          aria-hidden="true"
        />

        {/* The 60FPS Video Loop Canvas */}
        <canvas 
          ref={canvasRef} 
          className="hero-canvas" 
          role="img" 
          aria-label="Divyam Shree Premium Regular Tea, Hand-Picked Leaves, 1kg Pack, preparation tradition animation" 
        />

        {/* Cinematic Film Vignette */}
        <div className="hero-cinematic-overlay"></div>

        {/* Loading Progress Indicator (Fades out immediately when Frame 0 is ready) */}
        {loadedCount === 0 && (
          <div className="hero-loader">
            <div className="loader-spinner"></div>
            <span>Setting the table...</span>
          </div>
        )}

        {/* Scroll Progress Bar at top (Hardware Accelerated scaleX) */}
        <div className="scroll-progress-line-track">
          <div 
            ref={progressLineRef}
            className="scroll-progress-line-fill" 
            style={{ transform: `scaleX(${scrollProgress})` }}
          />
        </div>

        {/* STAGE 0: Grand Brand Intro (0% - 18%) — anchored LEFT so the
            subject in frames 001-026 (centre/right) stays fully visible */}
        <div 
          className="story-panel stage-intro"
          style={{ 
            opacity: stage0Opacity, 
            pointerEvents: stage0Opacity > 0.5 ? 'auto' : 'none',
            transform: `translateY(${(1 - stage0Opacity) * 20}px)`
          }}
        >
          <div className="story-badge">
            <Sparkles size={14} className="badge-icon" />
            <span>SINCE 1980</span>
          </div>
          <h1 className="story-hero-title">
            Divyam<br />Shree
            <span className="sr-only">, Premium Regular Tea, Cold Coffee Mix &amp; Indore Jeerawan Masala</span>
          </h1>
          <h2 className="sr-only">
            Buy Divyam Shree Premium Regular Tea, Cold Coffee Instant Mix and Jeerawan Masala Online in India
          </h2>
          <p className="story-hero-subtitle">
            Premium regular tea with hand-picked leaves, café-style cold coffee mix and Indore Jeerawan masala — made the same way by our family since the 1980s. Shipped across India.
          </p>
          <div className="stage-intro-actions">
            <button 
              className="btn-discover"
              onClick={() => scrollToSection('products')}
              aria-label="Buy Divyam Shree tea, cold coffee and Jeerawan Masala online in India"
            >
              <ShoppingBag size={18} style={{ marginRight: '8px' }} />
              Shop Tea, Coffee &amp; Masala
            </button>
          </div>
          <div className="scroll-down-prompt">
            <span className="prompt-text">Scroll for the rest of the pantry</span>
            <div className="mouse-indicator">
              <div className="mouse-wheel"></div>
            </div>
            <ChevronDown size={18} className="prompt-arrow" />
          </div>
        </div>

        {/* STAGE 1: Cold coffee instant mix (24% - 46%) — LEFT panel.
            Frames 016-029 are busiest on the right, so the left third is clear. */}
        <div 
          className={`story-panel stage-card stage-card-left ${tappedStageIdx === 3 ? 'is-tapped is-active' : ''}`}
          style={{ 
            opacity: stage3Opacity, 
            pointerEvents: stage3Opacity > 0.5 ? 'auto' : 'none',
            '--stage-scroll-y': `${(1 - stage3Opacity) * 30}px`,
          }}
          onClick={() => setTappedStageIdx(prev => prev === 3 ? null : 3)}
        >
          <div className="story-badge">
            <ShieldCheck size={14} className="badge-icon" />
            <span>COLD COFFEE · INSTANT MIX</span>
          </div>
          <h2 className="story-card-title">Cold Coffee, Made for Hot Afternoons</h2>
          <p className="story-card-text">
            Whisk. Chill. Indulge. Café-style creaminess in every sip.
          </p>
          <div className="experience-metrics">
            <div className="metric">
              <span className="metric-num">3</span>
              <span className="metric-label">Blends in the Pantry</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric">
              <span className="metric-num">3</span>
              <span className="metric-label">Things in the Mix</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric">
              <span className="metric-num">40+</span>
              <span className="metric-label">Years in the Family</span>
            </div>
          </div>
        </div>

        {/* STAGE 2: Jeerawan Masala ingredients (54% - 88%) — RIGHT panel.
            Frames 034-055 are bright and busy on the left/centre, so the right third is clear. */}
        <div 
          className={`story-panel stage-card stage-card-right ${tappedStageIdx === 2 ? 'is-tapped is-active' : ''}`}
          style={{ 
            opacity: stage2Opacity, 
            pointerEvents: stage2Opacity > 0.5 ? 'auto' : 'none',
            '--stage-scroll-y': `${(1 - stage2Opacity) * 30}px`,
          }}
          onClick={() => setTappedStageIdx(prev => prev === 2 ? null : 2)}
        >
          <div className="story-badge">
            <Flame size={14} className="badge-icon" />
            <span>JEERAWAN MASALA</span>
          </div>
          <h2 className="story-card-title">Masala, Ground from Whole Spices</h2>
          <p className="story-card-text">
            Jeera, saunf, dhaniya, ajwain, tejpatta, kala namak, nork, lal mirch, haldi and amchur. Sprinkle it over poha, fruit or chaat.
          </p>
          <div className="spice-grid-simple">
            {masalaIngredients.map((spice) => (
              <div 
                key={spice.id} 
                className={`spice-item-simple ${spice.isFeatured ? 'spice-item-featured' : ''}`}
              >
                <div className="spice-simple-icon">
                  <spice.Icon />
                </div>
                <span className="spice-simple-name">{spice.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Soft bottom transition overlay blending hero into warm ivory collection */}
        <div 
          ref={bottomTransitionRef}
          className="hero-bottom-transition" 
          style={{ 
            opacity: Math.max(0, Math.min(1, (scrollProgress - 0.78) / 0.18)),
            pointerEvents: 'none'
          }}
        />

        {/* Floating Scroll Indicator bottom right */}
        <div 
          ref={progressIndicatorRef}
          className="story-progress-indicator"
          style={{
            opacity: scrollProgress > 0.93 ? Math.max(0, 1 - (scrollProgress - 0.93) / 0.05) : 1
          }}
        >
          <span ref={indicatorPctRef} className="indicator-pct">{Math.round(scrollProgress * 100)}%</span>
          <div className="indicator-track">
            <div 
              ref={indicatorThumbRef}
              className="indicator-thumb"
              style={{ height: `${Math.round(scrollProgress * 100)}%` }}
            ></div>
          </div>
          <span className="indicator-label">SCROLL</span>
        </div>
      </div>
    </div>
  );
};

export default HeroScrollStory;
