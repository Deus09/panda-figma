import React from 'react';
import { 
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonBackButton,
  IonButtons
} from '@ionic/react';
import { 
  bugOutline,
  warning,
  wifi,
  notifications,
  server
} from 'ionicons/icons';
import { pushNotificationService } from '../services/pushNotifications';
import { pushPermissionManager } from '../services/pushPermissionManager';
import NotificationPermissionCard from '../components/notifications/NotificationPermissionCard';
import NotificationPermissionBanner from '../components/notifications/NotificationPermissionBanner';
import UnsupportedFallback from '../components/notifications/UnsupportedFallback';

const NotificationTestPage: React.FC = () => {
  
  const triggerAppError = () => {
    throw new Error('Test application error');
  };

  const triggerNetworkError = async () => {
    try {
      await fetch('https://non-existent-api.moviloi.com/test');
    } catch (error) {
      console.error('Expected network error:', error);
    }
  };

  const triggerUnhandledRejection = () => {
    Promise.reject(new Error('Test unhandled promise rejection'));
  };

  const triggerPermissionRequest = async () => {
    try {
      const result = await pushPermissionManager.requestPermission();
      console.log('Permission result:', result);
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const getPermissionStatus = async () => {
    try {
      const status = await pushPermissionManager.checkPermissionStatus();
      console.log('Current permission status:', status);
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  const getDebugInfo = async () => {
    try {
      const info = await pushNotificationService.getDebugInfo();
      console.log('Push notification debug info:', info);
    } catch (error) {
      console.error('Debug info error:', error);
    }
  };

  const testSuppress = () => {
    pushPermissionManager.suppressFor24Hours();
    console.log('Permission requests suppressed for 24 hours');
  };

  const resetPermissionPrefs = () => {
    pushPermissionManager.resetNeverAskAgain();
    console.log('Permission preferences reset');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" />
          </IonButtons>
          <IonTitle>Push Notification Tests</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <div className="p-4 space-y-4">
          {/* UI Components Test */}
          <div>
            <h2 className="text-lg font-semibold mb-3">UI Components</h2>
            
            <NotificationPermissionCard className="mb-4" />
            
            <NotificationPermissionBanner className="mb-4" />
            
            <UnsupportedFallback 
              reason="Test unsupported state"
              className="mb-4"
            />
          </div>

          {/* Error Tests */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Error Tests</h2>
            <IonList>
              <IonItem>
                <IonIcon icon={bugOutline} slot="start" className="text-red-500" />
                <IonLabel>
                  <h3>App Error</h3>
                  <p>Trigger a React component error</p>
                </IonLabel>
                <IonButton 
                  slot="end" 
                  fill="outline" 
                  size="small"
                  onClick={triggerAppError}
                >
                  Trigger
                </IonButton>
              </IonItem>

              <IonItem>
                <IonIcon icon={wifi} slot="start" className="text-orange-500" />
                <IonLabel>
                  <h3>Network Error</h3>
                  <p>Trigger a network/fetch error</p>
                </IonLabel>
                <IonButton 
                  slot="end" 
                  fill="outline" 
                  size="small"
                  onClick={triggerNetworkError}
                >
                  Trigger
                </IonButton>
              </IonItem>

              <IonItem>
                <IonIcon icon={warning} slot="start" className="text-yellow-500" />
                <IonLabel>
                  <h3>Promise Rejection</h3>
                  <p>Trigger unhandled promise rejection</p>
                </IonLabel>
                <IonButton 
                  slot="end" 
                  fill="outline" 
                  size="small"
                  onClick={triggerUnhandledRejection}
                >
                  Trigger
                </IonButton>
              </IonItem>
            </IonList>
          </div>

          {/* Permission Tests */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Permission Tests</h2>
            <IonList>
              <IonItem>
                <IonIcon icon={notifications} slot="start" className="text-blue-500" />
                <IonLabel>
                  <h3>Request Permission</h3>
                  <p>Manually request notification permission</p>
                </IonLabel>
                <IonButton 
                  slot="end" 
                  fill="outline" 
                  size="small"
                  onClick={triggerPermissionRequest}
                >
                  Request
                </IonButton>
              </IonItem>

              <IonItem>
                <IonIcon icon={server} slot="start" className="text-green-500" />
                <IonLabel>
                  <h3>Check Status</h3>
                  <p>Get current permission status</p>
                </IonLabel>
                <IonButton 
                  slot="end" 
                  fill="outline" 
                  size="small"
                  onClick={getPermissionStatus}
                >
                  Check
                </IonButton>
              </IonItem>

              <IonItem>
                <IonIcon icon={bugOutline} slot="start" className="text-purple-500" />
                <IonLabel>
                  <h3>Debug Info</h3>
                  <p>Get comprehensive debug information</p>
                </IonLabel>
                <IonButton 
                  slot="end" 
                  fill="outline" 
                  size="small"
                  onClick={getDebugInfo}
                >
                  Debug
                </IonButton>
              </IonItem>

              <IonItem>
                <IonIcon icon={warning} slot="start" className="text-orange-500" />
                <IonLabel>
                  <h3>Test Suppress</h3>
                  <p>Suppress permission requests for 24h</p>
                </IonLabel>
                <IonButton 
                  slot="end" 
                  fill="outline" 
                  size="small"
                  onClick={testSuppress}
                >
                  Suppress
                </IonButton>
              </IonItem>

              <IonItem>
                <IonIcon icon={server} slot="start" className="text-gray-500" />
                <IonLabel>
                  <h3>Reset Prefs</h3>
                  <p>Reset all permission preferences</p>
                </IonLabel>
                <IonButton 
                  slot="end" 
                  fill="outline" 
                  size="small"
                  onClick={resetPermissionPrefs}
                >
                  Reset
                </IonButton>
              </IonItem>
            </IonList>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Test Instructions</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Open browser console to see detailed logs</li>
              <li>Test error boundaries by triggering errors</li>
              <li>Test permission flows with different browser states</li>
              <li>Check toast notifications and UI feedback</li>
              <li>Verify localStorage persistence across sessions</li>
            </ol>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NotificationTestPage;
