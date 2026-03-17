import { isTokenExpired } from 'pocketbase'
import { useEffect } from 'react'
import { pb } from '@/lib/pb'

// 3 days
const REFRESH_THRESHOLD_SECONDS = 3 * 24 * 60 * 60

// 1 hour
const POLL_INTERVAL_MS = 60 * 60 * 1000

async function maybeRefresh() {
  if (
    pb.authStore.isValid &&
    isTokenExpired(pb.authStore.token, REFRESH_THRESHOLD_SECONDS)
  ) {
    try {
      await pb.collection('users').authRefresh()
    } catch {
      // If refresh fails the store becomes invalid; the next navigation's
      // beforeLoad guard will redirect to /login automatically.
      pb.authStore.clear()
    }
  }
}

/**
 * Proactively refreshes the PocketBase auth token when it is approaching
 * expiry, so users who keep the tab open for extended periods stay logged in.
 *
 * Runs on:
 *  - mount (catches a tab restored from background / bfcache)
 *  - every POLL_INTERVAL_MS while the tab is open
 *  - document `visibilitychange` → visible (user switches back to the tab)
 */
export function useAuthRefresh() {
  useEffect(() => {
    maybeRefresh()

    const interval = setInterval(maybeRefresh, POLL_INTERVAL_MS)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        maybeRefresh()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])
}
