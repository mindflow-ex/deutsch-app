import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    svelte({ onwarn: (w, h) => w.code !== 'state_referenced_locally' && h(w) }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Deutsch zu zweit',
        short_name: 'Deutsch',
        description: 'Немецкий A1 для двоих по Schritte International Neu',
        lang: 'ru',
        theme_color: '#2f5d50',
        background_color: '#fbf7f0',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json,mp3}'],
        globIgnores: ['models/**'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/models/'),
            handler: 'CacheFirst',
            options: { cacheName: 'vosk-model', expiration: { maxEntries: 2 } }
          }
        ]
      }
    })
  ],
  build: { chunkSizeWarningLimit: 7000 }
});
