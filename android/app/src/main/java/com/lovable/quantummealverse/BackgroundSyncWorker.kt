
package com.lovable.quantummealverse

import android.content.Context
import android.os.Build
import android.util.Log
import androidx.work.*
import java.util.concurrent.TimeUnit
import java.util.Calendar
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

class BackgroundSyncWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    companion object {
        private const val TAG = "BackgroundSyncWorker"
        private const val WORK_NAME = "com.lovable.quantummealverse.background_sync"
        private const val PATTERN_ANALYSIS_PREFS = "sync_pattern_prefs"
        private const val SYNC_TIMES_KEY = "sync_times"
        private const val MAX_HISTORY = 20

        // Setup the periodic work request with intelligent scheduling
        fun setupPeriodicSync(context: Context) {
            // Create network and battery constraints
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .setRequiresBatteryNotLow(true)
                .build()

            // Get the next optimal interval based on user patterns
            val (initialDelay, repeatInterval) = calculateOptimalSyncSchedule(context)
            
            // Create the periodic work request
            val periodicWorkRequest = PeriodicWorkRequestBuilder<BackgroundSyncWorker>(
                repeatInterval, TimeUnit.MINUTES,
                // Flex period allows WorkManager to optimize the exact time
                (repeatInterval * 0.75).toLong(), TimeUnit.MINUTES
            )
                .setConstraints(constraints)
                .setInitialDelay(initialDelay, TimeUnit.MINUTES)
                .setBackoffCriteria(
                    BackoffPolicy.EXPONENTIAL,
                    15, // Minimum backoff time
                    TimeUnit.MINUTES
                )
                .build()

            // Enqueue the request, replacing any existing ones
            WorkManager.getInstance(context)
                .enqueueUniquePeriodicWork(
                    WORK_NAME,
                    ExistingPeriodicWorkPolicy.REPLACE,
                    periodicWorkRequest
                )
            
            Log.d(TAG, "Background sync scheduled with initial delay: $initialDelay min, repeat: $repeatInterval min")
        }

        // Also provide one-time sync capability
        fun requestImmediateSync(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val syncWork = OneTimeWorkRequestBuilder<BackgroundSyncWorker>()
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context).enqueue(syncWork)
            Log.d(TAG, "Immediate sync requested")
        }
        
        // Calculate the optimal sync schedule based on user patterns
        private fun calculateOptimalSyncSchedule(context: Context): Pair<Long, Long> {
            val prefs = context.getSharedPreferences(PATTERN_ANALYSIS_PREFS, Context.MODE_PRIVATE)
            val syncTimesJson = prefs.getString(SYNC_TIMES_KEY, "[]") ?: "[]"
            
            try {
                // Parse sync history
                val syncTimes = JSONObject()
                    .put("times", syncTimesJson)
                    .getJSONArray("times")
                
                // Default values
                var initialDelay: Long = 15 // 15 minutes default initial delay
                var repeatInterval: Long = 60 // 60 minutes default interval
                
                // Only analyze patterns if we have enough data points
                if (syncTimes.length() >= 5) {
                    // Count frequency by hour of day
                    val hourFrequency = IntArray(24)
                    val intervalSum = mutableListOf<Long>()
                    
                    val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
                    
                    // Calculate time intervals and hour frequencies
                    for (i in 0 until syncTimes.length()) {
                        val timeStr = syncTimes.getString(i)
                        val date = dateFormat.parse(timeStr)
                        
                        if (date != null) {
                            val calendar = Calendar.getInstance()
                            calendar.time = date
                            val hour = calendar.get(Calendar.HOUR_OF_DAY)
                            hourFrequency[hour]++
                            
                            // Calculate interval to next sync if available
                            if (i < syncTimes.length() - 1) {
                                val nextTimeStr = syncTimes.getString(i + 1)
                                val nextDate = dateFormat.parse(nextTimeStr)
                                
                                if (nextDate != null) {
                                    val intervalMinutes = (nextDate.time - date.time) / (1000 * 60)
                                    if (intervalMinutes in 5..1440) { // Between 5 min and 24 hours
                                        intervalSum.add(intervalMinutes)
                                    }
                                }
                            }
                        }
                    }
                    
                    // Find most frequent hour
                    val mostFrequentHour = hourFrequency.indices.maxByOrNull { hourFrequency[it] } ?: 9
                    
                    // Calculate average interval
                    if (intervalSum.isNotEmpty()) {
                        repeatInterval = intervalSum.average().toLong()
                        
                        // Ensure reasonable bounds
                        repeatInterval = repeatInterval.coerceIn(15, 180)
                    }
                    
                    // Calculate initial delay to reach the most frequent hour
                    val currentHour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
                    val hoursUntilTarget = (mostFrequentHour - currentHour + 24) % 24
                    initialDelay = (hoursUntilTarget * 60).toLong()
                    
                    // If target hour is far away, use a reasonable delay
                    if (initialDelay > 180) {
                        initialDelay = 45 // 45 minutes
                    }
                }
                
                return Pair(initialDelay, repeatInterval)
            } catch (e: Exception) {
                Log.e(TAG, "Error analyzing sync patterns", e)
                return Pair(15L, 60L) // Default values on error
            }
        }
        
        // Record a sync time for pattern analysis
        fun recordSyncTime(context: Context) {
            val prefs = context.getSharedPreferences(PATTERN_ANALYSIS_PREFS, Context.MODE_PRIVATE)
            val syncTimesJson = prefs.getString(SYNC_TIMES_KEY, "[]") ?: "[]"
            
            try {
                // Parse existing times
                val jsonObj = JSONObject().put("times", syncTimesJson)
                val syncTimes = jsonObj.getJSONArray("times")
                
                // Create a new array with the current time
                val updatedArray = JSONObject().put("times", JSONArray())
                val updatedTimes = updatedArray.getJSONArray("times")
                
                // Add current time in ISO format
                val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
                dateFormat.timeZone = TimeZone.getTimeZone("UTC")
                updatedTimes.put(dateFormat.format(Date()))
                
                // Copy recent history (limit to MAX_HISTORY entries)
                val startIndex = if (syncTimes.length() > MAX_HISTORY - 1) {
                    syncTimes.length() - (MAX_HISTORY - 1)
                } else {
                    0
                }
                
                for (i in startIndex until syncTimes.length()) {
                    updatedTimes.put(syncTimes.getString(i))
                }
                
                // Save updated times
                prefs.edit().putString(SYNC_TIMES_KEY, updatedTimes.toString()).apply()
                
            } catch (e: Exception) {
                Log.e(TAG, "Error recording sync time", e)
            }
        }
    }

    override suspend fun doWork(): Result {
        Log.d(TAG, "Background sync started")
        
        try {
            // Record this sync attempt for pattern analysis
            recordSyncTime(applicationContext)
            
            // Send broadcast to notify app about sync start
            val syncStartIntent = MainActivity.getIntent(applicationContext).apply {
                action = "com.lovable.quantummealverse.BACKGROUND_SYNC_STARTED"
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            applicationContext.sendBroadcast(syncStartIntent)
            
            // Perform the actual sync work
            val syncSuccessful = performSync()
            
            // After completion, reschedule using updated pattern data
            setupPeriodicSync(applicationContext)
            
            return if (syncSuccessful) {
                Log.d(TAG, "Background sync completed successfully")
                Result.success()
            } else {
                Log.d(TAG, "Background sync completed with errors")
                Result.retry()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error during background sync", e)
            return Result.failure()
        }
    }
    
    private suspend fun performSync(): Boolean {
        return try {
            // Send the sync status to MainActivity via a broadcast
            val intent = MainActivity.getIntent(applicationContext).apply {
                action = "com.lovable.quantummealverse.BACKGROUND_SYNC"
                putExtra("operation", "SYNC")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            applicationContext.sendBroadcast(intent)
            
            // Wait for a reasonable time to allow sync to complete
            // In a real implementation, we'd use a callback mechanism
            delay(10000) // 10 seconds
            
            true
        } catch (e: Exception) {
            Log.e(TAG, "Sync operation failed", e)
            false
        }
    }
}
