import React, { useState, useMemo } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronDown, chevronUp, checkmark } from 'ionicons/icons';
import { Episode } from '../services/tmdb';
import { MovieLog } from '../services/localStorage';

interface SeasonAccordionProps {
  seasonNumber: number;
  episodes: Episode[];
  watchedEpisodeIds: Set<string>; // String ID'ler kullanıyoruz
  watchedEpisodes: MovieLog[]; // Yeni prop eklendi
  onEpisodeToggle: (episodeId: number, isWatched: boolean) => void;
}

const SeasonAccordion: React.FC<SeasonAccordionProps> = ({ 
  seasonNumber, 
  episodes, 
  watchedEpisodeIds, 
  watchedEpisodes, 
  onEpisodeToggle 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // 🎯 Görev 2.3: İzlenen bölüm sayısını hesaplama (En Kritik Adım)
  const watchedCountForThisSeason = useMemo(() => {
    if (!episodes || !watchedEpisodes) return 0;
    const watchedIds = new Set(watchedEpisodes.map(log => String(log.tmdbId)));
    const result = episodes.filter(ep => watchedIds.has(String(ep.id))).length;
    
    return result;
  }, [episodes, watchedEpisodes, seasonNumber]);

  const totalCount = episodes.length;
  const isSeasonCompleted = watchedCountForThisSeason === totalCount;

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 mb-4">
      <button
        className={`w-full p-4 flex justify-between items-center text-left transition-all duration-300 ${
          isSeasonCompleted ? 'bg-primary/5 border-b border-primary/20' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h3 className={`font-semibold text-lg ${
            isSeasonCompleted ? 'text-primary' : 'text-white'
          }`}>
            Sezon {seasonNumber}
          </h3>
          <span className={`text-sm ${
            isSeasonCompleted ? 'text-primary/70' : 'text-white/70'
          }`}>
            {watchedCountForThisSeason} / {totalCount} bölüm izlendi
            {isSeasonCompleted && ' ✨ Tamamlandı!'}
          </span>
        </div>
        <div className="flex items-center gap-2">
            {isSeasonCompleted && (
              <div className="flex items-center gap-1 bg-primary/20 px-2 py-1 rounded-full">
                <IonIcon icon={checkmark} className="text-primary text-xl" />
                <span className="text-primary text-xs font-medium">Tamamlandı</span>
              </div>
            )}
            <IonIcon icon={isOpen ? chevronUp : chevronDown} className="text-2xl text-white/80" />
        </div>
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <ul className="space-y-2">
            {episodes.map(episode => {
              const isWatched = watchedEpisodeIds.has(String(episode.id));
              return (
                <li
                  key={episode.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 cursor-pointer border ${
                    isWatched 
                      ? 'bg-primary/10 border-primary/30 opacity-75 transform scale-[0.98]' 
                      : 'bg-black/20 hover:bg-black/40 border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => onEpisodeToggle(episode.id, !isWatched)}
                >
                  <div className="flex items-center gap-3">
                    {isWatched && (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 border border-primary/40">
                        <IonIcon icon={checkmark} className="text-primary text-sm" />
                      </div>
                    )}
                    <span className={`font-mono text-sm w-6 text-center ${
                      isWatched ? 'text-primary/80' : 'text-white/80'
                    }`}>
                      {episode.episode_number}
                    </span>
                    <span className={`font-medium ${
                      isWatched ? 'text-primary/90 line-through decoration-primary/40' : 'text-white'
                    }`}>
                      {episode.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {episode.runtime && (
                      <span className={`text-xs ${
                        isWatched ? 'text-primary/60' : 'text-white/60'
                      }`}>
                        {episode.runtime} dk
                      </span>
                    )}
                    {isWatched && (
                      <div className="flex items-center gap-1 text-primary">
                        <IonIcon icon={checkmark} className="text-lg" />
                        <span className="text-xs font-medium">İzlendi</span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SeasonAccordion;
