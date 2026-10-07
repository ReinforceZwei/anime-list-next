import { useEffect } from 'react'
import { ensureFreshAuth } from '@/lib/auth'

// 1 hour
const POLL_INTERVAL_MS = 60 * 60 * 1000

/**
 * Keeps the PocketBase session alive for as long as the app is in use.
 *
 * PocketBase issues a fixed-lifetime token (`users.authToken.duration`) and refuses
 * to refresh an expired one, so the token must be renewed *before* it lapses.
 * Renewing on every open (mount + visibilitychange) is what makes "opened at least
 * once within the token duration" keep the user signed in indefinitely instead of
 * requiring the app to be opened inside a 3-day pre-expiry window.
 *
 * Runs on:
 *  - mount (catches a tab restored from background / bfcache)
 *  - every POLL_INTERVAL_MS while the app is open
 *  - document `visibilitychange` → visible (user switches back to the app)
 */
export function useAuthRefresh() {
  useEffect(() => {
    void ensureFreshAuth()

    const interval = setInterval(() => {
      void ensureFreshAuth()
    }, POLL_INTERVAL_MS)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void ensureFreshAuth()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])
}
