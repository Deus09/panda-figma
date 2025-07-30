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
                {/* İzlenen Bölüm */}
                <div className="group bg-gradient-to-br from-card/90 via-card/80 to-card/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white group-hover:text-primary transition-colors duration-300">{seriesStats.watchedCount}</div>
                  <div className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">İzlenen Bölüm</div>
                </div>
                
                {/* İlerleme */}
                <div className="group bg-gradient-to-br from-card/90 via-card/80 to-card/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-orange-400/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-400/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <div className="w-6 h-6 bg-orange-400/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors duration-300">{Math.round(seriesStats.progressPercentage)}%</div>
                  <div className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">İlerleme</div>
                </div>
                
                {/* Toplam Bölüm */}
                <div className="group bg-gradient-to-br from-card/90 via-card/80 to-card/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-400/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-6 h-6 bg-blue-400/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">{seriesStats.totalEpisodes}</div>
                  <div className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">Toplam Bölüm</div>
                </div>
                
                {/* Ortalama Puan */}
                <div className="group bg-gradient-to-br from-card/90 via-card/80 to-card/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-yellow-400/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <div className="w-6 h-6 bg-yellow-400/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">{seriesStats.avgRating.toFixed(1)}</div>
                  <div className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">Ortalama Puan</div>
                </div>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="mb-6">
                <div className="relative">
                  <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden backdrop-blur-sm shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-primary via-orange-400 to-yellow-400 rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${seriesStats.progressPercentage}%` }}
                    >
                      {/* Animated shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                      {/* Moving light effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-bounce"></div>
                    </div>
                  </div>
                  
                  {/* Progress indicator dot */}
                  <div 
                    className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-1000 ease-out border-2 border-primary/30"
                    style={{ left: `${seriesStats.progressPercentage}%` }}
                  >
                    <div className="w-2 h-2 bg-primary rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Progress text */}
                <div className="text-center mt-3">
                  <span className="text-white/60 text-xs">{seriesStats.watchedCount} / {seriesStats.totalEpisodes} bölüm izlendi</span>
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
                      watchedEpisodes={watchedEpisodes}
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
