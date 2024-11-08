import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { getImageBaseUrl, getTvDetails, multiSearch } from '@/lib/service/tmdb'
import { SearchResultMulti, TvSeriesDetail } from "@/types/tmdb";

export const tmdbApi = createApi({
    reducerPath: 'tmdbApi',
    baseQuery: fakeBaseQuery(),
    endpoints: (builder) => ({
        multiSearch: builder.query<SearchResultMulti, string>({
            queryFn: async (name) => {
                const data = await multiSearch(name)
                return { data }
            }
        }),
        getDetails: builder.query<TvSeriesDetail, number>({
            queryFn: async (id) => {
                const data = await getTvDetails(id)
                return { data }
            }
        }),
        getImageBase: builder.query<string, void>({
            queryFn: async () => {
                const data = await getImageBaseUrl()
                return { data }
            }
        })
    }),
})

export const {
    useMultiSearchQuery,
    useLazyMultiSearchQuery,
    useGetDetailsQuery,
    useLazyGetDetailsQuery,
    useGetImageBaseQuery,
} = tmdbApi

