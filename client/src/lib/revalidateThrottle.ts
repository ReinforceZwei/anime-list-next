/**
 * Floor for how often the app may re-validate the cache in response to an app-lifecycle
 * event. `visibilitychange` fires on every tab/window switch and `online` on every
 * network flap, so without a floor a user hopping between windows produces one
 * revalidation request per switch.
 *
 * This is a floor, not a freshness target: realtime events still arrive instantly, the
 * throttle only bounds the *fallback* check that catches events missed while the
 * connection was down.
 */
export const MIN_REVALIDATE_INTERVAL_MS = 30 * 1000

/**
 * Whether a lifecycle-triggered revalidation should run now.
 *
 * @param nowMs       current time
 * @param lastRunAtMs when the last attempt started, or null if there was none
 * @param inFlight    whether an attempt is currently running
 */
export function shouldRevalidate(
  nowMs: number,
  lastRunAtMs: number | null,
  inFlight: boolean,
): boolean {
  // One comparison already in flight answers the same question this event is asking.
  if (inFlight) return false
  if (lastRunAtMs === null) return true
  // A stamp in the future (the system clock was corrected backwards) must not wedge the
  // fallback check until the clock catches up.
  if (nowMs < lastRunAtMs) return true
  return nowMs - lastRunAtMs >= MIN_REVALIDATE_INTERVAL_MS
}
