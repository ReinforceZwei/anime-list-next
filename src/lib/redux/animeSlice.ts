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
                        expand: 'tags'
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
    open: boolean
}

const initialState: AnimeState = {
    viewingId: null,
    open: false,
}

export const animeSlice = createSlice({
    name: 'anime',
    initialState,
    reducers: {
        open: (state, action: PayloadAction<string>) => {
            state.viewingId = action.payload
            state.open = true
        },
        close: (state) => {
            state.open = false
            state.viewingId = null
        }
    }
})

export const {
    open,
    close,
} = animeSlice.actions

export default animeSlice.reducer

interface AnimeRecord extends RecordModel {
    name: string
    status: 'pending' | 'in-progress' | 'finished' | 'abandon'
    download_status: 'pending' | 'in-progress' | 'finished'
    finish_time: string
    rating: number
    comment: string
    remark: string
    tmdb_id: string
    tags: string[]
    user_id: string
}