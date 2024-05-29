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

interface TagRecord extends RecordModel {
    name: string
    color?: string
    weight?: number
    user_id: string
    display: boolean
}