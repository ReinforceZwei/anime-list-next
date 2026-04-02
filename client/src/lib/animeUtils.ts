/**
 * Returns the display title for an anime record.
 *
 * Priority:
 * 1. customName (user-defined)
 * 2. If cachedSeasonName starts with cachedTitle → cachedSeasonName only
 *    Otherwise → cachedTitle + " " + cachedSeasonName
 * 3. cachedTitle or cachedSeasonName alone (whichever is available)
 * 4. fallback (defaults to empty string)
 */
export function getDisplayTitle(
  record: { customName?: string; cachedTitle?: string; cachedSeasonName?: string },
  fallback = '',
): string {
  if (record.customName) return record.customName

  const title = record.cachedTitle
  const season = record.cachedSeasonName

  if (title && season) {
    return season.startsWith(title) ? season : `${title} ${season}`
  }
  if (title) return title
  if (season) return season
  return fallback
}
