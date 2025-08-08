import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonText
} from '@ionic/react';
import {
  close,
  checkmarkCircle,
  film,
  tv,
  star,
  people,
  notifications
} from 'ionicons/icons';

interface NotificationExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow?: () => void;
  canRequest: boolean;
}

const NotificationExplanationModal: React.FC<NotificationExplanationModalProps> = ({
  isOpen,
  onClose,
  onAllow,
  canRequest
}) => {
  const { t } = useTranslation();

  const explanationPoints = [
    {
      icon: film,
      color: 'text-blue-500',
      text: t('notifications.permission.explanation.points.0') // Watchlist releases
    },
    {
      icon: star,
      color: 'text-yellow-500', 
      text: t('notifications.permission.explanation.points.1') // Favorite genres
    },
    {
      icon: tv,
      color: 'text-purple-500',
      text: t('notifications.permission.explanation.points.2') // New seasons
    },
    {
      icon: notifications,
      color: 'text-green-500',
      text: t('notifications.permission.explanation.points.3') // Recommendations
    },
    {
      icon: people,
      color: 'text-orange-500',
      text: t('notifications.permission.explanation.points.4') // Friends activity
    }
  ];

  const handleAllow = () => {
    if (onAllow) {
      onAllow();
    }
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('notifications.permission.explanation.title')}</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <div className="p-4">
          {/* Hero Section */}
          <div className="text-center mb-6">
            <div className="mb-4">
              <IonIcon 
                icon={notifications} 
                className="text-6xl text-primary"
              />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {t('notifications.permission.explanation.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('notifications.permission.explanation.subtitle')}
            </p>
          </div>

          {/* Benefits List */}
          <IonList className="mb-6">
            {explanationPoints.map((point, index) => (
              <IonItem key={index} className="mb-2">
                <IonIcon 
                  icon={point.icon}
                  slot="start" 
                  className={`text-xl ${point.color}`}
                />
                <IonLabel className="ion-text-wrap">
                  <p className="text-sm text-foreground">
                    {point.text}
                  </p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>

          {/* Privacy Note */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <h4 className="font-semibold mb-2 flex items-center">
              <IonIcon icon={checkmarkCircle} className="text-green-500 mr-2" />
              Gizlilik
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Bildirimleri istediğiniz zaman kapatabilirsiniz</li>
              <li>• Kişisel bilgileriniz paylaşılmaz</li>
              <li>• Sadece seçtiğiniz kategorilerde bildirim alırsınız</li>
              <li>• Spam göndermiyoruz, sadece değerli içerik</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {canRequest && (
              <IonButton 
                expand="block" 
                fill="solid"
                size="large"
                onClick={handleAllow}
              >
                <IonIcon icon={checkmarkCircle} slot="start" />
                {t('notifications.permission.actions.allow')}
              </IonButton>
            )}

            <IonButton 
              expand="block" 
              fill="outline"
              color="medium"
              size="large"
              onClick={onClose}
            >
              {canRequest 
                ? t('notifications.permission.actions.later') 
                : t('notifications.permission.actions.dismiss')
              }
            </IonButton>

            {!canRequest && (
              <div className="text-center">
                <IonText color="warning">
                  <p className="text-sm">
                    {t('notifications.permission.messages.settings_help')}
                  </p>
                </IonText>
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default NotificationExplanationModal;
