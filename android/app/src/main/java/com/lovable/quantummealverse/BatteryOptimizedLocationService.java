
package com.lovable.quantummealverse;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.os.BatteryManager;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;

public class BatteryOptimizedLocationService extends Service {
    private static final String TAG = "BatteryOptimizedLocationService";
    private static final String CHANNEL_ID = "battery_optimized_location_channel";
    private static final int NOTIFICATION_ID = 1002;
    
    // Location tracking variables
    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private LocationRequest locationRequest;
    private PowerManager.WakeLock wakeLock;
    
    // Battery monitoring
    private BatteryManager batteryManager;
    private float lastBatteryLevel = 1.0f;
    private boolean isLowPowerMode = false;
    
    // Service control
    private final IBinder binder = new LocalBinder();
    private boolean isTracking = false;
    private boolean isDeviceStationary = false;
    private float currentSpeed = 0;
    
    // Adaptive tracking settings
    private int defaultInterval = 30000; // 30 seconds
    private float distanceToDestination = -1; // Unknown
    
    public class LocalBinder extends Binder {
        public BatteryOptimizedLocationService getService() {
            return BatteryOptimizedLocationService.this;
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        
        // Initialize location client
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        
        // Initialize battery manager
        batteryManager = (BatteryManager) getSystemService(Context.BATTERY_SERVICE);
        
        // Create notification channel
        createNotificationChannel();
        
        // Initialize location callback
        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {
                if (locationResult == null) return;
                
                for (Location location : locationResult.getLocations()) {
                    processLocation(location);
                }
            }
        };
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "Battery optimized location service started");
        
        // Update battery status
        updateBatteryStatus();
        
        // Configure settings from intent if available
        if (intent != null) {
            if (intent.hasExtra("defaultInterval")) {
                defaultInterval = intent.getIntExtra("defaultInterval", 30000);
            }
            
            if (intent.hasExtra("distanceToDestination")) {
                distanceToDestination = intent.getFloatExtra("distanceToDestination", -1);
            }
            
            if (intent.hasExtra("forceLowPowerMode")) {
                isLowPowerMode = intent.getBooleanExtra("forceLowPowerMode", false);
            }
        }
        
        // Start as foreground service
        startForeground(NOTIFICATION_ID, createNotification());
        
        // Start location tracking if not already active
        if (!isTracking) {
            startLocationTracking();
        }
        
        // Return sticky to ensure the service restarts if killed
        return START_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "Battery optimized location service destroyed");
        
        // Clean up resources
        stopLocationTracking();
        
        // Release wake lock if held
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
            wakeLock = null;
        }
    }
    
    /**
     * Start location tracking with battery-optimized settings
     */
    public void startLocationTracking() {
        if (isTracking) return;
        
        try {
            // Create location request with adaptive parameters
            locationRequest = createLocationRequest();
            
            // Request location updates
            fusedLocationClient.requestLocationUpdates(
                locationRequest, 
                locationCallback,
                null // Looper.getMainLooper()
            );
            
            // Acquire wake lock for reliable tracking
            // Only hold minimal wake lock to conserve battery
            PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (powerManager != null) {
                wakeLock = powerManager.newWakeLock(
                    PowerManager.PARTIAL_WAKE_LOCK,
                    "QuantumMealverse:LocationWakeLock"
                );
                wakeLock.acquire(10 * 60 * 1000L); // 10 minutes max
            }
            
            isTracking = true;
            Log.d(TAG, "Started battery-optimized location tracking");
        } catch (SecurityException e) {
            Log.e(TAG, "Error starting location tracking", e);
        }
    }
    
    /**
     * Stop location tracking
     */
    public void stopLocationTracking() {
        if (!isTracking) return;
        
        // Stop location updates
        fusedLocationClient.removeLocationUpdates(locationCallback);
        
        // Release wake lock if held
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        
        isTracking = false;
        Log.d(TAG, "Stopped location tracking");
    }
    
    /**
     * Process new location update
     */
    private void processLocation(Location location) {
        // Calculate if device is stationary based on speed
        float speedMps = location.getSpeed();
        currentSpeed = speedMps * 3.6f; // Convert to km/h
        isDeviceStationary = currentSpeed < 1.0f; // Less than 1 km/h
        
        // Log location and status
        Log.d(TAG, String.format(
            "Location update: %.6f, %.6f, Speed: %.1f km/h, %s",
            location.getLatitude(), 
            location.getLongitude(), 
            currentSpeed,
            isDeviceStationary ? "Stationary" : "Moving"
        ));
        
        // Update notification with current state
        updateNotification();
        
        // If device state changes, update tracking parameters
        if (isTracking) {
            // Check if we need to adapt parameters
            boolean needsUpdate = false;
            
            // Adaptive sampling based on motion detection
            if (isDeviceStationary) {
                // If device has been stationary for a while, reduce update frequency
                if (locationRequest.getInterval() < 60000) {
                    needsUpdate = true;
                }
            } else {
                // If device started moving, increase frequency if it was lowered
                if (locationRequest.getInterval() > defaultInterval) {
                    needsUpdate = true;
                }
            }
            
            // If we need to update parameters
            if (needsUpdate) {
                // Stop and restart with new parameters
                fusedLocationClient.removeLocationUpdates(locationCallback);
                locationRequest = createLocationRequest();
                
                try {
                    fusedLocationClient.requestLocationUpdates(
                        locationRequest,
                        locationCallback,
                        null
                    );
                } catch (SecurityException e) {
                    Log.e(TAG, "Error updating location request", e);
                }
            }
        }
        
        // TODO: Implement your location transmission logic here
        // If device is stationary or battery is low, consider batching updates
        // This would hook into your location transmission service
    }
    
    /**
     * Create a battery-optimized location request
     */
    private LocationRequest createLocationRequest() {
        // Check current battery status 
        updateBatteryStatus();
        
        // Base values
        int interval = defaultInterval;
        int priority = Priority.PRIORITY_BALANCED_POWER_ACCURACY;
        float displacement = 10;  // 10 meters default
        
        // Adjust based on battery level
        if (lastBatteryLevel <= 0.05) {
            // Critical battery (<5%)
            interval = Math.max(120000, defaultInterval * 4);  // 2 minutes minimum
            priority = Priority.PRIORITY_LOW_POWER;
            displacement = 50;  // 50 meters
        } else if (lastBatteryLevel <= 0.15) {
            // Low battery (<15%)
            interval = Math.max(60000, defaultInterval * 2);  // 1 minute minimum
            priority = Priority.PRIORITY_LOW_POWER;
            displacement = 30;  // 30 meters
        } else if (lastBatteryLevel <= 0.30) {
            // Medium battery (<30%)
            interval = Math.max(defaultInterval, 45000);  // 45 seconds minimum
            displacement = 20;  // 20 meters
        }
        
        // Adjust for low power mode
        if (isLowPowerMode) {
            interval = Math.max(interval, 60000);  // At least 1 minute in low power mode
            priority = Priority.PRIORITY_LOW_POWER;
            displacement = Math.max(displacement, 30);  // At least 30 meters
        }
        
        // Adjust for device motion state
        if (isDeviceStationary) {
            interval = Math.max(interval * 2, 60000);  // Double interval when stationary, minimum 1 minute
            displacement = Math.max(displacement * 2, 50);  // Double displacement filter when stationary
        }
        
        // Adjust for proximity to destination
        if (distanceToDestination > 0) {
            if (distanceToDestination < 0.5) {
                // Within 500m of destination, increase frequency
                interval = Math.min(interval / 2, 15000);  // Half interval when close, max 15 seconds
                priority = Priority.PRIORITY_HIGH_ACCURACY;
                displacement = 5;  // 5 meters
            } else if (distanceToDestination > 10) {
                // Far from destination (>10km), reduce frequency
                interval = Math.max(interval, 60000);  // At least 1 minute
                displacement = Math.max(displacement, 50);  // At least 50 meters
            }
        }
        
        Log.d(TAG, String.format(
            "Creating location request: interval=%d ms, priority=%d, displacement=%.1f m",
            interval, priority, displacement
        ));
        
        LocationRequest.Builder builder = new LocationRequest.Builder(
            priority,
            interval
        );
        
        // Configure minimum displacement for updates
        builder.setMinUpdateDistanceMeters(displacement);
        
        // Allow system to batch location updates when possible
        builder.setMaxUpdateDelayMillis(interval * 2);
        
        // Set explicit minimum interval - half of our target
        builder.setMinUpdateIntervalMillis(interval / 2);
        
        // Build and return location request
        return builder.build();
    }
    
    /**
     * Update the battery status information
     */
    private void updateBatteryStatus() {
        if (batteryManager == null) return;
        
        // Get current battery level
        lastBatteryLevel = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) / 100.0f;
        
        // Check if device is in power save mode
        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (powerManager != null) {
            isLowPowerMode = powerManager.isPowerSaveMode();
        }
        
        Log.d(TAG, String.format(
            "Battery status: Level=%.1f%%, Low power mode=%s",
            lastBatteryLevel * 100,
            isLowPowerMode ? "ON" : "OFF"
        ));
    }

    /**
     * Create the notification channel for Android 8.0+
     */
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Battery Optimized Location Tracking",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Used for energy-efficient location tracking during deliveries");
            channel.enableVibration(false);
            channel.setSound(null, null);
            
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    /**
     * Create the notification for foreground service
     */
    private Notification createNotification() {
        // Create intent to open the app when notification is tapped
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                notificationIntent,
                PendingIntent.FLAG_IMMUTABLE
        );

        // Create the notification
        String contentText = getNotificationText();
        
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Quantum Mealverse")
                .setContentText(contentText)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setOngoing(true)
                .build();
    }
    
    /**
     * Get appropriate notification text based on current state
     */
    private String getNotificationText() {
        if (lastBatteryLevel <= 0.05) {
            return "Critical battery - minimal location tracking active";
        } else if (lastBatteryLevel <= 0.15 || isLowPowerMode) {
            return "Battery saving location tracking active";
        } else if (isDeviceStationary) {
            return "Device stationary - reduced location tracking active";
        } else if (distanceToDestination > 0 && distanceToDestination < 0.5) {
            return String.format("Near destination - %.0f meters away", distanceToDestination * 1000);
        } else {
            return "Optimized location tracking active";
        }
    }
    
    /**
     * Update the notification with current status
     */
    public void updateNotification() {
        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager != null) {
            notificationManager.notify(NOTIFICATION_ID, createNotification());
        }
    }

    /**
     * Helper method to start this service
     */
    public static void startService(Context context, int defaultInterval, float distanceToDestination, boolean forceLowPowerMode) {
        Intent intent = new Intent(context, BatteryOptimizedLocationService.class);
        intent.putExtra("defaultInterval", defaultInterval);
        intent.putExtra("distanceToDestination", distanceToDestination);
        intent.putExtra("forceLowPowerMode", forceLowPowerMode);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
    }

    /**
     * Helper method to stop this service
     */
    public static void stopService(Context context) {
        context.stopService(new Intent(context, BatteryOptimizedLocationService.class));
    }
    
    /**
     * Get the current battery level
     */
    public float getBatteryLevel() {
        return lastBatteryLevel;
    }
    
    /**
     * Check if device is in low power mode
     */
    public boolean isInLowPowerMode() {
        return isLowPowerMode;
    }
    
    /**
     * Check if device is currently stationary
     */
    public boolean isStationary() {
        return isDeviceStationary;
    }
    
    /**
     * Get the current speed in km/h
     */
    public float getCurrentSpeed() {
        return currentSpeed;
    }
}
