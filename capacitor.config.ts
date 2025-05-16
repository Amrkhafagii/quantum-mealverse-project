
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
        pauseLocationUpdatesAutomatically: true,  // Enable automatic pausing
        showsBackgroundLocationIndicator: true,
        activityRecognitionInterval: 10000, // 10 seconds for activity recognition
        distanceFilter: 10, // Default distance filter in meters
        significantChangesOnly: false, // Use significant changes only when in low power mode
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
        },
        locationUpdateInterval: 10000, // 10 seconds
        fastestLocationUpdateInterval: 5000, // 5 seconds
        motionTriggerDelay: 60000, // 1 minute delay before triggering motion detection
      }
    }
  }
};

export default config;
