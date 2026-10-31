import React, { lazy, Suspense } from 'react';
import Navbar from './Navbar';
import HeroScrollStory from './HeroScrollStory';

// Below-the-fold components code-split for minimal initial JS execution
const HeritageStory = lazy(() => import('./HeritageStory'));
const Products = lazy(() => import('./Products'));
const FAQ = lazy(() => import('./FAQ'));
const Footer = lazy(() => import('./Footer'));

function App() {
  return (
    <div className="app-container">
      {/* Background ambient gradient */}
      <div className="ambient-background"></div>
      
      <Navbar />
      
      <main>
        {/* Scrollimation Hero with 62 Loop Frames & Rich Tea Info */}
        <HeroScrollStory />
        
        {/* Origin & Heritage Story (From 1980s Tea Stall to 5:50 AM Diwali Promise) */}
        <Suspense fallback={<div className="section-placeholder" style={{ minHeight: '600px' }} />}>
          <HeritageStory />
        </Suspense>

        {/* Buy on Amazon Section */}
        <Suspense fallback={<div className="section-placeholder" style={{ minHeight: '800px' }} />}>
          <Products />
        </Suspense>

        {/* Knowledge, Brewing Rituals & SEO FAQs */}
        <Suspense fallback={<div className="section-placeholder" style={{ minHeight: '500px' }} />}>
          <FAQ />
        </Suspense>
      </main>
      
      {/* Royal Luxury Footer with Gradient Merge */}
      <Suspense fallback={<div className="section-placeholder" style={{ minHeight: '400px' }} />}>
        <Footer />
      </Suspense>
    </div>
  );
}

export default App;
