import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonText,
  IonCard,
  IonCardContent,
  IonToggle,
  IonItem,
  IonLabel
} from '@ionic/react';
import { 
  warningOutline, 
  homeOutline, 
  refreshOutline, 
  trashBinOutline,
  clipboardOutline,
  bugOutline
} from 'ionicons/icons';
import { errorLogger } from '../../utils/errors/logger';
import { AppError } from '../../utils/errors/errorTypes';

interface ErrorFallbackProps {
  error: Error;
  errorId: string;
  resetError: () => void;
  showDevDetails?: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorId,
  resetError,
  showDevDetails = false
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [showDetails, setShowDetails] = useState(showDevDetails);

  const getErrorType = (error: Error): 'network' | 'api' | 'generic' => {
    if (error.name === 'NetworkError') return 'network';
    if (error.name === 'ApiError') return 'api';
    return 'generic';
  };

  const getErrorMessage = (error: Error): string => {
    const type = getErrorType(error);
    
    if (error instanceof AppError) {
      return error.message;
    }
    
    return t(`errors.${type}_error`);
  };

  const handleGoHome = () => {
    resetError();
    history.replace('/home');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleClearCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      handleRefresh();
    } catch (e) {
      console.error('Error clearing cache:', e);
      handleRefresh();
    }
  };

  const handleReportError = async () => {
    try {
      const report = errorLogger.generateReport();
      await navigator.clipboard.writeText(report);
      
      // Show success toast - you might want to add a toast service
      console.log('Error report copied to clipboard');
    } catch (e) {
      console.error('Failed to copy error report:', e);
      // Fallback: log the report
      console.log('Error Report:', errorLogger.generateReport());
    }
  };

  const errorType = getErrorType(error);

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          {/* Error Icon */}
          <div className="mb-6">
            <IonIcon
              icon={warningOutline}
              className="text-6xl text-red-500 dark:text-red-400"
            />
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold mb-4 text-foreground">
            {t('errors.title')}
          </h1>

          {/* Error Description */}
          <p className="text-lg text-muted-foreground mb-2 max-w-md">
            {t('errors.subtitle')}
          </p>

          {/* Specific Error Message */}
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            {getErrorMessage(error)}
          </p>

          {/* Error ID */}
          <p className="text-xs text-muted-foreground mb-8 font-mono">
            {t('errors.error_id', { id: errorId })}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <IonButton 
              expand="block" 
              fill="solid" 
              color="primary"
              onClick={resetError}
            >
              <IonIcon icon={refreshOutline} slot="start" />
              {t('errors.retry')}
            </IonButton>

            <IonButton 
              expand="block" 
              fill="outline" 
              color="medium"
              onClick={handleGoHome}
            >
              <IonIcon icon={homeOutline} slot="start" />
              {t('errors.go_home')}
            </IonButton>

            <div className="flex gap-2">
              <IonButton 
                expand="block" 
                fill="clear" 
                size="small"
                onClick={handleRefresh}
              >
                <IonIcon icon={refreshOutline} slot="start" />
                {t('errors.refresh')}
              </IonButton>

              <IonButton 
                expand="block" 
                fill="clear" 
                size="small"
                onClick={handleClearCache}
              >
                <IonIcon icon={trashBinOutline} slot="start" />
                {t('errors.clear_cache')}
              </IonButton>
            </div>

            <IonButton 
              expand="block" 
              fill="clear" 
              size="small"
              onClick={handleReportError}
            >
              <IonIcon icon={clipboardOutline} slot="start" />
              {t('errors.report')}
            </IonButton>
          </div>

          {/* Development Details Toggle */}
          {(process.env.NODE_ENV === 'development' || showDevDetails) && (
            <div className="w-full max-w-md mt-8">
              <IonItem className="mb-4">
                <IonIcon icon={bugOutline} slot="start" />
                <IonLabel>{t('errors.details_toggle')}</IonLabel>
                <IonToggle 
                  checked={showDetails}
                  onIonChange={(e) => setShowDetails(e.detail.checked)}
                  slot="end"
                />
              </IonItem>

              {showDetails && (
                <IonCard>
                  <IonCardContent>
                    <div className="text-left">
                      <h3 className="font-bold mb-2">Error Details:</h3>
                      <p className="text-sm mb-2">
                        <strong>Name:</strong> {error.name}
                      </p>
                      <p className="text-sm mb-2">
                        <strong>Message:</strong> {error.message}
                      </p>
                      {error instanceof AppError && (
                        <>
                          <p className="text-sm mb-2">
                            <strong>Code:</strong> {error.code}
                          </p>
                          <p className="text-sm mb-2">
                            <strong>Severity:</strong> {error.severity}
                          </p>
                        </>
                      )}
                      {error.stack && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm font-bold mb-2">
                            Stack Trace
                          </summary>
                          <pre className="text-xs overflow-auto max-h-40 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            {error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </IonCardContent>
                </IonCard>
              )}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ErrorFallback;
