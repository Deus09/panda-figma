import React, { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonModal,
  IonTextarea,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonIcon,
  IonSpinner
} from '@ionic/react';
import { close } from 'ionicons/icons';
import { getMovieSuggestions, MovieSuggestion } from '../services/geminiService';

interface AiDiscoveryModalProps {
  open: boolean;
  onClose: () => void;
}

const AiDiscoveryModal: React.FC<AiDiscoveryModalProps> = ({ open, onClose }) => {
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
      <IonHeader>
        <IonToolbar className="bg-background border-b border-gray-800">
          <IonTitle className="text-foreground font-poppins text-lg font-semibold">
            Hayalindeki Filmi Tarif Et
          </IonTitle>
          <IonButtons slot="end">
            <IonButton 
              fill="clear" 
              onClick={onClose}
              className="text-foreground"
            >
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="bg-background">
        <div className="p-6 space-y-6">
          {/* Açıklama Metni */}
          <div className="text-center space-y-2">
            <div className="text-4xl mb-4">🧠✨</div>
            <p className="text-gray-400 font-poppins text-sm leading-relaxed">
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
                <div className="space-y-3">
                  <label className="block text-foreground font-poppins text-sm font-medium">
                    Film Açıklaması
                  </label>
                  <IonTextarea
                    value={description}
                    onIonInput={(e) => setDescription(e.detail.value!)}
                    placeholder="Örnek: Uzayda geçen, robotları olan ve aşk hikayesi bulunan animasyon film..."
                    rows={6}
                    className="bg-gray-800/50 rounded-lg border border-gray-700 text-foreground placeholder:text-gray-500"
                    fill="outline"
                  />
                </div>

                {/* Butonlar */}
                <div className="space-y-3">
                  <IonButton
                    expand="block"
                    onClick={handleFindMovies}
                    disabled={!description.trim()}
                    className="h-12 rounded-xl font-poppins font-semibold"
                    style={{
                      '--background': '#FE7743',
                      '--background-hover': '#e66a3a',
                      '--color': 'white'
                    }}
                  >
                    <span className="flex items-center gap-2">
                      🎬 Film Bul
                    </span>
                  </IonButton>

                  <IonButton
                    expand="block"
                    fill="outline"
                    onClick={handleReset}
                    disabled={!description.trim()}
                    className="h-12 rounded-xl font-poppins font-medium"
                    style={{
                      '--border-color': '#FE7743',
                      '--color': '#FE7743'
                    }}
                  >
                    Temizle
                  </IonButton>

                  <IonButton
                    expand="block"
                    fill="clear"
                    onClick={onClose}
                    className="h-12 rounded-xl font-poppins font-medium text-gray-400"
                  >
                    Kapat
                  </IonButton>
                </div>
              </>
            ) : (
              /* Loading durumu */
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <IonSpinner 
                  name="dots" 
                  className="w-12 h-12 text-[#FE7743]"
                />
                <div className="text-center space-y-2">
                  <p className="text-foreground font-poppins font-medium">
                    Yapay Zeka Çalışıyor...
                  </p>
                  <p className="text-gray-400 font-poppins text-sm">
                    Senin için en uygun filmleri arıyorum ✨
                  </p>
                </div>
              </div>
            )
          ) : (
            /* Film önerileri alınmışsa - Poster grid'ini göster */
            <>
              {/* Film Posterleri Grid */}
              <div className="grid grid-cols-3 gap-2">
                {suggestedMovies.map((movie, index) => (
                  <div
                    key={`${movie.tmdbId}-${index}`}
                    className="relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-800"
                    onClick={() => {
                      // TODO: Modal açma işlemi sonraki adımda eklenecek
                      console.log('Film seçildi:', movie);
                    }}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Poster yüklenemezse placeholder göster
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/200x300/374151/9CA3AF?text=No+Image';
                      }}
                    />
                    {/* Film başlığı overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-xs font-poppins font-medium truncate">
                        {movie.title}
                      </p>
                      <p className="text-gray-300 text-xs">
                        {movie.year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Yeniden Dene Butonu */}
              <div className="space-y-3">
                <IonButton
                  expand="block"
                  fill="outline"
                  onClick={handleTryAgain}
                  className="h-12 rounded-xl font-poppins font-medium"
                  style={{
                    '--border-color': '#FE7743',
                    '--color': '#FE7743'
                  }}
                >
                  🔄 Yeniden Dene
                </IonButton>

                <IonButton
                  expand="block"
                  fill="clear"
                  onClick={onClose}
                  className="h-12 rounded-xl font-poppins font-medium text-gray-400"
                >
                  Kapat
                </IonButton>
              </div>
            </>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};

export default AiDiscoveryModal;
