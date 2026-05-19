import type { RecordModel } from "pocketbase";
import type { FilterExpression } from './filter'
import { generateId } from './filter'

export interface TagRecord extends RecordModel {
  userId: string;
  name: string;
  color?: string;
  weight?: number;
  hidden?: boolean;
  created: string;
  updated: string;
}

export type SortableField = 'completedAt' | 'startedAt' | 'updated' | 'created' | 'rating'

export interface SectionDef {
  key: string
  label: string
  filter: FilterExpression | null   // null = match all records
  sortBy: SortableField
  sortOrder: 'asc' | 'desc'
}

export interface AnimeSection {
  key: string
  label: string
  items: AnimeRecord[]
}

export interface UserPreferencesRecord extends RecordModel {
  userId: string
  pageTitle?: string
  sections?: SectionDef[] | null   // null/empty = use built-in defaults
}

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
}

// ---- Default sections ----

function statusFilter(statuses: string[]): FilterExpression {
  return {
    id: generateId(),
    logic: 'and',
    conditions: [{
      id: generateId(),
      field: 'status',
      operator: 'in',
      value: statuses,
    }],
  }
}

export const DEFAULT_SECTIONS: SectionDef[] = [
  { key: 'watching',  label: '觀看中', filter: statusFilter(['watching']),  sortBy: 'updated',     sortOrder: 'desc' },
  { key: 'completed', label: '已看完', filter: statusFilter(['completed']), sortBy: 'completedAt', sortOrder: 'asc'  },
  { key: 'planned',   label: '計畫中', filter: statusFilter(['planned']),   sortBy: 'created',     sortOrder: 'asc'  },
  { key: 'dropped',   label: '已棄番', filter: statusFilter(['dropped']),   sortBy: 'updated',     sortOrder: 'desc' },
]