import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

// Dynamically import sharp so it won't fail if ran before package install completes
async function run() {
  const { default: sharp } = await import('sharp');

  const heroInput = path.join(publicDir, 'home-hero-portrait.png');
  const whatidoInput = path.join(publicDir, 'whatido-portrait.png');

  // Check inputs
  if (!fs.existsSync(heroInput)) {
    console.error(`Hero image not found: ${heroInput}`);
    return;
  }
  if (!fs.existsSync(whatidoInput)) {
    console.error(`WhatIDo image not found: ${whatidoInput}`);
    return;
  }

  console.log('Optimizing home-hero-portrait.png...');
  // Optimize Hero image: Output WebP and compressed PNG
  // The original is 4986x4184. Let's downscale to 2000px width (plenty sharp for retina display)
  await sharp(heroInput)
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 85, effort: 6 })
    .toFile(path.join(publicDir, 'home-hero-portrait.webp'));

  await sharp(heroInput)
    .resize({ width: 2000, withoutEnlargement: true })
    .png({ quality: 80, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'home-hero-portrait-temp.png'));

  // Replace original with temp
  fs.renameSync(
    path.join(publicDir, 'home-hero-portrait-temp.png'),
    path.join(publicDir, 'home-hero-portrait.png')
  );

  console.log('Optimizing whatido-portrait.png...');
  // Optimize WhatIDo image: Output WebP and compressed PNG
  // Original is 2836x7942. Downscale to 1200px width (since it's displayed small)
  await sharp(whatidoInput)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85, effort: 6 })
    .toFile(path.join(publicDir, 'whatido-portrait.webp'));

  await sharp(whatidoInput)
    .resize({ width: 1200, withoutEnlargement: true })
    .png({ quality: 80, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'whatido-portrait-temp.png'));

  // Replace original with temp
  fs.renameSync(
    path.join(publicDir, 'whatido-portrait-temp.png'),
    path.join(publicDir, 'whatido-portrait.png')
  );

  console.log('Generating og-image from hero image...');
  // Generate OG image: standard 1200x630 format cropped from hero portrait
  await sharp(heroInput)
    .resize({
      width: 1200,
      height: 630,
      fit: 'cover',
      position: 'center'
    })
    .png({ quality: 85 })
    .toFile(path.join(publicDir, 'og-image.png'));

  await sharp(heroInput)
    .resize({
      width: 1200,
      height: 630,
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 85 })
    .toFile(path.join(publicDir, 'og-image.webp'));

  console.log('Image optimization complete!');
}

run().catch(console.error);
