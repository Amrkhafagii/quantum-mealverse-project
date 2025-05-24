
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.117bb8e72e6f4681936555049936510d',
  appName: 'quantum-mealverse-project',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff',
      overlaysWebView: true,
      iosOverlaysWebView: true
    },
    BiometricAuth: {},
    GoogleMaps: {
      apiKey: "AIzaSyBKQztvlSSaT-kjpzWBHIZ1uzgRh8rPlVs"
    },
    SplashScreen: {
      launchAutoHide: true,
      showSpinner: false,
      spinnerColor: '#999999',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP'
    },
    Preferences: {},
    Geolocation: {
      requireAccuratePermissions: true
    },
    BackgroundGeolocation: {
      backgroundMessage: "Location tracking for meal deliveries",
      backgroundTitle: "Tracking Location",
      requestPermissions: true
    }
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true,
    handleApplicationNotifications: true
  },
  android: {
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
