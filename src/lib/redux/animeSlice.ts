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
            invalidatesTags: (result, error, arg) => [{ type: 'animes', id: arg.id }],
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
    })
})

export const {
    useGetAnimeQuery,
    useUpdateAnimeMutation,
    useAddAnimeMutation,
} = animeApi

export interface AnimeState {
    viewingId: string | null
    editingId: string | null
    open: boolean
    openAddAnime: boolean
}

const initialState: AnimeState = {
    viewingId: null,
    editingId: null,
    open: false,
    openAddAnime: false,
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
        },
        openAddAnime: (state) => {
            state.openAddAnime = true
        },
        closeAddAnime: (state) => {
            state.openAddAnime = false
        },
    }
})

export const {
    openCard,
    closeCard,
    openEditor,
    closeEditor,
    openAddAnime,
    closeAddAnime,
} = animeSlice.actions

export default animeSlice.reducer

export interface AnimeRecord extends RecordModel {
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