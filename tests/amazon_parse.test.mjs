import { describe, it, expect } from 'vitest';
import {
  parsePrice,
  parseOriginalPrice,
  parseDiscountPct,
  parseProductPage,
} from '../scripts/lib/amazon_parse.mjs';

// Markup shapes copied from the Amazon.in product pages the fetcher scrapes.
const APEX_BLOCK = `
  <div id="apex_desktop">
    <span class="apex-pricetopay-value"><span class="a-offscreen">₹349.00</span></span>
    <span class="apex-basisprice-offscreen-label">M.R.P.: ₹425.00</span>
    <span class="apex-savings-percentage">-18%</span>
  </div>`;

const CORE_PRICE_BLOCK = `
  <div id="corePrice_desktop"><span class="a-offscreen">₹1,299.00</span></div>`;

const LEGACY_BLOCK = `
  <span class="a-price-whole">1,299</span>
  <span class="a-text-price"><span class="a-offscreen">₹1,599</span></span>`;

describe('parsePrice', () => {
  it('reads the modern apex-pricetopay block', () => {
    expect(parsePrice(APEX_BLOCK)).toBe(349);
  });

  it('falls back to the corePrice_desktop block', () => {
    expect(parsePrice(CORE_PRICE_BLOCK)).toBe(1299);
  });

  it('falls back to the legacy a-price-whole span and strips thousands separators', () => {
    expect(parsePrice(LEGACY_BLOCK)).toBe(1299);
  });

  it('prefers the apex block when several price shapes are present', () => {
    expect(parsePrice(APEX_BLOCK + CORE_PRICE_BLOCK + LEGACY_BLOCK)).toBe(349);
  });

  it('rounds a decimal rupee amount to a whole number', () => {
    expect(parsePrice('<span class="apex-pricetopay-value">x<span class="a-offscreen">₹229.60</span>')).toBe(230);
  });

  it('returns null when no price markup is present', () => {
    expect(parsePrice('<html><body>Sign in to continue</body></html>')).toBeNull();
    expect(parsePrice('')).toBeNull();
  });
});

describe('parseOriginalPrice', () => {
  it('reads the M.R.P. label', () => {
    expect(parseOriginalPrice(APEX_BLOCK)).toBe(425);
  });

  it('reads the embedded basisPrice JSON amount', () => {
    const html = '<script>{"basisPrice":{"amount":280.0,"currencyCode":"INR"}}</script>';
    expect(parseOriginalPrice(html)).toBe(280);
  });

  it('reads the legacy a-text-price span', () => {
    expect(parseOriginalPrice(LEGACY_BLOCK)).toBe(1599);
  });

  it('returns null when the page shows no strike-through price', () => {
    expect(parseOriginalPrice('<html><body>no mrp here</body></html>')).toBeNull();
    expect(parseOriginalPrice('')).toBeNull();
  });
});

describe('parseDiscountPct', () => {
  it("prefers Amazon's advertised savings percentage", () => {
    expect(parseDiscountPct(APEX_BLOCK, 349, 425)).toBe(18);
  });

  it('derives the percentage when none is advertised', () => {
    // (425 - 349) / 425 = 17.88% -> 18
    expect(parseDiscountPct('', 349, 425)).toBe(18);
  });

  it('derives rather than trusting a 0% badge', () => {
    expect(parseDiscountPct('<span class="apex-savings-percentage">-0%</span>', 349, 425)).toBe(18);
  });

  it('returns null without a usable price pair', () => {
    expect(parseDiscountPct('', null, 425)).toBeNull();
    expect(parseDiscountPct('', 349, null)).toBeNull();
    expect(parseDiscountPct('', 500, 425)).toBeNull();
  });
});

describe('parseProductPage', () => {
  it('combines all three parsers for a full listing page', () => {
    expect(parseProductPage(APEX_BLOCK)).toEqual({
      currentPrice: 349,
      originalPrice: 425,
      discountPct: 18,
    });
  });

  it('degrades to nulls on a blocked / captcha page without throwing', () => {
    expect(parseProductPage('<html><body>Enter the characters you see below</body></html>')).toEqual({
      currentPrice: null,
      originalPrice: null,
      discountPct: null,
    });
  });
});
