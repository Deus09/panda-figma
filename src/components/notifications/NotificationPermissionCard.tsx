import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonText,
  IonBadge,
  IonSpinner,
  IonToast
} from '@ionic/react';
import {
  notifications,
  checkmarkCircle,
  closeCircle,
  helpCircle,
  warningOutline,
  settings,
  refresh
} from 'ionicons/icons';
import { pushPermissionManager, PermissionStatusResult } from '../../services/pushPermissionManager';
import { errorLogger } from '../../utils/errors/logger';
import NotificationExplanationModal from './NotificationExplanationModal';

interface NotificationPermissionCardProps {
  className?: string;
  onStatusChange?: (result: PermissionStatusResult) => void;
}

const NotificationPermissionCard: React.FC<NotificationPermissionCardProps> = ({
  className = '',
  onStatusChange
}) => {
  const { t } = useTranslation();
  const [statusResult, setStatusResult] = useState<PermissionStatusResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'warning' | 'danger'>('success');

  useEffect(() => {
    loadPermissionStatus();
  }, []);

  const loadPermissionStatus = async () => {
    setIsLoading(true);
    
    try {
      const result = await pushPermissionManager.checkPermissionStatus();
      setStatusResult(result);
      
      if (onStatusChange) {
        onStatusChange(result);
      }
    } catch (error) {
      console.error('Error loading permission status:', error);
      errorLogger.log(error as Error, { context: 'NotificationPermissionCard.loadPermissionStatus' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    if (!statusResult?.canRequest) return;
    
    setIsRequesting(true);
    
    try {
      const result = await pushPermissionManager.requestPermission();
      setStatusResult(result);
      
      // Toast mesajı
      let message = '';
      let color: 'success' | 'warning' | 'danger' = 'success';
      
      switch (result.status) {
        case 'granted':
          message = t('notifications.permission.toast.granted');
          color = 'success';
          break;
        case 'denied':
          message = t('notifications.permission.toast.denied');
          color = 'danger';
          break;
        default:
          message = t('notifications.permission.toast.error');
          color = 'warning';
      }
      
      setToastMessage(message);
      setToastColor(color);
      setShowToast(true);
      
      if (onStatusChange) {
        onStatusChange(result);
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      errorLogger.log(error as Error, { context: 'NotificationPermissionCard.handleRequestPermission' });
      
      setToastMessage(t('notifications.permission.toast.error'));
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleOpenSettings = () => {
    const instructions = pushPermissionManager.getSettingsInstructions();
    
    // Instructions'ı toast ile göster (basit versiyonu)
    setToastMessage(`${instructions.title}: ${instructions.steps[0]}`);
    setToastColor('warning');
    setShowToast(true);
  };

  const handleReset = () => {
    pushPermissionManager.resetNeverAskAgain();
    loadPermissionStatus();
    
    setToastMessage('Permission settings reset');
    setToastColor('success');
    setShowToast(true);
  };

  const getStatusIcon = () => {
    if (!statusResult) return helpCircle;
    
    switch (statusResult.status) {
      case 'granted': return checkmarkCircle;
      case 'denied': return closeCircle;
      case 'unsupported': return warningOutline;
      case 'restricted': return warningOutline;
      default: return helpCircle;
    }
  };

  const getStatusColor = () => {
    if (!statusResult) return 'medium';
    
    switch (statusResult.status) {
      case 'granted': return 'success';
      case 'denied': return 'danger';
      case 'unsupported': return 'warning';
      case 'restricted': return 'warning';
      default: return 'medium';
    }
  };

  const getStatusText = () => {
    if (!statusResult) return t('notifications.permission.status.unknown');
    
    return t(`notifications.permission.status.${statusResult.status}`);
  };

  const getMessage = () => {
    if (!statusResult) return '';
    
    if (statusResult.message) {
      return statusResult.message;
    }
    
    return t(`notifications.permission.messages.${statusResult.status}`);
  };

  const canShowActions = () => {
    return statusResult && (
      statusResult.status === 'prompt' ||
      statusResult.status === 'unknown' ||
      statusResult.status === 'denied'
    );
  };

  if (isLoading) {
    return (
      <IonCard className={className}>
        <IonCardContent className="p-4 text-center">
          <IonSpinner name="crescent" />
          <IonText className="block mt-2">
            Checking notification status...
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <>
      <IonCard className={className}>
        <IonCardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Status Icon */}
            <div className="flex-shrink-0 mt-1">
              <IonIcon 
                icon={getStatusIcon()} 
                className={`text-2xl ${getStatusColor() === 'success' ? 'text-green-500' : 
                  getStatusColor() === 'danger' ? 'text-red-500' : 
                  getStatusColor() === 'warning' ? 'text-orange-500' : 
                  'text-gray-500'}`}
              />
            </div>

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">
                  {t('notifications.permission.title')}
                </h3>
                <IonBadge color={getStatusColor()}>
                  {getStatusText()}
                </IonBadge>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-3">
                {getMessage()}
              </p>

              {/* Platform Support Info */}
              {statusResult && (statusResult.supportsBrowser !== undefined || statusResult.supportsNative !== undefined) && (
                <div className="text-xs text-muted-foreground mb-3 space-y-1">
                  {statusResult.supportsNative && (
                    <div>✓ Native app support available</div>
                  )}
                  {statusResult.supportsBrowser && (
                    <div>✓ Browser notifications supported</div>
                  )}
                  {!statusResult.supportsBrowser && !statusResult.supportsNative && (
                    <div>⚠ Platform not supported</div>
                  )}
                </div>
              )}

              {/* Actions */}
              {canShowActions() && (
                <div className="flex flex-wrap gap-2">
                  {/* Request Permission */}
                  {statusResult?.canRequest && (
                    <IonButton
                      size="small"
                      fill="solid"
                      onClick={handleRequestPermission}
                      disabled={isRequesting}
                    >
                      <IonIcon icon={checkmarkCircle} slot="start" />
                      {t('notifications.permission.actions.allow')}
                    </IonButton>
                  )}

                  {/* Settings for denied state */}
                  {statusResult?.status === 'denied' && (
                    <IonButton
                      size="small"
                      fill="outline"
                      onClick={handleOpenSettings}
                      disabled={isRequesting}
                    >
                      <IonIcon icon={settings} slot="start" />
                      {t('notifications.permission.actions.open_settings')}
                    </IonButton>
                  )}

                  {/* Retry button */}
                  <IonButton
                    size="small"
                    fill="clear"
                    onClick={loadPermissionStatus}
                    disabled={isRequesting}
                  >
                    <IonIcon icon={refresh} slot="start" />
                    {t('notifications.permission.actions.retry')}
                  </IonButton>

                  {/* Explanation */}
                  <IonButton
                    size="small"
                    fill="clear"
                    color="medium"
                    onClick={() => setShowExplanation(true)}
                    disabled={isRequesting}
                  >
                    <IonIcon icon={helpCircle} slot="start" />
                    Why?
                  </IonButton>
                </div>
              )}

              {/* Development actions */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <IonButton
                      size="small"
                      fill="clear"
                      color="warning"
                      onClick={handleReset}
                    >
                      Reset Prefs
                    </IonButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </IonCardContent>
      </IonCard>

      {/* Explanation Modal */}
      <NotificationExplanationModal
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        onAllow={handleRequestPermission}
        canRequest={statusResult?.canRequest || false}
      />

      {/* Toast */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={4000}
        position="bottom"
        color={toastColor}
      />
    </>
  );
};

export default NotificationPermissionCard;
