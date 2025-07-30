import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons,
  IonProgressBar,
  IonIcon,
} from '@ionic/react';
import { checkmark, play, time, chevronBack } from 'ionicons/icons';
import LocalStorageService, { MovieLog } from '../services/localStorage';
import { getSeriesDetails, getSeasonDetails, TMDBSeriesDetails, SeasonDetails, Episode } from '../services/tmdb';
import SeasonAccordion from '../components/SeasonAccordion';

const SeriesDetailPage: React.FC = () => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const [seriesApiData, setSeriesApiData] = useState<TMDBSeriesDetails & { seasons: SeasonDetails[] } | null>(null);
  const [watchedLogs, setWatchedLogs] = useState<MovieLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!seriesId) return;
      setIsLoading(true);
      try {
        const seriesDetails = await getSeriesDetails(parseInt(seriesId));
        
        const seasonsWithEpisodes = await Promise.all(
          (seriesDetails.seasons || []).map(async season => {
            const seasonDetails = await getSeasonDetails(parseInt(seriesId), season.season_number);
            return {
              ...seasonDetails,
              episode_count: season.episode_count, // Ensure episode_count is present
            };
          })
        );

        setSeriesApiData({ ...seriesDetails, seasons: seasonsWithEpisodes });

        const allLogs = LocalStorageService.getMovieLogs();
        setWatchedLogs(allLogs.filter(log => String(log.seriesId) === seriesId));

      } catch (error) {
        console.error("Error loading series data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [seriesId]);

  const {
    totalEpisodeCount,
    watchedEpisodeCount,
    progressPercentage,
    totalWatchedMinutes,
    totalSeriesMinutes,
    remainingMinutes,
    watchedEpisodeIds,
  } = useMemo(() => {
    const watchedLogsSet = new Set(watchedLogs.map(log => log.tmdbId));
    const allEpisodes = seriesApiData?.seasons.flatMap(s => s.episodes || []) || [];

    const totalEpCount = allEpisodes.length;
    const watchedEpCount = allEpisodes.filter(ep => watchedLogsSet.has(ep.id)).length;
    
    const totalSeriesMins = allEpisodes.reduce((sum, ep) => sum + (ep.runtime || 0), 0);
    const watchedMins = allEpisodes
      .filter(ep => watchedLogsSet.has(ep.id))
      .reduce((sum, ep) => sum + (ep.runtime || 0), 0);

    return {
      totalEpisodeCount: totalEpCount,
      watchedEpisodeCount: watchedEpCount,
      progressPercentage: totalEpCount > 0 ? (watchedEpCount / totalEpCount) * 100 : 0,
      totalWatchedMinutes: watchedMins,
      totalSeriesMinutes: totalSeriesMins,
      remainingMinutes: totalSeriesMins - watchedMins,
      watchedEpisodeIds: new Set(allEpisodes.filter(ep => watchedLogsSet.has(ep.id)).map(ep => ep.id)),
    };
  }, [seriesApiData, watchedLogs]);

  const handleEpisodeToggle = (episodeId: number, isWatched: boolean) => {
    // Bu fonksiyonu daha sonra dolduracağız
    console.log(`Episode ${episodeId} is now ${isWatched ? 'watched' : 'unwatched'}`);
  };

  if (isLoading) {
    return <IonPage><IonContent className="ion-padding">Yükleniyor...</IonContent></IonPage>;
  }

  if (!seriesApiData) {
    return <IonPage><IonContent className="ion-padding">Veri bulunamadı.</IonContent></IonPage>;
  }

  return (
    <IonPage>
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/w1280${seriesApiData.backdrop_path})`,
          filter: 'blur(16px) brightness(0.4)',
          transform: 'scale(1.1)',
          zIndex: -1,
        }}
      />
      <IonHeader className="ion-no-border">
        <IonToolbar color="transparent">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" icon={chevronBack} className="text-white" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="bg-transparent">
        <div className="p-4 flex items-center gap-4">
          <img
            src={`https://image.tmdb.org/t/p/w500${seriesApiData.poster_path}`}
            alt={seriesApiData.name}
            className="w-1/3 max-w-[180px] rounded-lg shadow-lg"
          />
          <div className="text-white">
            <h1 className="text-2xl font-bold">{seriesApiData.name}</h1>
            <p className="text-sm opacity-80">
              {new Date(seriesApiData.first_air_date).getFullYear()}
              {' · '}
              {seriesApiData.genres.map(g => g.name).join(', ')}
            </p>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-white">İlerleme</h2>
                <span className="text-sm font-medium text-white/80">%{progressPercentage.toFixed(0)}</span>
            </div>
            <IonProgressBar value={progressPercentage / 100}></IonProgressBar>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <IonIcon icon={checkmark} className="text-primary" />
                <p className="text-white font-bold">{watchedEpisodeCount}</p>
                <p className="text-xs text-white/70">İzlenen Bölümler</p>
              </div>
              <div className="text-center">
                <IonIcon icon={play} className="text-white/80" />
                <p className="text-white font-bold">{totalEpisodeCount}</p>
                <p className="text-xs text-white/70">Toplam Bölümler</p>
              </div>
              <div className="text-center">
                <IonIcon icon={time} className="text-primary" />
                <p className="text-white font-bold">{Math.floor(totalWatchedMinutes / 60)}s</p>
                <p className="text-xs text-white/70">İzlenen Süre</p>
              </div>
              <div className="text-center">
                <IonIcon icon={time} className="text-white/80" />
                <p className="text-white font-bold">{Math.floor(remainingMinutes / 60)}s</p>
                <p className="text-xs text-white/70">Kalan Süre</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
            {seriesApiData.seasons.map(season => (
                <SeasonAccordion
                    key={season.id}
                    seasonNumber={season.season_number}
                    episodes={season.episodes || []}
                    watchedEpisodeIds={watchedEpisodeIds}
                    onEpisodeToggle={handleEpisodeToggle}
                />
            ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SeriesDetailPage;
