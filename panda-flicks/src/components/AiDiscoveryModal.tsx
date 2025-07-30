import React, { useState } from 'react';
import { IonTextarea, IonModal } from '@ionic/react';
import { getMovieSuggestions, MovieSuggestion } from '../services/geminiService';
import TopHeaderBar from './TopHeaderBar';
import { useModal } from '../context/ModalContext';

interface AiDiscoveryModalProps {
  open: boolean;
  onClose: () => void;
  onMovieSelect?: (movie: MovieSuggestion) => void;
}

const AiDiscoveryModal: React.FC<AiDiscoveryModalProps> = ({ open, onClose, onMovieSelect }) => {
  const { openModal } = useModal();
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedMovies, setSuggestedMovies] = useState<MovieSuggestion[]>([]);

  const handleFindMovies = async () => {
    if (!description.trim()) return;
    
    try {
      setIsLoading(true);
      
      console.log('Film aranıyor:', description);
      const movieSuggestions = await getMovieSuggestions(description.trim());
      
      // Film önerilerini state'e kaydet
      setSuggestedMovies(movieSuggestions);
      
    } catch (error) {
      console.error('Film önerisi alınırken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDescription('');
    setSuggestedMovies([]);
  };

  const handleTryAgain = () => {
    setSuggestedMovies([]);
  };

  const handleMovieSelect = (movie: MovieSuggestion) => {
    onMovieSelect?.(movie);
    onClose();
  };

  const handleMovieClick = (movie: MovieSuggestion) => {
    openModal('movie', movie.tmdbId);
  };

  return (
    <IonModal 
      isOpen={open} 
      onDidDismiss={onClose}
      breakpoints={[0, 0.95]} 
      initialBreakpoint={0.95}
      className="ai-discovery-modal"
      style={{
        '--height': '95vh',
        '--max-height': '95vh'
      }}
    >
      <div className="w-full h-full bg-[#222] rounded-t-[54px] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-center bg-background w-full h-[60px] p-4">
          <span className="text-h2 font-bold text-foreground">
            AI Film Discovery
          </span>
        </div>
        
        {/* Modal Content */}
        <div className="px-4 pb-8 pt-6 overflow-y-auto h-full">
              {/* Açıklama Metni */}
              <div className="text-center mb-3">
                <p className="text-[#CCC] font-poppins text-[14px] leading-relaxed">
                  {suggestedMovies.length === 0 
                    ? "Aklındaki filmi tarif et, yapay zeka sana en uygun önerileri getirsin!"
                    : "İşte sana özel seçtiklerim! 🎬"
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
                        Film Açıklaması
                      </span>
                      <div className="relative">
                        <IonTextarea
                          value={description}
                          onIonInput={(e) => setDescription(e.detail.value!)}
                          placeholder="Örnek: Uzayda geçen, robotları olan ve aşk hikayesi bulunan animasyon film..."
                          rows={6}
                          className="w-full min-h-[150px] max-h-[250px] rounded-[12px] bg-[#D9D9D9] p-3 pr-10 text-black text-[16px] font-poppins font-normal resize-none outline-none overflow-y-auto border-0"
                          fill="solid"
                          style={{ height: 'auto', maxHeight: 250, minHeight: 150 }}
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
                            className="absolute bottom-3 right-3 w-6 h-6 flex items-center justify-center bg-[#D9D9D9] text-black hover:bg-gray-300 transition-all duration-200"
                            onClick={() => setDescription('')}
                            aria-label="Clear text"
                            style={{ 
                              zIndex: 9999,
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
                          🎬 Film Bul
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
                        Yapay Zeka Çalışıyor...
                      </p>
                      <p className="text-[#CCC] font-poppins text-[14px]">
                        Senin için en uygun filmleri arıyorum ✨
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
                      className="w-full h-[48px] rounded-[12px] text-[16px] font-poppins font-semibold bg-[#FE7743] text-[#F8F8FF] hover:bg-[#FE7743]/90 active:scale-95 transition-all duration-200 shadow-lg"
                    >
                      🔄 Yeniden Dene
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
