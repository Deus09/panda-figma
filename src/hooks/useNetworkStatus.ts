import { useState, useEffect } from 'react';
import { Network, ConnectionStatus } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

export interface NetworkStatus {
  isConnected: boolean;
  connectionType: string;
  isInitializing: boolean;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true, // Default olarak true başlatıyoruz
    connectionType: 'unknown',
    isInitializing: true,
  });

  useEffect(() => {
    const initializeNetworkStatus = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          // Native platform için Capacitor Network API kullan
          const status = await Network.getStatus();
          setNetworkStatus({
            isConnected: status.connected,
            connectionType: status.connectionType,
            isInitializing: false,
          });
        } else {
          // Web platform için navigator.onLine kullan
          setNetworkStatus({
            isConnected: navigator.onLine,
            connectionType: getWebConnectionType(),
            isInitializing: false,
          });
        }
      } catch (error) {
        console.error('Network status initialization error:', error);
        setNetworkStatus(prev => ({ ...prev, isInitializing: false }));
      }
    };

    const setupNetworkListener = () => {
      if (Capacitor.isNativePlatform()) {
        // Native platform listener
        let networkListenerHandle: any = null;
        
        const addNetworkListener = async () => {
          networkListenerHandle = await Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
            setNetworkStatus({
              isConnected: status.connected,
              connectionType: status.connectionType,
              isInitializing: false,
            });
          });
        };
        
        addNetworkListener();

        return () => {
          if (networkListenerHandle) {
            networkListenerHandle.remove();
          }
        };
      } else {
        // Web platform listeners
        const handleOnline = () => {
          setNetworkStatus(prev => ({
            ...prev,
            isConnected: true,
            connectionType: getWebConnectionType(),
          }));
        };

        const handleOffline = () => {
          setNetworkStatus(prev => ({
            ...prev,
            isConnected: false,
            connectionType: 'none',
          }));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }
    };

    initializeNetworkStatus();
    const cleanup = setupNetworkListener();

    return cleanup;
  }, []);

  // Web platformda connection type'ı tahmin etmeye çalış
  const getWebConnectionType = (): string => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        return connection.effectiveType || connection.type || 'unknown';
      }
    }
    return navigator.onLine ? 'unknown' : 'none';
  };

  return networkStatus;
};
