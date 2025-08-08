
import { NetworkService } from './networkService';

// Raw TMDB API Response types
interface TMDBRawMovieResult {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  vote_average?: number;
  overview?: string;
  backdrop_path?: string | null;
  runtime?: number;
  genres?: Array<{ id: number; name: string }>;
}

interface TMDBRawSeriesResult {
  id: number;
  name: string;
  first_air_date?: string;
  poster_path?: string | null;
  vote_average?: number;
  overview?: string;
  backdrop_path?: string | null;
  number_of_seasons?: number;
  number_of_episodes?: number;
  genres?: Array<{ id: number; name: string }>;
  seasons?: Array<{
    id: number;
    season_number: number;
    name: string;
    poster_path?: string | null;
    episode_count: number;
    air_date?: string;
  }>;
}

interface TMDBRawVideoResult {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TMDBMovieResult {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string;
}

export interface TMDBPaginatedResponse {
  results: TMDBMovieResult[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
  order: number;
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  runtime?: number;
  vote_average?: number;
  genres?: { id: number; name: string }[];
}

export interface TMDBSeriesDetails {
  id: number;
  name: string;
  first_air_date?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  vote_average?: number;
  genres?: { id: number; name: string }[];
  seasons?: Array<{
    id: number;
    season_number: number;
    name: string;
    poster_path?: string;
    episode_count: number;
    air_date?: string;
    episodes?: Episode[];
  }>;
}

export interface Episode {
  id: number;
  episode_number: number;
  name: string;
  runtime?: number;
  season_number: number;
  still_path?: string;
  air_date?: string;
  overview?: string;
  vote_average?: number;
}

export interface SeasonDetails {
  _id: string;
  air_date: string;
  episodes: Episode[];
  name: string;
  overview: string;
  id: number;
  poster_path: string;
  season_number: number;
}

export interface TMDBActorDetails {
  id: number;
  name: string;
  birthday?: string;
  deathday?: string;
  place_of_birth?: string;
  biography?: string;
  profile_path?: string;
  known_for_department?: string;
  popularity?: number;
}

export interface TMDBActorCredit {
  id: number;
  title?: string; // For movies
  name?: string; // For TV shows
  character: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  vote_average?: number;
  media_type: 'movie' | 'tv';
}

export interface TMDBSearchResult {
  id: number;
  title?: string; // For movies
  name?: string; // For TV shows/people
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  profile_path?: string; // For people
  vote_average?: number;
  media_type: 'movie' | 'tv' | 'person';
  known_for_department?: string; // For people
}

export interface TMDBMultiSearchResponse {
  movies: TMDBSearchResult[];
  series: TMDBSearchResult[];
  persons: TMDBSearchResult[];
}

export interface TMDBReview {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path?: string;
    rating?: number;
  };
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
  movieInfo?: {
    id: number;
    title: string;
    poster_path?: string;
    mediaType: 'movie' | 'tv' | 'person';
  };
}

export interface TMDBReviewsResponse {
  id: number;
  page: number;
  results: TMDBReview[];
  total_pages: number;
  total_results: number;
}

// -------------------------------------------------------------
// TMDB API Key Handling & Runtime Guard
// -------------------------------------------------------------
// Vite üzerinden gelen environment değişkeni. Frontend tarafında tamamen gizlenemez,
// yine de boş / placeholder kalmasını engellemek için runtime kontrol yapıyoruz.
const RAW_TMDB_API_KEY = (import.meta as any)?.env?.VITE_TMDB_API_KEY?.trim?.();
const INVALID_PLACEHOLDERS = new Set([
  '',
  'your_tmdb_api_key_here',
  'your-api-key-here',
  'YOUR_TMDB_KEY_HERE'
]);

const TMDB_API_KEY: string | null = RAW_TMDB_API_KEY && !INVALID_PLACEHOLDERS.has(RAW_TMDB_API_KEY)
  ? RAW_TMDB_API_KEY
  : null;

const API_KEY_ERROR_MESSAGE = 'TMDB API key misconfigured: Lütfen kök dizindeki .env dosyanıza geçerli bir VITE_TMDB_API_KEY değeri ekleyin.';

if (!TMDB_API_KEY) {
  // Development / test ortamında gürültülü log
  if ((import.meta as any)?.env?.MODE !== 'production') {
    console.error('⚠️ ' + API_KEY_ERROR_MESSAGE);
  }
}

const assertTmdbApiKey = () => {
  if (!TMDB_API_KEY) {
    throw new Error(API_KEY_ERROR_MESSAGE);
  }
};
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Network aware API wrapper
const fetchWithNetworkCheck = async (url: string, options?: RequestInit): Promise<Response> => {
  const networkStatus = await NetworkService.checkNetworkForApiCall();
  
  if (!networkStatus.canMakeRequest) {
    throw new Error('No network connection available. Please check your internet connection.');
  }
  
  // Bağlantı tipine göre timeout ayarla
  const quality = NetworkService.getDataQualityRecommendation(networkStatus.networkType);
  const timeout = quality === 'low' ? 15000 : quality === 'medium' ? 10000 : 5000;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Network request timeout (${timeout}ms). Please try again.`);
    }
    throw error;
  }
};

// Genel önbellekleme sistemi - generic tip kullanarak any yerine daraltılmış cache
type CacheValue = TMDBMovieResult[] | TMDBSeriesDetails | TMDBActorDetails | TMDBActorCredit[] | unknown;
const cache = new Map<string, CacheValue>();
const cacheTimestamps = new Map<string, number>();
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 dakika

// Önbelleği temizlemek için yardımcı fonksiyon
export const clearCache = () => {
  cache.clear();
  cacheTimestamps.clear();
  console.log('Cache cleared successfully.');
};

// Sürekli önbellek boyutunu kontrol etmek için yardımcı fonksiyon
export const getCacheStats = () => {
  return {
    cacheSize: cache.size,
    timestampSize: cacheTimestamps.size,
    entries: Array.from(cache.keys())
  };
};

// Simple cache for cast data (mevcut)
const castCache = new Map<number, { data: TMDBCastMember[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const searchMovies = async (query: string): Promise<TMDBMovieResult[]> => {
  try {
  assertTmdbApiKey();
    // Check cache first
    const cacheKey = `search_movies_${query.toLowerCase().trim()}`;
    const cached = cache.get(cacheKey);
    const timestamp = cacheTimestamps.get(cacheKey);
    
    if (cached && timestamp && Date.now() - timestamp < CACHE_DURATION_MS) {
      console.log(`Cache hit for: ${query}`);
      return cached as TMDBMovieResult[];
    }

    const response = await fetchWithNetworkCheck(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to search movies: ${response.status}`);
    }
    
    const data = await response.json();
    const results = (data.results || []).map((movie: TMDBRawMovieResult) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path
    }));

    // Cache the result
    cache.set(cacheKey, results);
    cacheTimestamps.set(cacheKey, Date.now());
    console.log(`Cached search result for: ${query}`);

    return results;
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

export const searchSeries = async (query: string): Promise<TMDBMovieResult[]> => {
  try {
  assertTmdbApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to search series: ${response.status}`);
    }
    
    const data = await response.json();
    return (data.results || []).map((series: TMDBRawSeriesResult) => ({
      id: series.id,
      title: series.name, // TV serileri için name kullanılır
      release_date: series.first_air_date, // TV serileri için first_air_date kullanılır
      poster_path: series.poster_path
    }));
  } catch (error) {
    console.error('Error searching series:', error);
    return [];
  }
};

export const getMovieCast = async (movieId: number): Promise<TMDBCastMember[]> => {
  try {
  assertTmdbApiKey();
    // Validate movieId
    if (!movieId || isNaN(movieId) || movieId <= 0) {
      throw new Error('Invalid movie ID provided');
    }

    // Check cache first
    const cached = castCache.get(movieId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Movie with ID ${movieId} not found`);
      }
      throw new Error(`Failed to fetch cast: ${response.status}`);
    }
    
    const data = await response.json();
    const cast = (data.cast || []).slice(0, 10);
    
    // Cache the result
    castCache.set(movieId, { data: cast, timestamp: Date.now() });
    
    return cast;
  } catch (error) {
    console.error('Error fetching cast:', error);
    throw new Error('Failed to load cast members. Please try again.');
  }
};

export const getPopularMovies = async (): Promise<TMDBMovieResult[]> => {
  try {
  assertTmdbApiKey();
    // 5 sayfa çekerek yaklaşık 100 film elde ediyoruz (20 film/sayfa)
    const pages = [1, 2, 3, 4, 5];
    const allMovies: TMDBMovieResult[] = [];
    
    // Parallel API çağrıları yaparak performansı artırıyoruz
    const promises = pages.map(page => 
      fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`)
    );
    
    const responses = await Promise.all(promises);
    
    // Tüm response'ları kontrol et ve verileri birleştir
    for (const response of responses) {
      if (!response.ok) {
        throw new Error(`Failed to fetch popular movies: ${response.status}`);
      }
      
      const data = await response.json();
      const mappedMovies = (data.results || []).map((movie: TMDBRawMovieResult) => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        poster_path: movie.poster_path
      }));
      
      allMovies.push(...mappedMovies);
    }
    
    return allMovies;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw new Error('Failed to load popular movies. Please try again.');
  }
};

export const getMoviesByGenre = async (genreId: number, page: number = 1): Promise<TMDBPaginatedResponse> => {
  try {
  assertTmdbApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&language=en-US&page=${page}&sort_by=popularity.desc`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch movies by genre: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      results: (data.results || []).map((movie: TMDBRawMovieResult) => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        poster_path: movie.poster_path
      })),
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results
    };
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    throw new Error('Failed to load movies by genre. Please try again.');
  }
};

export const getSeriesByGenre = async (genreId: number, page: number = 1): Promise<TMDBPaginatedResponse> => {
  try {
  assertTmdbApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${genreId}&language=en-US&page=${page}&sort_by=popularity.desc`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch series by genre: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      results: (data.results || []).map((series: TMDBRawSeriesResult) => ({
        id: series.id,
        title: series.name, // TV serileri için name kullanılır
        release_date: series.first_air_date, // TV serileri için first_air_date kullanılır
        poster_path: series.poster_path
      })),
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results
    };
  } catch (error) {
    console.error('Error fetching series by genre:', error);
    throw new Error('Failed to load series by genre. Please try again.');
  }
};

export const getPopularSeries = async (): Promise<TMDBMovieResult[]> => {
  try {
  assertTmdbApiKey();
    // 5 sayfa çekerek yaklaşık 100 dizi elde ediyoruz (20 dizi/sayfa)
    const pages = [1, 2, 3, 4, 5];
    const allSeries: TMDBMovieResult[] = [];
    
    // Parallel API çağrıları yaparak performansı artırıyoruz
    const promises = pages.map(page => 
      fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`)
    );
    
    const responses = await Promise.all(promises);
    
    // Tüm response'ları kontrol et ve verileri birleştir
    for (const response of responses) {
      if (!response.ok) {
        throw new Error(`Failed to fetch popular series: ${response.status}`);
      }
      
      const data = await response.json();
      // TV series results have different structure, map them to our interface
      const mappedSeries = (data.results || []).map((series: TMDBRawSeriesResult) => ({
        id: series.id,
        title: series.name, // TV series use 'name' instead of 'title'
        release_date: series.first_air_date, // TV series use 'first_air_date'
        poster_path: series.poster_path
      }));
      
      allSeries.push(...mappedSeries);
    }
    
    return allSeries;
  } catch (error) {
    console.error('Error fetching popular series:', error);
    throw new Error('Failed to load popular series. Please try again.');
  }
};

export const getMovieDetails = async (movieId: number): Promise<TMDBMovieDetails> => {
  const cacheKey = `movie:${movieId}`;
  const now = Date.now();

  // 1. Önbelleği kontrol et: Veri var mı ve süresi dolmuş mu?
  if (cache.has(cacheKey) && (now - cacheTimestamps.get(cacheKey)!) < CACHE_DURATION_MS) {
    console.log(`CACHE HIT: Returning movie ${movieId} from cache.`);
    return cache.get(cacheKey) as TMDBMovieDetails;
  }

  console.log(`CACHE MISS: Fetching movie ${movieId} from API.`);
  try {
  assertTmdbApiKey();
    // 2. Önbellekte yoksa veya süresi dolmuşsa API'ye git
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch movie details: ${response.status}`);
    }
    
    const data = await response.json();
    const movieDetails = {
      id: data.id,
      title: data.title,
      release_date: data.release_date,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      overview: data.overview,
      runtime: data.runtime,
      vote_average: data.vote_average,
      genres: data.genres || []
    };

    // 3. Gelen veriyi ve şu anki zamanı önbelleğe kaydet
    cache.set(cacheKey, movieDetails);
    cacheTimestamps.set(cacheKey, now);

    return movieDetails;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error);
    throw new Error('Failed to load movie details. Please try again.');
  }
};

export const getMovieTrailerKey = async (movieId: number): Promise<string | null> => {
  try {
  assertTmdbApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch movie videos: ${response.status}`);
    }
    const data = await response.json();
    const trailer = (data.results || []).find((vid: TMDBRawVideoResult) => vid.site === 'YouTube' && vid.type === 'Trailer');
    return trailer ? trailer.key : null;
  } catch (error) {
    console.error('Error fetching movie trailer:', error);
    return null;
  }
};

export const getSimilarMovies = async (movieId: number): Promise<TMDBMovieResult[]> => {
  try {
  assertTmdbApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch similar movies: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    return [];
  }
};

export const getSeriesDetails = async (seriesId: number): Promise<TMDBSeriesDetails> => {
  const cacheKey = `series:${seriesId}`;
  const now = Date.now();

  // 1. Önbelleği kontrol et: Veri var mı ve süresi dolmuş mu?
  if (cache.has(cacheKey) && (now - cacheTimestamps.get(cacheKey)!) < CACHE_DURATION_MS) {
    console.log(`CACHE HIT: Returning series ${seriesId} from cache.`);
    return cache.get(cacheKey) as TMDBSeriesDetails;
  }

  console.log(`CACHE MISS: Fetching series ${seriesId} from API.`);
  try {
  assertTmdbApiKey();
    // 2. Önbellekte yoksa veya süresi dolmuşsa API'ye git
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${seriesId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch series details: ${response.status}`);
    }
    
    const data = await response.json();
    const seriesDetails = {
      id: data.id,
      name: data.name,
      first_air_date: data.first_air_date,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      overview: data.overview,
      number_of_seasons: data.number_of_seasons,
      number_of_episodes: data.number_of_episodes,
      vote_average: data.vote_average,
      genres: data.genres || [],
      seasons: data.seasons || []
    };

    // 3. Gelen veriyi ve şu anki zamanı önbelleğe kaydet
    cache.set(cacheKey, seriesDetails);
    cacheTimestamps.set(cacheKey, now);

    return seriesDetails;
  } catch (error) {
    console.error(`Error fetching series details for ID ${seriesId}:`, error);
    throw new Error('Failed to load series details. Please try again.');
  }
};

export const getSeriesCast = async (seriesId: number): Promise<TMDBCastMember[]> => {
  try {
  assertTmdbApiKey();
    // Check cache first
    const cached = castCache.get(seriesId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${seriesId}/credits?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch series cast: ${response.status}`);
    }
    
    const data = await response.json();
    const cast = (data.cast || []).slice(0, 10);
    
    // Cache the result
    castCache.set(seriesId, { data: cast, timestamp: Date.now() });
    
    return cast;
  } catch (error) {
    console.error('Error fetching series cast:', error);
    throw new Error('Failed to load series cast members. Please try again.');
  }
};

export const getSeriesTrailerKey = async (seriesId: number): Promise<string | null> => {
  try {
  assertTmdbApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${seriesId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch series videos: ${response.status}`);
    }
    const data = await response.json();
    const trailer = (data.results || []).find((vid: any) => vid.site === 'YouTube' && vid.type === 'Trailer');
    return trailer ? trailer.key : null;
  } catch (error) {
    console.error('Error fetching series trailer:', error);
    return null;
  }
};

export const getSimilarSeries = async (seriesId: number): Promise<TMDBMovieResult[]> => {
  try {
  assertTmdbApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${seriesId}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch similar series: ${response.status}`);
    }
    
    const data = await response.json();
    return (data.results || []).map((series: any) => ({
      id: series.id,
      title: series.name,
      release_date: series.first_air_date,
      poster_path: series.poster_path
    }));
  } catch (error) {
    console.error('Error fetching similar series:', error);
    return [];
  }
};

export const getActorDetails = async (actorId: number): Promise<TMDBActorDetails> => {
  const cacheKey = `actor:${actorId}`;
  const now = Date.now();

  // 1. Önbelleği kontrol et: Veri var mı ve süresi dolmuş mu?
  if (cache.has(cacheKey) && (now - cacheTimestamps.get(cacheKey)!) < CACHE_DURATION_MS) {
    console.log(`CACHE HIT: Returning actor ${actorId} from cache.`);
    return cache.get(cacheKey) as TMDBActorDetails;
  }

  console.log(`CACHE MISS: Fetching actor ${actorId} from API.`);
  try {
  assertTmdbApiKey();
    // 2. Önbellekte yoksa veya süresi dolmuşsa API'ye git
    const response = await fetch(
      `${TMDB_BASE_URL}/person/${actorId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch actor details: ${response.status}`);
    }
    
    const data = await response.json();
    const actorDetails = {
      id: data.id,
      name: data.name,
      birthday: data.birthday,
      deathday: data.deathday,
      place_of_birth: data.place_of_birth,
      biography: data.biography,
      profile_path: data.profile_path,
      known_for_department: data.known_for_department,
      popularity: data.popularity
    };

    // 3. Gelen veriyi ve şu anki zamanı önbelleğe kaydet
    cache.set(cacheKey, actorDetails);
    cacheTimestamps.set(cacheKey, now);

    return actorDetails;
  } catch (error) {
    console.error(`Error fetching actor details for ID ${actorId}:`, error);
    throw new Error('Failed to load actor details. Please try again.');
  }
};

export const getActorCredits = async (actorId: number): Promise<TMDBActorCredit[]> => {
  const cacheKey = `actor_credits:${actorId}`;
  const now = Date.now();

  // 1. Önbelleği kontrol et: Veri var mı ve süresi dolmuş mu?
  if (cache.has(cacheKey) && (now - cacheTimestamps.get(cacheKey)!) < CACHE_DURATION_MS) {
    console.log(`CACHE HIT: Returning actor credits ${actorId} from cache.`);
    return cache.get(cacheKey) as TMDBActorCredit[];
  }

  console.log(`CACHE MISS: Fetching actor credits ${actorId} from API.`);
  try {
  assertTmdbApiKey();
    // 2. Önbellekte yoksa veya süresi dolmuşsa API'ye git
    const response = await fetch(
      `${TMDB_BASE_URL}/person/${actorId}/combined_credits?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch actor credits: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Actor credits response:', data); // Debug log
    
    const credits = [...(data.cast || [])].map((credit: any) => {
      console.log('Processing credit:', credit); // Debug individual credit
      return {
        id: credit.id,
        title: credit.title,
        name: credit.name,
        character: credit.character || 'Unknown Character',
        release_date: credit.release_date,
        first_air_date: credit.first_air_date,
        poster_path: credit.poster_path,
        vote_average: credit.vote_average,
        media_type: credit.media_type
      };
    });
    
    console.log('Processed credits:', credits); // Debug log
    
    // Sort by popularity/vote average and release date
    const sortedCredits = credits.sort((a, b) => {
      const aDate = new Date(a.release_date || a.first_air_date || '1900-01-01').getTime();
      const bDate = new Date(b.release_date || b.first_air_date || '1900-01-01').getTime();
      return bDate - aDate; // Most recent first
    });

    // 3. Gelen veriyi ve şu anki zamanı önbelleğe kaydet
    cache.set(cacheKey, sortedCredits);
    cacheTimestamps.set(cacheKey, now);

    return sortedCredits;
  } catch (error) {
    console.error(`Error fetching actor credits for ID ${actorId}:`, error);
    throw new Error('Failed to load actor filmography. Please try again.');
  }
};

export const searchAll = async (query: string): Promise<TMDBMultiSearchResponse> => {
  try {
  assertTmdbApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to search: ${response.status}`);
    }
    
    const data = await response.json();
    const results = data.results || [];
    
    // Sonuçları media_type'a göre ayır
    const movies: TMDBSearchResult[] = [];
    const series: TMDBSearchResult[] = [];
    const persons: TMDBSearchResult[] = [];
    
    results.forEach((item: any) => {
      const searchResult: TMDBSearchResult = {
        id: item.id,
        title: item.title,
        name: item.name,
        release_date: item.release_date,
        first_air_date: item.first_air_date,
        poster_path: item.poster_path,
        profile_path: item.profile_path,
        vote_average: item.vote_average,
        media_type: item.media_type,
        known_for_department: item.known_for_department
      };
      
      if (item.media_type === 'movie') {
        movies.push(searchResult);
      } else if (item.media_type === 'tv') {
        series.push(searchResult);
      } else if (item.media_type === 'person') {
        persons.push(searchResult);
      }
    });
    
    return { movies, series, persons };
  } catch (error) {
    console.error('Error searching:', error);
    throw new Error('Failed to search. Please try again.');
  }
};

export const getSeasonDetails = async (seriesId: number, seasonNumber: number): Promise<SeasonDetails> => {
  try {
  assertTmdbApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${seriesId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch season details: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching details for season ${seasonNumber} of series ID ${seriesId}:`, error);
    throw error;
  }
};

export const getMovieReviews = async (movieId: number, page: number = 1): Promise<TMDBReviewsResponse> => {
  const cacheKey = `movie_reviews:${movieId}:${page}`;
  const now = Date.now();

  // Check cache first
  if (cache.has(cacheKey) && (now - cacheTimestamps.get(cacheKey)!) < CACHE_DURATION_MS) {
    console.log(`CACHE HIT: Returning movie reviews ${movieId} page ${page} from cache.`);
    return cache.get(cacheKey) as TMDBReviewsResponse;
  }

  console.log(`CACHE MISS: Fetching movie reviews ${movieId} page ${page} from API.`);
  try {
  assertTmdbApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/reviews?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch movie reviews: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    cache.set(cacheKey, data);
    cacheTimestamps.set(cacheKey, now);

    return data;
  } catch (error) {
    console.error(`Error fetching movie reviews for ID ${movieId}:`, error);
    throw new Error('Failed to load movie reviews. Please try again.');
  }
};

export const getSeriesReviews = async (seriesId: number, page: number = 1): Promise<TMDBReviewsResponse> => {
  const cacheKey = `series_reviews:${seriesId}:${page}`;
  const now = Date.now();

  // Check cache first
  if (cache.has(cacheKey) && (now - cacheTimestamps.get(cacheKey)!) < CACHE_DURATION_MS) {
    console.log(`CACHE HIT: Returning series reviews ${seriesId} page ${page} from cache.`);
    return cache.get(cacheKey) as TMDBReviewsResponse;
  }

  console.log(`CACHE MISS: Fetching series reviews ${seriesId} page ${page} from API.`);
  try {
  assertTmdbApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${seriesId}/reviews?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch series reviews: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    cache.set(cacheKey, data);
    cacheTimestamps.set(cacheKey, now);

    return data;
  } catch (error) {
    console.error(`Error fetching series reviews for ID ${seriesId}:`, error);
    throw new Error('Failed to load series reviews. Please try again.');
  }
};

export const getPopularMoviesWithReviews = async (): Promise<TMDBMovieResult[]> => {
  try {
  assertTmdbApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch popular movies: ${response.status}`);
    }
    
    const data = await response.json();
    return (data.results || []).map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path
    }));
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw new Error('Failed to load popular movies. Please try again.');
  }
};

export const getPopularSeriesWithReviews = async (): Promise<TMDBMovieResult[]> => {
  try {
  assertTmdbApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch popular series: ${response.status}`);
    }
    
    const data = await response.json();
    return (data.results || []).map((series: any) => ({
      id: series.id,
      title: series.name, // TV serileri için name kullanılır
      release_date: series.first_air_date, // TV serileri için first_air_date kullanılır
      poster_path: series.poster_path
    }));
  } catch (error) {
    console.error('Error fetching popular series:', error);
    throw new Error('Failed to load popular series. Please try again.');
  }
};