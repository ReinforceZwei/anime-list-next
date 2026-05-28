import type { RecordModel } from "pocketbase";
import type { FilterExpression, ActionButton } from './filter'
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

export interface UIConfig {
  pageTitle?: string
  /** Show built-in quick-action buttons (status transitions) on the InfoCard. Default: true */
  showBuiltInActions?: boolean
}

export const DEFAULT_UI_CONFIG: UIConfig = {
  pageTitle: '',
  showBuiltInActions: true,
}

/** Convert built-in quick actions into ActionButton format so users can import them into the custom button editor. */
export function getBuiltInActionButtons(): ActionButton[] {
  return [
    {
      id: generateId(),
      label: '開始觀看',
      icon: 'IconPlayerPlay',
      color: '#228be6',
      condition: {
        id: generateId(),
        logic: 'and',
        conditions: [{ id: generateId(), field: 'status', operator: 'eq', value: 'planned' }],
      },
      actions: [{ type: 'setField', field: 'status', value: 'watching' }],
    },
    {
      id: generateId(),
      label: '標記為已看完',
      icon: 'IconCheck',
      color: '#12b886',
      condition: {
        id: generateId(),
        logic: 'and',
        conditions: [{ id: generateId(), field: 'status', operator: 'eq', value: 'watching' }],
      },
      actions: [{ type: 'setField', field: 'status', value: 'completed' }],
    },
    {
      id: generateId(),
      label: '列入待看',
      icon: 'IconCalendar',
      color: '#868e96',
      condition: {
        id: generateId(),
        logic: 'and',
        conditions: [{ id: generateId(), field: 'status', operator: 'isEmpty', value: null }],
      },
      actions: [{ type: 'setField', field: 'status', value: 'planned' }],
    },
    {
      id: generateId(),
      label: '開始下載',
      icon: 'IconDownload',
      color: '#fd7e14',
      condition: {
        id: generateId(),
        logic: 'and',
        conditions: [{ id: generateId(), field: 'downloadStatus', operator: 'eq', value: 'pending' }],
      },
      actions: [{ type: 'setField', field: 'downloadStatus', value: 'downloading' }],
    },
    {
      id: generateId(),
      label: '標記為已下載',
      icon: 'IconCheck',
      color: '#40c057',
      condition: {
        id: generateId(),
        logic: 'and',
        conditions: [{ id: generateId(), field: 'downloadStatus', operator: 'eq', value: 'downloading' }],
      },
      actions: [{ type: 'setField', field: 'downloadStatus', value: 'downloaded' }],
    },
  ]
}

export interface UserPreferencesRecord extends RecordModel {
  userId: string
  sections?: SectionDef[] | null   // null/empty = use built-in defaults
  actionButtons?: ActionButton[] | null    // user-defined action buttons
  uiConfig?: UIConfig
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