import { baseApi } from "./api";
import { createBrowserClient } from "@/lib/pocketbase";
import { AnimeRelationshipRecord } from '@/types/animeRelationship';


export const animeRelationshipApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getRelationships: builder.query<AnimeRelationshipRecord[], string>({
            queryFn: async (id) => {
                const pb = createBrowserClient()
                try {
                    const data = await pb.collection<AnimeRelationshipRecord>('animeRelationship').getFullList({
                        filter: `relationship ~ '${id}'`,
                    })
                    return { data }
                } catch (error) {
                    return { error }
                }
            }
        }),
    })
})

export const {
    useGetRelationshipsQuery,
} = animeRelationshipApi
