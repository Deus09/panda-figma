import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons,
  IonButton,
  IonIcon,
  IonProgressBar
} from '@ionic/react';
import { chevronBack, play, time, checkmark } from 'ionicons/icons';
import LocalStorageService, { MovieLog } from '../services/localStorage';
import { getSeriesDetails, TMDBSeriesDetails } from '../services/tmdb';
import SeasonAccordion from '../components/SeasonAccordion';

interface SeriesDetailPageProps {}

const SeriesDetailPage: React.FC<SeriesDetailPageProps> = () => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const history = useHistory();
  
  // BÖLÜM 2: State definitions
  const [seriesDetails, setSeriesDetails] = useState<TMDBSeriesDetails | null>(null);
  const [watchedEpisodes, setWatchedEpisodes] = useState<MovieLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // BÖLÜM 2: useEffect hook - veri yükleme
  useEffect(() => {
    const loadSeriesData = async () => {
      if (!seriesId) return;
      
      setIsLoading(true);
      try {
        // TMDB API'den dizi detaylarını al
        const details = await getSeriesDetails(parseInt(seriesId));
        setSeriesDetails(details);
        
        // localStorage'dan bu diziye ait izlenmiş bölümleri al
        const allLogs = LocalStorageService.getMovieLogs();
        const seriesEpisodes = allLogs.filter(log => 
          log.seriesId === seriesId && 
          (log.contentType === 'tv' || log.mediaType === 'tv')
        );
        setWatchedEpisodes(seriesEpisodes);
        
      } catch (error) {
        console.error('Error loading series data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSeriesData();
  }, [seriesId]);

  // BÖLÜM 2: İstatistik hesaplama mantığı
  const stats = useMemo(() => {
    if (!seriesDetails) return null;

    const totalEpisodeCount = seriesDetails.number_of_episodes || 0;
    const watchedEpisodeCount = watchedEpisodes.length;
    const progressPercentage = totalEpisodeCount > 0 ? (watchedEpisodeCount / totalEpisodeCount) * 100 : 0;
    
    const totalWatchedMinutes = watchedEpisodes.reduce((total, episode) => {
      return total + (episode.runtime || 45); // Varsayılan 45 dakika
    }, 0);
    
    const totalSeriesMinutes = totalEpisodeCount * 45; // Varsayılan bölüm süresi
    const remainingMinutes = totalSeriesMinutes - totalWatchedMinutes;

    return {
      totalEpisodeCount,
      watchedEpisodeCount,
      progressPercentage,
      totalWatchedMinutes,
      totalSeriesMinutes,
      remainingMinutes
    };
  }, [seriesDetails, watchedEpisodes]);

  if (isLoading) {
    return (
      <IonPage className="bg-background">
        <IonHeader>
          <IonToolbar color="transparent">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
            <IonTitle>Yükleniyor...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <IonProgressBar type="indeterminate" />
              <p className="mt-4 text-muted-foreground">Dizi detayları yükleniyor...</p>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!seriesDetails) {
    return (
      <IonPage className="bg-background">
        <IonHeader>
          <IonToolbar color="transparent">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
            <IonTitle>Hata</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground">Dizi detayları yüklenemedi.</p>
              <IonButton 
                fill="clear" 
                onClick={() => history.goBack()}
                className="mt-4"
              >
                Geri Dön
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className="bg-background">
      {/* BÖLÜM 3: HERO ALANI - Arkaplan bulanık poster */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: seriesDetails.backdrop_path 
            ? `url(https://image.tmdb.org/t/p/w1280${seriesDetails.backdrop_path})`
            : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
          filter: 'blur(15px) brightness(0.6)', // Daha açık ve daha az bulanık
          zIndex: 0
        }}
      />
      
      {/* Overlay katmanı - kontrast için */}
      <div className="fixed inset-0 bg-black/40 z-[1]" />
      
      {/* Ana içerik konteyneri */}
      <div className="relative z-10">
        <IonHeader>
          <IonToolbar color="transparent" className="bg-transparent">
            <IonButtons slot="start">
              <IonBackButton 
                defaultHref="/home" 
                className="text-white"
                icon={chevronBack}
              />
            </IonButtons>
            <IonTitle className="text-white font-semibold">{seriesDetails.name}</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="bg-transparent">
          {/* BÖLÜM 3: HERO ALANI */}
          <div className="flex flex-col md:flex-row items-start gap-6 p-6 pt-4">
            {/* Sol: Dizi Posteri */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 max-w-xs">
              {seriesDetails.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${seriesDetails.poster_path}`}
                  alt={seriesDetails.name}
                  className="w-full aspect-[2/3] rounded-2xl shadow-2xl object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-full aspect-[2/3] rounded-2xl shadow-2xl bg-muted/80 border-2 border-white/20 flex items-center justify-center">
                  <span className="text-white/60 text-sm">Poster Yok</span>
                </div>
              )}
            </div>

            {/* Sağ: Dizi Bilgileri */}
            <div className="flex-1 text-white space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white drop-shadow-lg">
                  {seriesDetails.name}
                </h1>
                
                <div className="flex items-center gap-4 mb-4 text-sm text-white/90">
                  <span className="bg-black/30 px-2 py-1 rounded-lg">
                    {seriesDetails.first_air_date ? new Date(seriesDetails.first_air_date).getFullYear() : 'TBA'}
                  </span>
                  <span className="bg-black/30 px-2 py-1 rounded-lg">
                    {seriesDetails.number_of_seasons || 0} Sezon
                  </span>
                  <span className="bg-black/30 px-2 py-1 rounded-lg">
                    {seriesDetails.number_of_episodes || 0} Bölüm
                  </span>
                </div>
              </div>

              {/* Türler */}
              {seriesDetails.genres && seriesDetails.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {seriesDetails.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1.5 bg-primary/80 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/20"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Özet */}
              {seriesDetails.overview && (
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <p className="text-white/90 leading-relaxed text-sm md:text-base">
                    {seriesDetails.overview}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* BÖLÜM 4: İLERLEME BÖLÜMÜ */}
          {stats && (
            <div className="p-4 bg-card/90 backdrop-blur-sm mx-4 rounded-2xl shadow-xl border border-border/50">
              <h2 className="text-xl font-semibold text-foreground mb-4">İzleme İlerlemen</h2>
              
              {/* Progress Bar */}
              <div className="relative mb-4">
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-500 relative"
                    style={{ width: `${stats.progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
                  </div>
                </div>
                <span className="absolute right-0 -top-6 text-sm font-medium text-foreground">
                  %{stats.progressPercentage.toFixed(0)}
                </span>
              </div>

              {/* İstatistik Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <IonIcon icon={checkmark} className="text-2xl text-primary mb-2" />
                  <div className="text-2xl font-bold text-foreground">{stats.watchedEpisodeCount}</div>
                  <div className="text-xs text-muted-foreground">İzlenen Bölüm</div>
                </div>

                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <IonIcon icon={play} className="text-2xl text-blue-500 mb-2" />
                  <div className="text-2xl font-bold text-foreground">{stats.totalEpisodeCount}</div>
                  <div className="text-xs text-muted-foreground">Toplam Bölüm</div>
                </div>

                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <IonIcon icon={time} className="text-2xl text-green-500 mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    {Math.floor(stats.totalWatchedMinutes / 60)}s
                  </div>
                  <div className="text-xs text-muted-foreground">İzlenen Süre</div>
                </div>

                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <IonIcon icon={time} className="text-2xl text-orange-500 mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    {Math.floor(stats.remainingMinutes / 60)}s
                  </div>
                  <div className="text-xs text-muted-foreground">Kalan Süre</div>
                </div>
              </div>
            </div>
          )}

          {/* BÖLÜM 5: BÖLÜM LİSTESİ */}
          <div className="p-4 mt-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">Sezonlar ve Bölümler</h2>
            <div className="space-y-4">
              {seriesDetails.seasons && seriesDetails.seasons.length > 0 ? (
                seriesDetails.seasons.map((season) => (
                  <SeasonAccordion
                    key={season.id}
                    seasonNumber={season.season_number}
                    episodes={[]} // TODO: TMDB'den sezon detaylarını çek
                    watchedEpisodes={watchedEpisodes}
                    onEpisodeToggle={(episode, isWatched) => {
                      console.log('Episode toggle:', episode.name, isWatched);
                      // TODO: localStorage'a kaydet/kaldır
                    }}
                  />
                ))
              ) : (
                <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
                  <p className="text-center text-muted-foreground">
                    Bu dizi için sezon bilgisi bulunamadı.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Alt boşluk */}
          <div className="h-20" />
        </IonContent>
      </div>
    </IonPage>
  );
};

export default SeriesDetailPage;
