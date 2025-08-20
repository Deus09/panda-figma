import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeI18n } from './i18n'; // i18n dinamik başlatma
import * as Sentry from '@sentry/capacitor';
import * as SentryReact from '@sentry/react';

// Sentry'yi başlat
Sentry.init(
  {
    dsn: 'https://4275a5ec1b3a4c95f150bcd67e06bd36@o4509874730762240.ingest.de.sentry.io/4509874737709136',
    // Performans takibi (tracing) ve oturum tekrarı (session replay) gibi ek özellikler
    // başlangıç için devre dışı bırakıldı. İhtiyaç halinde daha sonra etkinleştirilebilir.
  },
  // @sentry/react'ten init metodunu yönlendir
  SentryReact.init,
);

// i18n'i başlat ve app'i render et
const startApp = async () => {
  console.log('🚀 Starting app initialization...');
  await initializeI18n();
  console.log('✅ i18n initialization completed');
  
  const container = document.getElementById('root');
  const root = createRoot(container!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ App rendered successfully');
};

startApp().catch(console.error);