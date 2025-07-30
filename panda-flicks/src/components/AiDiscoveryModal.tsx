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
import { getMovieSuggestions } from '../services/geminiService';

interface AiDiscoveryModalProps {
  open: boolean;
  onClose: () => void;
}

const AiDiscoveryModal: React.FC<AiDiscoveryModalProps> = ({ open, onClose }) => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFindMovies = async () => {
    if (!description.trim()) return;
    
    try {
      setIsLoading(true);
      
      console.log('Film aranıyor:', description);
      const movieSuggestions = await getMovieSuggestions(description.trim());
      
      console.log('AI\'den gelen film önerileri:', movieSuggestions);
      
    } catch (error) {
      console.error('Film önerisi alınırken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDescription('');
  };

  return (
    <IonModal isOpen={open} onDidDismiss={onClose} breakpoints={[0, 0.75]} initialBreakpoint={0.75}>
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
              Aklındaki filmi tarif et, yapay zeka sana en uygun önerileri getirsin!
            </p>
          </div>

          {/* Metin Alanı ve Butonlar - Loading değilken göster */}
          {!isLoading ? (
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
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};

export default AiDiscoveryModal;
