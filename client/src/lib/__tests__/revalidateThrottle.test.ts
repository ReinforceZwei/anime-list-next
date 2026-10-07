import { describe, expect, it } from 'vitest'
import {
  MIN_REVALIDATE_INTERVAL_MS,
  shouldRevalidate,
} from '@/lib/revalidateThrottle'

const NOW = 1_800_000_000_000

describe('shouldRevalidate', () => {
  it('runs the first time', () => {
    expect(shouldRevalidate(NOW, null, false)).toBe(true)
  })

  it('throttles a burst of lifecycle events (tab/window hopping)', () => {
    const firstRun = NOW
    // 10 visibilitychange events spread over a few seconds
    for (const offset of [
      0, 400, 800, 1200, 1600, 2000, 2400, 2800, 3200, 3600,
    ]) {
      expect(shouldRevalidate(firstRun + offset, firstRun, false)).toBe(false)
    }
  })

  it('runs again once the window has elapsed', () => {
    expect(shouldRevalidate(NOW, NOW - MIN_REVALIDATE_INTERVAL_MS, false)).toBe(
      true,
    )
    expect(
      shouldRevalidate(NOW, NOW - MIN_REVALIDATE_INTERVAL_MS + 1, false),
    ).toBe(false)
  })

  it('skips while a comparison is already in flight', () => {
    expect(shouldRevalidate(NOW, NOW - MIN_REVALIDATE_INTERVAL_MS, true)).toBe(
      false,
    )
    expect(shouldRevalidate(NOW, null, true)).toBe(false)
  })

  it('does not wedge when the clock jumps backwards', () => {
    expect(shouldRevalidate(NOW, NOW + 60_000, false)).toBe(true)
  })
})
