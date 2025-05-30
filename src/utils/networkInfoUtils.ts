
import { NetworkInfo, NetworkType } from '@/types/unifiedLocation';

// Get network information
export function getNetworkInfo(): NetworkInfo {
  const connected = navigator.onLine;
  const type = getNetworkType();
  const strength = getNetworkStrength();
  
  return {
    connected,
    type,
    strength
  };
}

// Get network type
function getNetworkType(): NetworkType {
  // Check if the Network Information API is available
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      const type = connection.type;
      
      if (type === 'wifi') return 'wifi';
      if (type === 'cellular') {
        // Map effective type to our network types
        if (effectiveType === '4g') return '4g';
        if (effectiveType === '3g') return '3g';
        if (effectiveType === '2g') return '2g';
        if (effectiveType === 'slow-2g') return '2g';
        return 'cellular';
      }
      
      return 'unknown';
    }
  }
  
  // Fallback to online/offline status
  return navigator.onLine ? 'unknown' : 'none';
}

// Get network strength (0-100)
function getNetworkStrength(): number | undefined {
  // This is not easily available in browsers
  // In a real app, you could measure RTT or throughput
  
  // Check if the Network Information API with downlink is available
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    
    if (connection && 'downlink' in connection) {
      // Convert downlink (Mbps) to a strength percentage
      // Assuming max practical downlink is 100 Mbps for 100% strength
      const downlink = connection.downlink;
      return Math.min(100, Math.round((downlink / 100) * 100));
    }
  }
  
  return undefined;
}

// Monitor network quality changes
export function monitorNetworkQuality(
  callback: (info: NetworkInfo) => void
): () => void {
  const handleChange = () => {
    callback(getNetworkInfo());
  };
  
  window.addEventListener('online', handleChange);
  window.addEventListener('offline', handleChange);
  
  // Use Network Information API if available
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    
    if (connection) {
      connection.addEventListener('change', handleChange);
    }
  }
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleChange);
    window.removeEventListener('offline', handleChange);
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection) {
        connection.removeEventListener('change', handleChange);
      }
    }
  };
}
