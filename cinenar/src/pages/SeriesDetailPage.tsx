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
import AddButtonModal from '../components/AddButtonModal';

const SeriesDetailPage: React.FC = () => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const [seriesApiData, setSeriesApiData] = useState<TMDBSeriesDetails & { seasons: SeasonDetails[] } | null>(null);
  const [watchedLogs, setWatchedLogs] = useState<MovieLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // İzleme durumu state'i
  const [logStatus, setLogStatus] = useState<'watched' | 'watchlist' | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastTimeout, setToastTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Film ekleme modalı state'i
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);

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
        
        // 🔍 KRİTİK HATA ARAŞTIRMASI
        console.log('=== MAHSUN J HATA ANALİZİ ===');
        console.log('URL seriesId:', seriesId, typeof seriesId);
        console.log('Series details:', seriesDetails.name, 'ID:', seriesDetails.id);
        
        const tvLogs = allLogs.filter(log => log.mediaType === 'tv' || log.contentType === 'tv');
        console.log('TV logs toplam:', tvLogs.length);
        
        // Mahsun J ile ilgili tüm kayıtları bul
        const mahsunLogs = allLogs.filter(log => 
          log.title && log.title.toLowerCase().includes('mahsun')
        );
        console.log('Mahsun kayıtları:', mahsunLogs.map(log => ({
          title: log.title,
          tmdbId: log.tmdbId,
          seriesId: log.seriesId,
          mediaType: log.mediaType
        })));

        // Sezon bölümlerinin ID'lerini logla
        const allEpisodes = seasonsWithEpisodes.flatMap(s => s.episodes || []);
        console.log('Tüm bölüm ID\'leri:', allEpisodes.map(ep => ep.id));

        // FLEXIBLE MATCHING - Ana filtre
        let seriesEpisodes = allLogs.filter(log => 
          log.seriesId && 
          String(log.seriesId) === seriesId && 
          (log.contentType === 'tv' || log.mediaType === 'tv')
        );
        
        console.log('SeriesId match sonucu:', seriesEpisodes.length);
        
        // Fallback 1: Title match
        if (seriesEpisodes.length === 0 && seriesDetails) {
          seriesEpisodes = allLogs.filter(log => {
            const titleMatch = log.title && 
              log.title.toLowerCase().includes(seriesDetails.name.toLowerCase());
            const isTvContent = log.contentType === 'tv' || log.mediaType === 'tv';
            return titleMatch && isTvContent;
          });
          console.log('Title match sonucu:', seriesEpisodes.length);
        }
        
        // Fallback 2: SeriesTitle match
        if (seriesEpisodes.length === 0 && seriesDetails) {
          seriesEpisodes = allLogs.filter(log => {
            const seriesTitleMatch = log.seriesTitle && 
              log.seriesTitle.toLowerCase().includes(seriesDetails.name.toLowerCase());
            const isTvContent = log.contentType === 'tv' || log.mediaType === 'tv';
            return seriesTitleMatch && isTvContent;
          });
          console.log('SeriesTitle match sonucu:', seriesEpisodes.length);
        }

        console.log('FINAL bulunan bölümler:', seriesEpisodes.map(ep => ({
          title: ep.title,
          tmdbId: ep.tmdbId,
          seriesId: ep.seriesId
        })));
        console.log('=== ANALİZ BİTİŞ ===');

        setWatchedLogs(seriesEpisodes);

        // Dizi izleme durumunu kontrol et
        if (seriesId) {
          const status = LocalStorageService.getLogStatusByTmdbId(parseInt(seriesId), 'tv');
          setLogStatus(status);
        }

      } catch (error) {
        console.error("Error loading series data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [seriesId]);

  // Component unmount olduğunda timeout'ları temizle
  useEffect(() => {
    return () => {
      if (toastTimeout) {
        clearTimeout(toastTimeout);
      }
    };
  }, [toastTimeout]);

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

  // İzleme durumu buton işleyicileri
  const handleWatchlistToggle = () => {
    if (!seriesId || !seriesApiData) return;

    const newType = logStatus === 'watchlist' ? null : 'watchlist';
    
    if (newType === null) {
      // Kaydı sil
      const logs = LocalStorageService.getMovieLogs();
      const logToDelete = logs.find(log => log.tmdbId === parseInt(seriesId) && log.mediaType === 'tv');
      if (logToDelete) {
        LocalStorageService.deleteMovieLog(logToDelete.id);
      }
      setLogStatus(null);
    } else {
      // Önce mevcut kaydı güncellemeyi dene
      let updatedLog = LocalStorageService.updateLogTypeByTmdbId(parseInt(seriesId), newType, 'tv');
      
      if (!updatedLog) {
        // Kayıt yoksa yeni kayıt oluştur
        updatedLog = LocalStorageService.saveMovieLog({
          title: seriesApiData.name,
          date: new Date().toISOString().split('T')[0],
          rating: '',
          review: '',
          poster: seriesApiData.poster_path ? `https://image.tmdb.org/t/p/w500${seriesApiData.poster_path}` : '',
          type: newType,
          mediaType: 'tv',
          tmdbId: parseInt(seriesId),
          contentType: 'tv',
          genres: seriesApiData.genres?.map(g => g.name) || [],
          releaseYear: seriesApiData.first_air_date ? new Date(seriesApiData.first_air_date).getFullYear() : undefined,
          runtime: 45, // Ortalama bölüm süresi
          seasonCount: seriesApiData.number_of_seasons,
          episodeCount: seriesApiData.number_of_episodes,
          seriesId: seriesId,
          seriesTitle: seriesApiData.name,
          seriesPoster: seriesApiData.poster_path ? `https://image.tmdb.org/t/p/w500${seriesApiData.poster_path}` : ''
        });
      }
      setLogStatus(newType);
    }
  };

  const handleWatchedToggle = () => {
    if (!seriesId || !seriesApiData) return;

    const newType = logStatus === 'watched' ? null : 'watched';
    
    if (newType === null) {
      // Kaydı sil
      const logs = LocalStorageService.getMovieLogs();
      const logToDelete = logs.find(log => log.tmdbId === parseInt(seriesId) && log.mediaType === 'tv');
      if (logToDelete) {
        LocalStorageService.deleteMovieLog(logToDelete.id);
      }
      setLogStatus(null);
    } else {
      // Önce mevcut kaydı güncellemeyi dene
      let updatedLog = LocalStorageService.updateLogTypeByTmdbId(parseInt(seriesId), newType, 'tv');
      
      if (!updatedLog) {
        // Kayıt yoksa yeni kayıt oluştur
        updatedLog = LocalStorageService.saveMovieLog({
          title: seriesApiData.name,
          date: new Date().toISOString().split('T')[0],
          rating: '',
          review: '',
          poster: seriesApiData.poster_path ? `https://image.tmdb.org/t/p/w500${seriesApiData.poster_path}` : '',
          type: newType,
          mediaType: 'tv',
          tmdbId: parseInt(seriesId),
          contentType: 'tv',
          genres: seriesApiData.genres?.map(g => g.name) || [],
          releaseYear: seriesApiData.first_air_date ? new Date(seriesApiData.first_air_date).getFullYear() : undefined,
          runtime: 45, // Ortalama bölüm süresi
          seasonCount: seriesApiData.number_of_seasons,
          episodeCount: seriesApiData.number_of_episodes,
          seriesId: seriesId,
          seriesTitle: seriesApiData.name,
          seriesPoster: seriesApiData.poster_path ? `https://image.tmdb.org/t/p/w500${seriesApiData.poster_path}` : ''
        });
      }
      setLogStatus(newType);
      
      // Toast bildirimi göster
      if (newType === 'watched') {
        setShowToast(true);
        const timeout = setTimeout(() => {
          setShowToast(false);
        }, 5000);
        setToastTimeout(timeout);
      }
    }
  };

  const handleRatingClick = () => {
    // Toast'u kapat
    setShowToast(false);
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      setToastTimeout(null);
    }
    
    // Dizi ekleme modalını aç
    if (seriesApiData) {
      setPrefillData({
        title: seriesApiData.name,
        poster: seriesApiData.poster_path ? `https://image.tmdb.org/t/p/w500${seriesApiData.poster_path}` : '',
        tmdbId: seriesApiData.id,
        mediaType: 'tv',
        contentType: 'tv',
        genres: seriesApiData.genres?.map(g => g.name) || [],
        releaseYear: seriesApiData.first_air_date ? new Date(seriesApiData.first_air_date).getFullYear() : undefined,
        runtime: 45, // Ortalama bölüm süresi
        type: 'watched', // Zaten izlendi olarak işaretlendiği için
        seasonCount: seriesApiData.number_of_seasons,
        episodeCount: seriesApiData.number_of_episodes,
        seriesId: seriesId,
        seriesTitle: seriesApiData.name,
        seriesPoster: seriesApiData.poster_path ? `https://image.tmdb.org/t/p/w500${seriesApiData.poster_path}` : ''
      });
      setShowAddMovieModal(true);
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
            
            {/* İzleme Durumu Butonları */}
            <div className="flex items-center gap-3 mt-3">
              {/* İzledim Butonu */}
              <button
                onClick={handleWatchedToggle}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm ${
                  logStatus === 'watched' 
                    ? 'bg-[#FE7743] text-white shadow-lg' 
                    : 'bg-transparent text-white border border-white hover:bg-white hover:text-[#0C1117]'
                }`}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill={logStatus === 'watched' ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-medium">
                  {logStatus === 'watched' ? 'İzlendi' : 'İzledim'}
                </span>
              </button>

              {/* İzleme Listesi Butonu - sadece izlenmediyse göster */}
              {logStatus !== 'watched' && (
                <button
                  onClick={handleWatchlistToggle}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm ${
                    logStatus === 'watchlist' 
                      ? 'bg-[#FE7743] text-white shadow-lg' 
                      : 'bg-transparent text-white border border-white hover:bg-white hover:text-[#0C1117]'
                  }`}
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill={logStatus === 'watchlist' ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-medium">
                    {logStatus === 'watchlist' ? 'Listede' : 'Listeme Ekle'}
                  </span>
                </button>
              )}
            </div>
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
                    watchedEpisodes={watchedLogs}
                    onEpisodeToggle={handleEpisodeToggle}
                />
            ))}
        </div>

        {/* Add Movie Modal */}
        <AddButtonModal
          open={showAddMovieModal}
          onClose={() => {
            setShowAddMovieModal(false);
            setPrefillData(null);
          }}
          onSave={(log?: any) => {
            setShowAddMovieModal(false);
            setPrefillData(null);
            // Başarı mesajı göster
            console.log('Dizi puan ve yorum ile güncellendi:', log);
          }}
          onAddMovieLog={(log: any) => {
            // Dizi log'unu güncelle
            if (log && seriesApiData) {
              LocalStorageService.updateMovieLog(log.id, {
                rating: log.rating,
                review: log.review
              });
            }
          }}
          prefillData={prefillData}
        />

        {/* Success Toast */}
        {showToast && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm mx-4">
              <h1 className="text-black text-2xl font-bold mb-4">Başarılı!</h1>
              <p className="text-black mb-4">
                "{seriesApiData?.name}" izlendi olarak işaretlendi.
              </p>
              <button 
                className="w-full h-[40px] rounded-[12px] bg-[#FE7743] text-white text-[14px] font-poppins font-semibold shadow-lg hover:bg-[#e66a3a] transition-colors duration-200"
                onClick={handleRatingClick}
              >
                Puan & Yorum Ekle
              </button>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default SeriesDetailPage;
