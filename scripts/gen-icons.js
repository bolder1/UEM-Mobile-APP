// One-off script to render brand-matched app icon assets from SVG.
// Run with: node scripts/gen-icons.js
const path = require('path');
const sharp = require('sharp');

const PRIMARY = '#0052CC';
const PRIMARY_STRONG = '#003D99';

// Shield-with-check mark — the same glyph used for the in-app logo throughout
// the onboarding header, so the installed icon matches the product's own identity.
const SHIELD_PATH =
  'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z';
const CHECK_PATH = 'm9 12 2 2 4-4';

function iconSvg({ size, cornerRadius, bg, glyphScale = 0.52 }) {
  const glyphSize = size * glyphScale;
  const offset = (size - glyphSize) / 2;
  const strokeWidth = 24 / 24 * glyphSize * 0.09;
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${PRIMARY}"/>
      <stop offset="1" stop-color="${PRIMARY_STRONG}"/>
    </linearGradient>
  </defs>
  ${bg ? `<rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#g)"/>` : ''}
  <g transform="translate(${offset}, ${offset}) scale(${glyphSize / 24})">
    <path d="${SHIELD_PATH}" fill="none" stroke="#FFFFFF" stroke-width="${strokeWidth / (glyphSize / 24)}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${CHECK_PATH}" fill="none" stroke="#FFFFFF" stroke-width="${strokeWidth / (glyphSize / 24)}" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

async function run() {
  const assets = path.join(__dirname, '..', 'assets');

  // Main app icon (iOS + generic): full-bleed rounded square, brand gradient.
  await sharp(Buffer.from(iconSvg({ size: 1024, cornerRadius: 220, bg: true, glyphScale: 0.5 })))
    .png()
    .toFile(path.join(assets, 'icon.png'));

  // Android adaptive icon foreground: transparent bg, glyph inside the safe zone
  // (Android masks ~33% off each edge depending on launcher shape).
  await sharp(Buffer.from(iconSvg({ size: 1024, cornerRadius: 0, bg: false, glyphScale: 0.42 })))
    .png()
    .toFile(path.join(assets, 'android-icon-foreground.png'));

  // Android adaptive icon background: flat brand color plate.
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: PRIMARY },
  })
    .png()
    .toFile(path.join(assets, 'android-icon-background.png'));

  // Android monochrome icon (themed icons, Android 13+): white glyph on transparent.
  await sharp(Buffer.from(iconSvg({ size: 1024, cornerRadius: 0, bg: false, glyphScale: 0.42 })))
    .png()
    .toFile(path.join(assets, 'android-icon-monochrome.png'));

  // Splash icon: same glyph, transparent bg, centered by the splash-screen plugin.
  await sharp(Buffer.from(iconSvg({ size: 400, cornerRadius: 0, bg: false, glyphScale: 1 })))
    .png()
    .toFile(path.join(assets, 'splash-icon.png'));

  // Favicon (web).
  await sharp(Buffer.from(iconSvg({ size: 48, cornerRadius: 10, bg: true, glyphScale: 0.5 })))
    .png()
    .toFile(path.join(assets, 'favicon.png'));

  console.log('Icons generated.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
