export interface TmdbSearchItem {
  id: number
  mediaType: 'tv' | 'movie'
  title: string
  overview: string
  posterPath: string
  year: string
}

export interface TmdbSeasonInfo {
  seasonNumber: number
  name: string
  episodeCount: number
  posterPath: string
  airDate: string
}

export interface TmdbDetailResult {
  id: number
  mediaType: 'tv' | 'movie'
  title: string
  overview: string
  posterPath: string
  year: string
  /** TV only */
  seasons?: TmdbSeasonInfo[]
}
