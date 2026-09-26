// Generates the PWA / home-screen icons and favicon from the "Jim" wordmark
// (scripts/jim-logo.json, outlined Space Grotesk glyphs + dumbbell "i").
// Rasterised with Playwright's Chromium. Run: npm run icons
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const BG = '#141517';
const logo = JSON.parse(readFileSync(new URL('./jim-logo.json', import.meta.url), 'utf8'));
const [vx, vy, vw, vh] = logo.viewBox;

// Logo width as a fraction of the icon. Maskable icons get cropped to a circle
// (safe zone: radius 40%), so the wide wordmark must be smaller there.
const LOGO_W = 0.8;
const LOGO_W_MASKABLE = 0.7;

function iconSvg(size, { rounded = false, logoW = LOGO_W } = {}) {
  const w = size * logoW;
  const s = w / vw;
  const h = vh * s;
  const tx = (size - w) / 2 - vx * s;
  const ty = (size - h) / 2 - vy * s;
  const r = rounded ? size * 0.225 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`
    + `<rect width="${size}" height="${size}" rx="${r}" fill="${BG}"/>`
    + `<g transform="translate(${+tx.toFixed(2)} ${+ty.toFixed(2)}) scale(${+s.toFixed(5)})">${logo.inner}</g></svg>\n`;
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/favicon.svg', iconSvg(100, { rounded: true }));

const browser = await chromium.launch();
const page = await browser.newPage();
async function png(file, size, opts) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>html,body{margin:0}svg{display:block}</style>${iconSvg(size, opts)}`);
  writeFileSync(file, await page.screenshot({ omitBackground: false }));
}
// Full-bleed squares: iOS/Android apply their own corner mask.
await png('public/icons/icon-192.png', 192);
await png('public/icons/icon-512.png', 512);
await png('public/icons/icon-maskable-512.png', 512, { logoW: LOGO_W_MASKABLE });
await png('public/icons/apple-touch-icon.png', 180);
await browser.close();
console.log('icons written to public/icons');
