
package com.lovable.quantummealverse;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import androidx.work.WorkManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String BACKGROUND_SYNC_ACTION = "com.lovable.quantummealverse.BACKGROUND_SYNC";
    private static final String BACKGROUND_SYNC_STARTED_ACTION = "com.lovable.quantummealverse.BACKGROUND_SYNC_STARTED";
    private BroadcastReceiver syncReceiver;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize background sync
        initializeBackgroundSync();

        // Register for sync broadcasts
        registerSyncReceiver();
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
    
    public static Intent getIntent(Context context) {
        return new Intent(context, MainActivity.class);
    }
}
