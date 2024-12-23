export interface Configuration {
    images:      ImagesConfiguration;
    change_keys: string[];
}

export interface ImagesConfiguration {
    base_url:        string;
    secure_base_url: string;
    backdrop_sizes:  string[];
    logo_sizes:      string[];
    poster_sizes:    string[];
    profile_sizes:   string[];
    still_sizes:     string[];
}


export interface SearchResultMulti {
    page:          number;
    results:       (ResultTv | ResultMovie)[];
    total_pages:   number;
    total_results: number;
}

export interface ResultTv {
    backdrop_path:     string;
    id:                number;
    original_name:     string;
    overview:          string;
    poster_path:       string;
    media_type:        string;
    adult:             boolean;
    name:              string;
    original_language: string;
    genre_ids:         number[];
    popularity:        number;
    first_air_date:    string;
    vote_average:      number;
    vote_count:        number;
    origin_country:    string[];
}

export interface ResultMovie {
    adult:             boolean;
    backdrop_path:     string;
    genre_ids:         number[];
    id:                number;
    original_language: string;
    original_title:    string;
    overview:          string;
    popularity:        number;
    poster_path:       string;
    release_date:      string;
    title:             string;
    video:             boolean;
    vote_average:      number;
    vote_count:        number;
}


export interface TvSeriesDetail {
    adult:                boolean;
    backdrop_path:        string;
    created_by:           any[];
    episode_run_time:     number[];
    first_air_date:       string;
    genres:               Genre[];
    homepage:             string;
    id:                   number;
    in_production:        boolean;
    languages:            string[];
    last_air_date:        string;
    last_episode_to_air:  Episode;
    name:                 string;
    next_episode_to_air:  null;
    networks:             Network[];
    number_of_episodes:   number;
    number_of_seasons:    number;
    origin_country:       string[];
    original_language:    string;
    original_name:        string;
    overview:             string;
    popularity:           number;
    poster_path:          string;
    production_companies: Network[];
    production_countries: ProductionCountry[];
    seasons:              Season[];
    spoken_languages:     SpokenLanguage[];
    status:               string;
    tagline:              string;
    type:                 string;
    vote_average:         number;
    vote_count:           number;
}

export interface MovieDetail {
    adult: boolean
    backdrop_path: string
    belongs_to_collection: any
    budget: number
    genres: Genre[]
    homepage: string
    id: number
    imdb_id: string
    origin_country: string[]
    original_language: string
    original_title: string
    overview: string
    popularity: number
    poster_path: string
    production_companies: ProductionCompany[]
    production_countries: ProductionCountry[]
    release_date: string
    revenue: number
    runtime: number
    spoken_languages: SpokenLanguage[]
    status: string
    tagline: string
    title: string
    video: boolean
    vote_average: number
    vote_count: number
}

export interface Genre {
    id:   number;
    name: string;
}

export interface Episode {
    id:              number;
    overview:        string;
    name:            string;
    vote_average:    number;
    vote_count:      number;
    air_date:        string;
    episode_number:  number;
    episode_type:    string;
    production_code: string;
    runtime:         number;
    season_number:   number;
    show_id:         number;
    still_path:      string;
}

export interface EpisodeDetail {
    id:              number;
    overview:        string;
    name:            string;
    vote_average:    number;
    vote_count:      number;
    air_date:        string;
    episode_number:  number;
    production_code: string;
    runtime:         number;
    season_number:   number;
    show_id:         number;
    still_path:      string;
    crew:            Crew[];
    guest_stars:     GuestStar[];
}

export interface Crew {
    department: string
    job: string
    credit_id: string
    adult: boolean
    gender: number
    id: number
    known_for_department: string
    name: string
    original_name: string
    popularity: number
    profile_path: string
}

export interface GuestStar {
    character: string
    credit_id: string
    order: number
    adult: boolean
    gender: number
    id: number
    known_for_department: string
    name: string
    original_name: string
    popularity: number
    profile_path: string
}

export interface Network {
    id:             number;
    logo_path:      string;
    name:           string;
    origin_country: string;
}

export interface ProductionCountry {
    iso_3166_1: string;
    name:       string;
}

export interface ProductionCompany {
    id: number
    logo_path: string
    name: string
    origin_country: string
}

export interface Season {
    air_date:      string;
    episode_count: number;
    id:            number;
    name:          string;
    overview:      string;
    poster_path:   string;
    season_number: number;
    vote_average:  number;
}

export interface SpokenLanguage {
    english_name: string;
    iso_639_1:    string;
    name:         string;
}
