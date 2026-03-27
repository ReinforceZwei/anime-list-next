import { pb, Collections } from "@/lib/pb";
import { useMutation } from "@tanstack/react-query";
import type { TagRecord } from "@/types/anime";
import { showErrorNotification } from "@/lib/notifications";

// PocketBase internals excluded explicitly (RecordModel has an index signature that
// makes keyof RecordModel resolve to `string`, which would wipe the entire type).
type PbInternals = 'collectionId' | 'collectionName' | 'created' | 'updated' | 'expand'

// Excludes PocketBase internals and userId (injected by hook).
// id is kept so callers can optionally specify a custom record id on create.
export type TagCreateInput = Omit<TagRecord, PbInternals | 'userId'>
export type TagUpdateInput = Omit<TagRecord, PbInternals | 'userId'> & { id: string }
export type TagDeleteInput = { id: string }

export function useTagMutation() {
  const userId = pb.authStore.record?.id
  if (!userId) {
    console.warn('useTagMutation() hook is called without authenticated user. Mutation will likely fail.')
  }

  const createMutation = useMutation({
    mutationFn: (tag: TagCreateInput) => pb.collection(Collections.Tags).create({ ...tag, userId }),
    onError: showErrorNotification,
  })

  const updateMutation = useMutation({
    mutationFn: (tag: TagUpdateInput) => pb.collection(Collections.Tags).update(tag.id, tag),
    onError: showErrorNotification,
  })

  const deleteMutation = useMutation({
    mutationFn: (input: TagDeleteInput) => pb.collection(Collections.Tags).delete(input.id),
    onError: showErrorNotification,
  })

  return { createMutation, updateMutation, deleteMutation }
}
