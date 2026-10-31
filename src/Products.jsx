import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Truck, ShieldCheck, ShoppingCart, ExternalLink, Sparkles } from 'lucide-react';

// Divyam Shree is a multi-category house of taste: Tea, Coffee & Spices.
// Each product carries a category so the collection reads as a pantry, not a single chai SKU.
const products = [
  {
    id: 1,
    category: 'tea',
    categoryLabel: 'Tea',
    name: 'Divyam Shree Premium Regular Tea, Hand-Picked Leaves, 1kg Pack, High Protein Content, Made in India',
    badge: "Amazon's Choice",
    badgeType: 'bestseller',
    rating: 4.8,
    reviewsCount: '1,420+',
    price: '₹349',
    originalPrice: '₹425',
    discount: '18% OFF',
    weight: '500 g',
    description: 'Our family\'s masala chai: Assam CTC with whole spices, blended for a cup that stands up to milk and a proper boil.',
    highlights: [
      'Hand-picked leaves from Assam',
      'Blended to our grandfather\'s proportions',
      'Built for milk and a long boil',
      '500 g, sealed to keep the aroma in'
    ],
    image: '/images/tea.jpg',
    imageWebp: '/images/tea.webp',
    imageAvif: '/images/tea.avif',
    imageAlt: 'Divyam Shree Premium Regular Tea, Hand-Picked Leaves, 1kg Pack',
    amazonUrl: 'https://www.amazon.in/dp/B0FXM25FWZ'
  },
  {
    id: 2,
    category: 'coffee',
    categoryLabel: 'Coffee',
    name: 'Divyam Shree Cold Coffee Instant Mix',
    badge: 'Top Rated',
    badgeType: 'toprated',
    rating: 4.9,
    reviewsCount: '980+',
    price: '₹229',
    originalPrice: '₹280',
    discount: '18% OFF',
    weight: '250 g',
    description: 'Whisk. Chill. Indulge. Café-style creaminess in every sip.',
    highlights: [
      'Mixes into cold milk without a blender',
      'Thick, creamy body',
      'Ready in under a minute',
      '250 g pouch for the kitchen shelf'
    ],
    image: '/images/coffee.jpg',
    imageWebp: '/images/coffee.webp',
    imageAvif: '/images/coffee.avif',
    imageAlt: 'Divyam Shree Cold Coffee Instant Mix with creamy golden café-style froth',
    amazonUrl: 'https://www.amazon.in/dp/B0FXLWDMJD'
  },
  {
    id: 3,
    category: 'spices',
    categoryLabel: 'Spices',
    name: 'Divyam Shree Authentic Jeerawan Masala',
    badge: 'Stone-Ground',
    badgeType: 'popular',
    rating: 4.7,
    reviewsCount: '520+',
    price: '₹59',
    originalPrice: '₹90',
    discount: '34% OFF',
    weight: '100 g',
    description: 'Ground from jeera, saunf, dhaniya, ajwain, tejpatta, kala namak, nork, lal mirch, haldi and amchur. Dust it over poha, fruit or chaat.',
    highlights: [
      'Jeera, saunf and dhaniya',
      'Ajwain, tejpatta and kala namak',
      'Lal mirch, haldi and amchur',
      'The same blend our family uses at home'
    ],
    image: '/images/chaat_masala.jpg',
    imageWebp: '/images/chaat_masala.webp',
    imageAvif: '/images/chaat_masala.avif',
    imageAlt: 'Divyam Shree Jeerawan Masala spice blend',
    amazonUrl: 'https://www.amazon.in/dp/B0FXLV22SX'
  }
];

// Category filter tabs — reinforces that the brand spans three shelves
const categories = [
  { id: 'all', label: 'All Products' },
  { id: 'tea', label: 'Tea' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'spices', label: 'Spices & Masala' }
];

const Products = () => {
  const [tappedProductId, setTappedProductId] = useState(null);
  const [trustBarTapped, setTrustBarTapped] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.product-card')) {
        setTappedProductId(null);
      }
      if (!e.target.closest('.amazon-trust-bar')) {
        setTrustBarTapped(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  const handleProductCardClick = (productId, e) => {
    if (e.target.closest('.btn-amazon')) {
      return;
    }
    setTappedProductId(prev => (prev === productId ? null : productId));
  };

  const visibleProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <section className="products-section" id="products">
      {/* Amazon Trust Banner */}
      <div 
        className={`amazon-trust-bar ${trustBarTapped ? 'is-tapped is-active' : ''}`}
        onClick={() => setTrustBarTapped(prev => !prev)}
      >
        <div className="trust-item">
          <Truck className="trust-icon" size={20} />
          <div>
            <strong>Amazon Prime Delivery</strong>
            <span>Free delivery on Prime orders</span>
          </div>
        </div>
        <div className="trust-item">
          <ShieldCheck className="trust-icon" size={20} />
          <div>
            <strong>Genuine Divyam Shree</strong>
            <span>Sold from our own Amazon storefront</span>
          </div>
        </div>
        <div className="trust-item">
          <CheckCircle className="trust-icon" size={20} />
          <div>
            <strong>A-to-z Buyer Protection</strong>
            <span>Amazon's checkout and returns cover</span>
          </div>
        </div>
      </div>

      <div className="products-header">
        <div className="collection-pill">
          <Sparkles size={14} style={{ marginRight: '6px' }} />
          THE DIVYAM SHREE PANTRY
        </div>
        <h2>Buy Divyam Shree Tea, Coffee &amp; Jeerawan Masala Online in India</h2>
        <p>
          Premium regular tea with hand-picked leaves, café-style cold coffee mix and Indore Jeerawan masala — still made from the recipes our family wrote down in the 1980s.
          Everything we sell is here on this page.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="category-tabs" role="tablist" aria-label="Product categories">
        {categories.map(cat => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={activeCategory === cat.id}
            className={`category-tab ${activeCategory === cat.id ? 'is-active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {visibleProducts.map(product => (
          <article 
            className={`product-card ${tappedProductId === product.id ? 'is-tapped is-active' : ''}`} 
            key={product.id}
            onClick={(e) => handleProductCardClick(product.id, e)}
            itemScope 
            itemType="https://schema.org/Product"
          >
            <meta itemProp="brand" content="Divyam Shree" />
            <meta itemProp="category" content={product.categoryLabel} />
            <div className="product-image-wrapper">
              <span className={`product-badge badge-${product.badgeType}`}>
                {product.badge}
              </span>
              <span className={`product-category-tag tag-${product.category}`}>
                {product.categoryLabel}
              </span>
              <picture className="product-picture">
                <source type="image/avif" srcSet={product.imageAvif} />
                <source type="image/webp" srcSet={product.imageWebp} />
                <img 
                  src={product.image} 
                  alt={product.imageAlt || product.name} 
                  className="product-image" 
                  loading="lazy"
                  decoding="async"
                  width="480"
                  height="480"
                  itemProp="image"
                />
              </picture>
              <span className="product-weight-tag">{product.weight}</span>
            </div>

            <div className="product-info">
              <div className="product-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={15} 
                      fill={i < Math.floor(product.rating) ? "#FFB800" : "none"} 
                      color="#FFB800" 
                    />
                  ))}
                </div>
                <span className="rating-score">{product.rating}</span>
                <span className="reviews-count">({product.reviewsCount} on Amazon)</span>
              </div>

              <h3 itemProp="name">{product.name}</h3>
              <p className="product-desc" itemProp="description">{product.description}</p>

              <div className="product-highlights">
                {product.highlights.map((h, index) => (
                  <div key={index} className="highlight-row">
                    <CheckCircle size={14} className="check-icon" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div className="product-purchase-footer">
                <div className="price-block">
                  <div className="current-price" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                    <meta itemProp="priceCurrency" content="INR" />
                    <meta itemProp="availability" content="https://schema.org/InStock" />
                    <meta itemProp="url" content={product.amazonUrl} />
                    <span itemProp="price" content={product.price.replace(/[^0-9.]/g, '')}>{product.price}</span>
                  </div>
                  <div className="original-price">{product.originalPrice}</div>
                  <div className="discount-pill">{product.discount}</div>
                </div>

                <a 
                  href={product.amazonUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-amazon"
                  aria-label={`Buy ${product.name} on Amazon`}
                >
                  <ShoppingCart size={18} style={{ marginRight: '8px' }} />
                  <span>Buy on Amazon</span>
                  <ExternalLink size={15} style={{ marginLeft: '6px', opacity: 0.7 }} />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Products;
