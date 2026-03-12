import { useQuery } from "@tanstack/react-query";
import { searchTmdb, getTmdbDetail } from "@/api/tmdb";
import type { TmdbSearchItem, TmdbDetailResult } from "@/types/tmdb";

export function useTmdbSearch(query: string) {
  return useQuery<TmdbSearchItem[]>({
    queryKey: ["tmdb", "search", query],
    queryFn: () => searchTmdb(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTmdbDetail(type: "tv" | "movie" | null, id: number | null) {
  return useQuery<TmdbDetailResult>({
    queryKey: ["tmdb", "detail", type, id],
    queryFn: () => getTmdbDetail(type!, id!),
    enabled: !!type && !!id,
    staleTime: 1000 * 60 * 60,
  });
}
