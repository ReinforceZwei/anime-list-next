import { pb, Collections } from "@/lib/pb";
import type { TagRecord } from "@/types/anime";
import { useQuery } from "@tanstack/react-query";

// Make a super large batch size to ensure we get all records
// if records more than 99999, thats another problem...
const BATCH_SIZE = 99999

export function useTagList() {
  const userId = pb.authStore.record?.id
  if (!userId) {
    console.warn('useTagList() hook is called without authenticated user. Query will likely fail.')
  }

  return useQuery({
    queryKey: ['tags', userId],
    queryFn: () => pb.collection<TagRecord>(Collections.Tags).getFullList({ batch: BATCH_SIZE }),
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
