import { UnifiedLocation } from '@/types/unifiedLocation';
import { DeliveryLocation } from '@/types/location';
import { secureStorage } from './secureStorage';

/**
 * Debug utility to log location information
 */
export const logLocationDebug = (
  phase: string,
  data: { 
    location?: UnifiedLocation | DeliveryLocation | null,
    error?: any,
    context?: any
  }
) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    phase,
    ...data,
    userAgent: navigator.userAgent,
    online: navigator.onLine
  };
  
  console.log(`🌍 LOCATION DEBUG [${phase}]:`, logEntry);
  
  // Also store in session storage for persistence
  try {
    const existingLogs = JSON.parse(sessionStorage.getItem('locationDebugLogs') || '[]');
    existingLogs.push(logEntry);
    // Keep only the last 50 logs to avoid storage issues
    if (existingLogs.length > 50) existingLogs.shift();
    sessionStorage.setItem('locationDebugLogs', JSON.stringify(existingLogs));
  } catch (err) {
    console.error('Error storing debug logs:', err);
  }
  
  return logEntry;
};

/**
 * Clear all location-related storage data
 */
export const clearLocationStorage = async () => {
  console.log('🧹 Clearing all location storage...');
  
  try {
    // Clear in-memory cache
    localStorage.removeItem('deliveryLocation');
    localStorage.removeItem('cached_orders');
    localStorage.removeItem('locationPermissionStatus');
    localStorage.removeItem('lastLocation');
    localStorage.removeItem('pending_actions');
    localStorage.removeItem('autoNavigateToMenu');
    
    // Clear secure storage
    await secureStorage.removeItem('deliveryLocation');
    
    // Clear session storage
    sessionStorage.removeItem('locationDebugLogs');
    sessionStorage.removeItem('selectedRestaurant');
    
    console.log('✅ All location storage cleared successfully');
    return true;
  } catch (err) {
    console.error('Error clearing location storage:', err);
    return false;
  }
};

/**
 * Export all location debug logs as JSON
 */
export const exportLocationLogs = () => {
  try {
    const logs = sessionStorage.getItem('locationDebugLogs') || '[]';
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `location-debug-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (err) {
    console.error('Error exporting logs:', err);
    return false;
  }
};
