
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.117bb8e72e6f4681936555049936510d',
  appName: 'quantum-mealverse-project',
  webDir: 'dist',
  server: {
    url: 'https://117bb8e7-2e6f-4681-9365-55049936510d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
    scrollEnabled: true,
    // These settings help prevent auto layout issues
    limitsNavigationsToAppBoundDomains: true,
    handleApplicationNotifications: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      showSpinner: false,
      spinnerColor: '#999999',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP'
    }
  }
};

export default config;
