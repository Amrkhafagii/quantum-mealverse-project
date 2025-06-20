
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.117bb8e72e6f4681936555049936510d',
  appName: 'quantum-mealverse-project',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
    // Development URL removed to ensure app loads web assets from bundle
    // Uncomment the below lines during development only
    // url: 'http://localhost:8080',
    // cleartext: true
  },
  plugins: {
    StatusBar: {
      // Configure status bar for iOS
      style: 'dark',
      backgroundColor: '#ffffff',
      overlaysWebView: true,
      // Smart status bar handling based on app content (iOS only)
      iosOverlaysWebView: true
    },
    BiometricAuth: {
      // Plugin-specific configurations would go here
    },
    GoogleMaps: {
      apiKey: "AIzaSyBKQztvlSSaT-kjpzWBHIZ1uzgRh8rPlVs" // Keep existing API key
    },
    SplashScreen: {
      launchAutoHide: true,
      showSpinner: false,
      spinnerColor: '#999999',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP'
    },
    // Add the following plugin configurations
    Preferences: {},
    Geolocation: {
      // Set GPS as high accuracy source
      requireAccuratePermissions: true
    },
    BackgroundGeolocation: {
      // Background geolocation configuration
      backgroundMessage: "Location tracking for meal deliveries",
      backgroundTitle: "Tracking Location",
      requestPermissions: true
    },
    // Register our custom LocationPermissions plugin with proper configuration
    LocationPermissions: {
      // Custom plugin for enhanced location permission handling
      iosPermissions: {
        whenInUse: true,
        always: false
      },
      androidPermissions: {
        fine: true,
        coarse: true,
        background: true
      }
    }
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
    scrollEnabled: true,
    // These settings help prevent auto layout issues
    limitsNavigationsToAppBoundDomains: true,
    handleApplicationNotifications: true
  },
  android: {
    // Android-specific configuration
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
