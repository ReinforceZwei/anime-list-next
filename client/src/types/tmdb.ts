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

export interface TmdbGenre {
  id: number
  name: string
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
  status: string
  tagline: string
  genres: TmdbGenre[]
  /** TV only */
  firstAirDate?: string
  /** TV only */
  numberOfSeasons?: number
  /** TV only */
  numberOfEpisodes?: number
  /** TV only */
  seasons?: TmdbSeasonInfo[]
  /** Movie only */
  releaseDate?: string
  /** Movie only */
  runtime?: number
}
