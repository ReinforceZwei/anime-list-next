import { pb, Collections } from "@/lib/pb";
import type { LastUpdateRecord } from "@/types/lastUpdate";
import { useQuery } from "@tanstack/react-query";

export function useLastUpdate() {
  const userId = pb.authStore.record?.id
  if (!userId) {
    console.warn('useLastUpdate() hook is called without authenticated user. Query will likely fail.')
  }
  return useQuery({
    queryKey: [Collections.LastUpdates, userId],
    queryFn: () => pb.collection<LastUpdateRecord>(Collections.LastUpdates).getFullList(),
    staleTime: Infinity,
    gcTime: Infinity,
  })
}