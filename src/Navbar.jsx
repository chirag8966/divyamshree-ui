import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const offsetsRef = React.useRef({ heritageTop: 0, productsTop: 0, communityTop: 0 });
  const rafIdRef = React.useRef(null);

  useEffect(() => {
    const updateOffsets = () => {
      const heritageEl = document.getElementById('heritage');
      const productsEl = document.getElementById('products');
      const communityEl = document.getElementById('community');

      const getDocTop = (el) => (el ? el.getBoundingClientRect().top + window.scrollY : Infinity);

      offsetsRef.current = {
        heritageTop: getDocTop(heritageEl),
        productsTop: getDocTop(productsEl),
        communityTop: getDocTop(communityEl)
      };
    };

    updateOffsets();
    window.addEventListener('resize', updateOffsets, { passive: true });
    window.addEventListener('orientationchange', updateOffsets, { passive: true });

    const handleScroll = () => {
      if (rafIdRef.current) return;
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const scrollY = window.scrollY;
        setIsScrolled(scrollY > 30);

        const { heritageTop, productsTop, communityTop } = offsetsRef.current;

        let nextSection = '';
        if (scrollY >= communityTop - 400) {
          nextSection = 'community';
        } else if (scrollY >= productsTop - 250) {
          nextSection = 'collection';
        } else if (scrollY >= heritageTop - 250) {
          nextSection = 'heritage';
        }

        setActiveSection(prev => (prev !== nextSection ? nextSection : prev));
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('resize', updateOffsets);
      window.removeEventListener('orientationchange', updateOffsets);
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const navigateTo = (target) => {
    setMobileMenuOpen(false);
    const productsEl = document.getElementById('products');
    const communityEl = document.getElementById('community');

    if (target === 'heritage') {
      const heritageEl = document.getElementById('heritage');
      if (heritageEl) {
        heritageEl.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (target === 'collection') {
      if (productsEl) {
        productsEl.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (target === 'community') {
      if (communityEl) {
        communityEl.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (target === 'story') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar-wrapper">
      <nav className={`floating-pill-nav ${isScrolled ? 'nav-scrolled' : ''}`}>
        {/* Left: Brand with Official Royal Emblem Logo */}
        <a 
          href="#story" 
          className="pill-brand" 
          onClick={(e) => { e.preventDefault(); navigateTo('story'); }}
        >
          <div className="brand-logo-wrapper">
            <img 
              src="/logo.png" 
              alt="Divyam Shree Insignia" 
              className="brand-logo-img" 
              width="36" 
              height="36" 
            />
          </div>
          <div className="brand-text-group">
            <span className="brand-title">DIVYAM SHREE</span>
            <span className="brand-subtitle">TEA · COFFEE · MASALA</span>
          </div>
        </a>

        {/* Center: Interactive Chapter Navigation Links */}
        <div className={`pill-nav-links ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <button 
            className={`pill-nav-link ${activeSection === 'heritage' ? 'active' : ''}`}
            onClick={() => navigateTo('heritage')}
          >
            Our Story
          </button>
          <button 
            className={`pill-nav-link ${activeSection === 'collection' ? 'active' : ''}`}
            onClick={() => navigateTo('collection')}
          >
            Collection
          </button>
          <button 
            className={`pill-nav-link ${activeSection === 'community' ? 'active' : ''}`}
            onClick={() => navigateTo('community')}
          >
            Community
          </button>
        </div>

        {/* Right: Pill Action Button & Mobile Toggle */}
        <div className="pill-actions">
          <button 
            className="btn-pill-quote"
            onClick={() => navigateTo('collection')}
            aria-label="View the Divyam Shree pantry on Amazon"
          >
            <ShoppingBag size={15} style={{ marginRight: '6px' }} />
            <span>Shop Pantry</span>
          </button>

          <button 
            className="pill-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
