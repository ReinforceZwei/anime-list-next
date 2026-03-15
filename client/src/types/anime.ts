import type { RecordModel } from "pocketbase";

export interface AnimeRecord extends RecordModel {
  userId: string;
  tmdbId?: number;
  tmdbSeasonNumber?: number;
  tmdbMediaType?: "tv" | "movie" | "";
  /** User input when no TMDb ID available */
  customName?: string;
  /** Cached title from TMDb (translated title) */
  cachedTitle?: string;
  /** Cached season name from TMDb (TV only, translated) */
  cachedSeasonName?: string;
  status?: "planned" | "watching" | "completed" | "dropped" | "";
  downloadStatus?: "pending" | "downloading" | "downloaded" | "";
  startedAt?: string;
  completedAt?: string;
  rating?: number;
  comment?: string;
  remark?: string;
  tags?: string[];
  created: string;
  updated: string;
  deleted?: string;
}