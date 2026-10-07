import { pb } from '@/lib/pb'
import {
  didSessionRestart,
  isAuthError,
  isUsableToken,
  shouldRefreshAuth,
} from '@/lib/authSession'

/** When the token was last renewed, so frequent opens do not mint tokens. */
const LAST_REFRESH_KEY = 'pb_auth_last_refresh'

function readLastRefreshAt(): number | null {
  const raw = localStorage.getItem(LAST_REFRESH_KEY)
  if (!raw) return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

function writeLastRefreshAt(value: number) {
  localStorage.setItem(LAST_REFRESH_KEY, String(value))
}

/** Drop the local session (logout, or a token the server no longer accepts). */
export function forgetSession() {
  localStorage.removeItem(LAST_REFRESH_KEY)
  pb.authStore.clear()
}

/**
 * Makes sure the current session is usable, renewing the token before it lapses.
 *
 * Returns false only when there is no usable session left (missing/expired token,
 * or the server rejected it) — i.e. when the caller must send the user to /login.
 *
 * PocketBase cannot refresh an expired token, so an app that is not opened for
 * longer than `users.authToken.duration` still requires a fresh login.
 */
export async function ensureFreshAuth(): Promise<boolean> {
  const token = pb.authStore.token
  // Known-expired (or no token at all): PocketBase refuses to refresh an expired
  // token, so there is nothing left to save and the user must log in again.
  if (!isUsableToken(Date.now(), token)) return false

  if (!shouldRefreshAuth(Date.now(), token, readLastRefreshAt())) {
    return true
  }

  try {
    await pb.collection('users').authRefresh()
    writeLastRefreshAt(Date.now())
    return true
  } catch (err) {
    if (isAuthError(err)) {
      forgetSession()
      return false
    }
    // Transient failure (offline, server restart, timeout): the token is most
    // likely still valid, so keep the session and retry on the next call.
    return true
  }
}

/**
 * Registers `onRestart` for the moment a new token starts a new session rather than
 * renewing an already-valid one. Returns the unsubscribe function.
 */
export function watchSessionRestart(onRestart: () => void): () => void {
  let previousToken = pb.authStore.token
  return pb.authStore.onChange(() => {
    const nextToken = pb.authStore.token
    if (didSessionRestart(Date.now(), previousToken, nextToken)) onRestart()
    previousToken = nextToken
  })
}
