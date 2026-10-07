import { getTokenPayload } from 'pocketbase'

/**
 * Renew at most this often. Only a throttle so an app that is opened/switched
 * frequently does not mint a token every few seconds.
 */
export const MIN_REFRESH_INTERVAL_MS = 30 * 60 * 1000

/** `exp` from a PocketBase auth token, in ms, or null when the payload is unreadable. */
export function tokenExpiresAtMs(token: string): number | null {
  const exp = getTokenPayload(token).exp
  return typeof exp === 'number' ? exp * 1000 : null
}

/**
 * Whether the token still looks usable, judged on `exp` alone.
 *
 * Deliberately NOT `pb.authStore.isValid` / `isTokenExpired()`: both decode the
 * payload with `atob`, which understands standard base64 only, while go-jwt encodes
 * JWT segments as base64url — an unreadable payload makes them report "expired" for
 * a token the server would still accept, which would log the user out for nothing.
 * PocketBase auth claims are ASCII-only ({"collectionId","exp","id","refreshable",
 * "type"}; no `>`, `?`, `~` or DEL, the only printable bytes whose base64url group
 * lands on index 62/63), so they do decode in practice — but if the payload is ever
 * unreadable, report "unknown" and let the server decide.
 */
export function isUsableToken(nowMs: number, token: string): boolean {
  if (!token) return false
  const expiresAtMs = tokenExpiresAtMs(token)
  return expiresAtMs === null || expiresAtMs > nowMs
}

/**
 * PocketBase issues a fixed-lifetime auth token (users.authToken.duration) and
 * refuses to refresh it once `exp` has passed (record_auth_refresh requires an
 * authenticated request, and expired tokens fail ParseJWT). The only way to keep a
 * session alive is to renew it while still valid — so renew on every app open,
 * throttled, instead of only inside a pre-expiry window.
 */
export function shouldRefreshAuth(
  nowMs: number,
  token: string,
  lastRefreshAtMs: number | null,
): boolean {
  const expiresAtMs = tokenExpiresAtMs(token)
  if (expiresAtMs !== null && expiresAtMs <= nowMs) return false // PocketBase would 401
  // Unreadable payload: we cannot judge the token locally, so ask the server. A
  // successful renewal hands back a readable token, after which the throttle applies
  // again — this cannot loop.
  if (expiresAtMs === null) return true
  if (lastRefreshAtMs === null) return true
  return nowMs - lastRefreshAtMs >= MIN_REFRESH_INTERVAL_MS
}

/**
 * True when a new token starts a *new* session (login after the previous token had
 * lapsed) rather than renewing an already-valid one. Callers drop cached per-user
 * data only on a restart, never on a routine renewal.
 */
export function didSessionRestart(
  nowMs: number,
  previousToken: string,
  nextToken: string,
): boolean {
  return isUsableToken(nowMs, nextToken) && !isUsableToken(nowMs, previousToken)
}

/** PocketBase rejected the token outright (as opposed to a network/offline error). */
export function isAuthError(err: unknown): boolean {
  const status = (err as { status?: number } | null)?.status
  return status === 401 || status === 403
}

/** PocketBase answered, but the filtered list had no items (getFirstListItem → 404). */
export function isMissingRecordError(err: unknown): boolean {
  return (err as { status?: number } | null)?.status === 404
}
