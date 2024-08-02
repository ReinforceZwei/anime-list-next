import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RecordModel } from "pocketbase";
import { baseApi } from "./api";
import { createBrowserClient } from "@/lib/pocketbase";

export const animeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAnime: builder.query<AnimeRecord, string>({
            providesTags: (result) => result ? [{ type: 'animes', id: result.id }] : [{ type: 'animes', id: '*' }],
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
        }),
        updateAnime: builder.mutation<AnimeRecord, AnimeRecord>({
            invalidatesTags: (result, error, arg) => result ? [{ type: 'animes', id: arg.id }] : [],
            queryFn: async (anime) => {
                const pb = createBrowserClient()
                try {
                    const data = await pb.collection<AnimeRecord>('animes').update(anime.id, anime)
                    return { data }
                } catch (error) {
                    return { error: error }
                }
            }
        }),
        addAnime: builder.mutation<AnimeRecord, Partial<AnimeRecord>>({
            invalidatesTags: [{ type: 'animes', id: '*' }],
            queryFn: async (anime) => {
                const pb = createBrowserClient()
                try {
                    const data = await pb.collection<AnimeRecord>('animes').create({
                        ...anime,
                        user_id: pb.authStore.model?.id,
                    })
                    return { data }
                } catch (error) {
                    return { error: error }
                }
            }
        }),
        deleteAnime: builder.mutation<boolean, string>({
            invalidatesTags: [{ type: 'animes', id: '*' }],
            queryFn: async (id) => {
                const pb = createBrowserClient()
                try {
                    const data = await pb.collection<AnimeRecord>('animes').delete(id)
                    return { data }
                } catch (error) {
                    return { error: error }
                }
            }
        }),
    })
})

export const {
    useGetAnimeQuery,
    useUpdateAnimeMutation,
    useAddAnimeMutation,
    useDeleteAnimeMutation,
} = animeApi

export interface AnimeState {
    viewingId: string | null
    editingId: string | null
    posterSrc: string | null
    open: boolean
    openAddAnime: boolean
    touchedAnimeId: string[]
}

const initialState: AnimeState = {
    viewingId: null,
    editingId: null,
    posterSrc: null,
    open: false,
    openAddAnime: false,
    touchedAnimeId: [],
}

export const animeSlice = createSlice({
    name: 'anime',
    initialState,
    reducers: {
        // openCard: (state, action: PayloadAction<string>) => {
        //     state.viewingId = action.payload
        //     state.open = true
        // },
        // closeCard: (state) => {
        //     state.open = false
        //     state.viewingId = null
        // },
        // openEditor: (state, action: PayloadAction<string>) => {
        //     state.editingId = action.payload
        // },
        // closeEditor: (state) => {
        //     state.editingId = null
        // },
        // openAddAnime: (state) => {
        //     state.openAddAnime = true
        // },
        // closeAddAnime: (state) => {
        //     state.openAddAnime = false
        // },
        // openPoster: (state, action: PayloadAction<string>) => {
        //     state.posterSrc = action.payload
        // },
        // closePoster: (state) => {
        //     state.posterSrc = null
        // },
        animeTouched: (state, action: PayloadAction<string>) => {
            if (!state.touchedAnimeId.includes(action.payload)) {
                state.touchedAnimeId.push(action.payload)
            }
        },
    }
})

export const {
    // openCard,
    // closeCard,
    // openEditor,
    // closeEditor,
    // openAddAnime,
    // closeAddAnime,
    // openPoster,
    // closePoster,
    animeTouched,
} = animeSlice.actions

export default animeSlice.reducer

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