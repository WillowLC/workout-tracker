import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// Deploy base path. Must never change once users have installed the app
// (data is tied to the origin + scope). Set via BASE_PATH at build time.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/*.png', 'favicon.svg'],
      manifest: {
        name: 'Jim — Workout Tracker',
        short_name: 'Jim',
        description: 'Minimal, offline-first workout tracker',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        theme_color: '#141517',
        background_color: '#141517',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell + exercise thumbnails are precached (works offline immediately).
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2,webmanifest}', 'exercise-media/*/thumb.jpg'],
        // Full-size exercise photos are cached the first time they are viewed.
        runtimeCaching: [
          {
            urlPattern: /\/exercise-media\/[^/]+\/\d\.jpg$/,
            handler: 'CacheFirst',
            options: { cacheName: 'exercise-photos', expiration: { maxEntries: 500 } },
          },
        ],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
