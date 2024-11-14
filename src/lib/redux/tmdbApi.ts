import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { getImageBaseUrl, getMovieDetails, getTvDetails, isTmdbAvailable, multiSearch } from '@/lib/service/tmdb'
import { Search, MultiSearchResult, TvShowDetails, MovieDetails } from 'tmdb-ts'

export const tmdbApi = createApi({
    reducerPath: 'tmdbApi',
    baseQuery: fakeBaseQuery(),
    endpoints: (builder) => ({
        isTmdbAvailable: builder.query<boolean, void>({
            queryFn: async () => {
                return { data: await isTmdbAvailable() }
            }
        }),
        multiSearch: builder.query<Search<MultiSearchResult>, string>({
            queryFn: async (name) => {
                const data = await multiSearch(name)
                return { data }
            }
        }),
        getDetails: builder.query<TvShowDetails, number>({
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
        }),
        getMovieDetails: builder.query<MovieDetails, number>({
            queryFn: async (id) => {
                const data = await getMovieDetails(id)
                return { data }
            }
        }),
    }),
})

export const {
    useIsTmdbAvailableQuery,
    useMultiSearchQuery,
    useLazyMultiSearchQuery,
    useGetDetailsQuery,
    useLazyGetDetailsQuery,
    useGetImageBaseQuery,
    useGetMovieDetailsQuery,
} = tmdbApi

