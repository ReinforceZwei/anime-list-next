'use server'
import { Configuration, SearchResult, TvSeriesDetail } from '@/types/tmdb'



function getApiKey() {
    const key = process.env.TMDB_API_KEY
    if (!key) {
        throw new Error('TMDB API key not defined')
    }
    return key
}

function urlWithKey(url: string, query = {}): URL {
    const _url = new URL(url)
    _url.search = new URLSearchParams({ api_key: getApiKey(), ...query }).toString()
    return _url
}

async function getTmdbConfiguration(): Promise<Configuration> {
    const resp = await fetch(urlWithKey('https://api.themoviedb.org/3/configuration'))
    const json = await resp.json()
    return json
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

export async function multiSearch(query: string): Promise<SearchResult> {
    const resp = await fetch(urlWithKey('https://api.themoviedb.org/3/search/multi', {
        language: 'zh-TW',
        query
    }))
    const json = await resp.json()
    return json
}

export async function getTvDetails(id: number): Promise<TvSeriesDetail> {
    const resp = await fetch(urlWithKey(`https://api.themoviedb.org/3/tv/${id}`, {
        language: 'zh-TW',
    }))
    const json = await resp.json()
    return json
}