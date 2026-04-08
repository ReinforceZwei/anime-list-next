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

// ── Sub-types (matching raw TMDb JSON field names) ──────────────────────────

export interface TmdbGenre {
  id: number
  name: string
}

export interface TmdbSeason {
  air_date: string
  episode_count: number
  id: number
  name: string
  overview: string
  /** Full poster image path (already resolved at backend) */
  poster_path: string
  season_number: number
  vote_average: number
  show_id?: number
}

export interface TmdbCreatedBy {
  id: number
  credit_id: string
  name: string
  gender: number
  profile_path: string
}

export interface TmdbNetwork {
  name: string
  id: number
  logo_path: string
  origin_country: string
}

export interface TmdbProductionCompany {
  name: string
  id: number
  logo_path: string
  origin_country: string
}

export interface TmdbProductionCountry {
  iso_3166_1: string
  name: string
}

export interface TmdbSpokenLanguage {
  iso_639_1: string
  name: string
}

export interface TmdbBelongsToCollection {
  id: number
  name: string
  poster_path: string
  backdrop_path: string
}

export interface TmdbEpisode {
  air_date: string
  episode_number: number
  id: number
  name: string
  overview: string
  production_code: string
  season_number: number
  show_id: number
  still_path: string
  vote_count: number
  vote_average: number
}

// ── Detail result types (raw TMDb JSON + mediaType discriminator) ────────────

export interface TmdbTvDetailResult {
  mediaType: 'tv'
  id: number
  backdrop_path: string
  created_by: TmdbCreatedBy[]
  episode_run_time: number[]
  first_air_date: string
  genres: TmdbGenre[]
  homepage: string
  in_production: boolean
  languages: string[]
  last_air_date: string
  name: string
  last_episode_to_air: TmdbEpisode
  next_episode_to_air: TmdbEpisode | null
  networks: TmdbNetwork[]
  number_of_episodes: number
  number_of_seasons: number
  origin_country: string[]
  original_language: string
  original_name: string
  overview: string
  popularity: number
  /** Full poster image path (already resolved at backend) */
  poster_path: string
  production_companies: TmdbProductionCompany[]
  production_countries: TmdbProductionCountry[]
  seasons: TmdbSeason[]
  status: string
  tagline: string
  type: string
  vote_count: number
  vote_average: number
}

export interface TmdbMovieDetailResult {
  mediaType: 'movie'
  adult: boolean
  backdrop_path: string
  belongs_to_collection: TmdbBelongsToCollection
  budget: number
  genres: TmdbGenre[]
  homepage: string
  id: number
  imdb_id: string
  original_language: string
  original_title: string
  overview: string
  popularity: number
  /** Full poster image path (already resolved at backend) */
  poster_path: string
  origin_country: string[]
  production_companies: TmdbProductionCompany[]
  production_countries: TmdbProductionCountry[]
  release_date: string
  revenue: number
  runtime: number
  spoken_languages: TmdbSpokenLanguage[]
  status: string
  tagline: string
  title: string
  video: boolean
  vote_count: number
  vote_average: number
}

export type TmdbDetailResult = TmdbTvDetailResult | TmdbMovieDetailResult
