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
import { LocalStorageService, MovieLog } from '../services/localStorage';
import { getSeriesDetails, getSeasonDetails, TMDBSeriesDetails, SeasonDetails, Episode } from '../services/tmdb';
import SeasonAccordion from '../components/SeasonAccordion';
import { debugSpecificSeries } from '../utils/globalSeriesAnalyzer';

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
        // ⚡ YENİ DEBUG KODU - Başlangıçta seriesId'yi analiz et
        console.log('🔍 CURRENT SERIES ID:', seriesId);
        debugSpecificSeries(seriesId);
        
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
        
        // --- YENİ TEŞHİS KODLARI ---
        console.log('URL\'den gelen seriesId:', seriesId, '| Tipi:', typeof seriesId);
        console.log('LocalStorage\'daki ilk kaydın seriesId\'si:', allLogs.length > 0 ? allLogs[0].seriesId : 'Kayıt yok', '| Tipi:', allLogs.length > 0 ? typeof allLogs[0].seriesId : 'Kayıt yok');
        console.log('Tüm Kayıtlar (Filtresiz):', allLogs);
        // --- TEŞHİS KODLARI BİTİŞİ ---

        // ⚡ FLEXIBLE MATCHING - Önce tam eşleşme dene, sonra fallback'leri kullan
        let seriesEpisodes = allLogs.filter(log => 
          log.seriesId && // Önce seriesId'nin var olduğundan emin ol
          String(log.seriesId) === seriesId && 
          (log.contentType === 'tv' || log.mediaType === 'tv')
        );
        
        console.log('🎯 Tam eşleşme sonucu:', seriesEpisodes.length, 'bölüm');
        
        // Eğer tam eşleşme yoksa, title'da series adı geçen kayıtları ara
        if (seriesEpisodes.length === 0 && seriesDetails) {
          console.log('🔄 Fallback arama yapılıyor...');
          seriesEpisodes = allLogs.filter(log => {
            const titleMatch = log.title && 
              log.title.toLowerCase().includes(seriesDetails.name.toLowerCase());
            const isTvContent = log.contentType === 'tv' || log.mediaType === 'tv';
            return titleMatch && isTvContent;
          });
          console.log('🔄 Fallback sonucu:', seriesEpisodes.length, 'bölüm bulundu');
        }
        
        // Eğer hala bulunamadıysa, seriesTitle field'ında ara
        if (seriesEpisodes.length === 0 && seriesDetails) {
          console.log('🔄 SeriesTitle arama yapılıyor...');
          seriesEpisodes = allLogs.filter(log => {
            const seriesTitleMatch = log.seriesTitle && 
              log.seriesTitle.toLowerCase().includes(seriesDetails.name.toLowerCase());
            const isTvContent = log.contentType === 'tv' || log.mediaType === 'tv';
            return seriesTitleMatch && isTvContent;
          });
          console.log('🔄 SeriesTitle sonucu:', seriesEpisodes.length, 'bölüm bulundu');
        }

        // --- YENİ SONUÇ KODU ---
        console.log('✅ Filtreleme Sonucu Bulunan Bölümler:', seriesEpisodes);
        // --- SONUÇ KODU BİTİŞİ ---

        setWatchedLogs(seriesEpisodes);

      } catch (error) {
        console.error("Error loading series data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [seriesId]);

  // 📊 İstatistik hesaplamaları
  const {
    totalEpisodeCount,
    watchedEpisodeCount,
    progressPercentage,
    totalWatchedMinutes,
    totalSeriesMinutes,
    remainingMinutes,
    watchedEpisodeIds,
  } = useMemo(() => {    
    // ❗ ÖNEMLİ: String karşılaştırması yapıyoruz
    const watchedLogsSet = new Set(watchedLogs.map(log => String(log.tmdbId)));
    const allEpisodes = seriesApiData?.seasons.flatMap(s => s.episodes || []) || [];

    const totalEpCount = allEpisodes.length;
    // ❗ ÖNEMLİ FİKS: episode.id'yi de String'e çeviriyoruz
    const watchedEpCount = allEpisodes.filter(ep => watchedLogsSet.has(String(ep.id))).length;
    
    const totalSeriesMins = allEpisodes.reduce((sum, ep) => sum + (ep.runtime || 0), 0);
    const watchedMins = allEpisodes
      .filter(ep => watchedLogsSet.has(String(ep.id)))
      .reduce((sum, ep) => sum + (ep.runtime || 0), 0);

    const result = {
      totalEpisodeCount: totalEpCount,
      watchedEpisodeCount: watchedEpCount,
      progressPercentage: totalEpCount > 0 ? (watchedEpCount / totalEpCount) * 100 : 0,
      totalWatchedMinutes: watchedMins,
      totalSeriesMinutes: totalSeriesMins,
      remainingMinutes: totalSeriesMins - watchedMins,
      // ❗ ÖNEMLİ FİKS: watchedEpisodeIds Set'inde de String kullanıyoruz
      watchedEpisodeIds: new Set(allEpisodes.filter(ep => watchedLogsSet.has(String(ep.id))).map(ep => String(ep.id))),
    };
    
    return result;
  }, [seriesApiData, watchedLogs]);

  const handleEpisodeToggle = (episodeId: number, isWatched: boolean) => {
    console.log(`🎬 Episode toggle: ${episodeId} -> ${isWatched ? 'watched' : 'unwatched'}`);
    
    if (!seriesApiData) return;
    
    // Episode bilgisini TMDB verilerinden bul
    const episode = seriesApiData.seasons
      .flatMap(season => season.episodes || [])
      .find(ep => ep.id === episodeId);
    
    if (!episode) {
      console.error('❌ Episode bulunamadı:', episodeId);
      return;
    }
    
    if (isWatched) {
      // ✅ Bölümü izlendi olarak kaydet
      try {
        const episodeLog = LocalStorageService.saveMovieLog({
          title: `${seriesApiData.name} - S${episode.season_number.toString().padStart(2, '0')}E${episode.episode_number.toString().padStart(2, '0')} - ${episode.name}`,
          date: new Date().toISOString().split('T')[0], // Bugünün tarihi
          rating: '', // İsteğe bağlı
          review: '', // İsteğe bağlı 
          poster: episode.still_path ? `https://image.tmdb.org/t/p/w500${episode.still_path}` : (seriesApiData.poster_path ? `https://image.tmdb.org/t/p/w500${seriesApiData.poster_path}` : ''),
          type: 'watched',
          mediaType: 'tv',
          contentType: 'tv',
          tmdbId: episodeId, // ❗ ÖNEMLİ: Episode ID'sini tmdbId olarak kullan
          seasonCount: seriesApiData.number_of_seasons,
          episodeCount: seriesApiData.number_of_episodes,
          runtime: episode.runtime || 45, // Varsayılan olarak 45 dakika
          seriesId: seriesId, // Dizi ID'si
          seriesTitle: seriesApiData.name,
          seriesPoster: seriesApiData.poster_path ? `https://image.tmdb.org/t/p/w500${seriesApiData.poster_path}` : ''
        });
        
        console.log('✅ Bölüm kaydedildi:', episodeLog.title);
        
        // WatchedLogs state'ini güncelle
        setWatchedLogs(prev => [...prev, episodeLog]);
        
      } catch (error) {
        console.error('❌ Bölüm kaydetme hatası:', error);
      }
    } else {
      // ❌ Bölümü izlenmedi olarak işaretle (localStorage'dan sil)
      const episodeLogToDelete = watchedLogs.find(log => log.tmdbId === episodeId);
      if (episodeLogToDelete) {
        const success = LocalStorageService.deleteMovieLog(episodeLogToDelete.id);
        if (success) {
          console.log('🗑️ Bölüm silindi:', episodeLogToDelete.title);
          
          // WatchedLogs state'ini güncelle
          setWatchedLogs(prev => prev.filter(log => log.id !== episodeLogToDelete.id));
        } else {
          console.error('❌ Bölüm silme hatası');
        }
      }
    }
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
