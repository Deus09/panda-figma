import React, { useState } from 'react';
import { IonTextarea, IonModal } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { getMovieSuggestions, MovieSuggestion } from '../services/geminiService';
import { useModal } from '../context/ModalContext';

interface AiDiscoveryModalProps {
  open: boolean;
  onClose: () => void;
  onMovieSelect?: (movie: MovieSuggestion) => void;
}

const AiDiscoveryModal: React.FC<AiDiscoveryModalProps> = ({ open, onClose, onMovieSelect }) => {
  const { t } = useTranslation();
  const { openModal } = useModal();
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedMovies, setSuggestedMovies] = useState<MovieSuggestion[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [excludedMovies, setExcludedMovies] = useState<MovieSuggestion[]>([]);
  const MAX_RETRIES = 2; // İlk deneme hariç 2 yeniden deneme hakkı

  const handleFindMovies = async () => {
    if (!description.trim()) return;

    setIsLoading(true);
    setRetryCount(0); // Sayacı sıfırla
    setExcludedMovies([]); // Dışlama listesini temizle

    try {
      console.log('Film aranıyor:', description);
      const movieSuggestions = await getMovieSuggestions(description.trim());
      
      // Film önerilerini state'e kaydet
      setSuggestedMovies(movieSuggestions);
      setExcludedMovies(movieSuggestions); // Gelen ilk filmleri dışlama listesine ekle
      
    } catch (error) {
      console.error('Film önerisi alınırken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = async () => {
    if (retryCount >= MAX_RETRIES) return; // Limite ulaşıldıysa işlemi durdur

    setIsLoading(true);
    setSuggestedMovies([]); // Mevcut filmleri temizle

    try {
      // API isteğini dışlanacak filmlerle birlikte gönder
      const movieSuggestions = await getMovieSuggestions(description.trim(), excludedMovies);
      setSuggestedMovies(movieSuggestions);
      // Yeni gelen filmleri kümülatif listeye ekle
      setExcludedMovies(prev => [...prev, ...movieSuggestions]);
      setRetryCount(prev => prev + 1); // Sayacı artır
    } catch (error) {
      console.error('Film önerisi alınırken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovieClick = (movie: MovieSuggestion) => {
    openModal('movie', movie.tmdbId);
  };

  return (
    <IonModal 
      isOpen={open} 
      onDidDismiss={onClose}
      breakpoints={[0, 0.8]} 
      initialBreakpoint={0.8}
      className="ai-discovery-modal"
      style={{
        '--height': '80vh',
        '--max-height': '80vh'
      }}
    >
      <div className="w-full h-full bg-[#222] rounded-t-[54px] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-center bg-background w-full h-[60px] p-4">
          <span className="text-h2 font-bold text-foreground">
            {t('ai.ai_film_discovery')}
          </span>
        </div>
        
        {/* Modal Content */}
        <div className="px-4 pb-8 pt-6 overflow-y-auto h-full">
              {/* Açıklama Metni */}
              <div className="text-center mb-3">
                <p className="text-[#CCC] font-poppins text-[14px] leading-relaxed">
                  {suggestedMovies.length === 0 
                    ? t('ai.ai_description')
                    : `${t('ai.ai_suggestions')} ${retryCount > 0 ? `(${t('ai.attempt')} ${retryCount}/${MAX_RETRIES})` : ''}`
                  }
                </p>
              </div>

              {/* Koşullu İçerik */}
              {suggestedMovies.length === 0 ? (
                /* Film önerisi alınmamışsa - Input ve butonları göster */
                !isLoading ? (
                  <>
                    {/* Metin Alanı */}
                    <div className="mb-8">
                      <span className="block text-[16px] font-semibold font-poppins text-[#F8F8FF] mb-3">
                        {t('ai.film_description')}
                      </span>
                      <div className="relative">
                        <IonTextarea
                          value={description}
                          onIonInput={(e) => setDescription(e.detail.value!)}
                          placeholder={t('ai.film_description_placeholder')}
                          rows={6}
                          className="w-full min-h-[150px] max-h-[250px] rounded-[12px] bg-gray-800 p-3 pr-10 text-gray-200 text-[16px] font-poppins font-normal resize-none outline-none overflow-y-auto border-0"
                          fill="solid"
                          style={{ 
                            height: 'auto', 
                            maxHeight: 250, 
                            minHeight: 150,
                            '--placeholder-color': '#9CA3AF', // text-gray-400
                            '--placeholder-opacity': '1',
                            'paddingRight': '40px' // Buton için yer aç
                          }}
                          onInput={e => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = Math.min(target.scrollHeight, 250) + 'px';
                          }}
                        />
                        {/* X Butonu - Textarea içinde sağ alt köşe */}
                        {description.length > 0 && (
                          <button
                            type="button"
                            className="absolute bottom-3 right-3 w-6 h-6 flex items-center justify-center bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-all duration-200"
                            onClick={() => setDescription('')}
                            aria-label="Clear text"
                            style={{ 
                              zIndex: 10,
                              pointerEvents: 'auto'
                            }}
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Film Bul Butonu */}
                    <div className="space-y-4">
                      <button
                        onClick={handleFindMovies}
                        disabled={!description.trim()}
                        className={`w-full h-[48px] rounded-[12px] text-[16px] font-poppins font-semibold shadow-lg transition-all duration-200 ${
                          !description.trim() 
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : 'bg-[#FE7743] text-[#F8F8FF] hover:bg-[#FE7743]/90 active:scale-95'
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          {t('ai.find_movies')}
                        </span>
                      </button>
                    </div>
                  </>
                ) : (
                  /* Loading durumu */
                  <div className="flex flex-col items-center justify-center py-12 space-y-6">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-[#333] border-t-[#FE7743] rounded-full animate-spin"></div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-[#F8F8FF] font-poppins font-semibold text-[18px]">
                        {t('ai.ai_working')}
                      </p>
                      <p className="text-[#CCC] font-poppins text-[14px]">
                        {t('ai.ai_searching')}
                      </p>
                    </div>
                  </div>
                )
              ) : (
                /* Film önerileri alınmışsa - Poster grid'ini göster */
                <>
                  {/* Film Posterleri Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {suggestedMovies.map((movie, index) => (
                      <div
                        key={`${movie.tmdbId}-${index}`}
                        className="relative aspect-[2/3] rounded-[12px] overflow-hidden cursor-pointer hover:opacity-80 transition-all duration-200 bg-[#333] hover:scale-105 active:scale-95"
                        onClick={() => handleMovieClick(movie)}
                      >
                        <img
                          src={movie.poster_path && movie.poster_path.startsWith('/') 
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : 'https://placehold.co/200x300/374151/9CA3AF?text=No+Image'
                          }
                          alt={movie.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Poster yüklenemezse placeholder göster
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://placehold.co/200x300/374151/9CA3AF?text=No+Image';
                          }}
                        />
                        {/* Film başlığı overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2">
                          <p className="text-white text-[11px] font-poppins font-semibold truncate leading-tight">
                            {movie.title}
                          </p>
                          <p className="text-[#CCC] text-[9px] mt-1">
                            {movie.year}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Yeniden Dene Butonu */}
                  <div className="pb-4">
                    <button
                      onClick={handleTryAgain}
                      disabled={retryCount >= MAX_RETRIES || isLoading}
                      className={`w-full h-[48px] rounded-[12px] text-[16px] font-poppins font-semibold transition-all duration-200 shadow-lg ${
                        (retryCount >= MAX_RETRIES || isLoading) 
                          ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                          : 'bg-[#FE7743] text-[#F8F8FF] hover:bg-[#FE7743]/90 active:scale-95'
                      }`}
                    >
                      {isLoading 
                        ? t('ai.thinking')
                        : (retryCount >= MAX_RETRIES 
                            ? `${t('ai.all_attempts_used')} (${retryCount}/${MAX_RETRIES})` 
                            : `${t('ai.try_again')} (${retryCount}/${MAX_RETRIES})`
                          )
                      }
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </IonModal>
  );
};

export default AiDiscoveryModal;
