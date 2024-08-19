import { baseApi } from "./api";
import { createBrowserClient } from "@/lib/pocketbase";
import { generateCacheTagList } from '../vendor/rtkQueryUtils';
import { TagRecord } from '@/types/tag';

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
                } catch (error: any) {
                    return { error: error.toJSON() }
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
                } catch (error: any) {
                    return { error: error.toJSON() }
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
                } catch (error: any) {
                    return { error: error.toJSON() }
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
                } catch (error: any) {
                    return { error: error.toJSON() }
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
                } catch (error: any) {
                    return { error: error.toJSON() }
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

