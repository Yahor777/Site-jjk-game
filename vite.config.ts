import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base,
  server: { host: '0.0.0.0' },
  preview: { host: '0.0.0.0' },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Curse Breaker: Night District',
        short_name: 'Curse Breaker',
        description: 'A fast mobile roguelite about an exorcist fighting cursed spirits.',
        theme_color: '#090b18',
        background_color: '#090b18',
        display: 'standalone',
        orientation: 'landscape',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        cleanupOutdatedCaches: true
      }
    })
  ]
});
