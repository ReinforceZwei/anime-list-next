import { pb } from "@/lib/pb";
import { useMutation } from "@tanstack/react-query";
import type { AnimeRecord } from "@/types/anime";

export type AnimeCreateInput = Omit<AnimeRecord, 'userId' | 'created' | 'updated' | 'deleted'>;
export type AnimeUpdateInput = Omit<AnimeRecord, 'userId' | 'created' | 'updated' | 'deleted'>;
export type AnimeDeleteInput = {
  id: string;
}

export function useAnimeMutation() {
  const userId = pb.authStore.record?.id
  if (!userId) {
    console.warn('useAnimeMutation() hook is called without authenticated user. Mutation will likely fail.')
  }
  const createMutation = useMutation({
    mutationFn: (anime: AnimeCreateInput) => pb.collection('animes').create({ ...anime, userId }),
  })

  const updateMutation = useMutation({
    mutationFn: (anime: AnimeUpdateInput) => pb.collection('animes').update(anime.id, anime),
  })

  const deleteMutation = useMutation({
    mutationFn: (input: AnimeDeleteInput) => pb.collection('animes').delete(input.id),
  })

  return { createMutation, updateMutation, deleteMutation }
}