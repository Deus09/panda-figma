import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/home';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import Explore from './pages/explore';
import Lists from './pages/lists';
import Profile from './pages/profile';

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

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <Route exact path="/home">
        <Home />
      </Route>
      <Route exact path="/tab2">
        <Tab2 />
      </Route>
      <Route path="/tab3">
        <Tab3 />
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
  </IonApp>
);

export default App;
