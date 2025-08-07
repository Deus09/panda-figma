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
  checkmarkCircle 
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { 
  getNotificationSettings, 
  updateNotificationSettings, 
  getPushNotificationToken,
  NotificationPreferences 
} from '../services/pushNotifications';

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
              disabled={isSaving}
            />
          </IonItem>

          {/* Alt Kategori Ayarları - Sadece ana ayar açıksa göster */}
          {preferences.enabled && (
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
                {fcmToken 
                  ? 'Cihaz push bildirimleri almaya hazır' 
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

          {/* Test Butonu (geliştirme amaçlı) */}
          {fcmToken && preferences.enabled && (
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
