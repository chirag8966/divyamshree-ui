import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Maximize2, X, Heart } from 'lucide-react';

const storyImages = [
  {
    id: 'origin',
    num: '01',
    image: '/images/story/story_1_origin.jpg',
    imageWebp: '/images/story/story_1_origin.webp',
    imageAvif: '/images/story/story_1_origin.avif',
    alt: 'The original Divyam Shree tea stall',
    stamp: 'WHERE IT BEGAN',
    title: 'It started at a tea stall in Indore.',
    storyText: 'Our family ran a small tea stall. The recipes for the masala chai and the Jeerawan masala were written down by hand and kept in the family, and they are still the ones we use.',
    cardSticker: 'Handwritten, never printed',
    handwrittenTag: 'Then and now ♡'
  },
  {
    id: 'heritage',
    num: '02',
    image: '/images/story/story_2_heritage_1980s.jpg',
    imageWebp: '/images/story/story_2_heritage_1980s.webp',
    imageAvif: '/images/story/story_2_heritage_1980s.avif',
    alt: '1980s tea stall with grandfather pouring hot cutting chai',
    stamp: '1980s · CUTTING CHAI',
    title: 'Our grandfather\'s cutting chai.',
    storyText: 'Through the 1980s our grandfather brewed cutting chai for the lanes of Indore, blending Assam CTC with whole spices he ground each morning. We still grind ours the same way, and we still taste against his cup.',
    cardSticker: 'Good tea, good people',
    handwrittenTag: 'Some cups are hard to forget ♡'
  },
  {
    id: 'diwali',
    num: '03',
    image: '/images/story/story_3_diwali_rebirth.jpg',
    imageWebp: '/images/story/story_3_diwali_rebirth.webp',
    imageAvif: '/images/story/story_3_diwali_rebirth.avif',
    alt: 'Diwali earthen diyas and leather-bound books at 5:50 AM dawn',
    stamp: '5:50 AM · DIWALI DAWN',
    title: 'Then came last Diwali.',
    storyText: 'On Diwali morning, at 5:50, the family sat around the table and decided the recipes were too good to leave in a notebook. They became the three things we sell now: masala tea, cold coffee mix and stone-ground Jeerawan masala.',
    cardSticker: 'Ideas at 5:50 AM',
    handwrittenTag: 'That morning we started again ♡'
  },
  {
    id: 'promise',
    num: '04',
    image: '/images/story/story_4_promise.jpg',
    imageWebp: '/images/story/story_4_promise.webp',
    imageAvif: '/images/story/story_4_promise.avif',
    alt: 'Divyam Shree founder with the family recipes today',
    stamp: 'THE PROMISE · TODAY',
    title: 'What we ship today.',
    storyText: 'Everything you order leaves our kitchen and reaches you through Amazon: the masala tea, the cold coffee mix, the Jeerawan masala. We also pack gift boxes for companies and bulk quantities for cafés and hotels across India.',
    cardSticker: 'Packed by the family, sent across India',
    handwrittenTag: 'Brewed like it is for family ♡'
  }
];

const HeritageStory = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const trackRef = useRef(null);
  const cardsRef = useRef([]);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Scroll to a specific card index
  const scrollToCard = useCallback((index) => {
    const cardEl = cardsRef.current[index];
    if (cardEl && trackRef.current) {
      cardEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
      setActiveIdx(index);
    }
  }, []);

  const handlePrev = useCallback(() => {
    const prevIdx = activeIdx === 0 ? storyImages.length - 1 : activeIdx - 1;
    scrollToCard(prevIdx);
  }, [activeIdx, scrollToCard]);

  const handleNext = useCallback(() => {
    const nextIdx = activeIdx === storyImages.length - 1 ? 0 : activeIdx + 1;
    scrollToCard(nextIdx);
  }, [activeIdx, scrollToCard]);

  // Update active dot based on scroll position
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const trackCenter = track.scrollLeft + track.offsetWidth / 2;
        let closestIdx = 0;
        let minDistance = Infinity;

        cardsRef.current.forEach((card, idx) => {
          if (!card) return;
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const distance = Math.abs(trackCenter - cardCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closestIdx = idx;
          }
        });

        setActiveIdx(closestIdx);
      }, 50);
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIdx !== null) {
        if (e.key === 'Escape') setLightboxIdx(null);
        if (e.key === 'ArrowLeft') setLightboxIdx((prev) => (prev === 0 ? storyImages.length - 1 : prev - 1));
        if (e.key === 'ArrowRight') setLightboxIdx((prev) => (prev === storyImages.length - 1 ? 0 : prev + 1));
        return;
      }
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIdx, handlePrev, handleNext]);

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e) => {
    const track = trackRef.current;
    if (!track) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - track.offsetLeft;
    scrollLeftStartRef.current = track.scrollLeft;
    track.classList.add('is-dragging');
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 6) {
      hasDraggedRef.current = true;
    }
    track.scrollLeft = scrollLeftStartRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (trackRef.current) {
      trackRef.current.classList.remove('is-dragging');
    }
  };

  const [tappedCardIdx, setTappedCardIdx] = useState(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.heritage-picture-card')) {
        setTappedCardIdx(null);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  const handleCardClick = (index, e) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    const isTouchDevice = typeof window !== 'undefined' && (
      window.matchMedia('(hover: none)').matches || 
      window.matchMedia('(max-width: 1024px)').matches ||
      'ontouchstart' in window
    );

    const clickedPill = e && e.target && e.target.closest('.overlay-zoom-pill');

    if (isTouchDevice && !clickedPill) {
      if (tappedCardIdx === index) {
        setLightboxIdx(index);
      } else {
        setTappedCardIdx(index);
        setActiveIdx(index);
      }
    } else {
      setLightboxIdx(index);
    }
  };

  return (
    <section className={`heritage-section ${lightboxIdx !== null ? 'has-lightbox-open' : ''}`} id="heritage">
      <div className="heritage-bg-ambient"></div>

      <div className="heritage-pictures-container">
        {/* Minimal Section Header */}
        <div className="heritage-pictures-header">
          <div className="heritage-pill">
            <Sparkles size={14} className="heritage-pill-icon" />
            <span>OUR STORY</span>
          </div>

          <h2 className="heritage-pictures-title">
            The Story of Divyam Shree
          </h2>

          <p className="heritage-pictures-subtitle">
            Swipe or scroll: from a tea stall in the 1980s to the three blends we sell now.
          </p>
        </div>

        {/* Scrollable Pictures Wrapper */}
        <div className="heritage-slider-wrapper">
          {/* Previous Arrow Button */}
          <button
            className="slider-arrow-btn arrow-prev"
            onClick={handlePrev}
            aria-label="Previous picture"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Horizontal Scroll Track */}
          <div
            className="heritage-pictures-track"
            ref={trackRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            {storyImages.map((story, index) => (
              <div
                key={story.id}
                ref={(el) => (cardsRef.current[index] = el)}
                className={`heritage-picture-card ${activeIdx === index ? 'is-active' : ''} ${tappedCardIdx === index ? 'is-tapped' : ''}`}
                onClick={(e) => handleCardClick(index, e)}
                title="Click to view full card"
              >
                <div className="scrapbook-card">
                  {/* Decorative Washi Paper Tape Strips */}
                  <div className="washi-tape tape-top-center"></div>
                  <div className="washi-tape tape-top-right"></div>

                  {/* Photo Media Frame */}
                  <div className="card-media-frame">
                    <picture className="card-origin-picture">
                      <source type="image/avif" srcSet={story.imageAvif} />
                      <source type="image/webp" srcSet={story.imageWebp} />
                      <img
                        src={story.image}
                        alt={story.alt}
                        className="card-origin-img"
                        loading="lazy"
                        decoding="async"
                        width="600"
                        height="750"
                        draggable="false"
                      />
                    </picture>

                    {/* Vintage Postage Stamp Tag */}
                    <div className="vintage-post-stamp">
                      <span>{story.stamp}</span>
                    </div>

                    {/* Expand icon pill on hover */}
                    <div className="card-hover-overlay">
                      <span className="overlay-zoom-pill">
                        <Maximize2 size={14} />
                        <span>View Full Card</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Paper Footer with Cursive Sticker & Heart */}
                  <div className="card-paper-footer">
                    <div className="paper-sticker-note">
                      <span className="sticker-cursive">{story.cardSticker}</span>
                      <Heart size={13} fill="#A8522E" color="#A8522E" />
                    </div>
                    <span className="paper-slide-indicator">
                      {story.num} of 04
                    </span>
                  </div>

                  {/* Crawlable story copy — visually hidden, present for search engines & screen readers */}
                  <div className="sr-only">
                    <h3>{story.title}</h3>
                    <p>{story.storyText}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Next Arrow Button */}
          <button
            className="slider-arrow-btn arrow-next"
            onClick={handleNext}
            aria-label="Next picture"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Carousel Pagination & Indicator Dots */}
        <div className="heritage-pictures-controls">
          <div className="picture-dots-indicator">
            {storyImages.map((story, index) => (
              <button
                key={story.id}
                className={`picture-dot ${activeIdx === index ? 'dot-active' : ''}`}
                onClick={() => scrollToCard(index)}
                aria-label={`Go to picture ${index + 1}`}
              >
                <span className="dot-fill"></span>
              </button>
            ))}
          </div>
          <span className="picture-counter-text">
            {activeIdx + 1} of {storyImages.length}
          </span>
        </div>
      </div>

      {/* Lightbox Modal for Full Image Zoom */}
      {lightboxIdx !== null && (
        <div className="heritage-lightbox-modal" onClick={() => setLightboxIdx(null)}>
          <div className="lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close-btn"
              onClick={() => setLightboxIdx(null)}
              aria-label="Close image viewer"
            >
              <X size={20} />
            </button>

            {/* Lightbox Prev / Next */}
            <button
              className="lightbox-nav-btn lightbox-prev"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx((prev) => (prev === 0 ? storyImages.length - 1 : prev - 1));
              }}
              aria-label="Previous picture"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              className="lightbox-nav-btn lightbox-next"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx((prev) => (prev === storyImages.length - 1 ? 0 : prev + 1));
              }}
              aria-label="Next picture"
            >
              <ChevronRight size={24} />
            </button>

            <div className="lightbox-img-wrapper">
              <picture className="lightbox-picture">
                <source type="image/avif" srcSet={storyImages[lightboxIdx].imageAvif} />
                <source type="image/webp" srcSet={storyImages[lightboxIdx].imageWebp} />
                <img
                  src={storyImages[lightboxIdx].image}
                  alt={storyImages[lightboxIdx].alt}
                  className="lightbox-full-img"
                  width="900"
                  height="1125"
                  decoding="async"
                />
              </picture>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeritageStory;
