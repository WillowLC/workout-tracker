// Static-hosting deep-link support. On GitHub Pages (BASE_PATH != "/") we copy
// index.html to 404.html so unknown paths boot the SPA. Cloudflare Pages does
// SPA fallback itself only when there is NO 404.html, so we skip it there.
import { copyFileSync } from 'node:fs';
const base = process.env.BASE_PATH ?? '/';
if (base !== '/') {
  copyFileSync('dist/index.html', 'dist/404.html');
  console.log('postbuild: copied index.html -> 404.html');
}
