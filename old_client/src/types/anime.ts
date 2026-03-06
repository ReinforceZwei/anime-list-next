import { RecordModel } from "pocketbase"

export interface AnimeRecord extends RecordModel {
    name: string
    status?: 'pending' | 'in-progress' | 'finished' | 'abandon'
    download_status?: 'pending' | 'in-progress' | 'finished'
    start_time?: string
    finish_time?: string
    rating?: number
    comment?: string
    remark?: string
    tmdb_id?: string
    tmdb_season_number?: string
    tags: string[]
    user_id: string
}

export const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In progress' },
    { value: 'finished', label: 'Finished' },
    { value: 'abandon', label: 'Abandon' },
]

export const DOWNLOAD_STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In progress' },
    { value: 'finished', label: 'Finished' },
]