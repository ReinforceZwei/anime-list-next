'use server'
//import { Configuration, SearchResultMulti, TvSeriesDetail } from '@/types/tmdb'
import { TMDB, Configuration, Search, MultiSearchResult, TvShowDetails, AvailableLanguage } from 'tmdb-ts'

function getApiKey() {
    const key = process.env.TMDB_API_KEY
    if (!key) {
        throw new Error('TMDB API key not defined')
    }
    return key
}

function getLanguage(): AvailableLanguage {
    return 'zh-TW'
}

let client: TMDB | null = null
function getClient(): TMDB {
    if (client === null) {
        client = new TMDB(getApiKey())
    }
    return client
}

async function getTmdbConfiguration(): Promise<Configuration> {
    return await getClient().configuration.getApiConfiguration()
}

export async function isTmdbAvailable() {
    return Boolean(process.env.TMDB_API_KEY)
}

let imageBaseUrl: string | null = null
export async function getImageBaseUrl(): Promise<string> {
    if (imageBaseUrl !== null) {
        return imageBaseUrl
    }
    const config = await getTmdbConfiguration()
    imageBaseUrl = config.images.secure_base_url
    return imageBaseUrl
}

export async function multiSearch(query: string): Promise<Search<MultiSearchResult>> {
    return await getClient().search.multi({
        query,
        language: getLanguage(),
    })
}

export async function getTvDetails(id: number): Promise<TvShowDetails> {
    return await getClient().tvShows.details(id, undefined, getLanguage())
}

export async function getMovieDetails(id: number) {
    return await getClient().movies.details(id, undefined, getLanguage())
}