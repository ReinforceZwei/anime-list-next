export interface TmdbSearchItem {
  id: number
  mediaType: 'tv' | 'movie'
  title: string
  originalTitle: string
  overview: string
  /** Full poster image path (already resolved at backend) */
  posterPath: string
  year: string
}

export interface TmdbSeasonInfo {
  seasonNumber: number
  name: string
  episodeCount: number
  /** Full poster image path (already resolved at backend) */
  posterPath: string
  airDate: string
}

export interface TmdbDetailResult {
  id: number
  mediaType: 'tv' | 'movie'
  title: string
  originalTitle: string
  overview: string
  /** Full poster image path (already resolved at backend) */
  posterPath: string
  year: string
  /** TV only */
  seasons?: TmdbSeasonInfo[]
}
