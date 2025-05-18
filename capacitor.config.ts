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
    Haptics: {
      // iOS-specific configuration
      ios: {
        enableSelectionFeedback: true,
        selectionFeedbackStyle: "medium", // light, medium, heavy
        enableImpactFeedback: true,
      },
      // Android-specific configuration
      android: {
        enableVibrationFallback: true,
        feedbackVibrationDuration: 50 // Default duration for haptic feedback in milliseconds
      }
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
    },
    // Add the Background Sync configuration
    BackgroundSync: {
      // iOS-specific configuration
      ios: {
        minimumBackgroundFetchInterval: 900, // 15 minutes in seconds
        backgroundSyncIdentifier: "com.lovable.quantummealverse.background-sync"
      },
      // Android-specific configuration
      android: {
        notificationChannelId: "background_sync",
        notificationTitle: "Data Sync",
        notificationText: "Syncing your data",
        syncMinimumInterval: 15, // 15 minutes
        batterySaverEnabled: true,
        requiresNetworkConnectivity: true,
        requiresCharging: false
      }
    },
    // Add the RouteOptimization configuration
    RouteOptimization: {
      // iOS-specific configuration (MapKit/Google Maps SDK)
      ios: {
        preferMapKit: true, // Use native MapKit when available
        useGoogleMapsWhenAvailable: true,
        routeOptimizationStrategy: "fastest", // fastest, shortest, or balanced
        avoidHighways: false,
        avoidTolls: false,
        avoidFerries: true,
        considerTraffic: true, // Use traffic information when available
        promptForGoogleAPI: false, // Don't prompt for Google API key
      },
      // Android-specific configuration (Google Maps Routes API)
      android: {
        routeOptimizationStrategy: "fastest", // fastest, shortest, or balanced
        backgroundComputation: true, // Allow computation in background
        cacheDuration: 30, // Cache routes for 30 minutes
        priorityLevel: "high", // high, medium, or low
        avoidHighways: false,
        avoidTolls: false,
        avoidFerries: true
      }
    },
    // Add QR Scanner configuration
    QrScanner: {
      // iOS-specific configuration
      ios: {
        // No specific options needed for iOS scanner
      },
      // Android-specific configuration
      android: {
        scannerActivity: "com.lovable.quantummealverse.QrScannerActivity",
      }
    },
    // Add AR Preview plugin configuration
    ARPreviewPlugin: {
      ios: {
        // iOS-specific AR configuration
        allowsCameraAccess: true,
        usesLiDAR: true,
        detectionImages: [
          "meal_anchor_1",
          "meal_anchor_2"
        ]
      },
      android: {
        // Android-specific AR configuration
        installIfNeeded: true,
        defaultLightEstimation: true,
        cameraPermissionText: "Camera access is required for AR features"
      }
    }
  }
};

export default config;
