import React from 'react';
import { IonToast } from '@ionic/react';
import { useTranslation } from 'react-i18next';

interface NetworkErrorToastProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  message?: string;
}

export const NetworkErrorToast: React.FC<NetworkErrorToastProps> = ({
  isOpen,
  onDidDismiss,
  message
}) => {
  const { t } = useTranslation();
  
  const getErrorMessage = (msg?: string): string => {
    if (!msg) return t('network.network_error');
    
    if (msg.includes('No network connection')) {
      return t('network.no_connection');
    }
    
    if (msg.includes('timeout')) {
      return t('network.timeout_error');
    }
    
    if (msg.includes('Failed to fetch')) {
      return t('network.server_error');
    }
    
    return t('network.network_error');
  };

  return (
    <IonToast
      isOpen={isOpen}
      onDidDismiss={onDidDismiss}
      message={getErrorMessage(message)}
      duration={4000}
      position="top"
      color="danger"
      buttons={[
        {
          text: t('common.done'),
          role: 'cancel'
        }
      ]}
    />
  );
};

// Hook for handling network errors consistently
export const useNetworkErrorHandler = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [showToast, setShowToast] = React.useState(false);

  const handleNetworkError = (err: Error | string) => {
    const message = typeof err === 'string' ? err : err.message;
    setError(message);
    setShowToast(true);
  };

  const clearError = () => {
    setError(null);
    setShowToast(false);
  };

  const NetworkErrorComponent = () => (
    <NetworkErrorToast
      isOpen={showToast}
      onDidDismiss={clearError}
      message={error || undefined}
    />
  );

  return {
    handleNetworkError,
    clearError,
    NetworkErrorComponent,
    hasError: showToast
  };
};
