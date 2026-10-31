import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const workspaceRoot = process.cwd();

async function optimizeFrames() {
  console.log('Optimizing frames in public/frames...');
  const framesDir = path.join(workspaceRoot, 'public/frames');
  const files = fs.readdirSync(framesDir).filter(f => f.endsWith('.jpg'));
  
  let totalOrig = 0;
  let totalWebp = 0;

  for (const file of files) {
    const inputPath = path.join(framesDir, file);
    const outputPath = path.join(framesDir, file.replace('.jpg', '.webp'));
    const stat = fs.statSync(inputPath);
    totalOrig += stat.size;

    await sharp(inputPath)
      .webp({ quality: 78, effort: 4 })
      .toFile(outputPath);

    const outStat = fs.statSync(outputPath);
    totalWebp += outStat.size;
  }

  console.log(`Frames: ${files.length} frames converted.`);
  console.log(`Original total: ${(totalOrig / 1024 / 1024).toFixed(2)} MB`);
  console.log(`WebP total: ${(totalWebp / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Savings: ${(100 - (totalWebp / totalOrig) * 100).toFixed(1)}% reduction!`);
}

async function optimizeStoryImages() {
  console.log('\nOptimizing story images...');
  const storyDir = path.join(workspaceRoot, 'public/images/story');
  const storyFiles = [
    'story_1_origin.jpg',
    'story_2_heritage_1980s.jpg',
    'story_3_diwali_rebirth.jpg',
    'story_4_promise.jpg'
  ];

  for (const file of storyFiles) {
    const inputPath = path.join(storyDir, file);
    const base = file.replace('.jpg', '');
    const webpPath = path.join(storyDir, `${base}.webp`);
    const avifPath = path.join(storyDir, `${base}.avif`);

    await sharp(inputPath)
      .resize({ width: 1000, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(webpPath);

    await sharp(inputPath)
      .resize({ width: 1000, withoutEnlargement: true })
      .avif({ quality: 65, effort: 4 })
      .toFile(avifPath);

    const origSize = fs.statSync(inputPath).size;
    const webpSize = fs.statSync(webpPath).size;
    const avifSize = fs.statSync(avifPath).size;
    console.log(`${file}: orig ${(origSize / 1024).toFixed(1)}KB -> webp ${(webpSize / 1024).toFixed(1)}KB | avif ${(avifSize / 1024).toFixed(1)}KB`);
  }
}

async function optimizeProductImages() {
  console.log('\nOptimizing product images...');
  const imgDir = path.join(workspaceRoot, 'public/images');
  const productFiles = ['tea.jpg', 'coffee.jpg', 'chaat_masala.jpg'];

  for (const file of productFiles) {
    const inputPath = path.join(imgDir, file);
    const base = file.replace('.jpg', '');
    const webpPath = path.join(imgDir, `${base}.webp`);
    const avifPath = path.join(imgDir, `${base}.avif`);

    await sharp(inputPath)
      .resize({ width: 960, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(webpPath);

    await sharp(inputPath)
      .resize({ width: 960, withoutEnlargement: true })
      .avif({ quality: 65, effort: 4 })
      .toFile(avifPath);

    const origSize = fs.statSync(inputPath).size;
    const webpSize = fs.statSync(webpPath).size;
    const avifSize = fs.statSync(avifPath).size;
    console.log(`${file}: orig ${(origSize / 1024).toFixed(1)}KB -> webp ${(webpSize / 1024).toFixed(1)}KB | avif ${(avifSize / 1024).toFixed(1)}KB`);
  }
}

async function run() {
  await optimizeFrames();
  await optimizeStoryImages();
  await optimizeProductImages();
  console.log('\nAll asset optimizations complete!');
}

run().catch(console.error);
