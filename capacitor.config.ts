import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tscompany.moviloi',
  appName: 'moviloi',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    Network: {
      // Network plugin configuration
    }
  }
};

export default config;
