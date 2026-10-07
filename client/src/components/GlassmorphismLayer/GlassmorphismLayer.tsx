import { useEffect } from 'react'
import { pb } from '@/lib/pb'
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
  // rendered in __root, i.e. on /login too — never run a per-user query without a session
  const { data: prefs } = useUserPreferences({ enabled: pb.authStore.isValid })
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
