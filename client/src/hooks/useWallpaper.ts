import { useMemo } from 'react'
import { pb } from '@/lib/pb'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { DEFAULT_WALLPAPER_CONFIG } from '@/types/anime'
import type { WallpaperConfig } from '@/types/anime'

interface WallpaperCache {
  type: WallpaperConfig['type']
  color?: string
  imageUrl?: string
  imageFile?: string
  position?: string
  repeat?: string
  size?: string
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
  } catch { /* quota exceeded — ignore */ }
}

function getFileUrl(record: { id: string; collectionId: string }, filename: string): string {
  // pb.files.getURL is stable for the same record + filename
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
      if (!imageUrl) return {} // still loading
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
  const { data: prefs } = useUserPreferences({ enabled: isAuthenticated })

  const serverConfig: WallpaperConfig = prefs?.uiConfig?.wallpaper ?? DEFAULT_WALLPAPER_CONFIG
  const serverWallpaperFile: string | undefined = prefs?.wallpaper

  const result = useMemo(() => {
    const cache = readCache()

    // Unauthenticated: use cache or default, not loading
    if (!isAuthenticated) {
      if (cache) {
        const config: WallpaperConfig =
          cache.type === 'default' ? { type: 'default' }
          : cache.type === 'color' ? { type: 'color', color: cache.color! }
          : { type: 'image', position: cache.position, repeat: cache.repeat, size: cache.size }
        return {
          style: deriveStyle(config, cache.imageUrl),
          isLoading: false,
          imageUrl: cache.imageUrl,
          config,
        }
      }
      return {
        style: deriveStyle(DEFAULT_WALLPAPER_CONFIG),
        isLoading: false,
        imageUrl: undefined,
        config: DEFAULT_WALLPAPER_CONFIG,
      }
    }

    // Authenticated: waiting for server data
    if (prefs === undefined) {
      // Show cached style while loading to avoid flicker
      if (cache) {
        const config: WallpaperConfig =
          cache.type === 'default' ? { type: 'default' }
          : cache.type === 'color' ? { type: 'color', color: cache.color! }
          : { type: 'image', position: cache.position, repeat: cache.repeat, size: cache.size }
        return {
          style: deriveStyle(config, cache.imageUrl),
          isLoading: true,
          imageUrl: cache.imageUrl,
          config,
        }
      }
      return { style: {}, isLoading: true, imageUrl: undefined, config: DEFAULT_WALLPAPER_CONFIG }
    }

    // Authenticated with server data (prefs may be null = no record yet)
    let imageUrl: string | undefined

    if (serverConfig.type === 'image' && serverWallpaperFile) {
      // Same file as cached? reuse URL; otherwise resolve & update cache
      if (cache?.imageFile === serverWallpaperFile && cache?.imageUrl) {
        imageUrl = cache.imageUrl
      } else {
        imageUrl = getFileUrl(prefs!, serverWallpaperFile)
      }
    }

    // Build new cache entry
    const newCache: WallpaperCache = {
      type: serverConfig.type,
      color: serverConfig.type === 'color' ? serverConfig.color : undefined,
      imageUrl,
      imageFile: serverConfig.type === 'image' ? serverWallpaperFile : undefined,
      position: serverConfig.type === 'image' ? serverConfig.position : undefined,
      repeat: serverConfig.type === 'image' ? serverConfig.repeat : undefined,
      size: serverConfig.type === 'image' ? serverConfig.size : undefined,
    }

    // Write back only if changed
    if (JSON.stringify(newCache) !== JSON.stringify(cache)) {
      writeCache(newCache)
    }

    return {
      style: deriveStyle(serverConfig, imageUrl),
      isLoading: false,
      imageUrl,
      config: serverConfig,
    }
  }, [prefs, serverConfig, serverWallpaperFile, isAuthenticated])

  return result
}
