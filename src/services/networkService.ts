import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

export class NetworkService {
  
  /**
   * Current network status'unu kontrol eder
   */
  static async getNetworkStatus() {
    try {
      if (Capacitor.isNativePlatform()) {
        return await Network.getStatus();
      } else {
        return {
          connected: navigator.onLine,
          connectionType: navigator.onLine ? 'unknown' : 'none'
        };
      }
    } catch (error) {
      console.error('Network status check failed:', error);
      return {
        connected: true, // Hata durumunda conservative approach
        connectionType: 'unknown'
      };
    }
  }

  /**
   * Network bağlantısı var mı kontrol eder
   */
  static async isConnected(): Promise<boolean> {
    const status = await this.getNetworkStatus();
    return status.connected;
  }

  /**
   * API çağrıları için network kontrolü yapar
   * Offline ise cached data kullanımı önerilir
   */
  static async checkNetworkForApiCall(): Promise<{
    canMakeRequest: boolean;
    shouldUseCache: boolean;
    networkType: string;
  }> {
    const status = await this.getNetworkStatus();
    
    return {
      canMakeRequest: status.connected,
      shouldUseCache: !status.connected,
      networkType: status.connectionType
    };
  }

  /**
   * Bağlantı tipine göre data quality önerisi
   */
  static getDataQualityRecommendation(connectionType: string): 'high' | 'medium' | 'low' {
    switch (connectionType.toLowerCase()) {
      case 'wifi':
      case '4g':
        return 'high';
      case '3g':
        return 'medium';
      case '2g':
      case 'slow-2g':
        return 'low';
      default:
        return 'medium';
    }
  }

  /**
   * Network değişikliklerini dinleyen utility
   */
  static addNetworkListener(callback: (status: any) => void) {
    if (Capacitor.isNativePlatform()) {
      return Network.addListener('networkStatusChange', callback);
    } else {
      const handleOnline = () => callback({ connected: true, connectionType: 'unknown' });
      const handleOffline = () => callback({ connected: false, connectionType: 'none' });
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return {
        remove: () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        }
      };
    }
  }
}
