import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RecordModel } from "pocketbase";
import { baseApi } from "./api";
import { createBrowserClient } from "@/lib/pocketbase";

export const tagApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getTags: builder.query<TagRecord[], void>({
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
        })
    })
})

export const {
    useGetTagsQuery
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
}

const initialState: TagState = {
    openAddTag: false,
}

export const tagSlice = createSlice({
    name: 'anime',
    initialState,
    reducers: {
        openAddTag: (state, action: PayloadAction<string>) => {
            state.openAddTag = true
        },
        closeAddTag: (state) => {
            state.openAddTag = false
        },
    }
})

export const {
    openAddTag,
    closeAddTag,
} = tagSlice.actions

export default tagSlice.reducer