import React, { useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import logoImage from '../assets/logo.png';
import './SplashScreen.css';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 2.5 saniye sonra splash screen'i kapat
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Fade-out animasyonu için 300ms ekstra bekle
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <IonPage className={`splash-screen ${!isVisible ? 'fade-out' : ''}`}>
      <IonContent className="ion-no-padding">
        <div className="splash-container">
          <div className="logo-container">
            {/* Gerçek logo */}
            <div className="app-logo pulsing">
              <img src={logoImage} alt="Moviloi Logo" className="logo-image" />
            </div>
            <p className="splash-subtitle">Film ve dizi deneyimini keşfet</p>
          </div>
        </div>
      </IonContent>
      

    </IonPage>
  );
};

export default SplashScreen;
