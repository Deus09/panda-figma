import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IonDatetime, IonModal, IonItem, IonLabel, IonThumbnail, IonCheckbox, IonButton, IonList } from '@ionic/react';
import { searchMovies, TMDBMovieResult, TMDBCastMember, getSeriesDetails, searchAll, TMDBMultiSearchResponse, TMDBSearchResult, getSeasonDetails, SeasonDetails as TMDBSeasonDetails } from '../services/tmdb';
import { improveComment, chatWithCast } from '../services/gemini';
import { LocalStorageService } from '../services/localStorage';
import { TvSeriesDetails } from '../types/tmdb';
import CastSelectionModal from './CastSelectionModal';
import CastChatModal from './CastChatModal';

interface AddButtonModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (log?: { selectedMovie?: TMDBMovieResult; tmdbId?: number }) => void;
  onAddMovieLog?: (log: any) => void;
  onMovieSelect?: (movie: TMDBMovieResult, id: number) => void;
  prefillData?: {
    title?: string;
    poster?: string;
    tmdbId?: number;
    mediaType?: 'movie' | 'tv';
    contentType?: 'movie' | 'tv';
    genres?: string[];
    releaseYear?: number;
    runtime?: number;
    type?: 'watched' | 'watchlist';
  };
}

const AddButtonModal: React.FC<AddButtonModalProps> = ({ open, onClose, onSave, onAddMovieLog, onMovieSelect, prefillData }) => {
  // Modal view states
  const { t } = useTranslation();
  type ModalView = 'search' | 'episodes';
  const [view, setView] = useState<ModalView>('search');
  
  const [selectedSeries, setSelectedSeries] = useState<TvSeriesDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<TMDBSeasonDetails | null>(null);
  const [checkedEpisodes, setCheckedEpisodes] = useState<Set<number>>(new Set());

  const [watchList, setWatchList] = useState(false);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<TMDBSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovieResult | null>(null);
  const [tmdbId, setTmdbId] = useState<number | null>(null);
  
  // Yeni state'ler - Akıllı veri aktarımı için
  const [title, setTitle] = useState('');
  const [poster, setPoster] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [comment, setComment] = useState('');
  const [improving, setImproving] = useState(false);
  const [improved, setImproved] = useState('');
  const [showImproveAlert, setShowImproveAlert] = useState(false);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [pendingImproved, setPendingImproved] = useState('');
  
  // Cast chat states
  const [showCastSelection, setShowCastSelection] = useState(false);
  const [showCastChat, setShowCastChat] = useState(false);
  const [selectedCastMember, setSelectedCastMember] = useState<TMDBCastMember | null>(null);

  React.useEffect(() => {
    console.log('Selected rating:', rating);
  }, [rating]);

  React.useEffect(() => {
    if (open) {
      setView('search');
      setSelectedSeries(null);
      setSelectedSeason(null);
      setCheckedEpisodes(new Set());
      setSearch('');
      setSelectedMovie(null);
      setTmdbId(null);
      setRating(0);
      setHoverRating(null);
      setDate(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
      });
      setComment('');
      setWatchList(false);
      setShowCastSelection(false);
      setShowCastChat(false);
      setSelectedCastMember(null);
      
      // Yeni state'leri de sıfırla
      setTitle('');
      setPoster('');
      setSelectedItem(null);

      // Prefill data varsa kullan
      if (prefillData) {
        setSelectedItem({
          title: prefillData.title,
          name: prefillData.title,
          poster_path: prefillData.poster,
          poster: prefillData.poster,
          tmdbId: prefillData.tmdbId,
          id: prefillData.tmdbId,
          mediaType: prefillData.mediaType || 'movie',
          contentType: prefillData.contentType || 'movie',
          genres: prefillData.genres || [],
          releaseYear: prefillData.releaseYear,
          runtime: prefillData.runtime || 120
        });
        setTmdbId(prefillData.tmdbId || null);
        setWatchList(prefillData.type === 'watchlist');
        setTitle(prefillData.title || '');
        setPoster(prefillData.poster || '');
      }
    }
  }, [open, prefillData]);

  useEffect(() => {
    if (search.length >= 3) {
      setLoading(true);
      searchAll(search)
        .then(res => {
          // Movies ve series'i birleştir
          const combined = [...res.movies, ...res.series];
          setSuggestions(combined);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    } else {
      setSuggestions([]);
    }
  }, [search]);

  if (!open) return null;

  const handleCancel = () => {
    setSearch('');
    setSelectedMovie(null);
    setTmdbId(null);
    setRating(0);
    setHoverRating(null);
    setDate(() => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    });
    setComment('');
    setWatchList(false);
    onClose();
  };

  // Sparkle butonuna tıklama fonksiyonu
  const handleImprove = async () => {
    if (!comment.trim() || !selectedItem) return;
    setImproving(true);
    try {
      const movieTitle = selectedItem.title || selectedItem.name || '';
      const result = await improveComment(comment, movieTitle);
      setPendingImproved(result);
      setActionSheetOpen(true);
    } catch {
      // hata yönetimi eklenebilir
    } finally {
      setImproving(false);
    }
  };

  // Veri alma fonksiyonu - Bölüm seçim ekranından gelen veriyi işler
  const handleItemSelected = (item: any) => {
    console.log('Item selected:', item);
    setSelectedItem(item);
    setTitle(item.name || item.title || '');
    
    // Poster belirleme mantığını düzelt
    let posterUrl = '';
    if (item.poster) {
      // Tam URL varsa direkt kullan
      posterUrl = item.poster;
    } else if (item.poster_path) {
      // TMDB path varsa tam URL'e çevir
      posterUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    } else if (item.seriesPoster) {
      // Dizi posteri varsa onu kullan
      posterUrl = item.seriesPoster;
    }
    
    setPoster(posterUrl);
    setTmdbId(item.id || item.tmdbId);
    
    // Eğer film ise selectedMovie'yi de set et
    if (item.media_type === 'movie' || item.mediaType === 'movie') {
      setSelectedMovie(item);
    }
    
    // Seçim yapıldıktan sonra search view'a dön ve form alanlarını aktif hale getir
    setView('search');
    setSuggestions([]);
    setSearch('');
    
    // Form alanlarını sıfırla (yeni seçim için)
    setRating(0);
    setComment('');
    setWatchList(false);
    setDate(() => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    });
  };

  // Dizi seçim fonksiyonu - OPTIMIZE EDİLDİ: Doğrudan bölüm seçimine gider
  const handleSeriesSelect = async (seriesId: number) => {
    try {
      console.log('Fetching series details for ID:', seriesId);
      const seriesDetails = await getSeriesDetails(seriesId);
      console.log('Received series details:', seriesDetails);
      console.log('Seasons array:', seriesDetails.seasons);
      
      // Transform to TvSeriesDetails format
      const transformedSeries: TvSeriesDetails = {
        id: seriesDetails.id,
        name: seriesDetails.name,
        poster_path: seriesDetails.poster_path || null,
        number_of_seasons: seriesDetails.number_of_seasons || 0,
        seasons: seriesDetails.seasons?.map(season => ({
          id: season.id,
          season_number: season.season_number,
          name: season.name,
          poster_path: season.poster_path || null,
          episode_count: season.episode_count
        })) || []
      };
      
      console.log('Transformed series:', transformedSeries);
      setSelectedSeries(transformedSeries);
      
      // 🚀 YENİ: Otomatik olarak ilk sezonu seç ve doğrudan episodes'a git
      if (transformedSeries.seasons && transformedSeries.seasons.length > 0) {
        const firstSeason = transformedSeries.seasons[0];
        console.log('Auto-selecting first season:', firstSeason.season_number);
        
        // İlk sezonun detaylarını çek
        const seasonDetailsData = await getSeasonDetails(transformedSeries.id, firstSeason.season_number);
        setSelectedSeason(firstSeason.season_number);
        setSeasonDetails(seasonDetailsData);
        setCheckedEpisodes(new Set()); // Reset checked episodes
        setView('episodes'); // 🎯 Doğrudan bölüm seçimine git!
      } else {
        // Sezon yoksa search'e geri dön
        setView('search');
      }
    } catch (error) {
      console.error('Error fetching series details:', error);
      // Hata durumunda search'e geri dön
      setView('search');
    }
  };

  // Season change handler
  const handleSeasonChange = async (seasonNumber: number) => {
    if (!selectedSeries) return;
    
    setSelectedSeason(seasonNumber);
    setCheckedEpisodes(new Set()); // Clear selected episodes
    
    try {
      const seasonDetailsData = await getSeasonDetails(selectedSeries.id, seasonNumber);
      setSeasonDetails(seasonDetailsData);
    } catch (error) {
      console.error('Error fetching season details:', error);
    }
  };

  // Episode checkbox toggle fonksiyonu
  const handleEpisodeToggle = (episodeId: number) => {
    setCheckedEpisodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(episodeId)) {
        newSet.delete(episodeId);
      } else {
        newSet.add(episodeId);
      }
      return newSet;
    });
  };

  // Tümünü seç/bırak fonksiyonu
  const handleSelectAllEpisodes = () => {
    if (!seasonDetails || !seasonDetails.episodes) return;
    
    const allEpisodeIds = seasonDetails.episodes.map(ep => ep.id);
    const areAllSelected = allEpisodeIds.every(id => checkedEpisodes.has(id));
    
    if (areAllSelected) {
      setCheckedEpisodes(new Set());
    } else {
      setCheckedEpisodes(new Set(allEpisodeIds));
    }
  };

  const handleSave = () => {
    if (!selectedItem) return;
    console.log('handleSave called, selectedItem:', selectedItem);
    
    // Prefill data ile gelen film/dizi için mevcut kaydı kontrol et
    if (prefillData && prefillData.tmdbId) {
      const existingLogs = LocalStorageService.getMovieLogs();
      const existingLog = existingLogs.find(log => 
        log.tmdbId === prefillData.tmdbId && 
        log.mediaType === prefillData.mediaType
      );
      
      if (existingLog) {
        // Mevcut kaydı güncelle
        const updatedLog = LocalStorageService.updateMovieLog(existingLog.id, {
          rating: rating.toString(),
          review: comment,
          date: date
        });
        onAddMovieLog?.(updatedLog);
        onSave({ selectedMovie: selectedItem, tmdbId: selectedItem.tmdbId || selectedItem.id });
        return;
      }
    }
    
    // Eğer birden fazla bölüm seçildiyse hepsini kaydet
    if (selectedItem.allSelectedEpisodes && selectedItem.allSelectedEpisodes.length > 1) {
      selectedItem.allSelectedEpisodes.forEach((episode: any) => {
        const log = {
          title: `${selectedItem.seriesTitle} - S${selectedItem.seasonNumber}E${episode.episode_number}: ${episode.name}`,
          date,
          rating: rating.toString(),
          review: comment,
          poster: episode.still_path ? `https://image.tmdb.org/t/p/w500${episode.still_path}` : selectedItem.poster,
          type: watchList ? 'watchlist' : 'watched',
          mediaType: selectedItem.mediaType || 'movie' as 'movie' | 'tv',
          contentType: selectedItem.mediaType || 'movie' as 'movie' | 'tv',
          tmdbId: episode.id, // ✅ DÜZELTİLDİ: Episode ID'si kullanılıyor, series ID'si değil
          seriesId: selectedItem.seriesId,
          seriesTitle: selectedItem.seriesTitle,
          seriesPoster: selectedItem.seriesPoster,
          seasonNumber: selectedItem.seasonNumber,
          episodeNumber: episode.episode_number,
          episodeId: episode.id,
          runtime: selectedItem.runtime || (selectedItem.mediaType === 'tv' ? 45 : 120)
        };
        onAddMovieLog?.(log);
      });
    } else {
      // Tek film/bölüm için normal kaydetme
      const log = {
        title: selectedItem.title || selectedItem.name,
        date,
        rating: rating.toString(),
        review: comment,
        poster: selectedItem.poster || (selectedItem.poster_path ? `https://image.tmdb.org/t/p/w500${selectedItem.poster_path}` : ''),
        type: watchList ? 'watchlist' : 'watched',
        mediaType: selectedItem.mediaType || 'movie' as 'movie' | 'tv',
        contentType: selectedItem.mediaType || 'movie' as 'movie' | 'tv',
        tmdbId: selectedItem.tmdbId || selectedItem.id,
        seriesId: selectedItem.seriesId,
        seriesTitle: selectedItem.seriesTitle,
        seriesPoster: selectedItem.seriesPoster,
        seasonNumber: selectedItem.seasonNumber,
        episodeNumber: selectedItem.episodeNumber,
        episodeId: selectedItem.episodeId,
        runtime: selectedItem.runtime || (selectedItem.mediaType === 'tv' ? 45 : 120)
      };
      onAddMovieLog?.(log);
    }
    
    // Modal'ı kapat
    onSave({ selectedMovie: selectedItem, tmdbId: selectedItem.tmdbId || selectedItem.id });
  };

  // TV dizisi bölümlerini kaydetme fonksiyonu - Artık "İleri" butonu mantığı
  const handleEpisodeForward = () => {
    if (!selectedSeries || !seasonDetails || checkedEpisodes.size === 0) return;
    
    console.log('Moving forward with selected episode(s):', {
      series: selectedSeries.name,
      season: selectedSeason,
      episodes: Array.from(checkedEpisodes)
    });

    // İlk seçilen bölümü ana forma aktar
    const firstEpisodeId = Array.from(checkedEpisodes)[0];
    const episode = seasonDetails.episodes?.find(ep => ep.id === firstEpisodeId);
    
    if (episode) {
      const episodeItem = {
        id: episode.id,
        name: `${selectedSeries.name} - S${selectedSeason}E${episode.episode_number}: ${episode.name}`,
        title: `${selectedSeries.name} - S${selectedSeason}E${episode.episode_number}: ${episode.name}`,
        poster_path: episode.still_path || selectedSeries.poster_path,
        // Poster URL'ini doğru şekilde oluştur - öncelik sırası: episode still > series poster
        poster: episode.still_path 
          ? `https://image.tmdb.org/t/p/w500${episode.still_path}` 
          : (selectedSeries.poster_path 
            ? `https://image.tmdb.org/t/p/w500${selectedSeries.poster_path}` 
            : ''),
        media_type: 'tv',
        mediaType: 'tv',
        tmdbId: episode.id, // ✅ DÜZELTİLDİ: Episode ID'si kullanılıyor, series ID'si değil
        seriesId: selectedSeries.id.toString(),
        seriesTitle: selectedSeries.name,
        seriesPoster: selectedSeries.poster_path ? `https://image.tmdb.org/t/p/w500${selectedSeries.poster_path}` : undefined,
        seasonNumber: selectedSeason,
        episodeNumber: episode.episode_number,
        episodeId: episode.id,
        runtime: episode.runtime || 45,
        // Eğer birden fazla bölüm seçildiyse onları da sakla
        allSelectedEpisodes: Array.from(checkedEpisodes).map(episodeId => {
          const ep = seasonDetails.episodes?.find(e => e.id === episodeId);
          return ep ? {
            id: ep.id,
            name: ep.name,
            episode_number: ep.episode_number,
            still_path: ep.still_path,
            runtime: ep.runtime
          } : null;
        }).filter(Boolean)
      };
      
      // Ana forma veriyi aktar
      handleItemSelected(episodeItem);
    }
  };

  const handleChatWithCast = () => {
    setShowCastSelection(true);
  };

  const handleCastSelect = (castMember: TMDBCastMember) => {
    setSelectedCastMember(castMember);
    setShowCastChat(true);
  };

  const handleSendMessage = async (message: string): Promise<string> => {
    if (!selectedCastMember || !selectedItem) {
      throw new Error('No cast member or content selected');
    }
    
    const title = selectedItem.title || selectedItem.name || '';
    return await chatWithCast(message, selectedCastMember, title);
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black bg-opacity-40">
        <div className="w-[393px] max-h-[95vh] h-[95vh] rounded-t-[54px] bg-[#222] pb-6 pt-6 px-4 shadow-2xl animate-slideInUp overflow-y-auto relative z-[60]">
          {/* Modal Title */}
          <div className="flex justify-center mb-8">
            <span className="text-[24px] font-extrabold font-poppins text-[#F8F8FF] text-center drop-shadow-[0_4px_15px_rgba(255,255,255,0.5)]">Film/Dizi Ekle</span>
          </div>
          {/* Search Bar */}
          {!selectedItem ? (
            <div className="mb-8 relative">
              <span className="block text-[16px] font-semibold font-poppins text-[#F8F8FF] mb-1">Search a flick/series</span>
              <div className="relative">
                <input
                  className="w-full h-[40px] rounded-[12px] bg-[#EFEEEA] pl-10 pr-10 text-black text-[16px] font-poppins font-semibold outline-none"
                  placeholder="Fight Club"
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                  }}
                  onFocus={() => setSuggestions(search.length >= 3 ? suggestions : [])}
                />
                {/* X butonu */}
                {search.length > 0 && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-[#FE7743] focus:outline-none"
                    aria-label="Clear search"
                    onClick={() => {
                      setSearch('');
                    }}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" fill="none" stroke="#000" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6z" />
                </svg>
                {search.length >= 3 && suggestions.length > 0 && (
                  <div ref={suggestionsRef} className="absolute left-0 top-[44px] w-full bg-white rounded-b-[12px] shadow-lg z-50 max-h-72 overflow-y-auto border border-[#FE7743]">
                    {loading && <div className="p-2 text-sm text-gray-400">Loading...</div>}
                    {suggestions.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[#FE7743]/10"
                        onClick={() => {
                          if (item.media_type === 'movie') {
                            // Film seçimi - artık direkt ana forma aktar
                            const movieItem = {
                              id: item.id,
                              title: item.title,
                              name: item.title,
                              poster_path: item.poster_path,
                              poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
                              media_type: 'movie',
                              mediaType: 'movie',
                              tmdbId: item.id,
                              runtime: 120 // varsayılan
                            };
                            handleItemSelected(movieItem);
                          } else if (item.media_type === 'tv') {
                            // Dizi seçimi - sezon/bölüm seçim ekranına git
                            setSuggestions([]);
                            setSearch(item.name || '');
                            handleSeriesSelect(item.id);
                          }
                        }}
                      >
                        <img
                          src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://placehold.co/40x60?text=No+Image'}
                          alt={item.title || item.name}
                          className="w-10 h-16 object-cover rounded"
                        />
                        <span className="text-black text-[15px] font-poppins">{item.title || item.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">{item.release_date?.slice(0,4) || item.first_air_date?.slice(0,4) || ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Seçim yapıldıktan sonra seçilen içeriği göster
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="block text-[16px] font-semibold font-poppins text-[#F8F8FF]">Selected Content</span>
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setTitle('');
                    setPoster('');
                    setSelectedMovie(null);
                    setTmdbId(null);
                  }}
                  className="text-[#FE7743] text-sm font-medium hover:text-[#FE7743]/80"
                >
                  Change
                </button>
              </div>
              <div className="flex items-center gap-4 p-3 bg-[#333] rounded-lg">
                {poster && (
                  <img
                    src={poster}
                    alt={title}
                    className="w-16 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-[#F8F8FF] font-semibold text-[16px] leading-5">{title}</h3>
                  <p className="text-[#B0B0B0] text-sm mt-1">
                    {selectedItem?.mediaType === 'tv' ? 'TV Series Episode' : 'Movie'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Search View - Default */}
          {view === 'search' && (
            <>
          {/* Add Watch List Toggle */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-[16px] font-semibold font-poppins text-[#F8F8FF]">Add Watch List</span>
            <button
              type="button"
              aria-pressed={watchList}
              onClick={() => selectedItem && setWatchList(v => !v)}
              disabled={!selectedItem}
              className={`w-12 h-7 rounded-full flex items-center transition-colors duration-300 focus:outline-none ${
                !selectedItem ? 'bg-gray-400 opacity-50 cursor-not-allowed' :
                watchList ? 'bg-[#FE7743]' : 'bg-[#D9D9D9]'
              }`}
            >
              <span
                className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${watchList ? 'translate-x-5' : 'translate-x-1'}`}
              />
            </button>
          </div>          {/* Additional fields for TV shows - Geçici olarak kaldırıldı, TMDB'den gelecek */}
          {/* TV dizileri için sezon/bölüm bilgileri TMDB API'sinden otomatik olarak gelecek */}

          {/* Runtime - Kaldırıldı, TMDB'den gelecek */}
          {/* Film/dizi süre bilgisi TMDB API'sinden otomatik olarak gelecek */}

          {/* Date Watched */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-[16px] font-semibold font-poppins text-[#F8F8FF]">Date Watched</span>
            <button
              type="button"
              className={`w-[130px] h-[40px] rounded-[12px] bg-[#D9D9D9] flex items-center justify-center text-[#000] text-[16px] font-poppins font-semibold relative ${
                (watchList || !selectedItem) ? 'opacity-50 pointer-events-none' : ''
              }`}
              onClick={() => !watchList && selectedItem && setShowDatePicker(true)}
              disabled={watchList || !selectedItem}
            >
              {date === new Date().toISOString().split('T')[0] ? 'Today' : date}
            </button>
            <IonModal isOpen={showDatePicker} onDidDismiss={() => setShowDatePicker(false)}>
              <div className="flex flex-col items-center justify-center h-full bg-[#222]">
                <IonDatetime
                  presentation="date"
                  preferWheel={true}
                  value={date}
                  onIonChange={e => {
                    if (e.detail.value) setDate(e.detail.value as string);
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full"
                  disabled={watchList}
                />
                <button
                  className="mt-4 px-6 py-2 rounded-lg bg-[#FE7743] text-white font-poppins font-semibold"
                  onClick={() => setShowDatePicker(false)}
                  disabled={watchList}
                >
                  Set Date
                </button>
              </div>
            </IonModal>
          </div>
          {/* Rating */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-[16px] font-semibold font-poppins text-[#F8F8FF]">Rating</span>
            <div className={`flex gap-1 ${(watchList || !selectedItem) ? 'opacity-50 pointer-events-none' : ''}`}>
              {[1,2,3,4,5].map(i => {
                const value = i;
                const displayValue = hoverRating !== null ? hoverRating : rating;
                let fill = '#D9D9D9';
                if (displayValue >= value) fill = '#FE7743';
                else if (displayValue >= value - 0.5) fill = 'url(#half-star)';
                return (
                  <svg
                    key={i}
                    width="35" height="33" viewBox="0 0 35 33" fill="none"
                    onMouseMove={(watchList || !selectedItem) ? undefined : e => {
                      const { left, width } = (e.target as SVGElement).getBoundingClientRect();
                      const x = e.clientX - left;
                      if (x < width / 2) setHoverRating(value - 0.5);
                      else setHoverRating(value);
                    }}
                    onMouseLeave={(watchList || !selectedItem) ? undefined : () => setHoverRating(null)}
                    onClick={(watchList || !selectedItem) ? undefined : e => {
                      const { left, width } = (e.target as SVGElement).getBoundingClientRect();
                      const x = e.clientX - left;
                      if (x < width / 2) setRating(value - 0.5);
                      else setRating(value);
                    }}
                    onTouchStart={(watchList || !selectedItem) ? undefined : e => {
                      const touch = e.touches[0];
                      const { left, width } = (e.target as SVGElement).getBoundingClientRect();
                      const x = touch.clientX - left;
                      if (x < width / 2) setHoverRating(value - 0.5);
                      else setHoverRating(value);
                    }}
                    onTouchEnd={(watchList || !selectedItem) ? undefined : e => {
                      const touch = e.changedTouches[0];
                      const { left, width } = (e.target as SVGElement).getBoundingClientRect();
                      const x = touch.clientX - left;
                      if (x < width / 2) setRating(value - 0.5);
                      else setRating(value);
                      setHoverRating(null);
                    }}
                    style={{ cursor: (watchList || !selectedItem) ? 'not-allowed' : 'pointer', transition: 'fill 0.2s' }}
                  >
                    <defs>
                      <linearGradient id="half-star" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="50%" stopColor="#FE7743" />
                        <stop offset="50%" stopColor="#D9D9D9" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points="17.5,2 22.5,12.5 34,13.5 25,21.5 28,32 17.5,26 7,32 10,21.5 1,13.5 12.5,12.5"
                      fill={fill}
                      stroke="#FE7743"
                      strokeWidth="2"
                    />
                  </svg>
                );
              })}
            </div>
          </div>
          {/* Comment */}
          <div className="mb-8 relative">
            <span className="block text-[16px] font-semibold font-poppins text-[#F8F8FF] mb-1">Add a comment</span>
            <div className="relative">
              <textarea
                className={`w-full min-h-[150px] max-h-[250px] rounded-[12px] bg-[#D9D9D9] p-3 pr-10 text-black text-[16px] font-poppins font-normal resize-none outline-none overflow-y-auto ${(watchList || !selectedItem) ? 'opacity-50 pointer-events-none' : ''}`}
                placeholder="Write your comment..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                disabled={watchList || !selectedItem}
                style={{ height: 'auto', maxHeight: 250, minHeight: 150 }}
                onInput={e => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 250) + 'px';
                }}
              />
              <button
                type="button"
                className="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center bg-transparent p-0 m-0 focus:outline-none"
                tabIndex={-1}
                aria-label="Sparkle"
                disabled={watchList || improving || !selectedItem}
                onClick={handleImprove}
              >
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 50 50">
                  <path d="M22.462 11.035l2.88 7.097c1.204 2.968 3.558 5.322 6.526 6.526l7.097 2.88c1.312.533 1.312 2.391 0 2.923l-7.097 2.88c-2.968 1.204-5.322 3.558-6.526 6.526l-2.88 7.097c-.533 1.312-2.391 1.312-2.923 0l-2.88-7.097c-1.204-2.968-3.558-5.322-6.526-6.526l-7.097-2.88c-1.312-.533-1.312-2.391 0-2.923l7.097-2.88c2.968-1.204 5.322-3.558 6.526-6.526l2.88-7.097C20.071 9.723 21.929 9.723 22.462 11.035zM39.945 2.701l.842 2.428c.664 1.915 2.169 3.42 4.084 4.084l2.428.842c.896.311.896 1.578 0 1.889l-2.428.842c-1.915.664-3.42 2.169-4.084 4.084l-.842 2.428c-.311.896-1.578.896-1.889 0l-.842-2.428c-.664-1.915-2.169-3.42-4.084-4.084l-2.428-.842c-.896-.311-.896-1.578 0-1.889l2.428-.842c1.915-.664 3.42-2.169 4.084-4.084l.842-2.428C38.366 1.805 39.634 1.805 39.945 2.701z"></path>
                </svg>
              </button>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex justify-center gap-6 mt-6 relative z-[60]">
            <button onClick={handleCancel} className="w-[130px] h-[40px] rounded-[12px] bg-[#EFEEEA] text-[#222] text-[16px] font-poppins font-semibold shadow-md relative z-[60]">Cancel</button>
            <button 
              onClick={handleSave} 
              disabled={!selectedItem}
              className={`w-[130px] h-[40px] rounded-[12px] text-[16px] font-poppins font-semibold shadow-lg relative z-[60] ${
                !selectedItem 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-[#FE7743] text-[#F8F8FF] hover:bg-[#FE7743]/90'
              }`}
            >
              Save
            </button>
          </div>
          </>
          )}
          
          {/* Episodes View */}
          {view === 'episodes' && seasonDetails && (
            <div>
              <div className="text-center text-[#F8F8FF] text-[18px] font-poppins mb-6">
                Season {selectedSeason} - Bölüm Seçin
              </div>
              
              {/* Tümünü Seç Checkbox */}
              <IonItem className="bg-muted rounded-lg mb-4">
                <IonCheckbox 
                  slot="start"
                  checked={(seasonDetails.episodes?.length ?? 0) > 0 && seasonDetails.episodes?.every(ep => checkedEpisodes.has(ep.id)) === true}
                  indeterminate={seasonDetails.episodes?.some(ep => checkedEpisodes.has(ep.id)) === true && seasonDetails.episodes?.every(ep => checkedEpisodes.has(ep.id)) !== true}
                  onIonChange={handleSelectAllEpisodes}
                />
                <IonLabel className="text-[#F8F8FF]">
                  <h2 className="text-[16px] font-poppins font-semibold">Tümünü Seç</h2>
                  <p className="text-sm text-muted-foreground">{seasonDetails.episodes?.length ?? 0} bölüm</p>
                </IonLabel>
              </IonItem>

              {/* Episode List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto mb-6 pr-1">
                {seasonDetails.episodes?.map((episode) => (
                  <div 
                    key={episode.id}
                    className="flex items-center p-3 bg-card rounded-lg border border-border"
                  >
                    <IonCheckbox 
                      className="mr-4"
                      checked={checkedEpisodes.has(episode.id)}
                      onIonChange={() => handleEpisodeToggle(episode.id)}
                    />
                    <IonThumbnail className="w-24 h-16 mr-2">
                      {episode.still_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w200${episode.still_path}`} 
                          alt={episode.name}
                          className="rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                    </IonThumbnail>
                    <h3 className="font-semibold text-[#F8F8FF] whitespace-normal">
                      {episode.episode_number}. {episode.name}
                    </h3>
                  </div>
                )) ?? []}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-6 mt-6 relative z-[60]">
                <select
                  value={selectedSeason}
                  onChange={(e) => handleSeasonChange(Number(e.target.value))}
                  className="w-[130px] h-[40px] rounded-[12px] bg-[#EFEEEA] text-[#222] text-[16px] font-poppins font-semibold shadow-md relative z-[60]"
                >
                  {selectedSeries?.seasons?.map((season) => (
                    <option key={season.season_number} value={season.season_number}>
                      {season.season_number === 0 ? 'Özel' : `Sezon ${season.season_number}`}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={handleEpisodeForward}
                  disabled={checkedEpisodes.size === 0}
                  className={`w-[130px] h-[40px] rounded-[12px] text-[16px] font-poppins font-semibold shadow-lg relative z-[60] ${
                    checkedEpisodes.size === 0 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-[#FE7743] text-[#F8F8FF] hover:bg-[#FE7743]/90'
                  }`}
                >
                  İleri ({checkedEpisodes.size})
                </button>
              </div>
            </div>
          )}
        </div>
        {actionSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center w-[90vw] max-w-[350px]">
              <span className="text-black font-poppins text-base mb-4">Yorumunuzu geliştirmek istiyor musunuz?</span>
              <div className="bg-[#F3F2EF] rounded p-2 text-xs text-gray-700 mb-4 w-full max-h-[120px] overflow-y-auto">{pendingImproved}</div>
              <div className="flex gap-4">
                <button className="px-4 py-1 rounded bg-[#FE7743] text-white font-poppins" onClick={() => { setComment(pendingImproved); setActionSheetOpen(false); setPendingImproved(''); }}>Yes</button>
                <button className="px-4 py-1 rounded bg-gray-300 text-black font-poppins" onClick={() => { setActionSheetOpen(false); setPendingImproved(''); }}>No</button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Cast Selection Modal */}
      {tmdbId && tmdbId > 0 && (
        <CastSelectionModal
          open={showCastSelection}
          onClose={() => {
            setShowCastSelection(false);
          }}
          movieId={tmdbId}
          movieTitle={selectedItem?.title || selectedItem?.name || ''}
          onCastSelect={handleCastSelect}
        />
      )}

      {/* Cast Chat Modal */}
      {selectedCastMember && (
        <CastChatModal
          open={showCastChat}
          onClose={() => {
            setShowCastChat(false);
            setSelectedCastMember(null);
            // Chat kapandığında ana modal'ı da kapat
            onSave();
          }}
          castMember={selectedCastMember}
          movieTitle={selectedItem?.title || selectedItem?.name || ''}
          onSendMessage={handleSendMessage}
        />
      )}
    </>
  );
};

export default AddButtonModal; 