import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { baseApi } from "./api";
import { createBrowserClient } from "@/lib/pocketbase";
import { AnimeRecord } from '@/types/anime';

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
                } catch (error: any) {
                    return { error: error.toJSON() }
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
                } catch (error: any) {
                    return { error: error.toJSON() }
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
                } catch (error: any) {
                    return { error: error.toJSON() }
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
                } catch (error: any) {
                    return { error: error.toJSON() }
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
        animeTouched: (state, action: PayloadAction<string>) => {
            if (!state.touchedAnimeId.includes(action.payload)) {
                state.touchedAnimeId.push(action.payload)
            }
        },
    }
})

export const {
    animeTouched,
} = animeSlice.actions

export default animeSlice.reducer
