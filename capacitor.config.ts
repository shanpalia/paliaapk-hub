import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.plkapkhub.store',
  appName: 'PLKAPK Hub',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    allowNavigation: ['fpjrydfuhzwzkjuhkoaj.supabase.co']
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff'
    }
  },
  android: {
    buildOptions: {
      releaseType: 'APK'
    }
  }
};

export default config;
