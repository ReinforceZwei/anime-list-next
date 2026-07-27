import { useMemo } from 'react'
import { pb } from '@/lib/pb'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { DEFAULT_WALLPAPER_CONFIG } from '@/types/anime'
import type { WallpaperConfig, UIConfig } from '@/types/anime'

interface WallpaperCache {
  id: string
  collectionId: string
  wallpaper?: string
  uiConfig?: UIConfig
}

const CACHE_KEY = 'wallpaper-cache'
const DEFAULT_BG_URL = '/21.jpg'

function readCache(): WallpaperCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as WallpaperCache) : null
  } catch {
    return null
  }
}

function writeCache(cache: WallpaperCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    /* quota exceeded — ignore */
  }
}

function getFileUrl(
  record: { id: string; collectionId: string },
  filename: string,
): string {
  return pb.files.getURL(record, filename)
}

function deriveStyle(
  config: WallpaperConfig,
  imageUrl?: string,
): React.CSSProperties {
  switch (config.type) {
    case 'default':
      return {
        background: `url(${DEFAULT_BG_URL})`,
        backgroundPosition: 'right',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll',
        backgroundSize: 'cover',
      }
    case 'color':
      return { backgroundColor: config.color }
    case 'image': {
      if (!imageUrl) return {}
      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundPosition: config.position || 'center',
        backgroundRepeat: config.repeat || 'no-repeat',
        backgroundAttachment: 'scroll',
        backgroundSize: config.size || 'cover',
      }
    }
  }
}

function resolveWallpaper(
  prefs:
    | {
        id: string
        collectionId: string
        wallpaper?: string
        uiConfig?: UIConfig
      }
    | null
    | undefined,
  cache: WallpaperCache | null,
): { config: WallpaperConfig; imageUrl?: string } {
  // Server data available (may be null = user has no preferences record yet)
  if (prefs !== undefined) {
    const config = prefs?.uiConfig?.wallpaper ?? DEFAULT_WALLPAPER_CONFIG
    const wallpaperFile = prefs?.wallpaper
    const imageUrl =
      config.type === 'image' && wallpaperFile && prefs
        ? getFileUrl(prefs, wallpaperFile)
        : undefined
    return { config, imageUrl }
  }

  // Loading — use cache
  if (cache) {
    const config = cache.uiConfig?.wallpaper ?? DEFAULT_WALLPAPER_CONFIG
    const wallpaperFile = cache.wallpaper
    const imageUrl =
      config.type === 'image' && wallpaperFile
        ? getFileUrl(
            { id: cache.id, collectionId: cache.collectionId },
            wallpaperFile,
          )
        : undefined
    return { config, imageUrl }
  }

  // No cache, no server — default
  return { config: DEFAULT_WALLPAPER_CONFIG }
}

/**
 * Derive wallpaper CSS properties from the user's saved preferences.
 *
 * 1. Read localStorage cache → apply instantly (no flicker).
 * 2. If unauthenticated, stop there — render cached/default only.
 * 3. When server data arrives, resolve the image URL (if any),
 *    update localStorage, and derive final style.
 *
 * Realtime sync: useUserPreferencesRealtimeSync updates the React Query cache;
 * useUserPreferences re-renders, which causes this hook to re-derive.
 */
export function useWallpaper(): {
  style: React.CSSProperties
  isLoading: boolean
  /** Resolved image URL (only set when config.type is 'image' and file exists) */
  imageUrl?: string
  /** Current wallpaper config */
  config: WallpaperConfig
} {
  const isAuthenticated = pb.authStore.isValid

  // Only call useUserPreferences when authenticated — avoids doomed query on login page
  const { data: prefs, isLoading } = useUserPreferences({
    enabled: isAuthenticated,
  })

  const result = useMemo(() => {
    const cache = readCache()

    // Resolve effective config + imageUrl from server or cache
    const { config, imageUrl } = resolveWallpaper(prefs, cache)

    // Sync server data back to localStorage
    if (prefs) {
      const newCache: WallpaperCache = {
        id: prefs.id,
        collectionId: prefs.collectionId,
        wallpaper: prefs.wallpaper,
        uiConfig: prefs.uiConfig,
      }
      if (JSON.stringify(newCache) !== JSON.stringify(cache)) {
        writeCache(newCache)
      }
    }

    // When loading with no cache, render empty style to avoid default-wallpaper flash
    const style = isLoading && !cache ? {} : deriveStyle(config, imageUrl)

    return { style, isLoading, imageUrl, config }
  }, [prefs, isAuthenticated])

  return result
}
