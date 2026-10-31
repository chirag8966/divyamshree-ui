import React from 'react';

const HeroContent = () => {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1>Divyam<br />Shree</h1>
        <p>Masala tea, cold coffee and Jeerawan masala, made by one family since the 1980s.</p>
        <button className="btn-discover" onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}>
          See the Pantry
        </button>
      </div>
      
      <div className="bottom-bar">
        <div className="socials">
          <a href="#" aria-label="Facebook">FB</a>
          <a href="#" aria-label="Instagram">IG</a>
          <a href="#" aria-label="Twitter">TW</a>
        </div>
        
        <div className="scroll-indicator">
          <span className="scroll-text">Scroll</span>
          <div className="scroll-line"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
