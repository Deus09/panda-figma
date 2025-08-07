import React, { useState } from 'react';
import { IonContent, IonPage, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel } from '@ionic/react';
import TopHeaderBar from '../components/TopHeaderBar';
import BottomNavBar from '../components/BottomNavBar';
import { NetworkStatusIndicator, OfflineIndicator } from '../components/NetworkIndicator';
import { useNetwork } from '../context/NetworkContext';
import { NetworkService } from '../services/networkService';
import { useNetworkErrorHandler } from '../components/NetworkErrorHandler';
import { searchMovies } from '../services/tmdb';

const NetworkTestPage: React.FC = () => {
  const { isConnected, connectionType, isInitializing } = useNetwork();
  const { handleNetworkError, NetworkErrorComponent } = useNetworkErrorHandler();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testNetworkStatus = async () => {
    try {
      const status = await NetworkService.getNetworkStatus();
      addTestResult(`Network Status: Connected=${status.connected}, Type=${status.connectionType}`);
    } catch (error) {
      addTestResult(`Network Status Error: ${error}`);
    }
  };

  const testApiCall = async () => {
    try {
      const movies = await searchMovies('avengers');
      addTestResult(`API Call Success: Found ${movies.length} movies`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(`API Call Failed: ${errorMsg}`);
      handleNetworkError(errorMsg);
    }
  };

  const simulateOffline = () => {
    // Web platformda navigator.onLine'ı değiştirerek offline durumunu simüle edebiliriz
    // Bu sadece test amaçlı - gerçek uygulamada bu kullanılmaz
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });
    
    // Online/offline event'lerini manuel trigger et
    window.dispatchEvent(new Event('offline'));
    addTestResult('Simulated offline mode');
  };

  const simulateOnline = () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
    
    window.dispatchEvent(new Event('online'));
    addTestResult('Simulated online mode');
  };

  return (
    <IonPage className="bg-background">
      <IonContent fullscreen className="bg-background">
        <div className="bg-background min-h-screen">
          <TopHeaderBar title="Network Test" />
          <OfflineIndicator />
          
          <div className="p-4 space-y-4">
            {/* Network Status Card */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Network Status</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="space-y-2">
                  <IonItem>
                    <IonLabel>
                      <h3>Status</h3>
                      <p>{isInitializing ? 'Initializing...' : (isConnected ? 'Connected' : 'Disconnected')}</p>
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <h3>Connection Type</h3>
                      <p>{connectionType}</p>
                    </IonLabel>
                  </IonItem>
                  <NetworkStatusIndicator showWhenOnline={true} />
                </div>
              </IonCardContent>
            </IonCard>

            {/* Test Controls */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Test Controls</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="space-y-2">
                  <IonButton expand="block" onClick={testNetworkStatus}>
                    Test Network Status
                  </IonButton>
                  <IonButton expand="block" onClick={testApiCall}>
                    Test API Call
                  </IonButton>
                  <IonButton expand="block" color="warning" onClick={simulateOffline}>
                    Simulate Offline
                  </IonButton>
                  <IonButton expand="block" color="success" onClick={simulateOnline}>
                    Simulate Online
                  </IonButton>
                  <IonButton expand="block" color="medium" onClick={() => setTestResults([])}>
                    Clear Results
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>

            {/* Test Results */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Test Results</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {testResults.length === 0 ? (
                  <p className="text-muted-foreground">No test results yet</p>
                ) : (
                  <div className="space-y-1">
                    {testResults.map((result, index) => (
                      <div key={index} className="text-sm font-mono bg-card p-2 rounded border">
                        {result}
                      </div>
                    ))}
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          </div>
          
          <BottomNavBar />
        </div>
        <NetworkErrorComponent />
      </IonContent>
    </IonPage>
  );
};

export default NetworkTestPage;
