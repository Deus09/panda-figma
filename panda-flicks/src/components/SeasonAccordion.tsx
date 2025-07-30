import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronDown, chevronUp, checkmark } from 'ionicons/icons';
import { Episode } from '../services/tmdb';

interface SeasonAccordionProps {
  seasonNumber: number;
  episodes: Episode[];
  watchedEpisodeIds: Set<string>; // String ID'ler kullanıyoruz
  onEpisodeToggle: (episodeId: number, isWatched: boolean) => void;
}

const SeasonAccordion: React.FC<SeasonAccordionProps> = ({ seasonNumber, episodes, watchedEpisodeIds, onEpisodeToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  const watchedCount = episodes.filter(ep => watchedEpisodeIds.has(String(ep.id))).length;
  const totalCount = episodes.length;
  const isSeasonCompleted = watchedCount === totalCount;

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 mb-4">
      <button
        className="w-full p-4 flex justify-between items-center text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h3 className="font-semibold text-lg text-white">Sezon {seasonNumber}</h3>
          <span className="text-sm text-white/70">{watchedCount} / {totalCount} bölüm izlendi</span>
        </div>
        <div className="flex items-center gap-2">
            {isSeasonCompleted && <IonIcon icon={checkmark} color="primary" className="text-2xl" />}
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
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                    isWatched ? 'bg-black/30 opacity-60' : 'bg-black/20 hover:bg-black/40'
                  }`}
                  onClick={() => onEpisodeToggle(episode.id, !isWatched)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white/80 font-mono text-sm w-6 text-center">{episode.episode_number}</span>
                    <span className="text-white font-medium">{episode.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {episode.runtime && <span className="text-xs text-white/60">{episode.runtime} dk</span>}
                    {isWatched && <IonIcon icon={checkmark} color="primary" />}
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
