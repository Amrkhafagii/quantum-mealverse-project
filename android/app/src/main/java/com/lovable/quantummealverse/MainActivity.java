
package com.lovable.quantummealverse;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.work.WorkManager;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private static final String BACKGROUND_SYNC_ACTION = "com.lovable.quantummealverse.BACKGROUND_SYNC";
    private static final String BACKGROUND_SYNC_STARTED_ACTION = "com.lovable.quantummealverse.BACKGROUND_SYNC_STARTED";
    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1001;
    private static final int BACKGROUND_LOCATION_PERMISSION_REQUEST_CODE = 1002;
    
    private BroadcastReceiver syncReceiver;
    private boolean locationPermissionJustGranted = false;

    // ActivityResultLauncher for fine location permission
    private final ActivityResultLauncher<String> requestFineLocationPermission = 
            registerForActivityResult(new ActivityResultContracts.RequestPermission(), isGranted -> {
                if (isGranted) {
                    locationPermissionJustGranted = true;
                    Log.d(TAG, "Fine location permission granted");
                    
                    // Notify JS
                    notifyPermissionResult("location", "granted");
                    
                    // If we're on Android 10+, show educational dialog about background location
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        showBackgroundLocationEducationalUI();
                    }
                } else {
                    Log.d(TAG, "Fine location permission denied");
                    notifyPermissionResult("location", "denied");
                    showLocationPermissionDeniedDialog();
                }
            });

    // ActivityResultLauncher for background location permission
    private final ActivityResultLauncher<String> requestBackgroundLocationPermission = 
            registerForActivityResult(new ActivityResultContracts.RequestPermission(), isGranted -> {
                if (isGranted) {
                    Log.d(TAG, "Background location permission granted");
                    notifyPermissionResult("backgroundLocation", "granted");
                    
                    // Start our foreground service now that we have permissions
                    startLocationTrackingServiceIfNeeded();
                } else {
                    Log.d(TAG, "Background location permission denied");
                    notifyPermissionResult("backgroundLocation", "denied");
                    showBackgroundLocationPermissionDeniedDialog();
                }
            });

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize background sync
        initializeBackgroundSync();

        // Register for sync broadcasts
        registerSyncReceiver();
        
        // Bridge JavaScript event handler for permission requests
        registerPermissionPluginHandlers();
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        registerSyncReceiver();
    }
    
    @Override
    protected void onPause() {
        super.onPause();
        if (syncReceiver != null) {
            try {
                unregisterReceiver(syncReceiver);
            } catch (IllegalArgumentException e) {
                // Receiver not registered
            }
        }
    }

    private void initializeBackgroundSync() {
        // Initialize and schedule our background sync work
        BackgroundSyncWorker.Companion.setupPeriodicSync(getApplicationContext());
    }
    
    private void registerSyncReceiver() {
        if (syncReceiver == null) {
            syncReceiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    if (BACKGROUND_SYNC_ACTION.equals(intent.getAction())) {
                        // Forward sync event to the web app
                        String operation = intent.getStringExtra("operation");
                        bridge.triggerJSEvent("backgroundSync", "window", "{\"type\":\"" + operation + "\"}");
                    } else if (BACKGROUND_SYNC_STARTED_ACTION.equals(intent.getAction())) {
                        // Handle sync start
                        bridge.triggerJSEvent("backgroundSyncStarted", "window", "{}");
                    }
                }
            };
            
            IntentFilter filter = new IntentFilter();
            filter.addAction(BACKGROUND_SYNC_ACTION);
            filter.addAction(BACKGROUND_SYNC_STARTED_ACTION);
            registerReceiver(syncReceiver, filter);
        }
    }
    
    /**
     * Register handlers for permission-related plugin messages from JavaScript
     */
    private void registerPermissionPluginHandlers() {
        bridge.registerPluginCallback("LocationPermissions", "requestLocationPermission", (call, resultCallback) -> {
            boolean includeBackground = call.getBoolean("includeBackground", false);
            requestLocationPermission(includeBackground);
        });
        
        bridge.registerPluginCallback("LocationPermissions", "checkPermissionStatus", (call, resultCallback) -> {
            JSObject result = checkLocationPermissionStatus();
            resultCallback.success(result);
        });
    }
    
    /**
     * Entry point for requesting location permissions
     */
    private void requestLocationPermission(boolean includeBackground) {
        // Always request fine location first
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) 
                != PackageManager.PERMISSION_GRANTED) {
            requestFineLocationPermission.launch(Manifest.permission.ACCESS_FINE_LOCATION);
        } else if (includeBackground && Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Fine location already granted, check if we need background location
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_BACKGROUND_LOCATION) 
                    != PackageManager.PERMISSION_GRANTED) {
                showBackgroundLocationEducationalUI();
            } else {
                // Already have all needed permissions
                notifyPermissionResult("backgroundLocation", "granted");
                startLocationTrackingServiceIfNeeded();
            }
        } else {
            // Already have needed permissions
            notifyPermissionResult("location", "granted");
            startLocationTrackingServiceIfNeeded();
        }
    }
    
    /**
     * Check the status of location permissions
     */
    private JSObject checkLocationPermissionStatus() {
        JSObject status = new JSObject();
        
        boolean hasFineLocation = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) 
                == PackageManager.PERMISSION_GRANTED;
                
        boolean hasBackgroundLocation = Build.VERSION.SDK_INT < Build.VERSION_CODES.Q || 
                (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_BACKGROUND_LOCATION) 
                == PackageManager.PERMISSION_GRANTED);
        
        status.put("location", hasFineLocation ? "granted" : "denied");
        status.put("backgroundLocation", hasBackgroundLocation ? "granted" : "denied");
        
        return status;
    }
    
    /**
     * Show educational UI about background location before requesting it
     */
    private void showBackgroundLocationEducationalUI() {
        new AlertDialog.Builder(this)
            .setTitle("Background Location Access")
            .setMessage("To track deliveries even when the app is closed, Quantum Mealverse needs permission to access your location in the background. This helps us optimize delivery routes and ensure accurate delivery times.")
            .setPositiveButton("Continue", (dialog, which) -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    requestBackgroundLocationPermission.launch(Manifest.permission.ACCESS_BACKGROUND_LOCATION);
                }
            })
            .setNegativeButton("Not Now", (dialog, which) -> {
                dialog.dismiss();
                notifyPermissionResult("backgroundLocation", "denied");
            })
            .setCancelable(false)
            .show();
    }
    
    /**
     * Show dialog when fine location permission is denied
     */
    private void showLocationPermissionDeniedDialog() {
        new AlertDialog.Builder(this)
            .setTitle("Location Required")
            .setMessage("Quantum Mealverse needs location access to find restaurants near you and handle deliveries. Please grant location permission in your device settings.")
            .setPositiveButton("Settings", (dialog, which) -> {
                // Open app settings
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                Uri uri = Uri.fromParts("package", getPackageName(), null);
                intent.setData(uri);
                startActivity(intent);
            })
            .setNegativeButton("Cancel", (dialog, which) -> dialog.dismiss())
            .setCancelable(true)
            .show();
    }
    
    /**
     * Show dialog when background location permission is denied
     */
    private void showBackgroundLocationPermissionDeniedDialog() {
        new AlertDialog.Builder(this)
            .setTitle("Background Location Required for Delivery")
            .setMessage("Without background location access, delivery tracking will only work when the app is open. This may affect delivery estimates and route optimization.")
            .setPositiveButton("Settings", (dialog, which) -> {
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                Uri uri = Uri.fromParts("package", getPackageName(), null);
                intent.setData(uri);
                startActivity(intent);
            })
            .setNegativeButton("Continue Without Background Tracking", (dialog, which) -> {
                dialog.dismiss();
                // Start foreground service anyway to track when app is open
                startLocationTrackingServiceIfNeeded();
            })
            .setCancelable(true)
            .show();
    }
    
    /**
     * Start the location tracking service if we have the necessary permissions
     */
    private void startLocationTrackingServiceIfNeeded() {
        boolean hasLocationPermission = ContextCompat.checkSelfPermission(this, 
                Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
                
        if (hasLocationPermission) {
            LocationTrackingService.startService(this);
        }
    }
    
    /**
     * Notify JavaScript of permission results
     */
    private void notifyPermissionResult(String permissionType, String status) {
        JSObject data = new JSObject();
        data.put("permissionType", permissionType);
        data.put("status", status);
        bridge.triggerJSEvent("permissionResult", "window", data.toString());
    }
    
    public static Intent getIntent(Context context) {
        return new Intent(context, MainActivity.class);
    }
}
