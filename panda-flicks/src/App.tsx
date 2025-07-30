import { Redirect, Route } from 'react-router-dom';
import { useEffect } from 'react';
import {
  IonApp,
  setupIonicReact,
  IonModal
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/home';
import Explore from './pages/explore';
import Lists from './pages/lists';
import Profile from './pages/profile';
import LocalStorageService from './services/localStorage';
import { ModalProvider, useModal } from './context/ModalContext';
import MovieDetailModal from './components/MovieDetailModal';
import ActorDetailModal from './components/ActorDetailModal';
import SeriesDetailModal from './components/SeriesDetailModal';

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
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

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

const App: React.FC = () => {
  useEffect(() => {
    // Dark mode theme system initialization
    const preferences = LocalStorageService.getUserPreferences();
    const isDarkMode = preferences.darkMode !== false; // Default to dark mode
    
    // Apply dark mode class to document element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <ModalProvider>
      <IonApp className="bg-background text-foreground">
        <IonReactRouter>
          <Route exact path="/home">
            <Home />
          </Route>
          <Route exact path="/explore">
            <Explore />
          </Route>
          <Route exact path="/lists">
            <Lists />
          </Route>
          <Route exact path="/profile">
            <Profile />
          </Route>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonReactRouter>
        <ModalRenderer />
      </IonApp>
    </ModalProvider>
  );
};

export default App;
