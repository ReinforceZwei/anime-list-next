import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { registerSW } from 'virtual:pwa-register'
import * as Sentry from "@sentry/react";
import { tanstackRouterBrowserTracingIntegration, reactErrorHandler } from "@sentry/react";
import { routeTree } from './routeTree.gen'
import './index.css'

registerSW({ immediate: true })

const router = createRouter({ routeTree })

// Initialize Sentry after TanStack Router is created
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: __APP_VERSION__,

    sendDefaultPii: false,

    integrations: [
      tanstackRouterBrowserTracingIntegration(router),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Tracing
    tracesSampleRate: 0.1,

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement, {
    onUncaughtError: reactErrorHandler(),
    onCaughtError: reactErrorHandler(),
    onRecoverableError: reactErrorHandler(),
  })
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
