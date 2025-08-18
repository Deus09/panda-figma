import { Redirect, Route } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import {
  IonApp,
  setupIonicReact,
  IonModal,
  IonSpinner
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('./pages/home'));
const Explore = lazy(() => import('./pages/explore'));
const Lists = lazy(() => import('./pages/lists'));
const Profile = lazy(() => import('./pages/profile'));
const Social = lazy(() => import('./pages/social'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const NotificationTestPage = lazy(() => import('./pages/NotificationTestPage'));
const NotificationSettingsPage = lazy(() => import('./pages/NotificationSettingsPage'));
const PushNotificationTestPage = lazy(() => import('./pages/PushNotificationTestPage'));
const SeriesDetailPage = lazy(() => import('./pages/SeriesDetailPage'));
const NetworkTestPage = lazy(() => import('./pages/NetworkTestPage'));

import LocalStorageService from './services/localStorage';
import { ModalProvider, useModal } from './context/ModalContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NetworkProvider } from './context/NetworkContext';
import { PaywallProvider, usePaywall } from './context/PaywallContext';
import { OfflineIndicator } from './components/NetworkIndicator';
import MovieDetailModal from './components/MovieDetailModal';
import ActorDetailModal from './components/ActorDetailModal';
import SeriesDetailModal from './components/SeriesDetailModal';
import PaywallModal from './components/PaywallModal';
import { initializePushNotifications } from './services/pushNotifications';
import { useGlobalErrorHandler } from './hooks/useGlobalErrorHandler';
import GlobalErrorBoundary from './components/errors/GlobalErrorBoundary';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode - Her zaman dark tema
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

import '@ionic/react/css/palettes/dark.always.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const ModalRenderer: React.FC = () => {
  const { modalStack, closeModal } = useModal();
  const current = modalStack[modalStack.length - 1];
  if (!current) return null;

  if (current.type === 'movie') {
    return (
      <IonModal isOpen={true} onDidDismiss={closeModal}>
        <MovieDetailModal open={true} onClose={closeModal} movieId={current.id} />
      </IonModal>
    );
  }
  if (current.type === 'actor') {
    return (
      <IonModal isOpen={true} onDidDismiss={closeModal}>
        <ActorDetailModal open={true} onClose={closeModal} actorId={current.id} />
      </IonModal>
    );
  }
  if (current.type === 'series') {
    return (
      <IonModal isOpen={true} onDidDismiss={closeModal}>
        <SeriesDetailModal open={true} onClose={closeModal} seriesId={current.id} />
      </IonModal>
    );
  }
  return null;
};

const PaywallRenderer: React.FC = () => {
  const { isPaywallOpen, currentFeature, closePaywall } = usePaywall();
  
  if (!isPaywallOpen || !currentFeature) return null;

  const handleSubscribe = (plan: 'monthly' | 'yearly') => {
    // Demo için localStorage'a Pro durumunu kaydet
    const success = LocalStorageService.subscribeToProPlan(plan);
    if (success) {
      console.log(`✅ Subscribed to ${plan} plan successfully`);
      closePaywall();
    } else {
      console.error('❌ Failed to subscribe to plan');
    }
  };

  return (
    <PaywallModal 
      isOpen={isPaywallOpen}
      onClose={closePaywall}
      feature={currentFeature}
      onSubscribe={handleSubscribe}
    />
  );
};

const App: React.FC = () => {
  // Initialize global error handling
  useGlobalErrorHandler({
    onError: (error, context) => {
      console.warn('Global error caught:', error.message, context);
    }
  });

  useEffect(() => {
    // Dark mode theme system initialization - Her zaman dark tema
    const preferences = LocalStorageService.getUserPreferences();
    
    // Her zaman dark mode uygula
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    
    // User preferences'ta darkMode'u true yap
    const updatedPrefs = { ...preferences, darkMode: true };
    LocalStorageService.saveUserPreferences(updatedPrefs);

    // Push notifications initialization - skip in development
    const initPushNotifications = async () => {
      // Skip push notifications in development to avoid service worker CORS issues
      if (import.meta.env.DEV) {
        console.log('⏭️ Skipping push notifications in development mode');
        return;
      }
      
      try {
        await initializePushNotifications();
        console.log('✅ Push notifications initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize push notifications:', error);
      }
    };

    initPushNotifications();

    // Google OAuth callback handling - hash'de token varsa /auth/callback'e yönlendir
    const handleOAuthCallback = () => {
      const hash = window.location.hash;
      const currentPath = window.location.pathname;
      
      console.log('🔍 App.tsx - Hash check:', hash ? 'HAS_HASH' : 'NO_HASH');
      console.log('🔍 App.tsx - Current path:', currentPath);
      
      // Hash'de access_token varsa ve AuthCallback sayfasında değilsek yönlendir
      if (hash && hash.includes('access_token') && !currentPath.includes('/auth/callback')) {
        console.log('🔄 OAuth callback detected in App.tsx');
        console.log('🔗 Hash preview:', hash.substring(0, 60) + '...');
        
        // AuthCallback sayfasına hash ile birlikte yönlendir
        const callbackUrl = '/auth/callback' + hash;
        console.log('🔄 Redirecting to:', callbackUrl);
        
        // Hem pushState hem window.location.href dene
        try {
          // Önce history API ile dene
          window.history.pushState({}, '', callbackUrl);
          window.dispatchEvent(new PopStateEvent('popstate'));
          console.log('✅ History API ile yönlendirme başarılı');
        } catch (error) {
          console.log('❌ History API hatası, window.location.href kullanılıyor');
          // Hata varsa direkt navigation
          window.location.href = callbackUrl;
        }
        return true; // İşlem yapıldığını belirt
      }
      return false;
    };

    handleOAuthCallback();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <NetworkProvider>
          <ModalProvider>
            <PaywallProvider>
              <AppContent />
            </PaywallProvider>
          </ModalProvider>
        </NetworkProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const AppContent: React.FC = () => {
  const { openModal } = useModal();

  useEffect(() => {
    // Push notification event listeners
    const handlePushNotificationReceived = (event: CustomEvent) => {
      console.log('Push notification received while app is open:', event.detail);
      // Burada toast notification gösterebiliriz
    };

    const handlePushNotificationAction = (event: CustomEvent) => {
      console.log('Push notification action:', event.detail);
      const { data } = event.detail;
      
      if (data.deepLink) {
        // Deep link işleme
        console.log('Handling deep link:', data.deepLink);
      }
    };

    const handlePushNotificationContent = (event: CustomEvent) => {
      console.log('Opening content from push notification:', event.detail);
      const { contentType, id } = event.detail;
      
      // Modal ile content'i aç
      if (contentType && id) {
        openModal(contentType, id);
      }
    };

    // Event listener'ları ekle
    document.addEventListener('push-notification-received', handlePushNotificationReceived);
    document.addEventListener('push-notification-action', handlePushNotificationAction);
    document.addEventListener('push-notification-content', handlePushNotificationContent);

    // Cleanup function
    return () => {
      document.removeEventListener('push-notification-received', handlePushNotificationReceived);
      document.removeEventListener('push-notification-action', handlePushNotificationAction);
      document.removeEventListener('push-notification-content', handlePushNotificationContent);
    };
  }, [openModal]);

  return (
    <IonApp className="bg-background text-foreground">
      <GlobalErrorBoundary>
        <OfflineIndicator />
        <IonReactRouter>
          <Suspense fallback={
            <div className="suspense-fallback">
              <IonSpinner name="crescent" />
            </div>
          }>
            <Route exact path="/home">
              <Home />
            </Route>
            <Route exact path="/explore">
              <Explore />
            </Route>
            <Route exact path="/lists">
              <Lists />
            </Route>
            <Route exact path="/social">
              <Social />
            </Route>
            <Route exact path="/profile">
              <Profile />
            </Route>
            <Route exact path="/notifications">
              <NotificationSettingsPage />
            </Route>
            <Route exact path="/notification-test">
              <NotificationTestPage />
            </Route>
            <Route exact path="/push-test">
              <PushNotificationTestPage />
            </Route>
            <Route exact path="/auth/callback">
              <AuthCallback />
            </Route>
            <Route exact path="/test-auth">
              <AuthCallback />
            </Route>
            <Route exact path="/series/:seriesId" component={SeriesDetailPage} />
            <Route exact path="/network-test">
              <NetworkTestPage />
            </Route>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </Suspense>
        </IonReactRouter>
        <ModalRenderer />
        <PaywallRenderer />
      </GlobalErrorBoundary>
    </IonApp>
  );
};

export default App;
