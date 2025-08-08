import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonText,
  IonToast
} from '@ionic/react';
import {
  notifications,
  close,
  checkmarkCircle
} from 'ionicons/icons';
import { pushPermissionManager, PushPermissionStatus } from '../../services/pushPermissionManager';
import { errorLogger } from '../../utils/errors/logger';

interface NotificationPermissionBannerProps {
  className?: string;
  onStatusChange?: (status: PushPermissionStatus) => void;
}

const NotificationPermissionBanner: React.FC<NotificationPermissionBannerProps> = ({
  className = '',
  onStatusChange
}) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'warning' | 'danger'>('success');
  const [currentStatus, setCurrentStatus] = useState<PushPermissionStatus>('unknown');

  useEffect(() => {
    checkInitialStatus();
  }, []);

  const checkInitialStatus = async () => {
    try {
      const result = await pushPermissionManager.checkPermissionStatus();
      setCurrentStatus(result.status);

      // Banner'ı göster koşulları:
      // 1. Status unknown/prompt (henüz sorulmamış)
      // 2. Suppress edilmemiş
      // 3. Support var
      if ((result.status === 'unknown' || result.status === 'prompt') && result.canRequest) {
        const preferences = getLocalPermissionPrefs();
        
        // 24h suppress kontrolü
        if (preferences.suppressUntil && Date.now() < preferences.suppressUntil) {
          return; // Suppress edilmiş, gösterme
        }

        // Günlük limit kontrolü
        if (preferences.neverAskAgain) {
          return; // Kullanıcı "hiç sorma" demiş
        }

        setVisible(true);
      }
    } catch (error) {
      console.error('Error checking initial permission status:', error);
      errorLogger.log(error as Error, { context: 'NotificationPermissionBanner.checkInitialStatus' });
    }
  };

  const handleAllow = async () => {
    setIsRequesting(true);
    
    try {
      const result = await pushPermissionManager.requestPermission();
      setCurrentStatus(result.status);
      
      if (result.status === 'granted') {
        setToastMessage(t('notifications.permission.toast.granted'));
        setToastColor('success');
        setVisible(false);
        
        if (onStatusChange) {
          onStatusChange(result.status);
        }
      } else if (result.status === 'denied') {
        setToastMessage(t('notifications.permission.toast.denied'));
        setToastColor('danger');
        setVisible(false);
      } else {
        setToastMessage(t('notifications.permission.toast.error'));
        setToastColor('warning');
      }
      
      setShowToast(true);
    } catch (error) {
      console.error('Error requesting permission:', error);
      errorLogger.log(error as Error, { context: 'NotificationPermissionBanner.handleAllow' });
      
      setToastMessage(t('notifications.permission.toast.error'));
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleLater = () => {
    pushPermissionManager.suppressFor24Hours();
    setVisible(false);
    
    setToastMessage(t('notifications.permission.toast.suppressed'));
    setToastColor('warning');
    setShowToast(true);
  };

  const handleDismiss = () => {
    setVisible(false);
    
    // Simple suppress for this session
    const preferences = getLocalPermissionPrefs();
    setLocalPermissionPrefs({
      ...preferences,
      suppressUntil: Date.now() + (60 * 60 * 1000) // 1 hour
    });

    setToastMessage(t('notifications.permission.banner.dismissed'));
    setToastColor('warning');
    setShowToast(true);
  };

  // Basit localStorage helper'lar (pushPermissionManager'daki ile sync)
  const getLocalPermissionPrefs = () => {
    try {
      const stored = localStorage.getItem('push_permission_prefs');
      return stored ? JSON.parse(stored) : {
        status: 'unknown',
        promptCount: 0,
        neverAskAgain: false
      };
    } catch {
      return {
        status: 'unknown',
        promptCount: 0,
        neverAskAgain: false
      };
    }
  };

  const setLocalPermissionPrefs = (prefs: any) => {
    try {
      localStorage.setItem('push_permission_prefs', JSON.stringify(prefs));
    } catch (error) {
      console.warn('Failed to save permission preferences');
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <IonCard className={`notification-permission-banner ${className}`}>
        <IonCardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              <IonIcon 
                icon={notifications} 
                className="text-2xl text-primary"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1">
                {t('notifications.permission.banner_title')}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {t('notifications.permission.banner_subtitle')}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <IonButton
                  size="small"
                  fill="solid"
                  onClick={handleAllow}
                  disabled={isRequesting}
                >
                  <IonIcon icon={checkmarkCircle} slot="start" />
                  {t('notifications.permission.actions.allow')}
                </IonButton>

                <IonButton
                  size="small"
                  fill="outline"
                  color="medium"
                  onClick={handleLater}
                  disabled={isRequesting}
                >
                  {t('notifications.permission.actions.later')}
                </IonButton>
              </div>
            </div>

            {/* Close button */}
            <div className="flex-shrink-0">
              <IonButton
                fill="clear"
                size="small"
                onClick={handleDismiss}
                disabled={isRequesting}
                className="text-muted-foreground"
              >
                <IonIcon icon={close} />
              </IonButton>
            </div>
          </div>
        </IonCardContent>
      </IonCard>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="bottom"
        color={toastColor}
      />
    </>
  );
};

export default NotificationPermissionBanner;
