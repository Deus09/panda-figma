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

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'your-api-key-here';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Simple cache for cast data
const castCache = new Map<number, { data: TMDBCastMember[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const searchMovies = async (query: string): Promise<TMDBMovieResult[]> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to search movies: ${response.status}`);
    }
    
    const data = await response.json();
    return (data.results || []).map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path
    }));
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
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

export const getPopularMovies = async (): Promise<TMDBMovieResult[]> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch popular movies: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw new Error('Failed to load popular movies. Please try again.');
  }
};

export const getPopularSeries = async (): Promise<TMDBMovieResult[]> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch popular series: ${response.status}`);
    }
    
    const data = await response.json();
    // TV series results have different structure, map them to our interface
    return (data.results || []).map((series: any) => ({
      id: series.id,
      title: series.name, // TV series use 'name' instead of 'title'
      release_date: series.first_air_date, // TV series use 'first_air_date'
      poster_path: series.poster_path
    }));
  } catch (error) {
    console.error('Error fetching popular series:', error);
    throw new Error('Failed to load popular series. Please try again.');
  }
};

export const getMovieDetails = async (movieId: number): Promise<TMDBMovieDetails> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch movie details: ${response.status}`);
    }
    
    const data = await response.json();
    return {
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
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw new Error('Failed to load movie details. Please try again.');
  }
};

export const getMovieTrailerKey = async (movieId: number): Promise<string | null> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch movie videos: ${response.status}`);
    }
    const data = await response.json();
    const trailer = (data.results || []).find((vid: any) => vid.site === 'YouTube' && vid.type === 'Trailer');
    return trailer ? trailer.key : null;
  } catch (error) {
    console.error('Error fetching movie trailer:', error);
    return null;
  }
};

export const getSimilarMovies = async (movieId: number): Promise<TMDBMovieResult[]> => {
  try {
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
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${seriesId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch series details: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      first_air_date: data.first_air_date,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      overview: data.overview,
      number_of_seasons: data.number_of_seasons,
      number_of_episodes: data.number_of_episodes,
      vote_average: data.vote_average,
      genres: data.genres || []
    };
  } catch (error) {
    console.error('Error fetching series details:', error);
    throw new Error('Failed to load series details. Please try again.');
  }
};

export const getSeriesCast = async (seriesId: number): Promise<TMDBCastMember[]> => {
  try {
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
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/person/${actorId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch actor details: ${response.status}`);
    }
    
    const data = await response.json();
    return {
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
  } catch (error) {
    console.error('Error fetching actor details:', error);
    throw new Error('Failed to load actor details. Please try again.');
  }
};

export const getActorCredits = async (actorId: number): Promise<TMDBActorCredit[]> => {
  try {
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
    return credits.sort((a, b) => {
      const aDate = new Date(a.release_date || a.first_air_date || '1900-01-01').getTime();
      const bDate = new Date(b.release_date || b.first_air_date || '1900-01-01').getTime();
      return bDate - aDate; // Most recent first
    });
  } catch (error) {
    console.error('Error fetching actor credits:', error);
    throw new Error('Failed to load actor filmography. Please try again.');
  }
};