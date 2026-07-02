import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
    // Installable PWA shell. Calm by construction: no push (AD-12), and the
    // service worker precaches only the built app shell — it NEVER caches the
    // Base44 API, so task/pref data is always fresh (no stale reads).
    VitePWA({
      registerType: 'autoUpdate',       // new deploy → SW updates to the new bundle
      injectRegister: 'auto',           // registration injected into the built HTML
      devOptions: { enabled: false },   // SW only in build/preview, not `vite dev`
      includeAssets: ['favicon.png'],
      manifest: {
        id: '/',
        name: 'Akha',
        short_name: 'Akha',
        description: 'A calm task companion.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#04141f',
        theme_color: '#04141f',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the app shell only (JS/CSS/HTML). No runtimeCaching entry
        // exists, so the Base44 API is never cached — reads/writes always hit
        // the network. The denylist keeps the SPA navigation fallback off any
        // backend/API path.
        globPatterns: ['**/*.{js,css,html}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /\/functions\//, /base44/],
      },
    }),
  ]
});