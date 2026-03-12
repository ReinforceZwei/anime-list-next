import type { RecordModel } from "pocketbase";

export interface AnimeRecord extends RecordModel {
  userId: string;
  tmdbId?: number;
  tmdbSeasonNumber?: number;
  tmdbMediaType?: "tv" | "movie" | "";
  customName?: string;
  status?: "planned" | "watching" | "completed" | "dropped" | "";
  downloadStatus?: "pending" | "downloading" | "downloaded" | "";
  startedAt?: string;
  completedAt?: string;
  rating?: number;
  comment?: string;
  remark?: string;
  tags?: string[];
  deleted?: string;
}