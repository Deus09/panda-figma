import React from 'react';
import { IonChip, IonIcon } from '@ionic/react';
import { cloudOfflineOutline, wifiOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useNetwork } from '../context/NetworkContext';

interface OfflineIndicatorProps {
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const { isConnected, connectionType, isInitializing } = useNetwork();
  const { t } = useTranslation();

  // Hala başlatılıyor veya bağlantı varsa gösterme
  if (isInitializing || isConnected) {
    return null;
  }

  return (
    <IonChip 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
      color="danger"
    >
      <IonIcon icon={cloudOfflineOutline} />
      <span className="ml-1">{t('network.offline')}</span>
    </IonChip>
  );
};

interface NetworkStatusIndicatorProps {
  showWhenOnline?: boolean;
  className?: string;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({ 
  showWhenOnline = false,
  className = '' 
}) => {
  const { isConnected, connectionType, isInitializing } = useNetwork();
  const { t } = useTranslation();

  if (isInitializing) {
    return null;
  }

  if (isConnected && !showWhenOnline) {
    return null;
  }

  const getConnectionDisplayName = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'wifi':
        return t('network.wifi');
      case 'cellular':
        return t('network.cellular');
      case '4g':
        return '4G';
      case '3g':
        return '3G';
      case '2g':
        return '2G';
      case 'slow-2g':
        return 'Slow 2G';
      case 'none':
        return t('network.disconnected');
      default:
        return 'Unknown';
    }
  };

  return (
    <IonChip 
      className={`${className}`}
      color={isConnected ? 'success' : 'danger'}
    >
      <IonIcon icon={isConnected ? wifiOutline : cloudOfflineOutline} />
      <span className="ml-1">
        {isConnected 
          ? `${getConnectionDisplayName(connectionType)} ${t('network.connected')}`
          : t('network.offline')
        }
      </span>
    </IonChip>
  );
};
