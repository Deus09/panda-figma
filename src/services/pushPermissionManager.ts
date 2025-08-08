// Push notification permission states and utilities
export type PushPermissionStatus = 
  | 'unknown'      // İlk defa sorulmamış
  | 'granted'      // İzin verilmiş
  | 'denied'       // İzin reddedilmiş
  | 'prompt'       // Tarayıcı prompt gösterecek
  | 'unsupported'  // Platform/tarayıcı desteklemiyor
  | 'restricted';  // OS/Focus mode tarafından kısıtlanmış

export interface PermissionStatusResult {
  status: PushPermissionStatus;
  canRequest: boolean;
  message?: string;
  supportsBrowser?: boolean;
  supportsNative?: boolean;
}

export interface PushPermissionPreferences {
  status: PushPermissionStatus;
  lastPromptAt?: number;
  promptCount: number;
  suppressUntil?: number; // 24h suppress için timestamp
  neverAskAgain: boolean;
}

export class PushPermissionManager {
  private readonly MAX_DAILY_PROMPTS = 3;
  private readonly SUPPRESS_DURATION = 24 * 60 * 60 * 1000; // 24 saat

  /**
   * Mevcut permission durumunu kontrol eder
   */
  async checkPermissionStatus(): Promise<PermissionStatusResult> {
    try {
      // Platform desteği kontrolü
      const platformSupport = this.checkPlatformSupport();
      if (!platformSupport.supported) {
        return {
          status: 'unsupported',
          canRequest: false,
          message: platformSupport.reason,
          supportsBrowser: platformSupport.browser,
          supportsNative: platformSupport.native
        };
      }

      // Native platform (iOS/Android)
      if (platformSupport.native) {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        const result = await PushNotifications.checkPermissions();
        
        return {
          status: this.mapNativePermission(result.receive),
          canRequest: result.receive !== 'denied',
          supportsNative: true,
          supportsBrowser: false
        };
      }

      // Browser platform
      if (platformSupport.browser && 'Notification' in window) {
        const permission = Notification.permission;
        
        return {
          status: this.mapBrowserPermission(permission),
          canRequest: permission !== 'denied',
          supportsNative: false,
          supportsBrowser: true
        };
      }

      return {
        status: 'unsupported',
        canRequest: false,
        message: 'Push notifications not supported',
        supportsBrowser: false,
        supportsNative: false
      };

    } catch (error) {
      console.error('Error checking permission status:', error);
      return {
        status: 'unknown',
        canRequest: false,
        message: 'Error checking permissions',
        supportsBrowser: false,
        supportsNative: false
      };
    }
  }

  /**
   * Permission isteme işlemi
   */
  async requestPermission(): Promise<PermissionStatusResult> {
    try {
      const current = await this.checkPermissionStatus();
      
      if (!current.canRequest) {
        return current;
      }

      // Throttling kontrolü
      const preferences = this.getPermissionPreferences();
      if (this.shouldSuppressPrompt(preferences)) {
        return {
          status: 'denied',
          canRequest: false,
          message: 'Permission request suppressed (daily limit or user preference)'
        };
      }

      // Native request
      if (current.supportsNative) {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        const result = await PushNotifications.requestPermissions();
        
        const newStatus = this.mapNativePermission(result.receive);
        this.updatePermissionPreferences(newStatus);
        
        return {
          status: newStatus,
          canRequest: result.receive !== 'denied',
          supportsNative: true
        };
      }

      // Browser request
      if (current.supportsBrowser && 'Notification' in window) {
        const result = await Notification.requestPermission();
        const newStatus = this.mapBrowserPermission(result);
        this.updatePermissionPreferences(newStatus);
        
        return {
          status: newStatus,
          canRequest: result !== 'denied',
          supportsBrowser: true
        };
      }

      return current;

    } catch (error) {
      console.error('Error requesting permission:', error);
      return {
        status: 'denied',
        canRequest: false,
        message: 'Error requesting permission'
      };
    }
  }

  /**
   * Platform desteği kontrolü
   */
  private checkPlatformSupport(): { supported: boolean; native: boolean; browser: boolean; reason?: string } {
    // Capacitor native platform kontrolü
    try {
      const { Capacitor } = require('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        return { supported: true, native: true, browser: false };
      }
    } catch (e) {
      // Capacitor yüklü değil, browser fallback
    }

    // Browser support kontrolü
    if (typeof window !== 'undefined') {
      // Service Worker desteği
      if (!('serviceWorker' in navigator)) {
        return { 
          supported: false, 
          native: false, 
          browser: false,
          reason: 'Service Worker not supported'
        };
      }

      // Notification API desteği
      if (!('Notification' in window)) {
        return { 
          supported: false, 
          native: false, 
          browser: false,
          reason: 'Notification API not supported'
        };
      }

      // iOS Safari özel durumu (16+ destekler)
      const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOSSafari) {
        // iOS 16.4+ check (rough)
        const match = navigator.userAgent.match(/OS (\d+)_(\d+)/);
        if (match) {
          const majorVersion = parseInt(match[1]);
          const minorVersion = parseInt(match[2]);
          if (majorVersion < 16 || (majorVersion === 16 && minorVersion < 4)) {
            return { 
              supported: false, 
              native: false, 
              browser: false,
              reason: 'iOS Safari version too old (requires 16.4+)'
            };
          }
        }
      }

      return { supported: true, native: false, browser: true };
    }

    return { 
      supported: false, 
      native: false, 
      browser: false,
      reason: 'No window object (SSR?)'
    };
  }

  /**
   * Native platform permission mapping
   */
  private mapNativePermission(permission: string): PushPermissionStatus {
    switch (permission) {
      case 'granted': return 'granted';
      case 'denied': return 'denied';
      case 'prompt': return 'prompt';
      default: return 'unknown';
    }
  }

  /**
   * Browser permission mapping
   */
  private mapBrowserPermission(permission: NotificationPermission): PushPermissionStatus {
    switch (permission) {
      case 'granted': return 'granted';
      case 'denied': return 'denied';
      case 'default': return 'prompt';
      default: return 'unknown';
    }
  }

  /**
   * LocalStorage'dan permission preferences al
   */
  private getPermissionPreferences(): PushPermissionPreferences {
    try {
      const stored = localStorage.getItem('push_permission_prefs');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse push permission preferences');
    }

    return {
      status: 'unknown',
      promptCount: 0,
      neverAskAgain: false
    };
  }

  /**
   * Permission preferences güncelle
   */
  private updatePermissionPreferences(newStatus: PushPermissionStatus): void {
    try {
      const current = this.getPermissionPreferences();
      const now = Date.now();

      const updated: PushPermissionPreferences = {
        ...current,
        status: newStatus,
        lastPromptAt: now,
        promptCount: current.promptCount + 1
      };

      // Eğer denied ise ve çok fazla denenmişse neverAskAgain aktive et
      if (newStatus === 'denied' && updated.promptCount >= this.MAX_DAILY_PROMPTS) {
        updated.neverAskAgain = true;
      }

      localStorage.setItem('push_permission_prefs', JSON.stringify(updated));

      // Ana UserPreferences'a da kaydet (compat)
      try {
        const { LocalStorageService } = require('../localStorage');
        const userPrefs = LocalStorageService.getUserPreferences();
        if (userPrefs) {
          LocalStorageService.saveUserPreferences({
            ...userPrefs,
            pushPermissionStatus: newStatus
          });
        }
      } catch (e) {
        console.warn('Failed to sync with UserPreferences:', e);
      }

    } catch (error) {
      console.error('Failed to update permission preferences:', error);
    }
  }

  /**
   * Prompt suppress kontrolü
   */
  private shouldSuppressPrompt(prefs: PushPermissionPreferences): boolean {
    const now = Date.now();

    // Never ask again aktifse
    if (prefs.neverAskAgain) {
      return true;
    }

    // Suppress until timestamp varsa ve henüz geçmemişse
    if (prefs.suppressUntil && now < prefs.suppressUntil) {
      return true;
    }

    // Günlük limit kontrolü
    if (prefs.lastPromptAt) {
      const daysSince = (now - prefs.lastPromptAt) / (24 * 60 * 60 * 1000);
      if (daysSince < 1 && prefs.promptCount >= this.MAX_DAILY_PROMPTS) {
        return true;
      }
    }

    return false;
  }

  /**
   * "Daha sonra" seçeneği için 24h suppress
   */
  suppressFor24Hours(): void {
    try {
      const current = this.getPermissionPreferences();
      const updated: PushPermissionPreferences = {
        ...current,
        suppressUntil: Date.now() + this.SUPPRESS_DURATION
      };
      
      localStorage.setItem('push_permission_prefs', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to set suppress timestamp:', error);
    }
  }

  /**
   * Never ask again flag'i temizle (settings'den manuel enable için)
   */
  resetNeverAskAgain(): void {
    try {
      const current = this.getPermissionPreferences();
      const updated: PushPermissionPreferences = {
        ...current,
        neverAskAgain: false,
        suppressUntil: undefined
      };
      
      localStorage.setItem('push_permission_prefs', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to reset never ask again flag:', error);
    }
  }

  /**
   * Platform-specific settings açma talimatları
   */
  getSettingsInstructions(): { title: string; steps: string[] } {
    const userAgent = navigator.userAgent;
    
    if (/iPhone|iPad/.test(userAgent)) {
      return {
        title: 'iOS Safari Bildirimleri Etkinleştirme',
        steps: [
          'Ayarlar → Safari → Bildirimler',
          'Bu site için bildirimleri "İzin Ver" olarak ayarla',
          'Sayfayı yenileyip tekrar dene'
        ]
      };
    }
    
    if (/Android/.test(userAgent)) {
      return {
        title: 'Android Chrome Bildirimleri Etkinleştirme',
        steps: [
          'Chrome → ⋮ (menü) → Ayarlar → Site ayarları → Bildirimler',
          'Bu siteyi bulup "İzin Ver" seç',
          'Sayfayı yenileyip tekrar dene'
        ]
      };
    }

    // Desktop fallback
    return {
      title: 'Tarayıcı Bildirim Ayarları',
      steps: [
        'Adres çubuğundaki kilit ikonuna tıkla',
        'Bildirimler → "İzin Ver" seç',
        'Sayfayı yenileyip tekrar dene'
      ]
    };
  }
}

// Singleton instance
export const pushPermissionManager = new PushPermissionManager();
