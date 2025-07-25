const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'TMDB_API_KEY_PLACEHOLDER';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBMovieResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

export async function searchMovies(query: string): Promise<TMDBMovieResult[]> {
  if (!query || query.length < 3) return [];
  const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('TMDB API error');
  const data = await res.json();
  return (data.results || []).map((movie: any) => ({
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
  }));
}