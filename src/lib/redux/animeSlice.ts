import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RecordModel } from "pocketbase";
import { baseApi } from "./api";
import { createBrowserClient } from "@/lib/pocketbase";

export const animeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAnime: builder.query<AnimeRecord, string>({
            queryFn: async (id) => {
                const pb = createBrowserClient()
                try {
                    const data = await pb.collection<AnimeRecord>('animes').getOne(id, {
                        expand: 'tags,categories'
                    })
                    return { data }
                } catch (error) {
                    return { error: error }
                }
            }
        })
    })
})

export const {
    useGetAnimeQuery
} = animeApi

export interface AnimeState {
    viewingId: string | null
    editingId: string | null
    open: boolean
}

const initialState: AnimeState = {
    viewingId: null,
    editingId: null,
    open: false,
}

export const animeSlice = createSlice({
    name: 'anime',
    initialState,
    reducers: {
        openCard: (state, action: PayloadAction<string>) => {
            state.viewingId = action.payload
            state.open = true
        },
        closeCard: (state) => {
            state.open = false
            state.viewingId = null
        },
        openEditor: (state, action: PayloadAction<string>) => {
            state.editingId = action.payload
        },
        closeEditor: (state) => {
            state.editingId = null
        }
    }
})

export const {
    openCard,
    closeCard,
    openEditor,
    closeEditor,
} = animeSlice.actions

export default animeSlice.reducer

interface AnimeRecord extends RecordModel {
    name: string
    status?: 'pending' | 'in-progress' | 'finished' | 'abandon'
    download_status?: 'pending' | 'in-progress' | 'finished'
    finish_time?: string
    rating?: number
    comment?: string
    remark?: string
    tmdb_id?: string
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