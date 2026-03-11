import { pb } from '../lib/pb'
import type { TmdbDetailResult, TmdbSearchItem } from '../types/tmdb'

export async function searchTmdb(query: string): Promise<TmdbSearchItem[]> {
  return pb.send<TmdbSearchItem[]>('/api/tmdb/search', { query: { query } })
}

export async function getTmdbDetail(
  type: 'tv' | 'movie',
  id: number,
): Promise<TmdbDetailResult> {
  return pb.send<TmdbDetailResult>('/api/tmdb/detail', { query: { type, id } })
}
