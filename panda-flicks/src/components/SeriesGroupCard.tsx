import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { play, checkmark, chevronDown, chevronUp } from 'ionicons/icons';
import { MovieLog } from '../services/localStorage';
import MovieCard from './MovieCard';

interface SeriesGroupCardProps {
  seriesInfo: { id: string; title: string; poster: string; };
  episodes: MovieLog[];
}

const SeriesGroupCard: React.FC<SeriesGroupCardProps> = ({ seriesInfo, episodes }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const history = useHistory();

  // Güvenlik kontrolü
  if (!seriesInfo || !episodes || episodes.length === 0) {
    return null;
  }

  const watchedCount = episodes.filter(ep => ep.type === 'watched').length;
  const totalCount = episodes.length;

  const handleSeriesClick = () => {
    // TODO: Dizi detay sayfası modal olarak açılacak.
    console.log("Diziye tıklandı:", seriesInfo.title);
  };

  const handleToggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ana tıklama olayını engelle
    setIsExpanded(prev => !prev);
  };

  return (
    <div className="w-full">
      {/* Ana Kart - MovieCard ile Tutarlı Tasarım */}
      <div 
        className="w-full max-w-sm flex items-center p-2 rounded-2xl bg-card border border-border gap-4 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={handleSeriesClick}
      >
        {/* Poster Area - MovieCard ile Aynı Boyut */}
        <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
          <img
            src={seriesInfo.poster || 'https://placehold.co/96x96?text=No+Image'}
            alt={seriesInfo.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text Content Area */}
        <div className="flex-1 min-w-0">
          {/* Dizi Adı */}
          <h3 className="text-foreground font-bold truncate text-body">{seriesInfo.title}</h3>
          
          {/* Bölüm Bilgisi ve Progress */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span>{totalCount} bölüm</span>
            <div className="bg-primary px-2 py-1 rounded-full">
              <span className="text-xs font-bold text-primary-foreground">
                {watchedCount}/{totalCount}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-1.5 mt-2">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${totalCount > 0 ? (watchedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Expand/Collapse Button */}
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

      {/* Genişletilmiş Bölüm Listesi */}
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
