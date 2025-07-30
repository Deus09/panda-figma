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
  IonIcon
} from '@ionic/react';
import { close } from 'ionicons/icons';

interface AiDiscoveryModalProps {
  open: boolean;
  onClose: () => void;
}

const AiDiscoveryModal: React.FC<AiDiscoveryModalProps> = ({ open, onClose }) => {
  const [description, setDescription] = useState('');

  const handleFindMovies = () => {
    // Bu aşamada sadece console log - gerçek API bağlantısı sonraki adımda
    console.log('Film aranıyor:', description);
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
        </div>
      </IonContent>
    </IonModal>
  );
};

export default AiDiscoveryModal;
