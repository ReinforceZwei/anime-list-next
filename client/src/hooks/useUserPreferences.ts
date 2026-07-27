import { pb, Collections } from '@/lib/pb'
import type { UserPreferencesRecord } from '@/types/anime'
import { useQuery } from '@tanstack/react-query'

export function useUserPreferences(options?: { enabled?: boolean }) {
  const userId = pb.authStore.record?.id
  const enabled = options?.enabled ?? true

  if (!userId && enabled) {
    console.warn(
      'useUserPreferences() hook is called without authenticated user. Query will likely fail.',
    )
  }

  return useQuery({
    queryKey: [Collections.UserPreferences, userId],
    queryFn: async () => {
      try {
        return await pb
          .collection<UserPreferencesRecord>(Collections.UserPreferences)
          .getFirstListItem(`userId = '${userId}'`)
      } catch {
        // No record yet — user hasn't customised preferences
        return null
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled,
  })
}
