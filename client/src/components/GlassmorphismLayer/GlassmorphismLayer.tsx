import { useEffect } from 'react'
import { useUserPreferences } from '@/hooks/useUserPreferences'

/**
 * Toggles `data-glassmorphism` on <html> based on the user's UI config.
 *
 * Mirrors Mantine's own pattern: Mantine sets `data-mantine-color-scheme` on the
 * root element and CSS modules key off it (e.g. `[data-mantine-color-scheme='dark'] .foo`).
 * Here, components opt into the frosted-glass look with
 * `[data-glassmorphism] .className` selectors in their CSS modules.
 */
export function GlassmorphismLayer() {
  const { data: prefs } = useUserPreferences()
  const enabled = prefs?.uiConfig?.glassmorphism ?? false

  useEffect(() => {
    const root = document.documentElement
    if (enabled) {
      root.dataset.glassmorphism = 'true'
    } else {
      delete root.dataset.glassmorphism
    }
  }, [enabled])

  return null
}
