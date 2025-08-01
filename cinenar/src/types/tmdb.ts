// TV Series related types
export interface TvSeriesDetails {
  id: number;
  name: string;
  poster_path: string | null;
  number_of_seasons: number;
  seasons: Array<{
    id: number;
    season_number: number;
    name: string;
    poster_path: string | null;
    episode_count: number;
  }>;
}

// Season details interface
export interface SeasonDetails {
  id: number;
  season_number: number;
  name: string;
  poster_path?: string;
  air_date?: string;
  episode_count: number;
  overview?: string;
  episodes?: Episode[];
}

// Episode interface
export interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview?: string;
  still_path?: string;
  air_date?: string;
  runtime?: number;
  vote_average?: number;
}
