import React, { useState, useEffect } from 'react';
import { 
  IonModal, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton,
  IonIcon,
  IonBackButton,
  IonButtons
} from '@ionic/react';
import { close, star, calendar, chatbubbles, play } from 'ionicons/icons';
import { LocalStorageService, MovieLog } from '../services/localStorage';
import { getSeriesDetails, getSeasonDetails, TMDBSeriesDetails, SeasonDetails } from '../services/tmdb';
import SeasonAccordion from './SeasonAccordion';

interface DetailViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  itemType: 'movie' | 'tv' | null;
}

const DetailViewModal: React.FC<DetailViewModalProps> = ({ 
  isOpen, 
  onClose, 
  itemId, 
  itemType 
}) => {
  // State for different content types
  const [logDetails, setLogDetails] = useState<MovieLog | null>(null);
  const [seriesApiData, setSeriesApiData] = useState<TMDBSeriesDetails & { seasons: SeasonDetails[] } | null>(null);
  const [watchedEpisodes, setWatchedEpisodes] = useState<MovieLog[]>([]);
  const [seriesStats, setSeriesStats] = useState<{
    totalEpisodes: number;
    watchedCount: number;
    progressPercentage: number;
    avgRating: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !itemId || !itemType) return;
      
      setIsLoading(true);
      try {
        if (itemType === 'movie') {
          // 🎬 MOVIE DATA FETCHING
          const allLogs = LocalStorageService.getMovieLogs();
          const movieLog = allLogs.find(log => log.id === itemId);
          setLogDetails(movieLog || null);
          
        } else if (itemType === 'tv') {
          // 📺 TV SERIES DATA FETCHING - Step 1: Get watched episodes from localStorage
          const allLogs = LocalStorageService.getMovieLogs();
          const episodes = allLogs.filter(log => 
            log.seriesId === itemId && 
            (log.contentType === 'tv' || log.mediaType === 'tv')
          );
          setWatchedEpisodes(episodes);
          
          // 📺 TV SERIES DATA FETCHING - Step 2: Get all season/episode info from API
          if (episodes.length > 0) {
            const seriesId = parseInt(itemId);
            const seriesDetails = await getSeriesDetails(seriesId);
            
            const seasonsWithEpisodes = await Promise.all(
              (seriesDetails.seasons || []).map(async season => {
                const seasonDetails = await getSeasonDetails(seriesId, season.season_number);
                return {
                  ...seasonDetails,
                  episode_count: season.episode_count,
                };
              })
            );

            setSeriesApiData({ ...seriesDetails, seasons: seasonsWithEpisodes });
            
            // 📊 STATISTICS CALCULATION for TV Series
            const allEpisodes = seasonsWithEpisodes.flatMap(season => season.episodes || []);
            const watchedCount = episodes.length;
            const totalCount = allEpisodes.length;
            const progressPercentage = totalCount > 0 ? (watchedCount / totalCount) * 100 : 0;
            
            // Calculate average rating
            const ratingsWithValues = episodes
              .map(ep => parseFloat(ep.rating))
              .filter(rating => !isNaN(rating) && rating > 0);
            const avgRating = ratingsWithValues.length > 0 
              ? ratingsWithValues.reduce((sum, rating) => sum + rating, 0) / ratingsWithValues.length 
              : 0;
            
            setSeriesStats({
              totalEpisodes: totalCount,
              watchedCount,
              progressPercentage,
              avgRating
            });
          }
        }
      } catch (error) {
        console.error('Error fetching modal data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, itemId, itemType]);

  // Reset data when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLogDetails(null);
      setSeriesApiData(null);
      setWatchedEpisodes([]);
      setSeriesStats(null);
    }
  }, [isOpen]);

  // Episode toggle handler for series
  const handleEpisodeToggle = (episodeId: number, isWatched: boolean) => {
    // Implementation for episode toggle (similar to SeriesDetailPage)
    console.log(`Episode ${episodeId} toggled: ${isWatched}`);
    // TODO: Add real toggle logic here
  };

  if (isLoading) {
    return (
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Yükleniyor...</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={onClose}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="bg-background">
          <div className="flex items-center justify-center h-full">
            <div className="text-foreground">Yükleniyor...</div>
          </div>
        </IonContent>
      </IonModal>
    );
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonContent className="bg-background">
        {/* MOVIE VIEW */}
        {itemType === 'movie' && logDetails && (
          <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
            {/* Header with close button */}
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4">
              <div></div>
              <IonButton fill="clear" color="light" onClick={onClose}>
                <IonIcon icon={close} size="large" />
              </IonButton>
            </div>
            
            {/* Movie Hero Section */}
            <div className="relative">
              <img 
                src={logDetails.poster} 
                alt={logDetails.title}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-3xl font-bold text-white mb-2">{logDetails.title}</h1>
                <div className="flex items-center gap-4 text-white/80">
                  <span className="flex items-center gap-1">
                    <IonIcon icon={calendar} />
                    {logDetails.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <IonIcon icon={star} />
                    {logDetails.rating}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Movie Details */}
            <div className="p-6 space-y-6">
              {logDetails.review && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Yorumum</h3>
                  <p className="text-white/80 leading-relaxed">{logDetails.review}</p>
                </div>
              )}
              
              {/* Chat with Cast Button */}
              <IonButton 
                expand="block" 
                size="large"
                className="mt-6"
              >
                <IonIcon icon={chatbubbles} slot="start" />
                Oyuncularla Chat
              </IonButton>
            </div>
          </div>
        )}

        {/* TV SERIES VIEW */}
        {itemType === 'tv' && seriesApiData && seriesStats && (
          <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
            {/* Header with close button */}
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4">
              <div></div>
              <IonButton fill="clear" color="light" onClick={onClose}>
                <IonIcon icon={close} size="large" />
              </IonButton>
            </div>
            
            {/* Series Hero Section */}
            <div className="relative">
              <img 
                src={seriesApiData.poster_path ? `https://image.tmdb.org/t/p/w500${seriesApiData.poster_path}` : '/placeholder-poster.jpg'} 
                alt={seriesApiData.name}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-3xl font-bold text-white mb-2">{seriesApiData.name}</h1>
                <div className="flex items-center gap-4 text-white/80">
                  <span>{seriesApiData.number_of_seasons} sezon</span>
                  <span>{seriesStats.totalEpisodes} bölüm</span>
                </div>
              </div>
            </div>
            
            {/* Progress Dashboard */}
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl font-bold text-white">{seriesStats.watchedCount}</div>
                  <div className="text-sm text-white/70">İzlenen Bölüm</div>
                </div>
                <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl font-bold text-white">{Math.round(seriesStats.progressPercentage)}%</div>
                  <div className="text-sm text-white/70">İlerleme</div>
                </div>
                <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl font-bold text-white">{seriesStats.totalEpisodes}</div>
                  <div className="text-sm text-white/70">Toplam Bölüm</div>
                </div>
                <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl font-bold text-white">{seriesStats.avgRating.toFixed(1)}</div>
                  <div className="text-sm text-white/70">Ortalama Puan</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${seriesStats.progressPercentage}%` }}
                  />
                </div>
              </div>
              
              {/* Seasons Accordion */}
              <div className="space-y-4">
                {seriesApiData.seasons.map(season => {
                  const watchedEpisodeIds = new Set(
                    watchedEpisodes.map(ep => String(ep.tmdbId))
                  );
                  
                  return (
                    <SeasonAccordion
                      key={season.id}
                      seasonNumber={season.season_number}
                      episodes={season.episodes || []}
                      watchedEpisodeIds={watchedEpisodeIds}
                      onEpisodeToggle={handleEpisodeToggle}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

export default DetailViewModal;
