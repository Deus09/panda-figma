import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronDown, chevronUp, checkmark, time } from 'ionicons/icons';
import { MovieLog } from '../services/localStorage';

interface Episode {
  id: number;
  name: string;
  episode_number: number;
  overview?: string;
  still_path?: string;
  runtime?: number;
  air_date?: string;
}

interface SeasonAccordionProps {
  seasonNumber: number;
  episodes: Episode[];
  watchedEpisodes: MovieLog[]; // İzlenmiş bölümler
  onEpisodeToggle?: (episode: Episode, isWatched: boolean) => void;
}

const SeasonAccordion: React.FC<SeasonAccordionProps> = ({ 
  seasonNumber, 
  episodes, 
  watchedEpisodes,
  onEpisodeToggle 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isEpisodeWatched = (episodeId: number): boolean => {
    return watchedEpisodes.some(log => log.tmdbId === episodeId);
  };

  const watchedCount = episodes.filter(ep => isEpisodeWatched(ep.id)).length;
  const totalCount = episodes.length;
  const progressPercentage = totalCount > 0 ? (watchedCount / totalCount) * 100 : 0;

  return (
    <div className="w-full bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden">
      {/* Sezon Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="text-left">
            <h3 className="text-lg font-semibold text-foreground">
              Sezon {seasonNumber}
            </h3>
            <p className="text-sm text-muted-foreground">
              {watchedCount}/{totalCount} bölüm izlendi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress Ring */}
          <div className="relative w-12 h-12">
            <svg
              className="w-12 h-12 transform -rotate-90"
              viewBox="0 0 48 48"
            >
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPercentage / 100)}`}
                className="text-primary transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-foreground">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>

          {/* Expand Icon */}
          <IonIcon 
            icon={isExpanded ? chevronUp : chevronDown}
            className="text-xl text-muted-foreground"
          />
        </div>
      </button>

      {/* Episodes List */}
      {isExpanded && (
        <div className="border-t border-border/30">
          <div className="max-h-96 overflow-y-auto">
            {episodes.map((episode) => {
              const isWatched = isEpisodeWatched(episode.id);
              
              return (
                <div
                  key={episode.id}
                  className={`flex items-center gap-4 p-4 border-b border-border/20 last:border-b-0 hover:bg-muted/10 transition-colors ${
                    isWatched ? 'bg-primary/5' : ''
                  }`}
                >
                  {/* Episode Image */}
                  <div className="w-16 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={
                        episode.still_path
                          ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
                          : 'https://placehold.co/160x90?text=No+Image'
                      }
                      alt={episode.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Episode Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        E{episode.episode_number}
                      </span>
                      <h4 className="font-semibold text-foreground truncate">
                        {episode.name}
                      </h4>
                    </div>
                    
                    {episode.overview && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {episode.overview}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {episode.runtime && (
                        <div className="flex items-center gap-1">
                          <IonIcon icon={time} />
                          <span>{episode.runtime}dk</span>
                        </div>
                      )}
                      {episode.air_date && (
                        <span>{new Date(episode.air_date).toLocaleDateString('tr-TR')}</span>
                      )}
                    </div>
                  </div>

                  {/* Watch Status */}
                  <button
                    onClick={() => onEpisodeToggle?.(episode, !isWatched)}
                    className={`p-2 rounded-full transition-colors ${
                      isWatched
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted-foreground/10'
                    }`}
                  >
                    <IonIcon 
                      icon={checkmark} 
                      className={`text-lg ${isWatched ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonAccordion;
