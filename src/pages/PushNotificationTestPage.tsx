import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
  IonIcon,
  IonBadge,
  IonSpinner,
  IonToast
} from '@ionic/react';
import { 
  notifications, 
  checkmark, 
  close, 
  warning,
  informationCircle,
  send
} from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { 
  pushNotificationService,
  getPushNotificationToken,
  getNotificationSettings,
  PushNotificationPayload
} from '../services/pushNotifications';

interface NotificationTest {
  id: string;
  name: string;
  description: string;
  payload: PushNotificationPayload;
}

const PushNotificationTestPage: React.FC = () => {
  const [isNative, setIsNative] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<{ [key: string]: 'success' | 'error' | 'pending' }>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const notificationTests: NotificationTest[] = [
    {
      id: 'new_movie',
      name: 'Yeni Film Bildirimi',
      description: 'Yeni çıkan film için bildirim testi',
      payload: {
        id: 'test_movie_1',
        title: 'Yeni Film Çıktı! 🎬',
        body: 'Avengers: Endgame artık izleme listenizde',
        type: 'new_release',
        data: {
          movieId: '299534',
          tmdbId: '299534',
          contentType: 'movie',
          deepLink: '/movie/299534'
        }
      }
    },
    {
      id: 'watchlist_reminder',
      name: 'İzleme Listesi Hatırlatması',
      description: 'İzleme listesindeki içerik için hatırlatma',
      payload: {
        id: 'test_reminder_1',
        title: 'İzleme Listesi Hatırlatması 📺',
        body: 'Stranger Things - 4. sezon henüz izlenmedi',
        type: 'watchlist_reminder',
        data: {
          seriesId: '66732',
          tmdbId: '66732',
          contentType: 'tv',
          deepLink: '/series/66732'
        }
      }
    }
  ];

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    setIsLoading(true);
    setIsNative(Capacitor.isNativePlatform());

    try {
      // FCM token'ı al
      const token = await getPushNotificationToken();
      setFcmToken(token);

      // Notification preferences'ı al
      const prefs = await getNotificationSettings();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to initialize push notification test page:', error);
      setToastMessage('Sayfa başlatılamadı: ' + error);
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const runNotificationTest = async (test: NotificationTest) => {
    setTestResults(prev => ({ ...prev, [test.id]: 'pending' }));

    try {
      // Test notification gönderimi
      await pushNotificationService.scheduleLocalNotification(test.payload);
      
      // Başarılı sonuç simülasyonu
      setTimeout(() => {
        setTestResults(prev => ({ ...prev, [test.id]: 'success' }));
        setToastMessage(`${test.name} başarıyla test edildi!`);
        setShowToast(true);
      }, 1000);

    } catch (error) {
      console.error('Notification test failed:', error);
      setTestResults(prev => ({ ...prev, [test.id]: 'error' }));
      setToastMessage(`Test başarısız: ${error}`);
      setShowToast(true);
    }
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Push Notification Test</IonTitle>
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
          <IonTitle>Push Notification Test</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        {/* Platform Durumu */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle className="flex items-center">
              <IonIcon icon={informationCircle} className="mr-2" />
              Platform Durumu
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel>Platform</IonLabel>
                <IonBadge color={isNative ? 'success' : 'warning'}>
                  {isNative ? 'Native (iOS/Android)' : 'Web Browser'}
                </IonBadge>
              </IonItem>
              
              <IonItem>
                <IonLabel>FCM Token</IonLabel>
                <IonBadge color={fcmToken ? 'success' : 'danger'}>
                  {fcmToken ? 'Mevcut' : 'Yok'}
                </IonBadge>
              </IonItem>

              <IonItem>
                <IonLabel>Bildirimler Etkin</IonLabel>
                <IonBadge color={preferences?.enabled ? 'success' : 'danger'}>
                  {preferences?.enabled ? 'Evet' : 'Hayır'}
                </IonBadge>
              </IonItem>
            </IonList>

            {!isNative && (
              <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Push notifications sadece native platformlarda (iOS/Android) çalışır.
                </p>
              </div>
            )}
          </IonCardContent>
        </IonCard>

        {/* Notification Testleri */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle className="flex items-center">
              <IonIcon icon={notifications} className="mr-2" />
              Notification Testleri
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              {notificationTests.map((test) => (
                <IonItem key={test.id}>
                  <IonLabel>
                    <h3>{test.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {test.description}
                    </p>
                  </IonLabel>
                  
                  <IonButton 
                    size="small" 
                    fill="clear" 
                    onClick={() => runNotificationTest(test)}
                    disabled={testResults[test.id] === 'pending'}
                  >
                    {testResults[test.id] === 'pending' ? <IonSpinner name="circular" /> : 'Test Et'}
                  </IonButton>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default PushNotificationTestPage;
