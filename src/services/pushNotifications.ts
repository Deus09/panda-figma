import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { LocalStorageService } from './localStorage';
import { pushPermissionManager } from './pushPermissionManager';
import { errorLogger } from '../utils/errors/logger';
import { NetworkError, AppError } from '../utils/errors/errorTypes';

export interface NotificationPreferences {
  enabled: boolean;
  newReleases: boolean;
  watchlistReminders: boolean;
  seasonFinales: boolean;
  recommendations: boolean;
}

export interface PushNotificationPayload {
  id: string;
  title: string;
  body: string;
  type: 'new_release' | 'watchlist_reminder' | 'season_finale' | 'recommendation' | 'general';
  data?: {
    movieId?: string;
    seriesId?: string;
    tmdbId?: string;
    contentType?: 'movie' | 'tv';
    deepLink?: string;
  };
}

class PushNotificationService {
  private isInitialized = false;
  private registrationToken: string | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Permission status kontrolü via permission manager
      const permissionResult = await pushPermissionManager.checkPermissionStatus();
      
      if (permissionResult.status === 'unsupported') {
        console.log('Push notifications not supported on this platform:', permissionResult.message);
        throw new AppError('Push notifications not supported', 'PUSH_UNSUPPORTED', 'low');
      }

      if (permissionResult.status === 'denied') {
        throw new AppError('Push notification permission denied', 'PUSH_DENIED', 'medium');
      }

      // Permission yoksa iste
      if (permissionResult.status !== 'granted') {
        const requestResult = await pushPermissionManager.requestPermission();
        if (requestResult.status !== 'granted') {
          throw new AppError(
            `Permission not granted: ${requestResult.status}`, 
            'PUSH_PERMISSION_FAILED', 
            'medium'
          );
        }
      }

      // Platform-specific initialization
      if (Capacitor.isNativePlatform()) {
        await this.initializeNative();
      } else if (permissionResult.supportsBrowser) {
        await this.initializeBrowser();
      }

      this.isInitialized = true;
      console.log('Push notifications initialized successfully');
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      errorLogger.log(error as Error, { 
        context: 'PushNotificationService.initialize',
        platform: Capacitor.getPlatform(),
        isNative: Capacitor.isNativePlatform()
      });
      throw error;
    }
  }

  private async initializeNative(): Promise<void> {
    // Event listener'ları kaydet
    this.registerEventListeners();

    // FCM token için kayıt yap
    await PushNotifications.register();
  }

  private async initializeBrowser(): Promise<void> {
    // Service Worker registration
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // Push manager ile subscription oluştur
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.getVapidPublicKey()
        });
        
        // Subscription token'ını kaydet
        this.registrationToken = JSON.stringify(subscription);
        this.saveTokenToStorage(this.registrationToken);
        
        console.log('Browser push subscription created');
      } catch (error) {
        throw new NetworkError('Failed to register service worker for push notifications', {
          originalError: error
        });
      }
    }
  }

  private getVapidPublicKey(): ArrayBuffer {
    // VAPID public key - bu gerçek bir public key olmalı
    const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || 
      'BEl62iUYgUivxIkv69yViEuiBIa40HI80NqrCrUIc9L7kqDTMoB5dONJF3C2iC6i4c2pNJHTAw6l2w4PWqJ9xUw';
    
    const padding = '='.repeat((4 - vapidPublicKey.length % 4) % 4);
    const base64 = (vapidPublicKey + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
      
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray.buffer;
  }

  private registerEventListeners(): void {
    // Registration başarılı olduğunda
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Registration token: ', token.value);
      this.registrationToken = token.value;
      this.saveTokenToStorage(token.value);
    });

    // Registration başarısız olduğunda
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Registration error: ', error.message);
    });

    // Push notification geldiğinde (uygulama açıkken)
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received: ', notification);
      this.handleForegroundNotification(notification);
    });

    // Notification'a tıklandığında (uygulama kapalıyken)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push notification action performed: ', notification);
      this.handleNotificationAction(notification);
    });
  }

  private handleForegroundNotification(notification: PushNotificationSchema): void {
    // Uygulama açıkken gelen bildirimleri işle
    // Toast notification göster veya modal aç
    const customData = notification.data as PushNotificationPayload['data'];
    
    // Bu bildirim için uygun eylemi gerçekleştir
    if (customData?.deepLink) {
      // Deep link handling için event emit et
      document.dispatchEvent(new CustomEvent('push-notification-received', {
        detail: { notification, data: customData }
      }));
    }
  }

  private handleNotificationAction(actionPerformed: ActionPerformed): void {
    // Notification'a tıklama sonrası eylemler
    const notification = actionPerformed.notification;
    const customData = notification.data as PushNotificationPayload['data'];

    if (customData) {
      // Deep link handling
      if (customData.deepLink) {
        document.dispatchEvent(new CustomEvent('push-notification-action', {
          detail: { data: customData }
        }));
      }

      // Content'e yönlendirme
      if (customData.movieId || customData.seriesId) {
        document.dispatchEvent(new CustomEvent('push-notification-content', {
          detail: {
            contentType: customData.contentType,
            id: customData.movieId || customData.seriesId,
            tmdbId: customData.tmdbId
          }
        }));
      }
    }
  }

  private saveTokenToStorage(token: string): void {
    try {
      localStorage.setItem('fcm_token', token);
      
      // User preferences'a da kaydet
      const prefs = LocalStorageService.getUserPreferences();
      if (prefs) {
        LocalStorageService.saveUserPreferences({
          ...prefs,
          fcmToken: token
        });
      }
    } catch (error) {
      console.error('Failed to save FCM token:', error);
    }
  }

  async getRegistrationToken(): Promise<string | null> {
    if (this.registrationToken) {
      return this.registrationToken;
    }

    // Storage'dan token'ı al
    try {
      const storedToken = localStorage.getItem('fcm_token');
      if (storedToken) {
        this.registrationToken = storedToken;
        return storedToken;
      }
    } catch (error) {
      console.error('Failed to get stored FCM token:', error);
    }

    return null;
  }

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      const prefs = LocalStorageService.getUserPreferences();
      return prefs?.notificationPreferences || {
        enabled: true,
        newReleases: true,
        watchlistReminders: true,
        seasonFinales: true,
        recommendations: true
      };
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
      return {
        enabled: false,
        newReleases: false,
        watchlistReminders: false,
        seasonFinales: false,
        recommendations: false
      };
    }
  }

  async updateNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      const currentPrefs = LocalStorageService.getUserPreferences();
      if (currentPrefs) {
        LocalStorageService.saveUserPreferences({
          ...currentPrefs,
          notificationPreferences: preferences
        });
      }

      // Backend'e de gönder (eğer varsa)
      const token = await this.getRegistrationToken();
      if (token) {
        // Bu kısım backend implementasyonuna göre değişecek
        console.log('Notification preferences updated:', preferences);
      }
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }

  async scheduleLocalNotification(payload: PushNotificationPayload, delay: number = 0): Promise<void> {
    // Local notification için gelecekte eklenebilecek fonksiyonalite
    // Şu an için sadece log
    console.log('Local notification scheduled:', payload, 'delay:', delay);
  }

  async removeAllDeliveredNotifications(): Promise<void> {
    try {
      await PushNotifications.removeAllDeliveredNotifications();
    } catch (error) {
      console.error('Failed to remove delivered notifications:', error);
    }
  }

  async getDeliveredNotifications(): Promise<any[]> {
    try {
      const result = await PushNotifications.getDeliveredNotifications();
      return result.notifications || [];
    } catch (error) {
      console.error('Failed to get delivered notifications:', error);
      return [];
    }
  }

  // Backend ile token senkronizasyonu için
  async syncTokenWithBackend(userId?: string): Promise<void> {
    const token = await this.getRegistrationToken();
    if (!token) {
      console.warn('No FCM token available for sync');
      return;
    }

    try {
      // Bu kısım backend API'nize göre implementasyonu yapılacak
      console.log('Syncing FCM token with backend:', token, 'for user:', userId);
      
      // Örnek API çağrısı:
      // const response = await fetch('/api/user/fcm-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, userId })
      // });
      
    } catch (error) {
      console.error('Failed to sync FCM token with backend:', error);
      errorLogger.log(error as Error, {
        context: 'PushNotificationService.syncTokenWithBackend',
        userId,
        hasToken: !!token
      });
    }
  }

  /**
   * Permission durumu kontrolü
   */
  async checkPermissionStatus() {
    return pushPermissionManager.checkPermissionStatus();
  }

  /**
   * Permission isteme
   */
  async requestPermission() {
    return pushPermissionManager.requestPermission();
  }

  /**
   * Platform desteği kontrolü
   */
  isSupported(): boolean {
    // Native platform her zaman desteklenir
    if (Capacitor.isNativePlatform()) {
      return true;
    }

    // Browser için detaylı kontrol
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }

  /**
   * Registration durumu ve debug bilgisi
   */
  async getDebugInfo() {
    try {
      const permissionResult = await this.checkPermissionStatus();
      const token = await this.getRegistrationToken();
      const preferences = await this.getNotificationPreferences();

      return {
        isInitialized: this.isInitialized,
        platform: Capacitor.getPlatform(),
        isNative: Capacitor.isNativePlatform(),
        isSupported: this.isSupported(),
        permissionStatus: permissionResult.status,
        canRequest: permissionResult.canRequest,
        hasToken: !!token,
        tokenLength: token?.length || 0,
        preferences,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Singleton instance
export const pushNotificationService = new PushNotificationService();

// Utility fonksiyonlar
export const initializePushNotifications = async (): Promise<void> => {
  return pushNotificationService.initialize();
};

export const getPushNotificationToken = async (): Promise<string | null> => {
  return pushNotificationService.getRegistrationToken();
};

export const updateNotificationSettings = async (preferences: NotificationPreferences): Promise<void> => {
  return pushNotificationService.updateNotificationPreferences(preferences);
};

export const getNotificationSettings = async (): Promise<NotificationPreferences> => {
  return pushNotificationService.getNotificationPreferences();
};
