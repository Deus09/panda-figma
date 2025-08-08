import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonButton,
  IonIcon,
  IonSpinner,
  IonToast,
  IonBackButton,
  IonButtons,
} from '@ionic/react';
import { 
  notifications, 
  film, 
  tv, 
  star, 
  alertCircle,
  checkmarkCircle,
  bugOutline 
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { 
  getNotificationSettings, 
  updateNotificationSettings, 
  getPushNotificationToken,
  NotificationPreferences,
  pushNotificationService 
} from '../services/pushNotifications';
import NotificationPermissionCard from '../components/notifications/NotificationPermissionCard';
import UnsupportedFallback from '../components/notifications/UnsupportedFallback';
import { PermissionStatusResult } from '../services/pushPermissionManager';

const NotificationSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: false,
    newReleases: false,
    watchlistReminders: false,
    seasonFinales: false,
    recommendations: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatusResult | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    loadNotificationSettings();
    loadFCMToken();
    loadPermissionStatus();
  }, []);

  const loadPermissionStatus = async () => {
    try {
      const status = await pushNotificationService.checkPermissionStatus();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Failed to load permission status:', error);
    }
  };

  const loadDebugInfo = async () => {
    try {
      const info = await pushNotificationService.getDebugInfo();
      setDebugInfo(info);
      setShowDebugInfo(true);
    } catch (error) {
      console.error('Failed to load debug info:', error);
    }
  };

  useEffect(() => {
    loadNotificationSettings();
    loadFCMToken();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      setIsLoading(true);
      const settings = await getNotificationSettings();
      setPreferences(settings);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      setToastMessage('Bildirim ayarları yüklenemedi');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFCMToken = async () => {
    try {
      const token = await getPushNotificationToken();
      setFcmToken(token);
    } catch (error) {
      console.error('Failed to load FCM token:', error);
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    // Permission kontrolü
    if (key === 'enabled' && value && permissionStatus?.status !== 'granted') {
      setToastMessage('Önce bildirim izni vermelisiniz');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    try {
      const newPreferences = { ...preferences, [key]: value };
      
      // Ana bildirimleri kapatıyorsa, diğerlerini de kapat
      if (key === 'enabled' && !value) {
        newPreferences.newReleases = false;
        newPreferences.watchlistReminders = false;
        newPreferences.seasonFinales = false;
        newPreferences.recommendations = false;
      }
      
      setPreferences(newPreferences);
      
      setIsSaving(true);
      await updateNotificationSettings(newPreferences);
      
      setToastMessage('Ayarlar başarıyla güncellendi');
      setToastColor('success');
      setShowToast(true);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      setToastMessage('Ayarlar güncellenemedi');
      setToastColor('danger');
      setShowToast(true);
      
      // Hata durumunda eski ayarları geri yükle
      loadNotificationSettings();
    } finally {
      setIsSaving(false);
    }
  };

  const handlePermissionStatusChange = (result: PermissionStatusResult) => {
    setPermissionStatus(result);
    
    // Token'ı yeniden yükle
    loadFCMToken();
    
    // Preferences'ları güncelle
    if (result.status === 'granted' && !preferences.enabled) {
      // Auto-enable notifications when permission granted
      handlePreferenceChange('enabled', true);
    } else if (result.status === 'denied' && preferences.enabled) {
      // Auto-disable if permission lost
      handlePreferenceChange('enabled', false);
    }
  };

  const handleTestNotification = async () => {
    // Test bildirimi gönderme (geliştirme amaçlı)
    setToastMessage('Test bildirimi gönderildi (geliştirme modu)');
    setToastColor('success');
    setShowToast(true);
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/profile" />
            </IonButtons>
            <IonTitle>Bildirim Ayarları</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="flex justify-center items-center h-64">
            <IonSpinner name="circular" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" />
          </IonButtons>
          <IonTitle>Bildirim Ayarları</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        {/* Permission Status Card */}
        {permissionStatus?.status === 'unsupported' ? (
          <div className="p-4">
            <UnsupportedFallback 
              reason={permissionStatus.message}
              showUpgradeInfo={true}
            />
          </div>
        ) : (
          <div className="p-4">
            <NotificationPermissionCard 
              onStatusChange={handlePermissionStatusChange}
            />
          </div>
        )}

        <IonList className="py-4">
          {/* Ana Bildirim Ayarı */}
          <IonItem>
            <IonIcon icon={notifications} slot="start" className="text-primary" />
            <IonLabel>
              <h2 className="font-semibold">Push Bildirimleri</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tüm push bildirimlerini etkinleştir/devre dışı bırak
              </p>
            </IonLabel>
            <IonToggle 
              checked={preferences.enabled} 
              onIonChange={(e) => handlePreferenceChange('enabled', e.detail.checked)}
              disabled={isSaving || permissionStatus?.status !== 'granted'}
            />
          </IonItem>

          {/* Alt Kategori Ayarları - Sadece ana ayar açık ve permission granted ise göster */}
          {preferences.enabled && permissionStatus?.status === 'granted' && (
            <>
              <div className="px-4 py-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Bildirim Türleri
                </h3>
              </div>

              <IonItem>
                <IonIcon icon={film} slot="start" className="text-blue-500" />
                <IonLabel>
                  <h3>Yeni Çıkan Filmler</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    İlgilendiğiniz türlerde yeni filmler çıktığında bildirim alın
                  </p>
                </IonLabel>
                <IonToggle 
                  checked={preferences.newReleases} 
                  onIonChange={(e) => handlePreferenceChange('newReleases', e.detail.checked)}
                  disabled={isSaving}
                />
              </IonItem>

              <IonItem>
                <IonIcon icon={alertCircle} slot="start" className="text-orange-500" />
                <IonLabel>
                  <h3>İzleme Listesi Hatırlatmaları</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    İzleme listenizdeki içerikler için hatırlatmalar
                  </p>
                </IonLabel>
                <IonToggle 
                  checked={preferences.watchlistReminders} 
                  onIonChange={(e) => handlePreferenceChange('watchlistReminders', e.detail.checked)}
                  disabled={isSaving}
                />
              </IonItem>

              <IonItem>
                <IonIcon icon={tv} slot="start" className="text-purple-500" />
                <IonLabel>
                  <h3>Sezon Finalleri</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Takip ettiğiniz dizilerin sezon finalleri için bildirimler
                  </p>
                </IonLabel>
                <IonToggle 
                  checked={preferences.seasonFinales} 
                  onIonChange={(e) => handlePreferenceChange('seasonFinales', e.detail.checked)}
                  disabled={isSaving}
                />
              </IonItem>

              <IonItem>
                <IonIcon icon={star} slot="start" className="text-yellow-500" />
                <IonLabel>
                  <h3>Öneriler</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    İzleme geçmişinize göre kişiselleştirilmiş öneriler
                  </p>
                </IonLabel>
                <IonToggle 
                  checked={preferences.recommendations} 
                  onIonChange={(e) => handlePreferenceChange('recommendations', e.detail.checked)}
                  disabled={isSaving}
                />
              </IonItem>
            </>
          )}

          {/* Durum Bilgisi */}
          <div className="px-4 py-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center">
                <IonIcon 
                  icon={fcmToken ? checkmarkCircle : alertCircle} 
                  className={`mr-2 ${fcmToken ? 'text-green-500' : 'text-orange-500'}`}
                />
                Bildirim Durumu
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {permissionStatus?.status === 'granted' && fcmToken 
                  ? 'Cihaz push bildirimleri almaya hazır' 
                  : permissionStatus?.status === 'denied'
                  ? 'Bildirim izni reddedildi'
                  : permissionStatus?.status === 'unsupported'
                  ? 'Bu cihaz/tarayıcı desteklenmiyor'
                  : 'Push bildirimleri henüz etkinleştirilmedi'
                }
              </p>
              {fcmToken && (
                <p className="text-xs text-gray-500 dark:text-gray-500 font-mono break-all">
                  Token: {fcmToken.substring(0, 20)}...
                </p>
              )}
            </div>
          </div>

          {/* Test Butonu (sadece granted durumunda) */}
          {fcmToken && preferences.enabled && permissionStatus?.status === 'granted' && (
            <div className="px-4 py-2">
              <IonButton 
                expand="block" 
                fill="outline" 
                onClick={handleTestNotification}
                className="mt-2"
              >
                Test Bildirimi Gönder
              </IonButton>
            </div>
          )}

          {/* Debug Info (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="px-4 py-2">
              <IonButton 
                expand="block" 
                fill="clear" 
                size="small"
                onClick={loadDebugInfo}
                className="mt-2"
              >
                <IonIcon icon={bugOutline} slot="start" />
                Debug Info
              </IonButton>
              
              {showDebugInfo && debugInfo && (
                <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded p-3">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </IonList>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default NotificationSettingsPage;
