import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RecordModel } from "pocketbase";
import { baseApi } from "./api";
import { createBrowserClient } from "@/lib/pocketbase";
import { generateCacheTagList } from '../vendor/rtkQueryUtils';

export const tagApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getTags: builder.query<TagRecord[], void>({
            providesTags: (result) => generateCacheTagList(result, 'tags'),
            queryFn: async () => {
                const pb = createBrowserClient()
                try {
                    const data = await pb.collection<TagRecord>('tags').getFullList({
                        sort: '+weight,+name'
                    })
                    return { data }
                } catch (error) {
                    return { error: error }
                }
            }
        }),
        getTag: builder.query<TagRecord, string>({
            providesTags: (result) => result ? [{ type: 'tags', id: result.id }] : [],
            queryFn: async (id: string) => {
                const pb = createBrowserClient()
                try {
                    const data = await pb.collection<TagRecord>('tags').getOne(id)
                    return { data }
                } catch (error) {
                    return { error: error }
                }
            }
        }),
        addTag: builder.mutation<TagRecord, Partial<TagRecord>>({
            invalidatesTags: [{ type: 'tags', id: '*' }],
            queryFn: async (tag) => {
                const pb = createBrowserClient()
                try {
                    const data = await pb.collection<TagRecord>('tags').create({
                        ...tag,
                        user_id: pb.authStore.model?.id
                    })
                    return { data }
                } catch (error) {
                    return { error }
                }
            }
        }),
        updateTag: builder.mutation<TagRecord, Partial<TagRecord>>({
            invalidatesTags: (result, error, arg) => result ? [{ type: 'tags', id: arg.id }] : [],
            queryFn: async (tag) => {
                const pb = createBrowserClient()
                try {
                    const data = await pb.collection<TagRecord>('tags').update(tag.id!, tag)
                    return { data }
                } catch (error) {
                    return { error: error }
                }
            }
        }),
        deleteTag: builder.mutation<boolean, string>({
            invalidatesTags: (result, error, arg) => result ? [{ type: 'tags', id: arg }] : [],
            queryFn: async (id: string) => {
                const pb = createBrowserClient()
                try {
                    const data = await pb.collection<TagRecord>('tags').delete(id)
                    return { data }
                } catch (error) {
                    return { error: error }
                }
            }
        }),
    })
})

export const {
    useGetTagsQuery,
    useGetTagQuery,
    useAddTagMutation,
    useUpdateTagMutation,
    useDeleteTagMutation,
} = tagApi

export interface TagRecord extends RecordModel {
    name: string
    color?: string
    weight?: number
    user_id: string
    display: boolean
}

export interface TagState {
    openAddTag: boolean
    openManageTag: boolean
}

const initialState: TagState = {
    openAddTag: false,
    openManageTag: false,
}

export const tagSlice = createSlice({
    name: 'anime',
    initialState,
    reducers: {
        openAddTag: (state) => {
            state.openAddTag = true
        },
        closeAddTag: (state) => {
            state.openAddTag = false
        },
        openManageTag: (state) => {
            state.openManageTag = true
        },
        closeManageTag: (state) => {
            state.openManageTag = false
        }
    }
})

export const {
    openAddTag,
    closeAddTag,
    openManageTag,
    closeManageTag,
} = tagSlice.actions

export default tagSlice.reducer