import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseProductPage } from './lib/amazon_parse.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PRODUCTS = [
  {
    id: 1,
    key: 'tea',
    name: 'Divyam Shree Premium Regular Tea, Hand-Picked Leaves, 1kg Pack, High Protein Content, Made in India',
    asin: 'B0FXM25FWZ',
    url: 'https://www.amazon.in/dp/B0FXM25FWZ',
    sku: 'DS-TEA-500G'
  },
  {
    id: 2,
    key: 'coffee',
    name: 'Divyam Shree Cold Coffee Instant Mix',
    asin: 'B0FXLWDMJD',
    url: 'https://www.amazon.in/dp/B0FXLWDMJD',
    sku: 'DS-COF-250G'
  },
  {
    id: 3,
    key: 'spices',
    name: 'Divyam Shree Authentic Jeerawan Masala',
    asin: 'B0FXLV22SX',
    url: 'https://www.amazon.in/dp/B0FXLV22SX',
    sku: 'DS-JRN-100G'
  }
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

async function fetchProductData(product) {
  console.log(`Fetching live price for ${product.name} (${product.url})...`);
  const response = await fetch(product.url, { headers: HEADERS });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${product.url}`);
  }

  const html = await response.text();
  const { currentPrice, originalPrice, discountPct } = parseProductPage(html);

  return {
    ...product,
    currentPrice,
    originalPrice,
    discountPct
  };
}

async function updateCodebase(results) {
  const productsJsxPath = path.join(rootDir, 'src', 'Products.jsx');
  const indexHtmlPath = path.join(rootDir, 'index.html');

  let productsJsx = fs.readFileSync(productsJsxPath, 'utf8');
  let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  let jsxModified = false;
  let htmlModified = false;

  for (const item of results) {
    if (!item.currentPrice) {
      console.warn(`⚠️ Could not determine price for ${item.name}, skipping file update.`);
      continue;
    }

    const priceStr = `₹${item.currentPrice}`;
    const origPriceStr = item.originalPrice ? `₹${item.originalPrice}` : null;
    const discountStr = item.discountPct ? `${item.discountPct}% OFF` : null;

    console.log(`\n📦 ${item.name}:`);
    console.log(`   Price:          ${priceStr}`);
    console.log(`   Original Price: ${origPriceStr || 'N/A'}`);
    console.log(`   Discount:       ${discountStr || 'N/A'}`);

    // Update in Products.jsx based on amazonUrl
    const urlPattern = new RegExp(
      `(\\bid:\\s*${item.id}[\\s\\S]*?amazonUrl:\\s*'${item.url.replace(/\//g, '\\/')}')`
    );

    const match = productsJsx.match(urlPattern);
    if (match) {
      let block = match[1];
      block = block.replace(/price:\s*'₹[0-9]+'/, `price: '${priceStr}'`);
      if (origPriceStr) {
        block = block.replace(/originalPrice:\s*'₹[0-9]+'/, `originalPrice: '${origPriceStr}'`);
      }
      if (discountStr) {
        block = block.replace(/discount:\s*'[0-9]+% OFF'/, `discount: '${discountStr}'`);
      }
      productsJsx = productsJsx.replace(match[1], block);
      jsxModified = true;
    }

    // Update in index.html schema
    if (item.sku) {
      const skuPattern = new RegExp(
        `("sku":\\s*"${item.sku}"[\\s\\S]*?"price":\\s*")([0-9]+)(")`
      );
      if (skuPattern.test(indexHtml)) {
        indexHtml = indexHtml.replace(skuPattern, `$1${item.currentPrice}$3`);
        htmlModified = true;
      }
    }
  }

  if (jsxModified) {
    fs.writeFileSync(productsJsxPath, productsJsx, 'utf8');
    console.log(`\n✅ Updated src/Products.jsx successfully.`);
  }

  if (htmlModified) {
    fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
    console.log(`✅ Updated index.html structured data successfully.`);
  }
}

async function main() {
  console.log('🔄 Starting Amazon price fetch & update...\n');
  const results = [];

  for (const product of PRODUCTS) {
    try {
      const data = await fetchProductData(product);
      results.push(data);
    } catch (err) {
      console.error(`❌ Failed to fetch ${product.name}:`, err.message);
    }
  }

  await updateCodebase(results);
  console.log('\n✨ Price update process complete!');
}

main().catch(err => {
  console.error('Fatal error running price fetcher:', err);
  process.exit(1);
});
