import { pb, Collections } from "@/lib/pb";
import type { UserPreferencesRecord } from "@/types/anime";
import { useQuery } from "@tanstack/react-query";

export function useUserPreferences() {
  const userId = pb.authStore.record?.id
  if (!userId) {
    console.warn('useUserPreferences() hook is called without authenticated user. Query will likely fail.')
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
  })
}
