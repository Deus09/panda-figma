export interface TMDBMovieResult {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
  order: number;
}

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'your-api-key-here';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Simple cache for cast data
const castCache = new Map<number, { data: TMDBCastMember[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const searchMovies = async (query: string): Promise<TMDBMovieResult[]> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch movies: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching movies:', error);
    throw new Error('Failed to search movies. Please try again.');
  }
};

export const getMovieCast = async (movieId: number): Promise<TMDBCastMember[]> => {
  try {
    // Check cache first
    const cached = castCache.get(movieId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
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