import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Leaf, 
  ArrowUpRight, 
  Award, 
  Phone, 
  Building2, 
  Gift, 
  Clock, 
  MapPin, 
  Heart 
} from 'lucide-react';

// Official WhatsApp Vector Icon
const WhatsAppIcon = ({ size = 20, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M12.031 2C6.51 2 2.015 6.495 2.015 12.015c0 1.896.53 3.673 1.45 5.201L2 22l4.928-1.428c1.474.845 3.177 1.328 4.988 1.328 5.521 0 10.016-4.495 10.016-10.015C21.932 6.495 17.552 2 12.031 2zm0 18.275c-1.616 0-3.14-.457-4.444-1.253l-.319-.196-3.298.956.974-3.21-.212-.338a8.204 8.204 0 0 1-1.26-4.219c0-4.555 3.707-8.262 8.263-8.262 4.555 0 8.262 3.707 8.262 8.262 0 4.555-3.707 8.26-8.266 8.26zm4.84-6.173c-.266-.133-1.572-.776-1.816-.865-.244-.089-.422-.133-.599.133-.178.266-.689.865-.845 1.043-.155.178-.311.2-.577.067-.266-.133-1.124-.414-2.14-1.321-.79-.705-1.324-1.576-1.48-1.842-.155-.266-.017-.41.116-.543.12-.119.266-.311.4-.466.133-.156.178-.267.267-.444.089-.178.044-.333-.022-.467-.067-.133-.599-1.443-.822-1.976-.216-.52-.437-.45-.599-.458-.155-.008-.333-.01-.51-.01-.178 0-.467.067-.711.333-.244.267-.933.911-.933 2.222 0 1.311.955 2.577 1.088 2.755.133.178 1.88 2.87 4.554 4.024.636.275 1.133.439 1.52.562.639.203 1.22.174 1.679.106.512-.077 1.572-.643 1.794-1.264.222-.622.222-1.155.155-1.266-.066-.111-.244-.178-.51-.311z"/>
  </svg>
);

const Footer = () => {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const whatsappNumber = '7566636650';
  const whatsappUrl = `https://wa.me/91${whatsappNumber}?text=Hello%20Divyam%20Shree%20Team%2C%20I%20am%20interested%20in%20Bulk%20%2F%20B2B%20orders.`;

  // Tap & click interaction matching product card animation
  const [tappedFooterCard, setTappedFooterCard] = useState(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.footer-b2b-card') && !e.target.closest('.footer-guild-card')) {
        setTappedFooterCard(null);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  const handleFooterCardClick = (cardId, e) => {
    if (e.target.closest('a') || e.target.closest('button')) {
      return;
    }
    setTappedFooterCard(prev => (prev === cardId ? null : cardId));
  };

  return (
    <footer className="royal-footer">
      {/* Warm Ambient Glow & Backdrop Layer */}
      <div className="footer-gradient-backdrop"></div>
      <div className="footer-ambient-radial"></div>

      {/* Massive subtle watermark in background */}
      <div className="footer-watermark" aria-hidden="true">DIVYAM SHREE</div>

      <div className="footer-inner-container">
        {/* Top Floating B2B & Bulk Orders Contact Card */}
        <div 
          className={`footer-b2b-card ${tappedFooterCard === 'b2b' ? 'is-tapped is-active' : ''}`} 
          id="contact"
          onClick={(e) => handleFooterCardClick('b2b', e)}
        >
          <div className="b2b-card-main">
            <div className="b2b-pill-badge">
              <Building2 size={14} className="b2b-pill-icon" />
              <span>CORPORATE GIFTING &amp; B2B SUPPLY</span>
            </div>

            <h3 className="b2b-heading">We Supply Companies, Cafés &amp; Distributors</h3>
            
            <p className="b2b-description">
              Festive gift boxes with your company name on them, bulk canisters for cafés and hotel kitchens, and wholesale quantities for distributors. 
              All three products, packed and priced by volume.
            </p>

            <div className="b2b-pillars-grid">
              <div className="b2b-pillar-item">
                <Gift size={16} className="b2b-pillar-icon" />
                <div>
                  <strong>Corporate &amp; Festive Gifting</strong>
                  <span>Boxes built around your logo and card</span>
                </div>
              </div>

              <div className="b2b-pillar-item">
                <Leaf size={16} className="b2b-pillar-icon" />
                <div>
                  <strong>Café &amp; Restaurant Supply</strong>
                  <span>Bulk canisters for daily service</span>
                </div>
              </div>

              <div className="b2b-pillar-item">
                <ShieldCheck size={16} className="b2b-pillar-icon" />
                <div>
                  <strong>Wholesale &amp; GST Invoicing</strong>
                  <span>GST invoice with volume pricing</span>
                </div>
              </div>

              <div className="b2b-pillar-item">
                <Clock size={16} className="b2b-pillar-icon" />
                <div>
                  <strong>Pan-India Dispatch</strong>
                  <span>Sent from our own warehouse</span>
                </div>
              </div>
            </div>
          </div>

          <div className="b2b-card-actions">
            <div className="whatsapp-action-box">
              <span className="whatsapp-action-badge">DIRECT WHATSAPP DESK</span>
              <p className="whatsapp-action-sub">
                Send us a message for price lists, samples or a quote:
              </p>

              <a 
                href={whatsappUrl}
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-footer-whatsapp"
                aria-label={`Chat with Divyam Shree B2B Team on WhatsApp at ${whatsappNumber}`}
              >
                <WhatsAppIcon size={22} className="whatsapp-btn-icon" />
                <div className="whatsapp-btn-text">
                  <span className="btn-wa-title">Message on WhatsApp</span>
                  <span className="btn-wa-num">+91 {whatsappNumber}</span>
                </div>
                <ArrowUpRight size={18} className="btn-arrow-icon" />
              </a>

              <div className="whatsapp-contact-alt">
                <a href={`tel:+91${whatsappNumber}`} className="btn-call-direct">
                  <Phone size={14} />
                  <span>Call: +91 {whatsappNumber}</span>
                </a>
                <span className="availability-note">Mon–Sat &middot; 9:00 AM – 8:00 PM IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Instagram Community Card */}
        <div 
          className={`footer-guild-card ${tappedFooterCard === 'guild' ? 'is-tapped is-active' : ''}`} 
          id="community"
          onClick={(e) => handleFooterCardClick('guild', e)}
        >
          <div className="guild-card-content">
            <div className="guild-badge">
              <Sparkles size={14} className="guild-badge-icon" />
              <span>FROM OUR KITCHEN</span>
            </div>
            <h3>Follow Divyam Shree on Instagram</h3>
            <p>
              Brewing notes, spice market mornings and whatever we are mixing next. <strong>@divyam_shree</strong> is where the kitchen posts it first.
            </p>
          </div>

          <div className="guild-instagram-action">
            <a 
              href="https://www.instagram.com/divyam_shree" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-guild-instagram"
              aria-label="Follow @divyam_shree on Instagram (opens Instagram in a new tab)"
            >
              <svg 
                className="instagram-icon-svg"
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
              <span>Follow @divyam_shree</span>
              <ArrowUpRight size={16} className="btn-arrow-icon" />
            </a>
            <span className="guild-privacy-note">Our only Instagram account &middot; New posts most weeks</span>
          </div>
        </div>

        {/* Main Footer Links & Heritage Information */}
        <div className="footer-main-grid">
          {/* Brand Col */}
          <div className="footer-col-brand">
            <div className="footer-brand-header">
              <div className="footer-brand-logo-wrapper">
                <img 
                  src="/logo.png" 
                  alt="Divyam Shree Insignia" 
                  className="footer-brand-logo-img" 
                  width="46" 
                  height="46" 
                />
              </div>
              <div>
                <span className="footer-brand-name">DIVYAM SHREE</span>
                <span className="footer-brand-tagline">TEA · COFFEE · MASALA</span>
              </div>
            </div>
            <p className="footer-brand-desc">
              Three blends from one family kitchen. We have been making masala tea, cold coffee mix and Jeerawan masala since the 1980s, and we still grind our spices the way the first kitchen did.
            </p>
            <div className="footer-brand-badges">
              <div className="brand-pill-badge">
                <Leaf size={13} />
                <span>Hand-picked Tea</span>
              </div>
              <div className="brand-pill-badge">
                <Award size={13} />
                <span>Jeerawan Masala</span>
              </div>
              <div className="brand-pill-badge">
                <ShieldCheck size={13} />
                <span>GST Invoicing for Bulk</span>
              </div>
            </div>
          </div>

          {/* Col 1: Shop */}
          <div className="footer-nav-col">
            <h4>Amazon Store</h4>
            <ul>
              <li>
                <a href="https://www.amazon.in/dp/B0FXM25FWZ" target="_blank" rel="noopener noreferrer">
                  Premium Regular Tea
                  <ArrowUpRight size={12} className="link-arrow" />
                </a>
              </li>
              <li>
                <a href="https://www.amazon.in/dp/B0FXLWDMJD" target="_blank" rel="noopener noreferrer">
                  Cold Coffee Instant Mix
                  <ArrowUpRight size={12} className="link-arrow" />
                </a>
              </li>
              <li>
                <a href="https://www.amazon.in/dp/B0FXLV22SX" target="_blank" rel="noopener noreferrer">
                  Jeerawan Masala
                  <ArrowUpRight size={12} className="link-arrow" />
                </a>
              </li>
              <li>
                <a href="#heritage" onClick={(e) => { e.preventDefault(); scrollToSection('heritage'); }}>
                  Our Story
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: B2B & Bulk Orders */}
          <div className="footer-nav-col">
            <h4>B2B &amp; Bulk Orders</h4>
            <ul>
              <li><a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Corporate Gift Boxes</a></li>
              <li><a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Café &amp; Restaurant Supply</a></li>
              <li><a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Hotel &amp; Resort Supply</a></li>
              <li><a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Wholesale &amp; Distribution</a></li>
              <li><a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Custom Spice Blends</a></li>
            </ul>
          </div>

          {/* Col 3: Contact & Direct Desk */}
          <div className="footer-nav-col">
            <h4>Contact &amp; Support</h4>
            <ul className="footer-contact-list">
              <li>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="contact-link-highlight">
                  <WhatsAppIcon size={14} className="contact-icon" />
                  <span>WhatsApp: +91 {whatsappNumber}</span>
                </a>
              </li>
              <li>
                <a href={`tel:+91${whatsappNumber}`}>
                  <Phone size={14} className="contact-icon" />
                  <span>Call: +91 {whatsappNumber}</span>
                </a>
              </li>
              <li>
                <span className="contact-info-item">
                  <MapPin size={14} className="contact-icon" />
                  <span>Indore, Madhya Pradesh, India</span>
                </span>
              </li>
              <li>
                <span className="contact-info-item">
                  <Clock size={14} className="contact-icon" />
                  <span>B2B Desk: 9 AM – 8 PM IST</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="footer-bottom-bar">
          <div className="bottom-disclaimer">
            <p>
              &copy; {new Date().getFullYear()} Divyam Shree Enterprises. All Rights Reserved. Made and packed in India. B2B &amp; Bulk Orders Available.
            </p>
          </div>
          <div className="bottom-socials">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">WHATSAPP: +91 {whatsappNumber}</a>
            <span className="dot-sep">&middot;</span>
            <a href="https://www.instagram.com/divyam_shree" target="_blank" rel="noopener noreferrer" aria-label="Instagram">INSTAGRAM</a>
          </div>
        </div>

        {/* Creator Signature Bar at the very end of the webpage */}
        <div className="footer-creator-bar">
          <p className="creator-credit-text">
            <span>Made with</span>
            <Heart size={15} className="heart-icon-pulse" aria-label="love" />
            <span>by</span>
            <a 
              href="https://www.linkedin.com/in/chirag8966/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="creator-name-link"
            >
              Chirag Jain
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
