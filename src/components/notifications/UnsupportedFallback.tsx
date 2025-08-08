import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  IonCard,
  IonCardContent,
  IonIcon,
  IonText,
  IonButton
} from '@ionic/react';
import {
  warningOutline,
  informationCircle,
  openOutline
} from 'ionicons/icons';

interface UnsupportedFallbackProps {
  reason?: string;
  className?: string;
  showUpgradeInfo?: boolean;
}

const UnsupportedFallback: React.FC<UnsupportedFallbackProps> = ({
  reason,
  className = '',
  showUpgradeInfo = true
}) => {
  const { t } = useTranslation();

  const getUpgradeInstructions = () => {
    const userAgent = navigator.userAgent;
    
    if (/iPhone|iPad/.test(userAgent)) {
      return {
        title: 'iOS Safari Güncellemesi Gerekli',
        subtitle: 'iOS 16.4 veya daha yeni sürüm gereklidir',
        steps: [
          'Ayarlar → Genel → Yazılım Güncellemesi',
          'iOS 16.4+ sürümüne güncelleyin',
          'Safari\'yi yeniden başlatın'
        ],
        actionText: 'iOS Ayarlarını Aç',
        actionUrl: 'App-Prefs:root=General&path=SOFTWARE_UPDATE_LINK'
      };
    }
    
    if (/Android/.test(userAgent)) {
      return {
        title: 'Chrome Güncellemesi Gerekli',
        subtitle: 'Chrome 78+ veya güncel Android WebView gereklidir',
        steps: [
          'Play Store → Chrome uygulaması',
          'Güncelle butonuna basın',
          'Sayfayı yenileyin'
        ],
        actionText: 'Play Store\'u Aç',
        actionUrl: 'https://play.google.com/store/apps/details?id=com.android.chrome'
      };
    }

    // Desktop/other browsers
    return {
      title: 'Tarayıcı Güncellemesi Önerilir',
      subtitle: 'Daha iyi deneyim için güncel tarayıcı kullanın',
      steps: [
        'Chrome, Firefox, Safari veya Edge güncel sürümü',
        'Tarayıcı ayarlarından bildirimleri etkinleştirin',
        'Bu sayfayı yenileyin'
      ],
      actionText: 'Tarayıcı İndirme Sayfası',
      actionUrl: 'https://browsehappy.com/'
    };
  };

  const instructions = getUpgradeInstructions();

  const handleActionClick = () => {
    try {
      // iOS settings için özel handling
      if (instructions.actionUrl.startsWith('App-Prefs:')) {
        // iOS settings denemesi - fallback ile
        window.location.href = instructions.actionUrl;
        // Fallback: manual instruction
        setTimeout(() => {
          alert('Ayarlar → Genel → Yazılım Güncellemesi yolunu takip edin');
        }, 1000);
      } else {
        // External URL
        window.open(instructions.actionUrl, '_blank');
      }
    } catch (error) {
      console.warn('Failed to open settings/url:', error);
      // Manual fallback
      alert(`${instructions.actionText}: ${instructions.actionUrl}`);
    }
  };

  return (
    <IonCard className={`unsupported-fallback ${className}`}>
      <IonCardContent className="p-4">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mb-4">
            <IonIcon 
              icon={warningOutline} 
              className="text-5xl text-orange-500"
            />
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2">
            {t('notifications.permission.status.unsupported')}
          </h3>

          {/* Reason */}
          <p className="text-sm text-muted-foreground mb-4">
            {reason || t('notifications.permission.messages.unsupported')}
          </p>

          {/* Upgrade Instructions */}
          {showUpgradeInfo && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <IonIcon icon={informationCircle} className="text-blue-500" />
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                  {instructions.title}
                </h4>
              </div>
              
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                {instructions.subtitle}
              </p>

              <ol className="text-sm text-blue-700 dark:text-blue-300 text-left space-y-1 mb-4">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="flex">
                    <span className="font-medium mr-2">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              <IonButton
                fill="outline"
                size="small"
                onClick={handleActionClick}
                className="text-blue-600 border-blue-600"
              >
                <IonIcon icon={openOutline} slot="start" />
                {instructions.actionText}
              </IonButton>
            </div>
          )}

          {/* Alternative Text */}
          <div className="text-xs text-muted-foreground">
            <p>
              Alternatif olarak masaüstü bilgisayarınızdan veya 
              güncel mobil tarayıcıdan erişmeyi deneyin.
            </p>
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default UnsupportedFallback;
