import { pb, Collections } from '@/lib/pb'
import type { UserPreferencesRecord } from '@/types/anime'
import { useQuery } from '@tanstack/react-query'
import { isMissingRecordError } from '@/lib/authSession'

export function useUserPreferences(options?: { enabled?: boolean }) {
  const userId = pb.authStore.record?.id

  // Preferences live behind an auth-gated rule. Without a session PocketBase
  // resolves @request.auth.* to empty, so the request returns 200 with zero rows;
  // getFirstListItem then throws a client-side 404 which the old code cached as
  // `null`. Because the key is [userPreferences, userId] and staleTime is Infinity,
  // that null survived the login and silently blanked the user's custom sections.
  const enabled = (options?.enabled ?? true) && pb.authStore.isValid && !!userId

  return useQuery({
    queryKey: [Collections.UserPreferences, userId],
    queryFn: async () => {
      try {
        return await pb
          .collection<UserPreferencesRecord>(Collections.UserPreferences)
          .getFirstListItem(pb.filter('userId = {:userId}', { userId }))
      } catch (err) {
        // 404 → the user simply has no preferences record yet.
        if (isMissingRecordError(err)) return null
        // 401/403/network must surface as an error so the query is retried later
        // instead of being cached as a permanent `null`.
        throw err
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled,
  })
}
