import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { play, checkmark, chevronDown, chevronUp } from 'ionicons/icons';
import { MovieLog } from '../services/localStorage';
import MovieCard from './MovieCard';

interface SeriesGroupCardProps {
  seriesInfo: { id: string; title: string; poster: string; };
  episodes: MovieLog[];
  onClick: () => void;
}

const SeriesGroupCard: React.FC<SeriesGroupCardProps> = ({ seriesInfo, episodes, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const history = useHistory();

  // Güvenlik kontrolü
  if (!seriesInfo || !episodes || episodes.length === 0) {
    return null;
  }

  const watchedCount = episodes.filter(ep => ep.type === 'watched').length;
  const totalCount = episodes.length;

  const handleSeriesClick = () => {
    onClick();
  };

  const handleToggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ana tıklama olayını engelle
    setIsExpanded(prev => !prev);
  };

  return (
    <div 
      className="bg-card rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      onClick={handleSeriesClick}
    >
      <div className="p-4 flex items-center gap-4">
        <div className="w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
          <img
            src={seriesInfo.poster || 'https://placehold.co/96x96?text=No+Image'}
            alt={seriesInfo.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-foreground font-bold truncate text-body">{seriesInfo.title}</h3>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span>{totalCount} bölüm</span>
            <div className="bg-primary px-2 py-1 rounded-full">
              <span className="text-xs font-bold text-primary-foreground">
                {watchedCount}/{totalCount}
              </span>
            </div>
          </div>

          <div className="w-full bg-muted rounded-full h-1.5 mt-2">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${totalCount > 0 ? (watchedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleToggleExpanded}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <IonIcon 
            icon={isExpanded ? chevronUp : chevronDown} 
            className="text-muted-foreground"
          />
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 animate-fadeIn">
          <h4 className="text-foreground font-semibold text-sm px-2 flex items-center gap-2">
            <IonIcon icon={play} className="text-primary" />
            Bölümler ({episodes.length})
          </h4>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {episodes.map((episode: MovieLog) => (
              <div key={episode.id} className="ml-4">
                <MovieCard 
                  title={episode.title}
                  date={episode.date}
                  rating={episode.rating}
                  review={episode.review}
                  poster={episode.poster}
                  onClick={() => {
                    // Episode detail action - şimdilik boş
                    console.log('Episode clicked:', episode.title);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesGroupCard;
