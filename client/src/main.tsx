import "./instrument"; // MUST be first — Sentry initialization
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { registerSW } from 'virtual:pwa-register'
import * as Sentry from "@sentry/react";
import { tanstackRouterBrowserTracingIntegration } from "@sentry/react";
import { reactErrorHandler } from "@sentry/react";
import { routeTree } from './routeTree.gen'
import './index.css'

registerSW({ immediate: true })

const router = createRouter({ routeTree })

// Add TanStack Router tracing after router is created
Sentry.addIntegration(tanstackRouterBrowserTracingIntegration(router));

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
