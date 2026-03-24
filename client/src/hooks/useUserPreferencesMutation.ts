import { pb, Collections } from "@/lib/pb";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserPreferencesRecord } from "@/types/anime";

type PbInternals = 'collectionId' | 'collectionName' | 'created' | 'updated' | 'expand'

export type UserPreferencesInput = Omit<UserPreferencesRecord, PbInternals | 'userId'>

export function useUserPreferencesMutation() {
  const userId = pb.authStore.record?.id

  if (!userId) {
    console.warn('useUserPreferencesMutation() hook is called without authenticated user. Mutation will likely fail.')
  }

  const saveMutation = useMutation({
    mutationFn: (input: UserPreferencesInput) => {
      if (input.id) {
        return pb
          .collection<UserPreferencesRecord>(Collections.UserPreferences)
          .update(input.id, input)
      }
      return pb
        .collection<UserPreferencesRecord>(Collections.UserPreferences)
        .create({ ...input, userId })
    },
  })

  return { saveMutation }
}
