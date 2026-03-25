// scripts/generate-favicons.js
// Run: node scripts/generate-favicons.js
import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join } from 'path';

const OUT = 'public';

// SVG template — size, background fill, text fill
function svg(size, bg, textFill) {
  const fontSize = Math.round(size * 0.54);
  const y = Math.round(size * 0.72);
  const radius = Math.round(size * 0.12);
  const rect = bg
    ? `<rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>`
    : '';
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  ${rect}
  <text x="${size / 2}" y="${y}"
    font-family="Georgia, 'Times New Roman', serif"
    font-style="italic" font-weight="700"
    font-size="${fontSize}" fill="${textFill}" text-anchor="middle">ВК</text>
</svg>`
  );
}

// Manifest JSON
const manifest = {
  name: 'Влад Ковальский',
  short_name: 'ВК',
  description: 'Ведущий мероприятий',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
  theme_color: '#0a0a0a',
  background_color: '#0a0a0a',
  display: 'browser',
};

async function run() {
  // favicon-32x32.png — transparent bg, dark text
  await sharp(svg(32, null, '#0a0a0a')).png().toFile(join(OUT, 'favicon-32x32.png'));
  console.log('✓ favicon-32x32.png');

  // favicon-16x16.png — transparent bg, dark text
  await sharp(svg(32, null, '#0a0a0a')).resize(16).png().toFile(join(OUT, 'favicon-16x16.png'));
  console.log('✓ favicon-16x16.png');

  // apple-touch-icon.png — 180×180, dark bg, white text (iOS home screen)
  await sharp(svg(512, '#0a0a0a', '#ffffff')).resize(180).png().toFile(join(OUT, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png');

  // PWA icons
  await sharp(svg(512, '#0a0a0a', '#ffffff')).resize(192).png().toFile(join(OUT, 'icon-192.png'));
  console.log('✓ icon-192.png');

  await sharp(svg(512, '#0a0a0a', '#ffffff')).png().toFile(join(OUT, 'icon-512.png'));
  console.log('✓ icon-512.png');

  // site.webmanifest
  writeFileSync(join(OUT, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('✓ site.webmanifest');

  console.log('\nDone.');
}

run().catch((err) => { console.error(err); process.exit(1); });
