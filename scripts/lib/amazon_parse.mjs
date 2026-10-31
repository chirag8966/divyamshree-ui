/**
 * Pure Amazon product-page parsers, split out of fetch_amazon_prices.mjs so the
 * scraping regexes can be unit-tested against saved markup without hitting the
 * network. Behaviour is identical to the inline versions it replaces.
 */

/**
 * Selling price. Tries the modern apex-pricetopay block, then the legacy
 * corePrice_desktop block, then the bare a-price-whole span.
 * @param {string} html
 * @returns {number|null} rounded rupees, or null when no pattern matched
 */
export function parsePrice(html) {
  const match =
    html.match(/apex-pricetopay-value[^>]*>.*?class="a-offscreen">([^<]+)/s) ||
    html.match(/id="corePrice_desktop"[^>]*>.*?class="a-offscreen">([^<]+)/s) ||
    html.match(/class="a-price-whole">([0-9,]+)/);

  if (!match) return null;
  const raw = match[1].replace(/,/g, '');
  const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : Math.round(num);
}

/**
 * MRP / original price. Tries the basis-price label, the basisPrice block,
 * the embedded JSON amount, then the legacy a-text-price span.
 * @param {string} html
 * @returns {number|null} rounded rupees, or null when no pattern matched
 */
export function parseOriginalPrice(html) {
  const match =
    html.match(/apex-basisprice-offscreen-label">M\.R\.P\.:\s*₹?([0-9,.]+)/i) ||
    html.match(/basisPrice.*?class="a-offscreen">₹?([0-9,.]+)/s) ||
    html.match(/"basisPrice":\{[^}]*"amount":([0-9.]+)/) ||
    html.match(/a-text-price.*?class="a-offscreen">₹?([0-9,.]+)/s);

  if (!match) return null;
  const num = parseFloat(match[1].replace(/,/g, ''));
  return isNaN(num) ? null : Math.round(num);
}

/**
 * Discount percentage. Prefers Amazon's own advertised percentage and falls
 * back to deriving it from the two prices.
 * @param {string} html
 * @param {number|null} currentPrice
 * @param {number|null} originalPrice
 * @returns {number|null} whole percent, or null when it cannot be determined
 */
export function parseDiscountPct(html, currentPrice, originalPrice) {
  const match =
    html.match(/apex-savings-percentage">-?([0-9]+)%/i) ||
    html.match(/savingsPercentage">-?([0-9]+)%/i);

  const advertised = match ? parseInt(match[1], 10) : null;
  if (advertised) return advertised;

  if (currentPrice && originalPrice && originalPrice > currentPrice) {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }
  return null;
}

/**
 * Run all three parsers over one product page.
 * @param {string} html
 * @returns {{currentPrice: number|null, originalPrice: number|null, discountPct: number|null}}
 */
export function parseProductPage(html) {
  const currentPrice = parsePrice(html);
  const originalPrice = parseOriginalPrice(html);
  return {
    currentPrice,
    originalPrice,
    discountPct: parseDiscountPct(html, currentPrice, originalPrice),
  };
}
