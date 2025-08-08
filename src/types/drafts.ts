// Draft / transient types used before persisting to LocalStorageService
import type { MovieLog } from '../services/localStorage';

// Minimal draft used when creating logs from UI before enrichment
export interface MovieLogDraft {
  title: string;
  date: string;
  rating: string;
  review: string;
  poster: string;
  type: 'watched' | 'watchlist';
  mediaType: 'movie' | 'tv';
  contentType: 'movie' | 'tv';
  tmdbId?: number;
  seriesId?: string;
  seriesTitle?: string;
  seriesPoster?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeId?: number;
  runtime?: number;
  genres?: string[];
  releaseYear?: number;
}

export function toMovieLog(draft: MovieLogDraft): Omit<MovieLog, 'id' | 'createdAt' | 'updatedAt'> {
  return { ...draft };
}
