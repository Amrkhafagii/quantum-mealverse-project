
package com.lovable.quantummealverse;

import android.annotation.SuppressLint;
import android.content.Context;
import android.location.Location;
import android.os.Build;
import android.os.Looper;
import android.util.Log;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationAvailability;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;

import java.util.HashMap;
import java.util.Map;

/**
 * Provides hybrid location services using Google Play Services Fused Location Provider
 * combined with WiFi and cell tower positioning
 */
public class HybridLocationProvider {
    private static final String TAG = "HybridLocationProvider";
    private static HybridLocationProvider instance;
    
    private final Context context;
    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private LocationRequest locationRequest;
    private boolean isTracking = false;
    
    // Listeners
    private final Map<String, LocationUpdateListener> listeners = new HashMap<>();
    
    // Interface for location updates
    public interface LocationUpdateListener {
        void onLocationUpdate(Location location, String source);
        void onLocationError(Exception e);
    }
    
    private HybridLocationProvider(Context context) {
        this.context = context;
        initializeLocationServices();
    }
    
    public static synchronized HybridLocationProvider getInstance(Context context) {
        if (instance == null) {
            instance = new HybridLocationProvider(context.getApplicationContext());
        }
        return instance;
    }
    
    private void initializeLocationServices() {
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(context);
        
        // Create location callback for continuous updates
        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {
                if (locationResult == null) {
                    return;
                }
                
                for (Location location : locationResult.getLocations()) {
                    if (location != null) {
                        String source = determineLocationSource(location);
                        notifyListeners(location, source);
                    }
                }
            }
            
            @Override
            public void onLocationAvailability(LocationAvailability locationAvailability) {
                if (locationAvailability != null && !locationAvailability.isLocationAvailable()) {
                    Log.d(TAG, "Location services are no longer available");
                }
            }
        };
    }
    
    /**
     * Determine the source of a location update based on accuracy and provider
     */
    private String determineLocationSource(Location location) {
        String provider = location.getProvider();
        float accuracy = location.getAccuracy();
        
        // GPS provider typically indicates direct GPS positioning
        if ("gps".equals(provider)) {
            return "gps";
        }
        
        // Network provider usually means cell tower or WiFi
        if ("network".equals(provider)) {
            // WiFi positioning typically has better accuracy than cell tower
            return accuracy < 100 ? "wifi" : "cell_tower";
        }
        
        // Fused location without clear provider
        if ("fused".equals(provider) || provider == null) {
            if (accuracy < 50) {
                return "gps"; // High accuracy suggests GPS was used
            } else if (accuracy < 500) {
                return "wifi"; // Medium accuracy suggests WiFi was used
            } else {
                return "cell_tower"; // Low accuracy suggests cell tower was used
            }
        }
        
        // Default fallback
        return "network";
    }
    
    /**
     * Register a listener for location updates
     */
    public void registerListener(String id, LocationUpdateListener listener) {
        listeners.put(id, listener);
    }
    
    /**
     * Unregister a listener
     */
    public void unregisterListener(String id) {
        listeners.remove(id);
    }
    
    /**
     * Notify all registered listeners about a location update
     */
    private void notifyListeners(Location location, String source) {
        for (LocationUpdateListener listener : listeners.values()) {
            listener.onLocationUpdate(location, source);
        }
    }
    
    /**
     * Notify all registered listeners about an error
     */
    private void notifyError(Exception e) {
        for (LocationUpdateListener listener : listeners.values()) {
            listener.onLocationError(e);
        }
    }
    
    /**
     * Get current location with maximum accuracy using hybrid sources
     */
    @SuppressLint("MissingPermission")
    public void getCurrentLocation(final LocationUpdateListener listener) {
        // Register temporary listener if provided
        if (listener != null) {
            registerListener("temp-" + System.currentTimeMillis(), listener);
        }
        
        // Create location request for high accuracy
        LocationRequest request = createLocationRequest(true);
        
        try {
            // Request a single location update with high accuracy
            Task<Location> locationTask = fusedLocationClient.getCurrentLocation(
                    Priority.PRIORITY_HIGH_ACCURACY, null);
                    
            locationTask.addOnSuccessListener(new OnSuccessListener<Location>() {
                @Override
                public void onSuccess(Location location) {
                    if (location != null) {
                        String source = determineLocationSource(location);
                        notifyListeners(location, source);
                    } else {
                        // If no location is available, try getting the last known location
                        fusedLocationClient.getLastLocation()
                                .addOnSuccessListener(new OnSuccessListener<Location>() {
                                    @Override
                                    public void onSuccess(Location lastLocation) {
                                        if (lastLocation != null) {
                                            String source = determineLocationSource(lastLocation);
                                            // Mark as cached source since it's the last known location
                                            notifyListeners(lastLocation, "cached");
                                        } else {
                                            // No location available at all
                                            notifyError(new Exception("No location available"));
                                        }
                                    }
                                });
                    }
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Error getting current location", e);
            notifyError(e);
        }
    }
    
    /**
     * Start continuous location tracking
     */
    @SuppressLint("MissingPermission")
    public boolean startLocationTracking(boolean highAccuracy) {
        if (isTracking) {
            return true; // Already tracking
        }
        
        try {
            locationRequest = createLocationRequest(highAccuracy);
            fusedLocationClient.requestLocationUpdates(
                    locationRequest, locationCallback, Looper.getMainLooper());
            isTracking = true;
            return true;
        } catch (Exception e) {
            Log.e(TAG, "Error starting location tracking", e);
            notifyError(e);
            return false;
        }
    }
    
    /**
     * Stop location tracking
     */
    public boolean stopLocationTracking() {
        if (!isTracking) {
            return true; // Not tracking
        }
        
        try {
            fusedLocationClient.removeLocationUpdates(locationCallback);
            isTracking = false;
            return true;
        } catch (Exception e) {
            Log.e(TAG, "Error stopping location tracking", e);
            return false;
        }
    }
    
    /**
     * Create location request with appropriate settings
     */
    private LocationRequest createLocationRequest(boolean highAccuracy) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Android 12+ uses the Builder pattern
            return new LocationRequest.Builder(
                    highAccuracy ? 
                        Priority.PRIORITY_HIGH_ACCURACY : 
                        Priority.PRIORITY_BALANCED_POWER_ACCURACY,
                    highAccuracy ? 10000 : 30000) // Update interval in milliseconds
                    .setMinUpdateDistanceMeters(highAccuracy ? 5 : 25)
                    .setMinUpdateIntervalMillis(highAccuracy ? 5000 : 15000)
                    .setMaxUpdateDelayMillis(highAccuracy ? 15000 : 60000)
                    .build();
        } else {
            // Legacy approach for Android 11 and below
            LocationRequest request = LocationRequest.create();
            
            if (highAccuracy) {
                request.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
                request.setInterval(10000); // 10 seconds
                request.setFastestInterval(5000); // 5 seconds
                request.setSmallestDisplacement(5); // 5 meters
            } else {
                request.setPriority(LocationRequest.PRIORITY_BALANCED_POWER_ACCURACY);
                request.setInterval(30000); // 30 seconds
                request.setFastestInterval(15000); // 15 seconds
                request.setSmallestDisplacement(25); // 25 meters
            }
            
            return request;
        }
    }
}
