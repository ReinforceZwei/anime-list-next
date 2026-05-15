/// <reference types="vitest/config" />
import { execSync } from 'child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import path from 'path'

function getAppVersion(): string {
  if (process.env.APP_VERSION) return process.env.APP_VERSION
  try {
    return execSync('git describe --tags --always').toString().trim()
  } catch {
    return 'dev'
  }
}

const appVersion = JSON.stringify(getAppVersion())
const isSentryEnabled = !!(process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT)

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: appVersion,
  },
  build: {
    sourcemap: isSentryEnabled ? "hidden" : false,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.*', 'src/routeTree.gen.ts'],
    },
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      pwaAssets: {
        config: true,
      },
      manifest: {
        name: '動漫清單',
        short_name: '動漫清單',
        description: '個人動漫觀看清單',
        theme_color: '#1a1b1e',
        background_color: '#1a1b1e',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'zh-TW',
        start_url: '/',
        scope: '/',
      },
      devOptions: { enabled: true },
      workbox: {
        navigateFallbackDenylist: [/^\/_.*/],
      },
    }),
    ...(isSentryEnabled
      ? [sentryVitePlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          release: {
            name: appVersion,
          },
          sourcemaps: {
            filesToDeleteAfterUpload: ['./dist/**/*.map']
          }
        })]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
