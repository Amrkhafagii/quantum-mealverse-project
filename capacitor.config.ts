
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.quantummealverse',
  appName: 'quantum-mealverse-project',
  webDir: 'dist',
 
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#000000"
    },
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#000000",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#23cfc9",
    },
    // Configure background location-related preferences
    BackgroundGeolocation: {
      // iOS-specific configuration
      ios: {
        activityType: "fitness", // Activity type that most closely represents the user activity
        desiredAccuracy: "best", // Location accuracy
        pauseLocationUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      },
      // Android-specific configuration
      android: {
        smallIcon: "ic_notification", // Android small icon for notifications
        iconColor: "#23cfc9", // Color of the notification icon
        startOnBoot: true, // Start tracking when device is booted
        notification: {
          channelName: "Location Tracking",
          title: "Location Tracking Active",
          text: "Quantum Mealverse is tracking your location for delivery",
          priority: 1 // High priority
        }
      }
    }
  }
};

export default config;
