import { describe, expect, it } from 'vitest'
import {
  MIN_REFRESH_INTERVAL_MS,
  didSessionRestart,
  isUsableToken,
  shouldRefreshAuth,
  tokenExpiresAtMs,
} from '@/lib/authSession'

/** base64url, the encoding go-jwt uses for JWT segments (no padding, `-`/`_`). */
function base64Url(input: string): string {
  return btoa(input)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '')
}

function fakeToken(expSeconds: number): string {
  const payload = base64Url(
    JSON.stringify({ type: 'auth', id: 'u1', exp: expSeconds }),
  )
  return `header.${payload}.signature`
}

const NOW = 1_800_000_000_000 // ms
const nowSeconds = NOW / 1000

describe('tokenExpiresAtMs', () => {
  it('reads exp out of the JWT payload', () => {
    expect(tokenExpiresAtMs(fakeToken(nowSeconds + 60))).toBe(NOW + 60_000)
  })

  it('returns null for garbage', () => {
    expect(tokenExpiresAtMs('not-a-jwt')).toBeNull()
  })
})

describe('shouldRefreshAuth', () => {
  it('refreshes a valid token that was never refreshed', () => {
    expect(shouldRefreshAuth(NOW, fakeToken(nowSeconds + 86400), null)).toBe(
      true,
    )
  })

  it('does not refresh again inside the throttle window', () => {
    expect(
      shouldRefreshAuth(NOW, fakeToken(nowSeconds + 86400), NOW - 60_000),
    ).toBe(false)
  })

  it('refreshes once the throttle window has elapsed', () => {
    expect(
      shouldRefreshAuth(
        NOW,
        fakeToken(nowSeconds + 86400),
        NOW - MIN_REFRESH_INTERVAL_MS,
      ),
    ).toBe(true)
  })

  it('never refreshes an already expired token (PocketBase would 401)', () => {
    expect(shouldRefreshAuth(NOW, fakeToken(nowSeconds - 1), null)).toBe(false)
  })

  it('still tries when the payload is unreadable, so the server decides', () => {
    expect(shouldRefreshAuth(NOW, 'not-a-jwt', NOW)).toBe(true)
  })
})

describe('isUsableToken', () => {
  it('accepts a token expiring in the future', () => {
    expect(isUsableToken(NOW, fakeToken(nowSeconds + 600))).toBe(true)
  })

  it('rejects an expired token', () => {
    expect(isUsableToken(NOW, fakeToken(nowSeconds - 1))).toBe(false)
  })

  it('rejects an empty token', () => {
    expect(isUsableToken(NOW, '')).toBe(false)
  })

  it('treats an unreadable payload as usable rather than logging the user out', () => {
    expect(isUsableToken(NOW, 'not-a-jwt')).toBe(true)
  })
})

describe('didSessionRestart', () => {
  it('is true when a valid token replaces an expired one', () => {
    expect(
      didSessionRestart(
        NOW,
        fakeToken(nowSeconds - 1),
        fakeToken(nowSeconds + 600),
      ),
    ).toBe(true)
  })

  it('is true when there was no previous token', () => {
    expect(didSessionRestart(NOW, '', fakeToken(nowSeconds + 600))).toBe(true)
  })

  it('is false for a routine renewal of a still-valid token', () => {
    expect(
      didSessionRestart(
        NOW,
        fakeToken(nowSeconds + 600),
        fakeToken(nowSeconds + 900),
      ),
    ).toBe(false)
  })
})
